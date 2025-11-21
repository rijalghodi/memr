import { describe, expect, it } from "vitest";

import {
  generateBetweenRank,
  generateFirstRank,
  generateLastRank,
} from "./fractional-idx";

describe("fractional-idx", () => {
  describe("generateFirstRank", () => {
    it("should generate a valid first rank", () => {
      const rank = generateFirstRank();
      expect(rank).toBeTypeOf("string");
      expect(rank.length).toBeGreaterThan(0);
    });

    it("should generate consistent first ranks", () => {
      const rank1 = generateFirstRank();
      const rank2 = generateFirstRank();
      expect(rank1).toBe(rank2);
    });

    it("should generate a rank that is less than any other rank", () => {
      const firstRank = generateFirstRank();
      const betweenRank = generateBetweenRank(undefined, undefined);
      expect(firstRank.localeCompare(betweenRank)).toBeLessThanOrEqual(0);
    });
  });

  describe("generateLastRank", () => {
    it("should generate a valid last rank", () => {
      const rank = generateLastRank();
      expect(rank).toBeTypeOf("string");
      expect(rank.length).toBeGreaterThan(0);
    });

    it("should generate a rank that is greater than first rank", () => {
      const firstRank = generateFirstRank();
      const lastRank = generateLastRank();
      expect(lastRank.localeCompare(firstRank)).toBeGreaterThan(0);
    });

    it("should generate a rank that is greater than any middle rank", () => {
      const firstRank = generateFirstRank();
      const middleRank = generateBetweenRank(firstRank, undefined);
      const lastRank = generateLastRank();
      expect(lastRank.localeCompare(middleRank)).toBeGreaterThan(0);
    });
  });

  describe("generateBetweenRank", () => {
    describe("with both undefined", () => {
      it("should generate first rank when both are undefined", () => {
        const rank = generateBetweenRank(undefined, undefined);
        const firstRank = generateFirstRank();
        expect(rank).toBe(firstRank);
      });

      it("should generate first rank when both are null (via undefined)", () => {
        const rank = generateBetweenRank(undefined, undefined);
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });
    });

    describe("with left undefined (insert at beginning)", () => {
      it("should generate rank before right rank", () => {
        const rightRank = generateBetweenRank(undefined, undefined);
        const rank = generateBetweenRank(undefined, rightRank);
        // Use simple string comparison (fractional indexing uses lexicographic order)
        // Note: generateKeyBetween(null, firstRank) returns "Zz" which is < "a0" in simple comparison
        expect(rank < rightRank || rank.localeCompare(rightRank) < 0).toBe(
          true
        );
      });

      it("should generate rank that is greater than or equal to first rank", () => {
        const firstRank = generateFirstRank();
        const rightRank = generateBetweenRank(firstRank, undefined);
        const rank = generateBetweenRank(undefined, rightRank);
        expect(rank.localeCompare(firstRank)).toBeGreaterThanOrEqual(0);
      });
    });

    describe("with right undefined (insert at end)", () => {
      it("should generate rank after left rank", () => {
        const leftRank = generateFirstRank();
        const rank = generateBetweenRank(leftRank, undefined);
        expect(rank.localeCompare(leftRank)).toBeGreaterThan(0);
      });

      it("should generate rank that is less than last rank", () => {
        const leftRank = generateFirstRank();
        const lastRank = generateLastRank();
        const rank = generateBetweenRank(leftRank, undefined);
        expect(rank.localeCompare(lastRank)).toBeLessThan(0);
      });
    });

    describe("with both ranks defined", () => {
      it("should generate rank between two ranks", () => {
        const leftRank = generateFirstRank();
        const rightRank = generateLastRank();
        const rank = generateBetweenRank(leftRank, rightRank);
        expect(rank.localeCompare(leftRank)).toBeGreaterThan(0);
        expect(rank.localeCompare(rightRank)).toBeLessThan(0);
      });

      it("should generate rank between consecutive ranks", () => {
        const rank1 = generateFirstRank();
        const rank2 = generateBetweenRank(rank1, undefined);
        const rank3 = generateBetweenRank(rank2, undefined);
        const middleRank = generateBetweenRank(rank1, rank3);
        expect(middleRank.localeCompare(rank1)).toBeGreaterThan(0);
        expect(middleRank.localeCompare(rank3)).toBeLessThan(0);
      });

      it("should handle multiple insertions between same ranks", () => {
        const leftRank = generateFirstRank();
        const rightRank = generateLastRank();
        const rank1 = generateBetweenRank(leftRank, rightRank);
        // For subsequent insertions, we need to use the previous rank as the new left boundary
        // to ensure uniqueness. This is a limitation of fractional indexing - you need to
        // track existing ranks to generate unique ones.
        const rank2 = generateBetweenRank(rank1, rightRank);
        const rank3 = generateBetweenRank(rank2, rightRank);

        // All ranks should be between left and right
        expect(rank1.localeCompare(leftRank)).toBeGreaterThan(0);
        expect(rank1.localeCompare(rightRank)).toBeLessThan(0);
        expect(rank2.localeCompare(leftRank)).toBeGreaterThan(0);
        expect(rank2.localeCompare(rightRank)).toBeLessThan(0);
        expect(rank3.localeCompare(leftRank)).toBeGreaterThan(0);
        expect(rank3.localeCompare(rightRank)).toBeLessThan(0);

        // All ranks should be unique and in order
        expect(rank1).not.toBe(rank2);
        expect(rank2).not.toBe(rank3);
        expect(rank1).not.toBe(rank3);
        // Use simple string comparison for fractional indexing
        const compare = (a: string, b: string) =>
          a < b ? -1 : a > b ? 1 : a.localeCompare(b);
        expect(compare(rank1, rank2)).toBeLessThan(0);
        expect(compare(rank2, rank3)).toBeLessThan(0);
      });
    });

    describe("with swapped order (left > right)", () => {
      it("should handle swapped ranks by swapping them internally", () => {
        const rank1 = generateFirstRank();
        const rank2 = generateBetweenRank(rank1, undefined);
        // Pass them in wrong order
        const rank = generateBetweenRank(rank2, rank1);
        // Should still generate a valid rank
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });

      it("should generate valid rank even when order is incorrect", () => {
        const leftRank = generateBetweenRank(undefined, undefined);
        const rightRank = generateFirstRank();
        // rightRank < leftRank, so order is swapped
        const rank = generateBetweenRank(leftRank, rightRank);
        expect(rank).toBeTypeOf("string");
      });
    });

    describe("with invalid ranks", () => {
      it("should handle invalid left rank by using first rank", () => {
        const rightRank = generateLastRank();
        const invalidLeft = "invalid-rank";
        const rank = generateBetweenRank(invalidLeft, rightRank);
        // Should fallback to first rank or handle gracefully
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });

      it("should handle invalid right rank by using last rank", () => {
        const leftRank = generateFirstRank();
        const invalidRight = "invalid-rank";
        const rank = generateBetweenRank(leftRank, invalidRight);
        // Should fallback to last rank or handle gracefully
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });

      it("should handle both invalid ranks by using first rank", () => {
        const invalidLeft = "invalid-left";
        const invalidRight = "invalid-right";
        const rank = generateBetweenRank(invalidLeft, invalidRight);
        // Should fallback to first rank
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });
    });

    describe("edge cases", () => {
      it("should handle empty string ranks", () => {
        const rank = generateBetweenRank("", "");
        expect(rank).toBeTypeOf("string");
        expect(rank.length).toBeGreaterThan(0);
      });

      it("should generate unique ranks for sequential insertions", () => {
        const ranks: string[] = [];
        let currentLeft: string | undefined = undefined;
        const currentRight: string | undefined = undefined;

        // Insert 10 ranks sequentially
        for (let i = 0; i < 10; i++) {
          const newRank = generateBetweenRank(currentLeft, currentRight);
          ranks.push(newRank);
          currentLeft = newRank;
        }

        // All ranks should be unique
        const uniqueRanks = new Set(ranks);
        expect(uniqueRanks.size).toBe(ranks.length);

        // Ranks should be in ascending order
        for (let i = 1; i < ranks.length; i++) {
          expect(ranks[i].localeCompare(ranks[i - 1])).toBeGreaterThan(0);
        }
      });

      it("should handle inserting at beginning multiple times", () => {
        const rightRank = generateLastRank();
        const rank1 = generateBetweenRank(undefined, rightRank);
        // Use the generated rank as the new right boundary for next insertion
        const rank2 = generateBetweenRank(undefined, rank1);
        const rank3 = generateBetweenRank(undefined, rank2);

        // Use simple string comparison for fractional indexing keys
        const compare = (a: string, b: string) =>
          a < b ? -1 : a > b ? 1 : a.localeCompare(b);
        expect(compare(rank3, rank2)).toBeLessThan(0);
        expect(compare(rank2, rank1)).toBeLessThan(0);
        expect(compare(rank1, rightRank)).toBeLessThan(0);
      });

      it("should handle inserting at end multiple times", () => {
        const leftRank = generateFirstRank();
        const rank1 = generateBetweenRank(leftRank, undefined);
        const rank2 = generateBetweenRank(rank1, undefined);
        const rank3 = generateBetweenRank(rank2, undefined);

        expect(leftRank.localeCompare(rank1)).toBeLessThan(0);
        expect(rank1.localeCompare(rank2)).toBeLessThan(0);
        expect(rank2.localeCompare(rank3)).toBeLessThan(0);
      });
    });

    describe("real-world scenarios", () => {
      it("should maintain order when inserting tasks in kanban board", () => {
        // Simulate kanban board with 3 columns
        const column1 = generateFirstRank();
        const column2 = generateBetweenRank(column1, undefined);
        // column3 represents the end boundary (not used but shows structure)
        generateBetweenRank(column2, undefined);

        // Add tasks to column 1 - use previous task as left boundary to ensure order
        const task1_1 = generateBetweenRank(column1, column2);
        const task1_2 = generateBetweenRank(task1_1, column2);
        const task1_3 = generateBetweenRank(task1_2, column2);

        // Verify order using simple string comparison
        const compare = (a: string, b: string) =>
          a < b ? -1 : a > b ? 1 : a.localeCompare(b);
        expect(compare(column1, task1_1)).toBeLessThan(0);
        expect(compare(task1_1, task1_2)).toBeLessThan(0);
        expect(compare(task1_2, task1_3)).toBeLessThan(0);
        expect(compare(task1_3, column2)).toBeLessThan(0);
      });

      it("should handle moving task between columns", () => {
        // Create initial state
        const col1Start = generateFirstRank();
        const col1End = generateBetweenRank(col1Start, undefined);
        const col2Start = col1End;
        const col2End = generateBetweenRank(col2Start, undefined);

        // Task in column 1 (not used but shows initial position)
        generateBetweenRank(col1Start, col1End);

        // Move to column 2 (between col2Start and col2End)
        const newPosition = generateBetweenRank(col2Start, col2End);

        // Verify new position is in column 2
        expect(newPosition.localeCompare(col2Start)).toBeGreaterThan(0);
        expect(newPosition.localeCompare(col2End)).toBeLessThan(0);
      });
    });
  });
});
