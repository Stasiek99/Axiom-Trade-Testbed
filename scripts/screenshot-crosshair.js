const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(fs.existsSync);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForFunction(() => !document.querySelector('mat-spinner'), { timeout: 10000 }).catch(() => {});

  // Hover over the chart to trigger crosshair tooltip
  const canvas = await page.$('.chart-canvas');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.45);
  await new Promise(r => setTimeout(r, 800));

  const outputPath = path.join(__dirname, '..', 'screenshots', 'phase2-crosshair.png');
  await page.screenshot({ path: outputPath });
  console.log('Screenshot saved:', outputPath);
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
