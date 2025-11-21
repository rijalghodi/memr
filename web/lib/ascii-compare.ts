export function asciiCompare(a: string, b: string): number {
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const ca = a.charCodeAt(i);
    const cb = b.charCodeAt(i);
    if (ca !== cb) return ca - cb; // pure codepoint comparison
  }

  return a.length - b.length; // prefix rule
}
