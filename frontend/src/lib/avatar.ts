const AVATAR_PALETTE = [
  { bg: 'oklch(0.88 0.12 145)', fg: 'oklch(0.22 0.05 145)' },
  { bg: 'oklch(0.86 0.10 200)', fg: 'oklch(0.22 0.05 200)' },
  { bg: 'oklch(0.88 0.10 85)', fg: 'oklch(0.22 0.06 85)' },
  { bg: 'oklch(0.85 0.13 25)', fg: 'oklch(0.22 0.07 25)' },
  { bg: 'oklch(0.85 0.10 295)', fg: 'oklch(0.22 0.06 295)' },
  { bg: 'oklch(0.88 0.09 175)', fg: 'oklch(0.22 0.05 175)' },
  { bg: 'oklch(0.86 0.11 60)', fg: 'oklch(0.22 0.06 60)' },
  { bg: 'oklch(0.86 0.10 320)', fg: 'oklch(0.22 0.06 320)' },
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function avatarColor(seed: string) {
  return AVATAR_PALETTE[hash(seed) % AVATAR_PALETTE.length];
}

export function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
