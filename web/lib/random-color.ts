export function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const COLORS: string[] = [
  "#e11d48", // Rose
  "#db2777", // Pink
  "#c026d3", // Fuchsia
  "#9333ea", // Purple
  "#4f46e5", // Indigo
  "#2563eb", // Blue
  "#0284c7", // Sky
  "#0891b2", // Cyan
  "#0d9488", // Teal
  "#059669", // Emerald
  "#16a34a", // Green
  "#65a30d", // Lime
  "#ca8a04", // Yellow
  "#d97706", // Amber
  "#ea580c", // Orange
  "#dc2626", // Red
  "#7c3aed", // Violet
  "#57534e", // Stone
  "#475569", // Slate
  "#0369a1", // Sky 700
] as const;
