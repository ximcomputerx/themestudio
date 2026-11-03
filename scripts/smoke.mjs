import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const port = 9223
const electron = path.resolve('node_modules/electron/dist/electron.exe')
const log = []
const child = spawn(electron, ['.', `--remote-debugging-port=${port}`], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: false
})
child.stdout.on('data', (chunk) => log.push(String(chunk)))
child.stderr.on('data', (chunk) => log.push(String(chunk)))

const checks = []
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail })
  if (!ok) console.error(`FAIL ${name} ${detail}`)
  else console.log(`PASS ${name}`)
}

async function waitForPage() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Electron exited early ${child.exitCode}\n${log.join('')}`)
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`)
      const pages = await response.json()
      const page = pages.find((item) => item.type === 'page' && item.webSocketDebuggerUrl)
      if (page) return page
    } catch {
      // The port is not open yet.
    }
    await delay(200)
  }
  throw new Error(`No debuggable page\n${log.join('')}`)
}

function rpc(ws) {
  let seq = 0
  const pending = new Map()
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(JSON.stringify(message.error)))
      else resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') {
      log.push(`EXC ${JSON.stringify(message.params.exceptionDetails?.text || message.params)}`)
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      log.push(`CONSOLE ${JSON.stringify(message.params.args?.map((arg) => arg.value ?? arg.description))}`)
    }
  })
  return (method, params = {}) => {
    const id = ++seq
    ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
  }
}

async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || JSON.stringify(result.exceptionDetails))
  return result.result?.value
}

