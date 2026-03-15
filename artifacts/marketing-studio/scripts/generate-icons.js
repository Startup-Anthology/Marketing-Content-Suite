const sharp = require("sharp");
const path = require("path");

const BG_COLOR = "#000000";
const ACCENT_COLOR = "#BB935B";

function createSALogoSvg(size) {
  const letterSize = Math.floor(size * 0.4);
  const strokeWidth = Math.max(2, Math.floor(size * 0.02));
  const borderRadius = Math.floor(size * 0.18);
  const borderInset = Math.floor(size * 0.06);
  const borderSize = size - borderInset * 2;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
  <rect x="${borderInset}" y="${borderInset}" width="${borderSize}" height="${borderSize}"
    rx="${borderRadius}" ry="${borderRadius}"
    fill="none" stroke="${ACCENT_COLOR}" stroke-width="${strokeWidth}"/>
  <text x="${size / 2}" y="${size / 2 + letterSize * 0.35}"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${letterSize}" font-weight="bold"
    fill="${ACCENT_COLOR}" text-anchor="middle">SA</text>
</svg>`;
}

async function generateIcon(size, outputPath) {
  const svg = Buffer.from(createSALogoSvg(size));
  await sharp(svg).resize(size, size).png().toFile(outputPath);
  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

async function main() {
  const assetsDir = path.resolve(__dirname, "..", "assets", "images");
  const publicIconsDir = path.resolve(__dirname, "..", "public", "icons");

  await generateIcon(1024, path.join(assetsDir, "icon.png"));
  await generateIcon(1024, path.join(assetsDir, "splash-icon.png"));
  await generateIcon(48, path.join(assetsDir, "favicon.png"));

  await generateIcon(192, path.join(publicIconsDir, "icon-192.png"));
  await generateIcon(512, path.join(publicIconsDir, "icon-512.png"));

  console.log("All icons generated successfully.");
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
