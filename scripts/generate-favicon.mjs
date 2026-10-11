import sharp from "sharp";
import fs from "fs";
import path from "path";

// Exact Cinzel Decorative Bold letter 'S' vector glyph
// Extracted directly from CinzelDecorative-Bold.ttf (the font used for "Signature")
// Scaled and optically centered on a 64x64 canvas.
const CINZEL_DECORATIVE_S_PATH = "M20.36 32.83L20.83 33.19Q18.77 36.49 18.77 39.95L18.77 39.95Q18.77 43.71 21.50 46.81L21.50 46.81Q23 48.56 25.29 49.54Q27.59 50.52 30.32 50.52Q33.06 50.52 35.22 49.49L35.22 49.49Q39.56 47.38 39.56 42.58L39.56 42.58Q39.56 40.77 38.35 38.76Q37.13 36.75 34.71 35.15L34.71 35.15L25.94 29.27Q20.83 26.07 20.83 21.01L20.83 21.01Q20.83 20.49 20.88 19.98L20.88 19.98Q21.19 16 24.05 13.50Q26.92 11 31.72 11L31.72 11Q34.66 11 38.84 11.52L38.84 11.52L42.04 11.52L41.36 19.10L40.90 19.10Q40.85 16.42 38.84 14.79Q36.82 13.17 33.52 13.17L33.52 13.17Q29.50 13.17 27.69 15.59L27.69 15.59Q26.81 16.83 26.81 18.28Q26.81 19.72 27.69 20.73Q28.57 21.73 30.48 22.92L30.48 22.92L40.13 29.21Q43.07 31.12 44.72 33.70L44.72 33.70Q46.68 36.75 46.68 39.95L46.68 39.95Q46.68 42.01 45.83 44.31Q44.98 46.60 43.04 48.56Q41.11 50.52 38.06 51.76Q35.02 53 31.33 53Q27.64 53 24.65 51.71L24.65 51.71Q19.13 49.39 17.63 43.61L17.63 43.61Q17.32 42.37 17.32 41.03L17.32 41.03Q17.32 36.70 20.36 32.83L20.36 32.83Z";

const SVG_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Background Slate/Navy Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#121829"/>
    </linearGradient>

    <!-- Border Ring Gradient (Burnished Gold / Topaz) -->
    <linearGradient id="borderGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.75"/>
    </linearGradient>

    <!-- Monogram S Gradient (Signature Brand Topaz & Gold) -->
    <linearGradient id="sGrad" x1="16" y1="11" x2="48" y2="53" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Radial Core Aura Glow -->
    <radialGradient id="coreAura" cx="32" cy="32" r="26" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Squircle with Ambient Glow -->
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#coreAura)"/>
  <rect x="2" y="2" width="60" height="60" rx="14" stroke="url(#borderGrad)" stroke-width="2"/>

  <!-- Cinzel Decorative 'S' Monogram (The exact "Signature" font) -->
  <path d="${CINZEL_DECORATIVE_S_PATH}" fill="url(#sGrad)"/>
</svg>
`;

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

async function run() {
  console.log("🎨 Generating Cinzel Decorative 'S' favicon and touch icons for Signature...");

  const baseSvgBuffer = Buffer.from(SVG_FAVICON.trim());

  // 1. Write SVG icons
  // app/ file conventions serve /icon.svg, /apple-icon.png and /favicon.ico
  fs.writeFileSync(path.join("src", "app", "icon.svg"), SVG_FAVICON.trim());
  console.log("  ✓ Wrote src/app/icon.svg");

  // 2. Generate PNGs for various resolutions
  const [b16, b32, b48, b180, b192, b512] = await Promise.all([
    sharp(baseSvgBuffer).resize(16, 16).png().toBuffer(),
    sharp(baseSvgBuffer).resize(32, 32).png().toBuffer(),
    sharp(baseSvgBuffer).resize(48, 48).png().toBuffer(),
    sharp(baseSvgBuffer).resize(180, 180).png().toBuffer(),
    sharp(baseSvgBuffer).resize(192, 192).png().toBuffer(),
    sharp(baseSvgBuffer).resize(512, 512).png().toBuffer(),
  ]);

  // 3. Write Apple touch icon & standard PWA icons
  fs.writeFileSync(path.join("src", "app", "apple-icon.png"), b180);
  fs.writeFileSync(path.join("public", "icon-192.png"), b192);
  fs.writeFileSync(path.join("public", "icon-512.png"), b512);
  console.log("  ✓ Generated Apple Touch and PWA icons (180x180, 192x192, 512x512)");

  // 4. Build multi-resolution ICO file (16, 32, 48)
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: b16 },
    { width: 32, height: 32, buffer: b32 },
    { width: 48, height: 48, buffer: b48 },
  ]);

  fs.writeFileSync(path.join("src", "app", "favicon.ico"), icoBuffer);
  console.log("  ✓ Generated multi-resolution favicon.ico (16px, 32px, 48px) for legacy browsers");

  console.log("✨ All Cinzel Decorative 'S' favicon assets successfully created!");
}

run().catch((err) => {
  console.error("❌ Failed to generate favicons:", err);
  process.exit(1);
});
