// import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

const BASE = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function midpoint(a, b) {
  if (!a) {
    if (!b) return "h"; // first key
    return midpoint("", b);
  }
  if (!b) {
    return midpoint(a, "");
  }

  const base = BASE.length;
  let result = "";

  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i <= maxLen; i++) {
    const ai = i < a.length ? BASE.indexOf(a[i]) : -1;
    const bi = i < b.length ? BASE.indexOf(b[i]) : base;
    const m = Math.floor((ai + bi + 1) / 2);
    result += BASE[m];
    if (ai + 1 < bi) break;
  }

  return result;
}

function generateKeyBetween(left, right) {
  if (!left) {
    if (!right) return "h"; // first key
    return midpoint("", right);
  }
  if (!right) {
    return midpoint(left, "");
  }
  return midpoint(left, right);
}

// Why is this order key invalid?
const key1 = null;
const key2 = "b";

// Try to generate a key between null and "b"
const keyBetween = generateKeyBetween(key1, key2);
console.log("Key between:", keyBetween);

// Try to generate 10 keys between null and "b"
// const keys = generateNKeysBetween(key1, key2, 10);
// console.log("Generated keys:", keys);

// Explanation:
// If you observe an "invalid order key", it's possible that the keys generated here cannot properly fit between
// the boundaries provided (e.g., null to "b"), or that the algorithm produces padding or unusual
// keys at boundaries. Make sure to check the valid range of inputs for generateKeyBetween and generateNKeysBetween.
