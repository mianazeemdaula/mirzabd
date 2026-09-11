// scripts/generate-logo.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 1. Standalone circular seal SVG (High Resolution 400x400)
const sealSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>
    <path id="topArc" d="M 26,100 A 74,74 0 1,1 174,100" />
    <path id="bottomArc" d="M 174,100 A 74,74 0 0,1 26,100" />
  </defs>

  <!-- Outer Fine Ring -->
  <circle cx="100" cy="100" r="97" fill="none" stroke="#0284C7" stroke-width="2.5" />
  <!-- Beaded decorative ring -->
  <circle cx="100" cy="100" r="93" fill="none" stroke="#0284C7" stroke-width="1.6" stroke-dasharray="2 3.5" />
  <!-- Inner Ring Background Banner -->
  <circle cx="100" cy="100" r="87.5" fill="#F0F9FF" stroke="#0284C7" stroke-width="1.8" />
  
  <!-- Inner Medallion Rings -->
  <circle cx="100" cy="100" r="61" fill="none" stroke="#0284C7" stroke-width="1.5" />
  <circle cx="100" cy="100" r="57.5" fill="none" stroke="#0284C7" stroke-width="1" stroke-dasharray="2 2" />
  <!-- Center Medallion Sky Blue Circle -->
  <circle cx="100" cy="100" r="54" fill="url(#skyGrad)" stroke="#0284C7" stroke-width="1.5" />

  <!-- Top Text: MIRZA BOOK DEPOT -->
  <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="13" font-weight="900" fill="#0F172A" letter-spacing="2.8">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">MIRZA BOOK DEPOT</textPath>
  </text>

  <!-- Bottom Text: ★ DEPALPUR • EST. 1981 ★ -->
  <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="10.5" font-weight="800" fill="#0284C7" letter-spacing="2.2">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">★ DEPALPUR • EST. 1981 ★</textPath>
  </text>

  <!-- Central Emblem: Open Book & Stars -->
  <!-- Left Page Shadow -->
  <path d="M 100 117 C 91 113, 76 111, 67 115 L 67 89 C 76 85, 91 87, 100 91 Z" fill="#0369A1" opacity="0.4" />
  <!-- Left Page -->
  <path d="M 100 115 C 92 111, 77 109, 68 113 L 68 87 C 77 83, 92 85, 100 89 Z" fill="#FFFFFF" stroke="#E0F2FE" stroke-width="0.8" />
  <!-- Right Page -->
  <path d="M 100 115 C 108 111, 123 109, 132 113 L 132 87 C 123 83, 108 85, 100 89 Z" fill="#FFFFFF" stroke="#E0F2FE" stroke-width="0.8" />
  <!-- Book Spine Center -->
  <path d="M 100 89 L 100 116" stroke="#0284C7" stroke-width="1.8" />

  <!-- Left Page Lines -->
  <path d="M 74 93 C 80 91, 88 91, 95 93 M 74 98 C 80 96, 88 96, 95 98 M 74 103 C 80 101, 88 101, 95 103 M 74 108 C 80 106, 88 106, 95 108" stroke="#7DD3FC" stroke-width="1.2" stroke-linecap="round" />
  <!-- Right Page Lines -->
  <path d="M 105 93 C 112 91, 120 91, 126 93 M 105 98 C 112 96, 120 96, 126 98 M 105 103 C 112 101, 120 101, 126 103 M 105 108 C 112 106, 120 106, 126 108" stroke="#7DD3FC" stroke-width="1.2" stroke-linecap="round" />
  <!-- Ribbon Bookmark -->
  <path d="M 100 115 L 100 122 L 97.5 119.5 L 95 122 L 95 114" fill="url(#goldGrad)" />

  <!-- Top Center Star -->
  <polygon points="100,66 101.8,70.5 106.5,70.8 103,74 104,78.5 100,76.2 96,78.5 97,74 93.5,70.8 98.2,70.5" fill="url(#goldGrad)" />
  <!-- Left Small Star -->
  <polygon points="87,71 88.2,74 91.5,74.2 89,76.5 89.8,79.5 87,78 84.2,79.5 85,76.5 82.5,74.2 85.8,74" fill="#FFFFFF" opacity="0.95" />
  <!-- Right Small Star -->
  <polygon points="113,71 114.2,74 117.5,74.2 115,76.5 115.8,79.5 113,78 110.2,79.5 111,76.5 108.5,74.2 111.8,74" fill="#FFFFFF" opacity="0.95" />
