import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputLogo = join(__dirname, "../public/logo-pwa.png");
const outputDir = join(__dirname, "../public/icons");

// Create icons directory
await mkdir(outputDir, { recursive: true });

console.log("Generating PWA icons from logo.png...");

// Generate regular icons
for (const size of sizes) {
  const outputPath = join(outputDir, `icon-${size}x${size}.png`);
  await sharp(inputLogo)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
  console.log(`✓ Generated ${size}x${size} icon`);
}

// Generate maskable icon (512x512 with padding for safe zone)
const maskablePath = join(outputDir, "icon-maskable-512x512.png");
await sharp(inputLogo)
  .resize(384, 384, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png()
  .toFile(maskablePath);
console.log(`✓ Generated maskable 512x512 icon`);

console.log("\nAll PWA icons generated successfully!");
