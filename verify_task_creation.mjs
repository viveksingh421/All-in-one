import { spawn } from 'child_process';
import http from 'http';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
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
      const res = await fetch('http://127.0.0.1:9223/json');
      const tabs = await res.json();
      const appTab = tabs.find(t => t.url.includes('5173'));
      if (appTab && appTab.webSocketDebuggerUrl) {
        return appTab.webSocketDebuggerUrl;
      }
    } catch (e) {
      // retry
    }
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

  // 1. Check existing cards
  let evalResult = await send('Runtime.evaluate', {
    expression: `document.querySelectorAll(".glass-card").length`
  });
  console.log('Initial floating card count:', evalResult.result.result.value);

  // 2. Type task name into the command bar input box
  const taskText = "Calibrate Quantum Telemetry Receiver";
  console.log('Typing into command bar input: "' + taskText + '"...');

  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.getElementById('command-task-input');
      input.focus();
      // Set value simulating React synthetic event
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(taskText)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return input.value;
    })()`
  });

  await wait(500);

  // Verify input value
  let inputVal = await send('Runtime.evaluate', {
    expression: `document.getElementById('command-task-input').value`
  });
  console.log('Current input value:', inputVal.result.result.value);

  // 3. Click "+ Launch" button
  console.log('Clicking "+ Launch" button...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('command-task-submit');
      btn.click();
      return true;
    })()`
  });

  await wait(1000);

  // 4. Verify new task card populated in container
  evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const cards = Array.from(document.querySelectorAll(".glass-card"));
      const titles = cards.map(c => c.querySelector("h3") ? c.querySelector("h3").innerText : '');
      const emptyState = document.querySelector(".glass-panel h3") ? document.querySelector(".glass-panel h3").innerText : null;
      return {
        cardCount: cards.length,
        titles,
        emptyStateVisible: !!(emptyState && emptyState.includes("Weightless and Clear"))
      };
    })()`,
    returnByValue: true
  });

  console.log('Verification Result:', JSON.stringify(evalResult.result.result.value, null, 2));

  // Take screenshot as proof
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshotRes.result && screenshotRes.result.data) {
    const fs = await import('fs');
    fs.writeFileSync('/Users/vivekkumarsingh/Antigravity/to_do_list/task_created_verification.png', Buffer.from(screenshotRes.result.data, 'base64'));
    console.log('Screenshot saved to task_created_verification.png');
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  chrome.kill();
  process.exit(1);
});
