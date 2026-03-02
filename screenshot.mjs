import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Get next auto-incremented filename
function getNextFilename(label) {
  const files = fs.existsSync(screenshotsDir)
    ? fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'))
    : [];

  let max = 0;
  for (const f of files) {
    const match = f.match(/^screenshot-(\d+)/);
    if (match) max = Math.max(max, parseInt(match[1]));
  }

  const n = max + 1;
  const suffix = label ? `-${label}` : '';
  return path.join(screenshotsDir, `screenshot-${n}${suffix}.png`);
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const outputPath = getNextFilename(label);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Small pause for any animations to settle
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log(`Screenshot saved: ${outputPath}`);
})();
