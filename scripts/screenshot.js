// scripts/screenshot.js — headless screenshot of the running dev server.
// Usage: node scripts/screenshot.js [output-path]
// Requires: npm install puppeteer-core (already done)
// Requires: Google Chrome installed at default Windows path.

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(fs.existsSync);

async function main() {
  if (!CHROME_PATH) {
    console.error('Chrome not found. Install Google Chrome or set CHROME_PATH.');
    process.exit(1);
  }

  const outputPath = process.argv[2]
    || path.join(__dirname, '..', 'screenshots', `app-snapshot-${Date.now()}.png`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 15000 });
  // Wait for chart to finish loading (spinner gone)
  await page.waitForFunction(
    () => !document.querySelector('mat-spinner'),
    { timeout: 10000 }
  ).catch(() => console.warn('Spinner still visible — chart may not have loaded.'));

  await page.screenshot({ path: outputPath });
  console.log('Screenshot saved:', outputPath);
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
