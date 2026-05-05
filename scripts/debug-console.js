// Patches the running app to log WS events, then reads the console for 15s
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find(fs.existsSync);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,        // visible so it REUSES existing session? No — launches new
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  // Inject a WS proxy BEFORE the page loads to spy on messages
  await page.evaluateOnNewDocument(() => {
    const OriginalWS = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      const ws = new OriginalWS(url, protocols);
      ws.addEventListener('message', (evt) => {
        try {
          const msgs = JSON.parse(evt.data);
          msgs.forEach(m => console.log('[WS-IN]', JSON.stringify(m)));
        } catch {}
      });
      return ws;
    };
    window.WebSocket.prototype = OriginalWS.prototype;
    window.WebSocket.CONNECTING = OriginalWS.CONNECTING;
    window.WebSocket.OPEN = OriginalWS.OPEN;
    window.WebSocket.CLOSING = OriginalWS.CLOSING;
    window.WebSocket.CLOSED = OriginalWS.CLOSED;
  });

  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2', timeout: 15000 });
  console.log('Collecting WS messages for 15s...');
  await new Promise(r => setTimeout(r, 15000));

  const wsMsgs = logs.filter(l => l.includes('[WS-IN]'));
  const byType = {};
  wsMsgs.forEach(l => {
    try {
      const m = JSON.parse(l.replace('[console] [WS-IN] ', '').replace('[log] [WS-IN] ', ''));
      byType[m.T] = (byType[m.T] || 0) + 1;
    } catch {}
  });

  console.log(`\nTotal WS messages: ${wsMsgs.length}`);
  console.log('By type:', JSON.stringify(byType));
  console.log('\nFirst 8 messages:');
  wsMsgs.slice(0, 8).forEach(l => console.log(l));

  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
