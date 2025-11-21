import { LexoRank } from "lexorank";

/**
 * Generates the first rank (minimum rank)
 * @returns The first rank as a string
 */
export function generateFirstRank(): string {
  return LexoRank.min().toString();
}

/**
 * Generates the last rank (maximum rank)
 * @returns The last rank as a string
 */
export function generateLastRank(): string {
  return LexoRank.max().toString();
}

/**
 * Generates a rank between two ranks
 * @param left - The left rank (or undefined to use first rank)
 * @param right - The right rank (or undefined to use last rank)
 * @returns A rank string between left and right
 */
export function generateBetweenRank(
  left: string | undefined,
  right: string | undefined
): string {
  // If both are undefined, generate first rank
  if (!left && !right) {
    return generateFirstRank();
  }

  // Validate and parse left rank, replace with first rank if invalid
  let leftRank: LexoRank;
  if (!left) {
    leftRank = LexoRank.min();
  } else {
    try {
      leftRank = LexoRank.parse(left);
    } catch {
      // If left is not a valid lexorank string, replace with first rank
      leftRank = LexoRank.min();
    }
  }

  // If right is undefined, use last rank
  if (!right) {
    const rightRank = LexoRank.max();
    return leftRank.between(rightRank).toString();
  }

  // Parse right rank
  const rightRank = LexoRank.parse(right);

  // Check if left and right are in correct order
  // LexoRank strings can be compared lexicographically
  if (leftRank.toString().localeCompare(rightRank.toString()) > 0) {
    // Swap if not in correct order
    return rightRank.between(leftRank).toString();
  }

  // Generate rank between left and right
  return leftRank.between(rightRank).toString();
}
