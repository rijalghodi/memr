import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

/**
 * Generates the first rank (minimum rank)
 * @returns The first rank as a string
 */
export function generateFirstRank(): string {
  // Generate first key by passing null for both left and right
  return generateKeyBetween(null, null);
}

/**
 * Generates the last rank (maximum rank)
 * @returns The last rank as a string
 */
export function generateLastRank(): string {
  // Generate a key after the first rank to get a last rank
  // We generate a key between first rank and null (which represents infinity)
  const firstRank = generateFirstRank();
  return generateKeyBetween(firstRank, null);
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
  // Normalize undefined to null for fractional-indexing API
  const leftKey: string | null = left || null;
  const rightKey: string | null = right || null;

  // If both are null/undefined, generate first rank
  if (!leftKey && !rightKey) {
    return generateFirstRank();
  }

  // Try to generate the key, handling validation and order issues
  try {
    // Check if left and right are in correct order
    // Fractional-indexing keys can be compared lexicographically
    if (leftKey && rightKey && leftKey.localeCompare(rightKey) > 0) {
      // Swap if not in correct order
      return generateKeyBetween(rightKey, leftKey);
    }

    // Generate rank between left and right
    // generateKeyBetween handles null values:
    // - null, null = first rank
    // - null, key = between first and key
    // - key, null = between key and last
    return generateKeyBetween(leftKey, rightKey);
  } catch {
    // If left is invalid, replace with first rank (null) and retry
    if (leftKey) {
      try {
        return generateKeyBetween(null, rightKey);
      } catch {
        // If still fails (right might be invalid), use first rank
        return generateFirstRank();
      }
    }
    // If right is invalid, replace with last rank (null) and retry
    if (rightKey) {
      try {
        return generateKeyBetween(leftKey, null);
      } catch {
        // If still fails (left might be invalid), use first rank
        return generateFirstRank();
      }
    }
    // Fallback to first rank
    return generateFirstRank();
  }
}

/**
 * Generates multiple ranks between two ranks
 * @param left - The left rank (or undefined to use first rank)
 * @param right - The right rank (or undefined to use last rank)
 * @param count - Number of keys to generate
 * @returns An array of rank strings between left and right
 */
export function generateNBetweenKeys(
  left: string | undefined,
  right: string | undefined,
  count: number
): string[] {
  // Normalize undefined to null for fractional-indexing API
  const leftKey: string | null = left || null;
  const rightKey: string | null = right || null;

  // If both are null/undefined, generate first rank and then generate N keys after it
  if (!leftKey && !rightKey) {
    const firstRank = generateFirstRank();
    try {
      return generateNKeysBetween(firstRank, null, count);
    } catch {
      // Fallback: generate keys sequentially
      const keys: string[] = [];
      let currentLeft: string | null = firstRank;
      for (let i = 0; i < count; i++) {
        try {
          const key = generateKeyBetween(currentLeft, null);
          keys.push(key);
          currentLeft = key;
        } catch {
          break;
        }
      }
      return keys;
    }
  }

  // Try to generate the keys, handling validation and order issues
  try {
    // Check if left and right are in correct order
    if (leftKey && rightKey && leftKey.localeCompare(rightKey) > 0) {
      // Swap if not in correct order
      return generateNKeysBetween(rightKey, leftKey, count);
    }

    // Generate ranks between left and right
    return generateNKeysBetween(leftKey, rightKey, count);
  } catch {
    // If left is invalid, replace with first rank (null) and retry
    if (leftKey) {
      try {
        return generateNKeysBetween(null, rightKey, count);
      } catch {
        // If still fails, generate sequentially from first rank
        const keys: string[] = [];
        let currentLeft: string | null = null;
        for (let i = 0; i < count; i++) {
          try {
            const key = generateKeyBetween(currentLeft, rightKey);
            keys.push(key);
            currentLeft = key;
          } catch {
            break;
          }
        }
        return keys;
      }
    }
    // If right is invalid, replace with last rank (null) and retry
    if (rightKey) {
      try {
        return generateNKeysBetween(leftKey, null, count);
      } catch {
        // If still fails, generate sequentially
        const keys: string[] = [];
        let currentLeft: string | null = leftKey;
        for (let i = 0; i < count; i++) {
          try {
            const key = generateKeyBetween(currentLeft, null);
            keys.push(key);
            currentLeft = key;
          } catch {
            break;
          }
        }
        return keys;
      }
    }
    // Fallback: generate sequentially from first rank
    const keys: string[] = [];
    let currentLeft: string | null = null;
    for (let i = 0; i < count; i++) {
      try {
        const key = generateKeyBetween(currentLeft, null);
        keys.push(key);
        currentLeft = key;
      } catch {
        break;
      }
    }
    return keys;
  }
}
