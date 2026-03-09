import { getDefaultResultOrder, setDefaultResultOrder } from 'node:dns';
import { lookup } from 'node:dns/promises';
import os from 'node:os';
import type { Logger } from '@nestjs/common';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

export const GEMINI_API_HOSTNAME = 'generativelanguage.googleapis.com';
export const DEFAULT_GEMINI_BASE_URL = `https://${GEMINI_API_HOSTNAME}`;
const NETWORK_PROBE_TIMEOUT_MS = 4000;

export type GeminiProxyMode = 'direct' | 'proxy';

export interface GeminiNetworkProbe {
  name: string;
  url: string;
  success: boolean;
  latencyMs: number;
  result?: unknown;
  error?: string;
}

export interface GeminiTransportConfig {
  baseUrl: string;
  proxyUrl?: string;
  forceIpv4: boolean;
  proxyMode: GeminiProxyMode;
}

export interface GeminiEgressDiagnostics {
  nodeVersion: string;
  geminiHostname: string;
  geminiBaseUrl: string;
  proxyMode: GeminiProxyMode;
  proxyUrl?: string;
  forceIpv4: boolean;
  dnsResultOrder: ReturnType<typeof getDefaultResultOrder>;
  dnsLookup: Array<{ address: string; family: number }>;
  localInterfaces: Array<{
    name: string;
    family: string;
    internal: boolean;
    address: string;
  }>;
  publicNetwork: GeminiNetworkProbe[];
  notes: string[];
}

let installedProxyUrl: string | undefined;
let ipv4PreferenceApplied = false;

export function resolveGeminiTransportConfig(
  env: NodeJS.ProcessEnv = process.env,
): GeminiTransportConfig {
  const proxyUrl = env.GEMINI_PROXY_URL?.trim() || undefined;
  const forceIpv4 = env.GEMINI_FORCE_IPV4 === 'true';

  return {
    baseUrl:
      env.GEMINI_BASE_URL?.trim() ||
      env.GOOGLE_GEMINI_BASE_URL?.trim() ||
      DEFAULT_GEMINI_BASE_URL,
    proxyUrl,
    forceIpv4,
    proxyMode: proxyUrl ? 'proxy' : 'direct',
  };
}

export function applyGeminiTransportConfig(
  config: GeminiTransportConfig,
  logger: Logger,
) {
  if (config.forceIpv4 && !ipv4PreferenceApplied) {
    setDefaultResultOrder('ipv4first');
    ipv4PreferenceApplied = true;
    logger.log('Gemini transport prefers IPv4 DNS resolution');
  }

  if (config.proxyUrl && installedProxyUrl !== config.proxyUrl) {
    setGlobalDispatcher(new ProxyAgent(config.proxyUrl));
    installedProxyUrl = config.proxyUrl;
    logger.warn(
      `Gemini proxy enabled via global dispatcher (${maskProxyUrl(config.proxyUrl)}). This affects fetch/undici requests process-wide.`,
    );
  }
}

export async function collectGeminiEgressDiagnostics(
  config: GeminiTransportConfig,
): Promise<GeminiEgressDiagnostics> {
  const [dnsLookup, publicNetwork] = await Promise.all([
    lookup(GEMINI_API_HOSTNAME, { all: true }),
    Promise.all([
      probePublicNetwork(
        'public-ipv4',
        'https://api.ipify.org?format=json',
        'json',
      ),
      probePublicNetwork('public-geo', 'https://ipwho.is/', 'json'),
    ]),
  ]);

  const notes: string[] = [];

  if (config.proxyMode === 'direct') {
    notes.push(
      'Gemini requests currently leave the host directly. If VPN is split-tunnel or IPv6 bypasses it, Google may still see the non-VPN region.',
    );
  }

  if (config.proxyMode === 'proxy') {
    notes.push(
      'Gemini requests are routed through GEMINI_PROXY_URL via undici global dispatcher, so fetch-based traffic in this process will share the same upstream.',
    );
  }

  if (config.forceIpv4) {
    notes.push(
      'IPv4-first DNS resolution is enabled to reduce IPv6 leakage scenarios.',
    );
  }

  return {
    nodeVersion: process.version,
    geminiHostname: GEMINI_API_HOSTNAME,
    geminiBaseUrl: config.baseUrl,
    proxyMode: config.proxyMode,
    proxyUrl: maskProxyUrl(config.proxyUrl),
    forceIpv4: config.forceIpv4,
    dnsResultOrder: getDefaultResultOrder(),
    dnsLookup,
    localInterfaces: summarizeLocalInterfaces(),
    publicNetwork,
    notes,
  };
}

export function maskProxyUrl(proxyUrl?: string): string | undefined {
  if (!proxyUrl) {
    return undefined;
  }

  try {
    const url = new URL(proxyUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'configured';
  }
}

async function probePublicNetwork(
  name: string,
  url: string,
  responseType: 'json',
): Promise<GeminiNetworkProbe> {
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(NETWORK_PROBE_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return {
      name,
      url,
      success: true,
      latencyMs: Date.now() - startedAt,
      result: responseType === 'json' ? await response.json() : undefined,
    };
  } catch (error) {
    return {
      name,
      url,
      success: false,
      latencyMs: Date.now() - startedAt,
      error:
        error instanceof Error ? error.message : 'Unknown network probe error',
    };
  }
}

function summarizeLocalInterfaces() {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, addresses]) =>
      (addresses ?? []).map((address) => ({
        name,
        family: address.family,
        internal: address.internal,
        address: address.address,
      })),
    )
    .sort((left, right) =>
      `${left.name}:${left.family}`.localeCompare(
        `${right.name}:${right.family}`,
      ),
    );
}