try {
  const page = await waitForPage()
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })
  const send = rpc(ws)
  await send('Runtime.enable')
  let ready = false
  for (let attempt = 0; attempt < 40; attempt += 1) {
    ready = await evaluate(send, `Boolean(document.querySelector('[data-testid="preview-root"]')) && document.body.innerText.includes('Theme Studio')`)
    if (ready) break
    await delay(250)
  }
  check('app boots into the studio', ready === true, log.join('').slice(-500))
  const security = await evaluate(send, `({
    requireType: typeof require,
    processType: typeof process,
    ipc: typeof window.ipcRenderer,
    fs: typeof window.fs,
    api: typeof window.themeStudio?.themes?.list
  })`)
  check('renderer has no require', security.requireType === 'undefined', JSON.stringify(security))
  check('renderer has no process', security.processType === 'undefined', JSON.stringify(security))
  check('renderer has no ipcRenderer', security.ipc === 'undefined', JSON.stringify(security))
  check('preload api exists', security.api === 'function', JSON.stringify(security))

  const before = await evaluate(send, `document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-color-primary')`)
  check('preview exposes a primary token', typeof before === 'string' && before.startsWith('#'), before)
  await evaluate(send, `(() => {
    const input = document.querySelector('[data-testid="color-primary"]')
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    set.call(input, '#FF00AA')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await delay(50)
  const after = await evaluate(send, `document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-color-primary')`)
  check('color edit updates the preview immediately', after === '#FF00AA', after)
  await evaluate(send, `(() => {
    const input = document.querySelector('[data-testid="glass-blur"]')
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    set.call(input, '4')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('blur', { bubbles: true }))
  })()`)
  await delay(50)
  const blur = await evaluate(send, `document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-glass-blur')`)
  check('blur edit updates the preview immediately', blur === '4px', blur)
  await evaluate(send, `document.querySelector('[data-testid="undo"]').click()`)
  await delay(50)
  const undone = await evaluate(send, `document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-glass-blur')`)
  check('undo restores the previous blur', undone !== '4px', undone)
  await evaluate(send, `document.querySelector('[data-testid="redo"]').click()`)
  await delay(50)
  const redone = await evaluate(send, `document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-glass-blur')`)
  check('redo reapplies the blur', redone === '4px', redone)
  await evaluate(send, `document.querySelector('[data-testid="scene-components"]').click()`)
  await delay(50)
  const components = await evaluate(send, `({
    buttons: Boolean(document.querySelector('[data-testid="state-primary"]')),
    fields: Boolean(document.querySelector('[data-testid="check-glass"]')),
    type: document.body.innerText.includes('中英文混排')
  })`)
  check('component preview renders controls', components.buttons && components.fields && components.type, JSON.stringify(components))
  await evaluate(send, `document.querySelector('[data-testid="scene-workspace"]').click()`)
  await delay(50)
  const terminal = await evaluate(send, `(() => {
    const node = document.querySelector('.pv-terminal')
    const style = getComputedStyle(node)
    return { text: node.innerText.includes('终端文字保持清晰'), filter: style.backdropFilter }
  })()`)
  check('terminal stays sharp and unblurred', terminal.text === true && (terminal.filter === 'none' || terminal.filter === ''), JSON.stringify(terminal))
  await evaluate(send, `(() => {
    const button = document.querySelector('[data-testid="before-after"]')
    if (!button) return false
    button.click()
    return true
  })()`)
  await delay(50)
  const compare = await evaluate(send, `Boolean(document.querySelector('[data-testid="preview-baseline"]'))`)
  check('before/after mounts both themes', compare === true)
  const originalLanguage = await evaluate(send, `window.themeStudio.language.getPreference()`)
  await evaluate(send, `(() => {
    document.querySelector('[data-testid="open-settings"]').click()
  })()`)
  await delay(50)
  const switched = await evaluate(send, `(() => {
    const node = document.querySelector('[data-testid="language-select"]')
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.click()
    return true
  })()`)
  await delay(80)
  await evaluate(send, `document.querySelector('.studio-option[data-value="en-US"]').click()`)
  await delay(80)
  const english = await evaluate(send, `document.body.innerText.includes('Glass Opacity') && document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-color-primary')`)
  check('english switch keeps the edited color', switched === true && english === '#FF00AA', String(english))
  await evaluate(send, `(() => {
    const node = document.querySelector('[data-testid="language-select"]')
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.click()
  })()`)
  await delay(80)
  await evaluate(send, `document.querySelector('.studio-option[data-value="zh-CN"]').click()`)
  await delay(80)
  const chinese = await evaluate(send, `({
    text: document.body.innerText.includes('玻璃透明度'),
    color: document.querySelector('[data-testid="preview-root"]').style.getPropertyValue('--ts-color-primary'),
    menu: document.body.innerText.includes('保存')
  })`)
  check('chinese switch keeps the theme', chinese.text === true && chinese.color === '#FF00AA', JSON.stringify(chinese))
  await evaluate(send, `(() => {
    const node = document.querySelector('[data-testid="language-select"]')
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    node.click()
  })()`)
  await delay(80)
  await evaluate(send, `(() => {
    document.querySelector('.studio-option[data-value=${JSON.stringify(originalLanguage)}]').click()
    document.querySelector('[data-testid="close-settings"]').click()
    return true
  })()`)
  await delay(80)
  await evaluate(send, `document.querySelector('[data-testid="save-theme"]').click()`)
  await delay(400)
  const library = await evaluate(send, `window.themeStudio.themes.list()`)
  check('save writes a theme file', Array.isArray(library) && library.some((item) => item.broken === false), JSON.stringify(library).slice(0, 300))
  const diagnostics = await evaluate(send, `window.themeStudio.app.diagnostics()`)
  check('diagnostics report a DPI scale', typeof diagnostics?.scaleFactor === 'number' && diagnostics.scaleFactor > 0, JSON.stringify(diagnostics))
  const corrupt = await evaluate(send, `window.themeStudio.themes.save({ schemaVersion: 1 }).then(() => 'accepted').catch((error) => error.message)`)
  check('corrupt save is rejected', typeof corrupt === 'string' && corrupt !== 'accepted' && corrupt.includes('meta'), corrupt)
  ws.close()
  child.kill()
  await delay(400)
  const relaunch = spawn(electron, ['.', `--remote-debugging-port=${port + 1}`], { cwd: process.cwd(), stdio: 'ignore', windowsHide: false })
  let restored = null
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port + 1}/json`)
      const pages = await response.json()
      const next = pages.find((item) => item.type === 'page' && item.webSocketDebuggerUrl)
      if (next) {
        const socket = new WebSocket(next.webSocketDebuggerUrl)
        await new Promise((resolve) => socket.addEventListener('open', resolve))
        const call = rpc(socket)
        await call('Runtime.enable')
        for (let inner = 0; inner < 30; inner += 1) {
          restored = await evaluate(call, `document.querySelector('[data-testid="preview-root"]')?.style.getPropertyValue('--ts-color-primary') || ''`)
          if (restored) break
          await delay(200)
        }
        socket.close()
        break
      }
    } catch {
      // Wait for the second process.
    }
    await delay(200)
  }
  relaunch.kill()
  check('restart restores the edited theme', restored === '#FF00AA', restored || '')
  const failed = checks.filter((item) => !item.ok)
  writeFileSync('scripts/smoke-result.json', JSON.stringify({ checks, log: log.join('').slice(-4000) }, null, 2))
  if (failed.length) process.exit(1)
  process.exit(0)
} catch (error) {
  console.error(error)
  writeFileSync('scripts/smoke-result.json', JSON.stringify({ checks, error: String(error), log: log.join('').slice(-4000) }, null, 2))
  child.kill()
  process.exit(1)
}
