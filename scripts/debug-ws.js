// Intercepts WebSocket messages from the running app for 15 seconds
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(fs.existsSync);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // Intercept WS frames via CDP
  const client = await page.createCDPSession();
  await client.send('Network.enable');

  const wsFrames = [];
  client.on('Network.webSocketFrameReceived', ({ response }) => {
    try {
      const msgs = JSON.parse(response.payloadData);
      msgs.forEach(m => wsFrames.push(m));
    } catch {}
  });

  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 12000)); // collect 12s of data

  console.log(`\n=== WS frames received (${wsFrames.length} total) ===`);
  const typeCounts = {};
  wsFrames.forEach(f => { typeCounts[f.T] = (typeCounts[f.T] || 0) + 1; });
  console.log('By type:', JSON.stringify(typeCounts));
  console.log('\nFirst 5 frames:');
  wsFrames.slice(0, 5).forEach(f => console.log(JSON.stringify(f)));
  if (wsFrames.some(f => f.T === 't')) {
    console.log('\nSample trade frame:');
    console.log(JSON.stringify(wsFrames.find(f => f.T === 't'), null, 2));
  }
  if (wsFrames.some(f => f.T === 'b')) {
    console.log('\nSample bar frame:');
    console.log(JSON.stringify(wsFrames.find(f => f.T === 'b'), null, 2));
  }

  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
