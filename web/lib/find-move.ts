function isMoved(
  value: string,
  prev: string[],
  next: string[],
  nextIndex: Map<string, number>,
  prevIndex: Map<string, number>,
): boolean {
  const i1 = prevIndex.get(value)!;
  const i2 = nextIndex.get(value)!;

  const pPrev = i1 > 0 ? prev[i1 - 1] : null;
  const nPrev = i1 < prev.length - 1 ? prev[i1 + 1] : null;

  const pNext = i2 > 0 ? next[i2 - 1] : null;
  const nNext = i2 < next.length - 1 ? next[i2 + 1] : null;

  return pPrev !== pNext && nPrev !== nNext;
}

// ------------------------------------------------------------
// 1. Strings version
// ------------------------------------------------------------
export function findMoved(prev: string[], next: string[]): string | null {
  const nextIndex = new Map(next.map((v, i) => [v, i]));
  const prevIndex = new Map(prev.map((v, i) => [v, i]));

  for (const x of prev) {
    if (isMoved(x, prev, next, nextIndex, prevIndex)) return x;
  }
  return null;
}

// ------------------------------------------------------------
// 2. Objects with .id
// ------------------------------------------------------------
export function findMovedId<T extends { id: string }>(
  prev: T[],
  next: T[],
): string | null {
  const prevIds = prev.map((x) => x.id);
  const nextIds = next.map((x) => x.id);

  const nextIndex = new Map(nextIds.map((v, i) => [v, i]));
  const prevIndex = new Map(prevIds.map((v, i) => [v, i]));

  for (const id of prevIds) {
    if (isMoved(id, prevIds, nextIds, nextIndex, prevIndex)) return id;
  }
  return null;
}

// ------------------------------------------------------------
// 3. Return moved index in NEXT array
// ------------------------------------------------------------
export function findMovedIndex(prev: string[], next: string[]): number {
  const nextIndex = new Map(next.map((v, i) => [v, i]));
  const prevIndex = new Map(prev.map((v, i) => [v, i]));

  for (const x of prev) {
    if (isMoved(x, prev, next, nextIndex, prevIndex)) {
      return nextIndex.get(x)!;
    }
  }

  return -1;
}
