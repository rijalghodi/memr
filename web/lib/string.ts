export function markdownToText(content: string, maxLength?: number) {
  // Get the first line for the title candidate
  let line = content.trim();

  // Replace markdown headings, blockquotes, list markers, checkboxes - block level elements - with a space
  line = line
    .replace(/^#+\s*/, " ") // heading (any # at the start)
    .replace(/^\>\s?/, " ") // blockquote
    .replace(/^[-*+]\s+/, " ") // unordered list
    .replace(/^\d+\.\s+/, " ") // ordered list
    .replace(/^\s*\[( |x|X)\]\s*/, " ") // task list checkbox
    .replace(/^\s*>\s*/, " "); // blockquote with possible leading space

  // Remove potential bold/italic/inline markdown -- replace them with a space if found in the whole line
  line = line
    .replace(/(\*\*|__)(.*?)\1/g, " $2 ") // bold
    .replace(/(\*|_)(.*?)\1/g, " $2 ") // italic
    .replace(/`([^`]*)`/g, " $1 ") // inline code
    .replace(/\[(.*?)\]\((.*?)\)/g, " $1 "); // link

  // Remove remaining markdown special characters (e.g., remaining #, *, >, -, +, etc.)
  line = line.replace(/[*_`>#-]/g, " ");

  // Remove multiple spaces
  line = line.replace(/\s+/g, " ");

  if (maxLength) {
    line = truncateString(line, maxLength);
  }

  return line.trim();
}

export function extractFirstLineFromContent(
  content: string,
  maxLength?: number
) {
  const trimmed = content.trim();
  const firstLine = trimmed.split("\n")[0];
  const text = markdownToText(firstLine, maxLength);
  return text;
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}
