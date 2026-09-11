// scripts/process-user-logo.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function main() {
  const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
  if (!fs.existsSync(logoPath)) {
    console.error("public/images/logo.png not found!");
    process.exit(1);
  }

  console.log("Processing user logo from public/images/logo.png...");

  // 1. app/icon.png (192x192)
  await sharp(logoPath)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), "app", "icon.png"));
  console.log("Created app/icon.png");

  // 2. app/apple-icon.png (180x180)
  await sharp(logoPath)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), "app", "apple-icon.png"));
  console.log("Created app/apple-icon.png");

  // 3. app/favicon.ico & public/favicon.ico (32x32 / 48x48)
  const ico32 = await sharp(logoPath)
    .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(process.cwd(), "app", "favicon.ico"), ico32);
  fs.writeFileSync(path.join(process.cwd(), "public", "favicon.ico"), ico32);
  console.log("Created app/favicon.ico and public/favicon.ico");

  // 4. public/images/logo-seal.png
  await sharp(logoPath)
    .png()
    .toFile(path.join(process.cwd(), "public", "images", "logo-seal.png"));
  console.log("Created public/images/logo-seal.png");

  // 5. public/images/logo-horizontal.png
  // Combine user's 500x500 seal with typography on a transparent canvas
  const sealSmall = await sharp(logoPath)
    .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const textSvg = Buffer.from(`
    <svg width="600" height="160" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="65" font-family="'Playfair Display', Georgia, serif" font-size="52" font-weight="900" fill="#0F172A" letter-spacing="3">
        MIRZA
      </text>
      <text x="210" y="65" font-family="'Playfair Display', Georgia, serif" font-size="52" font-weight="900" fill="#0284C7" letter-spacing="2">
        BOOK DEPOT
      </text>
      <line x1="12" y1="88" x2="520" y2="88" stroke="#E2E8F0" stroke-width="2.5" />
      <circle cx="260" cy="88" r="4.5" fill="#0284C7" />
      <text x="14" y="125" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="19" font-weight="700" fill="#64748B" letter-spacing="5">
        DEPALPUR • EST. 1990 • BOOKSTORE
      </text>
    </svg>
  `);

  await sharp({
    create: {
      width: 800,
      height: 180,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: sealSmall, top: 10, left: 10 },
      { input: textSvg, top: 10, left: 185 },
    ])
    .png()
    .toFile(path.join(process.cwd(), "public", "images", "logo-horizontal.png"));
  console.log("Created public/images/logo-horizontal.png");

  console.log("All logos and favicons processed successfully!");
}

main().catch((err) => {
  console.error("Error processing user logo:", err);
  process.exit(1);
});
