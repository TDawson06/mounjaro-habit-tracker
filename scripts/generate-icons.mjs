/**
 * Generates PNG app icons from public/app-icon.svg for iOS and PWA.
 * Run before build so "Add to Home Screen" uses the correct icon.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const svgPath = path.join(publicDir, "app-icon.svg");
const svg = readFileSync(svgPath);

async function generate() {
  for (const size of [180, 192, 512]) {
    const outPath = path.join(publicDir, `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(outPath);
    console.log(`Generated ${outPath}`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
