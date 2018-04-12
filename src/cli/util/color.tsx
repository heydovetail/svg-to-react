export function normalizeHex(hex: string): string {
  const compressableHexMatch = hex.match(/^#(([a-f0-9])\2){3}$/i);
  if (compressableHexMatch !== null) {
    const [str] = compressableHexMatch;
    return `#${str[1]}${str[3]}${str[5]}`.toLowerCase();
  }

  const hexMatch = hex.match(/^#([a-f0-9]{3}){1,2}$/i);
  if (hexMatch !== null) {
    const [str] = hexMatch;
    return str.toLowerCase();
  }

  return hex;
}
