import {
  DEFAULT_GEMINI_BASE_URL,
  maskProxyUrl,
  resolveGeminiTransportConfig,
} from './gemini.transport';

describe('gemini transport config', () => {
  it('uses direct mode by default', () => {
    const config = resolveGeminiTransportConfig({});

    expect(config).toMatchObject({
      baseUrl: DEFAULT_GEMINI_BASE_URL,
      forceIpv4: false,
      proxyMode: 'direct',
    });
  });

  it('uses explicit gemini proxy url when configured', () => {
    const config = resolveGeminiTransportConfig({
      GEMINI_PROXY_URL: 'http://user:pass@proxy.example.com:3128',
      GEMINI_BASE_URL: 'https://relay.example.com',
      GEMINI_FORCE_IPV4: 'true',
    });

    expect(config).toMatchObject({
      baseUrl: 'https://relay.example.com',
      proxyUrl: 'http://user:pass@proxy.example.com:3128',
      forceIpv4: true,
      proxyMode: 'proxy',
    });
  });

  it('masks proxy credentials in diagnostics', () => {
    expect(maskProxyUrl('http://user:pass@proxy.example.com:3128')).toBe(
      'http://proxy.example.com:3128',
    );
    expect(maskProxyUrl('not-a-valid-url')).toBe('configured');
  });
});
