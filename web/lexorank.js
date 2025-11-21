import { LexoRank } from "lexorank";

// Initial items
let items = [];

// Helper: push item
function add(text, rank) {
  console.log("Adding item:", text, rank.toString());
  items.push({ text, rank: rank.toString() });
}

// 1. First item
const r1 = LexoRank.middle();
add("A", r1);

const r12 = r1.genNext();
const r13 = r1.genNext();

console.log(r12.toString(), r13.toString());

// 2. Insert at end
// const r2 = r1.between(LexoRank.max());
const r2 = LexoRank.middle();
add("B", r2);

// 3. Insert between A and B
const r3 = r1.between(r2);
add("C", r3);

// 4. Insert at start
const r4 = LexoRank.min().between(r1);
add("Start", r4);

// Sort and print
items.sort((a, b) => a.rank.localeCompare(b.rank));

console.log("Sorted:");
for (const it of items) {
  console.log(it.rank, it.text);
}
