import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--disable-gpu',
  '--window-size=1280,800',
  'http://127.0.0.1:5173/'
]);

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json');
      const tabs = await res.json();
      const appTab = tabs.find(t => t.url.includes('5173'));
      if (appTab && appTab.webSocketDebuggerUrl) {
        return appTab.webSocketDebuggerUrl;
      }
    } catch (e) {}
    await wait(300);
  }
  throw new Error('Tab not found');
}

async function run() {
  await wait(1500);
  const wsUrl = await getWsUrl();
  console.log('Connecting to WebSocket:', wsUrl);

  const ws = new globalThis.WebSocket(wsUrl);
  let idCounter = 1;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data.toString());
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  if (ws.readyState !== 1) {
    await new Promise(r => ws.addEventListener('open', r, { once: true }));
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await wait(1000);

  // 1. Initial State: "all" category
  let stateRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll(".glass-card"));
      return {
        count: cards.length,
        titles: cards.map(c => c.querySelector("h3")?.innerText)
      };
    })()`,
    returnByValue: true
  });
  console.log('Initial (Cosmos - All):', JSON.stringify(stateRes.result.result.value, null, 2));

  // 2. Click on "Missions" sphere (#category-sphere-missions)
  console.log('\n--- Clicking on "Missions" Orbital Sphere ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const sphere = document.getElementById('category-sphere-missions');
      sphere.click();
      return true;
    })()`
  });
  await wait(600);

  let missionsRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll(".glass-card"));
      const gravityAnchor = document.querySelector(".font-mono span.capitalize")?.innerText;
      return {
        gravityAnchor,
        count: cards.length,
        titles: cards.map(c => c.querySelector("h3")?.innerText)
      };
    })()`,
    returnByValue: true
  });
  console.log('Filtered Missions View:', JSON.stringify(missionsRes.result.result.value, null, 2));

  // 3. Take screenshot of Missions sphere filter
  let screenshot = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot.result?.data) {
    fs.writeFileSync('/Users/vivekkumarsingh/Antigravity/to_do_list/missions_sphere_verification.png', Buffer.from(screenshot.result.data, 'base64'));
    console.log('Saved missions_sphere_verification.png');
  }

  // 4. Click on "Deep Space" sphere (#category-sphere-deep-space)
  console.log('\n--- Clicking on "Deep Space" Orbital Sphere ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const sphere = document.getElementById('category-sphere-deep-space');
      sphere.click();
      return true;
    })()`
  });
  await wait(600);

  let deepSpaceRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll(".glass-card"));
      const gravityAnchor = document.querySelector(".font-mono span.capitalize")?.innerText;
      return {
        gravityAnchor,
        count: cards.length,
        titles: cards.map(c => c.querySelector("h3")?.innerText)
      };
    })()`,
    returnByValue: true
  });
  console.log('Filtered Deep Space View:', JSON.stringify(deepSpaceRes.result.result.value, null, 2));

  // 5. Take screenshot of Deep Space sphere filter
  screenshot = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot.result?.data) {
    fs.writeFileSync('/Users/vivekkumarsingh/Antigravity/to_do_list/deep_space_sphere_verification.png', Buffer.from(screenshot.result.data, 'base64'));
    console.log('Saved deep_space_sphere_verification.png');
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  chrome.kill();
  process.exit(1);
});