</svg>`;

// 2. Horizontal Header Logo SVG (1200x300 for razor-sharp Retina displays)
const horizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="1380" height="330">
  <defs>
    <linearGradient id="skyGradH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="goldGradH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>
    <path id="topArcH" d="M 12,55 A 43,43 0 1,1 98,55" />
    <path id="bottomArcH" d="M 98,55 A 43,43 0 0,1 12,55" />
  </defs>

  <!-- ================= SEAL EMBLEM (Left side) ================= -->
  <g transform="translate(4, 3)">
    <!-- Outer Ring -->
    <circle cx="52" cy="52" r="50" fill="none" stroke="#0284C7" stroke-width="1.8" />
    <!-- Beaded ring -->
    <circle cx="52" cy="52" r="47.5" fill="none" stroke="#0284C7" stroke-width="1.2" stroke-dasharray="1.5 2.5" />
    <!-- Ring Background -->
    <circle cx="52" cy="52" r="44.5" fill="#F0F9FF" stroke="#0284C7" stroke-width="1.4" />
    
    <!-- Inner Rings -->
    <circle cx="52" cy="52" r="31" fill="none" stroke="#0284C7" stroke-width="1.2" />
    <circle cx="52" cy="52" r="29" fill="none" stroke="#0284C7" stroke-width="0.8" stroke-dasharray="1.5 1.5" />
    <!-- Center Medallion -->
    <circle cx="52" cy="52" r="27" fill="url(#skyGradH)" stroke="#0284C7" stroke-width="1.2" />

    <!-- Top Text along Arc: MIRZA BOOK DEPOT -->
    <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="7.6" font-weight="900" fill="#0F172A" letter-spacing="1.4">
      <textPath href="#topArcH" startOffset="50%" text-anchor="middle">MIRZA BOOK DEPOT</textPath>
    </text>

    <!-- Bottom Text: ★ EST. 1981 ★ -->
    <text font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="6.4" font-weight="800" fill="#0284C7" letter-spacing="1.2">
      <textPath href="#bottomArcH" startOffset="50%" text-anchor="middle">★ DEPALPUR • 1981 ★</textPath>
    </text>

    <!-- Open Book in Center -->
    <path d="M 52 61 C 47 58.5, 38 57.5, 33 60 L 33 46 C 38 43.5, 47 44.5, 52 47 Z" fill="#FFFFFF" stroke="#E0F2FE" stroke-width="0.6" />
    <path d="M 52 61 C 57 58.5, 66 57.5, 71 60 L 71 46 C 66 43.5, 57 44.5, 52 47 Z" fill="#FFFFFF" stroke="#E0F2FE" stroke-width="0.6" />
    <path d="M 52 47 L 52 61.5" stroke="#0284C7" stroke-width="1.2" />
    <!-- Book Lines -->
    <path d="M 37 49.5 C 41 48.5, 46 48.5, 50 49.5 M 37 53 C 41 52, 46 52, 50 53 M 37 56.5 C 41 55.5, 46 55.5, 50 56.5" stroke="#7DD3FC" stroke-width="0.8" stroke-linecap="round" />
    <path d="M 54 49.5 C 58 48.5, 63 48.5, 67 49.5 M 54 53 C 58 52, 63 52, 67 53 M 54 56.5 C 58 55.5, 63 55.5, 67 56.5" stroke="#7DD3FC" stroke-width="0.8" stroke-linecap="round" />
    <!-- Bookmark Ribbon -->
    <path d="M 52 61 L 52 65 L 50.5 63.5 L 49 65 L 49 60.5" fill="url(#goldGradH)" />

    <!-- Center Top Star -->
    <polygon points="52,34 53.1,36.5 55.8,36.7 53.8,38.5 54.4,41 52,39.7 49.6,41 50.2,38.5 48.2,36.7 50.9,36.5" fill="url(#goldGradH)" />
    <polygon points="44,37 44.8,38.8 46.8,38.9 45.3,40.3 45.7,42.2 44,41.2 42.3,42.2 42.7,40.3 41.2,38.9 43.2,38.8" fill="#FFFFFF" opacity="0.9" />
    <polygon points="60,37 60.8,38.8 62.8,38.9 61.3,40.3 61.7,42.2 60,41.2 58.3,42.2 58.7,40.3 57.2,38.9 59.2,38.8" fill="#FFFFFF" opacity="0.9" />
  </g>

  <!-- ================= TYPOGRAPHY (Right side) ================= -->
  <g transform="translate(122, 10)">
    <!-- Main Header "MIRZA" -->
    <text x="0" y="38" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="900" fill="#0F172A" letter-spacing="2.5">
      MIRZA
    </text>
    <!-- Accent "BOOK DEPOT" in Sky Blue -->
    <text x="135" y="38" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="900" fill="#0284C7" letter-spacing="1.5">
      BOOK DEPOT
    </text>

    <!-- Refined Divider Line -->
    <line x1="2" y1="52" x2="325" y2="52" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="162" cy="52" r="3" fill="#0284C7" />

    <!-- Subtitle: DEPALPUR • EST. 1981 • EVERY PAGE A NEW WORLD -->
    <text x="3" y="74" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="3.2">
      DEPALPUR • EST. 1981 • BOOKSTORE
    </text>
  </g>
</svg>`;

async function generate() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 1. Save SVG files
  fs.writeFileSync(path.join(imagesDir, "logo-seal.svg"), sealSvg, "utf8");
  fs.writeFileSync(path.join(imagesDir, "logo-horizontal.svg"), horizontalSvg, "utf8");
  console.log("Saved SVG files to public/images/");

  // 2. Generate PNGs using Sharp
  await sharp(Buffer.from(sealSvg))
    .png()
    .toFile(path.join(imagesDir, "logo-seal.png"));
  console.log("Generated public/images/logo-seal.png");

  await sharp(Buffer.from(horizontalSvg))
    .png()
    .toFile(path.join(imagesDir, "logo-horizontal.png"));
  console.log("Generated public/images/logo-horizontal.png");

  // Also generate logo.png (general logo)
  await sharp(Buffer.from(horizontalSvg))
    .png()
    .toFile(path.join(imagesDir, "logo.png"));
  console.log("Generated public/images/logo.png");

  // Update app/icon.png with the new seal emblem
  const appIconPath = path.join(process.cwd(), "app", "icon.png");
  await sharp(Buffer.from(sealSvg))
    .resize(192, 192)
    .png()
    .toFile(appIconPath);
  console.log("Generated app/icon.png (favicon)");
}

generate().catch(err => {
  console.error("Error generating logos:", err);
  process.exit(1);
});
