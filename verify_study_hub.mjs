import { spawn } from 'child_process';
import fs from 'fs';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--disable-gpu',
  '--window-size=1440,900',
  'http://127.0.0.1:5173/'
]);

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json');
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
  console.log('Connecting:', wsUrl);

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
  await wait(1200);

  // 1. Verify layout components presence
  const componentsCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        hasPdfHub: !!document.querySelector("iframe"),
        hasStopwatch: !!document.querySelector("svg circle[stroke='url(#stopwatchGlowGradient)']"),
        hasGeminiVibe: !!document.querySelector("input[placeholder*='Late night']"),
        hasZoomToggle: !!document.getElementById("todo-focus-zoom-toggle"),
        hasModeSwitcher: document.querySelectorAll("button[title*='Mode'], button[title*='Focus']").length
      };
    })()`,
    returnByValue: true
  });
  console.log('Modules Check:', componentsCheck.result.result.value);

  // Capture full workspace screenshot
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot.result?.data) {
    fs.writeFileSync('/Users/vivekkumarsingh/Antigravity/to_do_list/study_hub_layout_overview.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved study_hub_layout_overview.png');
  }

  // 2. Test Zoom-In Focus Toggle
  console.log('Testing Zoom-In / Focus Toggle on Center Stage...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById("todo-focus-zoom-toggle").click();`
  });
  await wait(800);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot.result?.data) {
    fs.writeFileSync('/Users/vivekkumarsingh/Antigravity/to_do_list/todo_zoomed_focus_verification.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved todo_zoomed_focus_verification.png');
  }

  // 3. Test Esc key to zoom back out
  console.log('Pressing Escape to return to normal view...');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await wait(600);

  // 4. Test Stopwatch: Start and Split
  console.log('Testing Stopwatch Start & Split...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const startBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Start"));
      if (startBtn) startBtn.click();
    })()`
  });
  await wait(800);
  await send('Runtime.evaluate', {
    expression: `(() => {
      const splitBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Split"));
      if (splitBtn) splitBtn.click();
    })()`
  });

  // 5. Test Gemini Vibe generator
  console.log('Testing Gemini Vibe generator prompt...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector("input[placeholder*='Late night']");
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, "Late night Rust compiler & async streams");
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const genBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Generate Vibe"));
      if (genBtn) genBtn.click();
    })()`
  });
  await wait(1200);

  const playlistCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const tracks = Array.from(document.querySelectorAll("a[href*='youtube.com']"));
      return {
        trackLinks: tracks.length
      };
    })()`,
    returnByValue: true
  });
  console.log('Vibe Generator Playlist Output:', playlistCheck.result.result.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  chrome.kill();
  process.exit(1);
});
