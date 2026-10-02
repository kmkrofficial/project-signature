import sharp from "sharp";
import fs from "fs";
import path from "path";

const SVG_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#070c18"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Border Ring Gradient -->
    <linearGradient id="borderGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.7"/>
    </linearGradient>

    <!-- Monogram K Gradient -->
    <linearGradient id="kGrad" x1="16" y1="14" x2="48" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>

    <!-- Signature Flourish Gradient -->
    <linearGradient id="flourishGrad" x1="12" y1="46" x2="52" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>

    <!-- Radial Core Glow -->
    <radialGradient id="coreAura" cx="32" cy="32" r="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Base with Glow -->
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#coreAura)"/>
  <rect x="2" y="2" width="60" height="60" rx="14" stroke="url(#borderGrad)" stroke-width="2"/>

  <!-- Architectural 'K' (Keerthi) -->
  <!-- Vertical Stem -->
  <rect x="18" y="15" width="6" height="27" rx="3" fill="url(#kGrad)"/>

  <!-- Upper Diagonal Arm -->
  <path d="M24 28 L37.5 14.5 C38.8 13.2 41 14.1 41 16 C41 16.8 40.6 17.6 40 18.2 L28.5 29.7 Z" fill="url(#kGrad)"/>

  <!-- Lower Diagonal Leg -->
  <path d="M26 27 L39 40 C40 41 41.5 41.5 43 41.5 H43.5 C45 41.5 45.5 39.8 44.2 38.8 L31.5 26 Z" fill="url(#kGrad)"/>

  <!-- Signature Flourish Underline (Signature) -->
  <path d="M14 47 C22 50.5 34 50 45.5 45.5 C47.5 44.8 49 46.8 47.8 48.1 C42 52.5 25 53 13.5 49 C12.5 48.6 12.8 46.5 14 47 Z" fill="url(#flourishGrad)"/>

  <!-- Signature Accent Dot -->
  <circle cx="49" cy="43.5" r="2.2" fill="#38bdf8"/>
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
  console.log("🎨 Generating bespoke personal favicon and touch icons for Keerthi's Signature...");

  const baseSvgBuffer = Buffer.from(SVG_FAVICON.trim());

  // 1. Write SVG icons
  fs.writeFileSync(path.join("src", "app", "icon.svg"), SVG_FAVICON.trim());
  fs.writeFileSync(path.join("public", "icon.svg"), SVG_FAVICON.trim());
  fs.writeFileSync(path.join("public", "favicon.svg"), SVG_FAVICON.trim());
  console.log("  ✓ Wrote src/app/icon.svg, public/icon.svg, public/favicon.svg");

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
  fs.writeFileSync(path.join("public", "apple-touch-icon.png"), b180);
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
  fs.writeFileSync(path.join("public", "favicon.ico"), icoBuffer);
  console.log("  ✓ Generated multi-resolution favicon.ico (16px, 32px, 48px) for legacy browsers");

  console.log("✨ All personal favicon assets successfully created!");
}

run().catch((err) => {
  console.error("❌ Failed to generate favicons:", err);
  process.exit(1);
});
