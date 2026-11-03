import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const child = spawn('release/win-unpacked/Theme Studio.exe', ['--remote-debugging-port=9226'], {
  stdio: 'ignore'
})

let page
for (let attempt = 0; attempt < 40; attempt += 1) {
  if (child.exitCode !== null) {
    console.error(`EXIT ${child.exitCode}`)
    process.exit(1)
  }
  try {
    const pages = await (await fetch('http://127.0.0.1:9226/json')).json()
    page = pages.find((item) => item.type === 'page' && item.webSocketDebuggerUrl)
    if (page) break
  } catch {
    // Port is not open yet.
  }
  await delay(250)
}

if (!page) {
  console.error('NO_PAGE')
  child.kill()
  process.exit(1)
}

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) => ws.addEventListener('open', resolve))
let seq = 0
const pending = new Map()
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
})
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
await send('Runtime.enable')

async function evaluate(expression) {
  const message = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (message.result?.exceptionDetails) throw new Error(JSON.stringify(message.result.exceptionDetails))
  return message.result?.result?.value
}

let text = ''
for (let attempt = 0; attempt < 30; attempt += 1) {
  text = await evaluate('document.body?.innerText || ""')
  if (String(text).includes('Theme Studio')) break
  await delay(200)
}
const security = await evaluate(`(async () => ({
  requireType: typeof require,
  api: typeof window.themeStudio?.themes?.list,
  primary: document.querySelector('[data-testid="preview-root"]')?.style.getPropertyValue('--ts-color-primary') || '',
  packaged: await window.themeStudio.app.diagnostics()
}))()`)
console.log(JSON.stringify({ booted: String(text).includes('Theme Studio'), preview: String(text).slice(0, 180), security }, null, 2))
ws.close()
child.kill()
process.exit(0)
