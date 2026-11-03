export type HighlightLanguage = 'json' | 'css' | 'markdown'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightJson(code: string): string {
  let html = ''
  let index = 0
  while (index < code.length) {
    const char = code[index] ?? ''
    if (char === '"') {
      const start = index
      index += 1
      while (index < code.length) {
        if (code[index] === '\\') {
          index += 2
          continue
        }
        if (code[index] === '"') {
          index += 1
          break
        }
        index += 1
      }
      const raw = code.slice(start, index)
      let look = index
      while (look < code.length && /\s/.test(code[look] ?? '')) look += 1
      const kind = code[look] === ':' ? 'tok-key' : 'tok-str'
      html += `<span class="${kind}">${escapeHtml(raw)}</span>`
      continue
    }
    if (char === '-' || (char >= '0' && char <= '9')) {
      const match = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(code.slice(index))
      if (match) {
        html += `<span class="tok-num">${match[0]}</span>`
        index += match[0].length
        continue
      }
    }
    const word = /^(true|false|null)\b/.exec(code.slice(index))
    if (word) {
      html += `<span class="tok-kw">${word[0]}</span>`
      index += word[0].length
      continue
    }
    html += escapeHtml(char)
    index += 1
  }
  return html
}

function highlightCss(code: string): string {
  let html = ''
  let index = 0
  while (index < code.length) {
    if (code.startsWith('/*', index)) {
      const end = code.indexOf('*/', index + 2)
      const stop = end === -1 ? code.length : end + 2
      html += `<span class="tok-cmt">${escapeHtml(code.slice(index, stop))}</span>`
      index = stop
      continue
    }
    const char = code[index] ?? ''
    if (char === '"' || char === "'") {
      const quote = char
      let stop = index + 1
      while (stop < code.length) {
        if (code[stop] === '\\') {
          stop += 2
          continue
        }
        if (code[stop] === quote) {
          stop += 1
          break
        }
        stop += 1
      }
      html += `<span class="tok-str">${escapeHtml(code.slice(index, stop))}</span>`
      index = stop
      continue
    }
    if (char === '-' && code[index + 1] === '-') {
      const match = /^--[A-Za-z0-9-_]+/.exec(code.slice(index))
      if (match) {
        html += `<span class="tok-var">${match[0]}</span>`
        index += match[0].length
        continue
      }
    }
    if (char >= '0' && char <= '9') {
      const match = /^\d+(?:\.\d+)?(?:px|%|em|rem|ms|s)?/.exec(code.slice(index))
      if (match) {
        html += `<span class="tok-num">${match[0]}</span>`
        index += match[0].length
        continue
      }
    }
    html += escapeHtml(char)
    index += 1
  }
  return html
}

function highlightMarkdown(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      if (line.startsWith('# ')) return `<span class="tok-key">${escapeHtml(line)}</span>`
      if (line.startsWith('## ')) return `<span class="tok-var">${escapeHtml(line)}</span>`
      return escapeHtml(line)
    })
    .join('\n')
}

export function highlightCode(code: string, language: HighlightLanguage): string {
  if (language === 'json') return highlightJson(code)
  if (language === 'css') return highlightCss(code)
  return highlightMarkdown(code)
}
