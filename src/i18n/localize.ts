type Translate = (key: string, values?: Record<string, string>) => string

const EXACT: Record<string, string> = {
  'Theme must be a JSON object': 'messages:themeMustBeObject',
  'meta must be an object': 'messages:metaObject',
  'meta.id must be a UUID': 'messages:metaUuid',
  'meta.version must use major.minor.patch': 'messages:metaVersion',
  'meta.presetId must be a string or null': 'messages:metaPreset',
  'meta.favorite must be true or false': 'messages:metaFavorite',
  'meta.createdAt must be an ISO timestamp': 'messages:metaCreated',
  'meta.updatedAt must be an ISO timestamp': 'messages:metaUpdated',
  'typography.fontFamily is not a supported font stack': 'messages:fontStack',
  'typography.monoFamily is not a supported font stack': 'messages:monoStack',
  'Invalid theme id': 'messages:invalidThemeId',
  'Theme path escapes the themes directory': 'messages:pathEscape',
  'tailwind.css is missing @theme': 'messages:missingThemeAt',
  'README.md does not explain React usage': 'messages:readmeReact',
  'Theme not found': 'messages:themeNotFound',
  'Theme file is too large': 'messages:themeTooLarge',
  'Theme file is not valid JSON': 'messages:themeInvalidJson',
  'Unreadable theme': 'messages:themeUnreadable',
  'Theme could not be read': 'messages:themeUnreadable',
  'Theme name is required': 'messages:themeNameRequired',
  'Import canceled': 'messages:importCanceled',
  'Import must be a file': 'messages:importNotFile',
  'Import file is not valid JSON': 'messages:themeInvalidJson',
  'Unknown export format': 'messages:unknownExport',
  'Choose an image file': 'messages:imageRequired',
  'Image must be 8 MB or smaller': 'messages:imageTooLarge',
  'File content is not a supported image': 'messages:imageUnsupported',
  'File is too large': 'messages:fileTooLarge',
  'Invalid request': 'messages:invalidRequest',
  'Zoom must be between 0.8 and 1.5': 'messages:zoomRange',
  'Unknown error': 'messages:unknownError',
  'Invalid IPC response': 'messages:invalidRequest',
  'Request failed': 'messages:unknownError'
}

function describeLine(line: string, translate: Translate): string {
  if (line.startsWith('code:')) {
    const body = line.slice('code:'.length)
    const splitAt = body.indexOf('|')
    const key = splitAt === -1 ? body : body.slice(0, splitAt)
    const detail = splitAt === -1 ? '' : body.slice(splitAt + 1)
    return translate(`messages:${key}`, { detail, name: detail, token: detail, version: detail })
  }
  const exact = EXACT[line]
  if (exact) return translate(exact)
  const rules: Array<{ pattern: RegExp; key: string; values: (match: RegExpMatchArray) => Record<string, string> }> = [
    {
      pattern: /^Unsupported schemaVersion\. Expected (\d+)$/,
      key: 'messages:unsupportedSchema',
      values: (match) => ({ version: match[1] ?? '' })
    },
    {
      pattern: /^(.*) contains a forbidden key$/,
      key: 'messages:forbiddenKey',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be a finite number$/,
      key: 'messages:finiteNumber',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be between (-?\d+(?:\.\d+)?) and (-?\d+(?:\.\d+)?)$/,
      key: 'messages:mustBeBetween',
      values: (match) => ({ label: match[1] ?? '', min: match[2] ?? '', max: match[3] ?? '' })
    },
    {
      pattern: /^(.*) must be true or false$/,
      key: 'messages:mustBeBoolean',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be a HEX, RGB, or HSL color$/,
      key: 'messages:mustBeColor',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be a string$/,
      key: 'messages:mustBeString',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be (\d+)-(\d+) characters$/,
      key: 'messages:mustBeLength',
      values: (match) => ({ label: match[1] ?? '', min: match[2] ?? '', max: match[3] ?? '' })
    },
    {
      pattern: /^glass\.depth must be one of (.+)$/,
      key: 'messages:depthEnum',
      values: (match) => ({ values: match[1] ?? '' })
    },
    {
      pattern: /^glow\.level must be one of (.+)$/,
      key: 'messages:levelEnum',
      values: (match) => ({ values: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must be an object$/,
      key: 'messages:mustBeObject',
      values: (match) => ({ label: match[1] ?? '' })
    },
    {
      pattern: /^(.*) is empty$/,
      key: 'messages:fileEmpty',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^(.*) must contain an object$/,
      key: 'messages:fileObject',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^(.*) is not valid JSON$/,
      key: 'messages:fileJson',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^(.*) is missing CSS variables$/,
      key: 'messages:missingVars',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^shadcn\.css is missing (.+)$/,
      key: 'messages:missingToken',
      values: (match) => ({ token: match[1] ?? '' })
    },
    {
      pattern: /^Missing (.+)$/,
      key: 'messages:missingFile',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^Unable to export (.+)$/,
      key: 'messages:unableToExport',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^Package is missing (.+)$/,
      key: 'messages:packageMissing',
      values: (match) => ({ detail: match[1] ?? '' })
    },
    {
      pattern: /^(.*) has unbalanced braces$/,
      key: 'messages:unbalanced',
      values: (match) => ({ name: match[1] ?? '' })
    },
    {
      pattern: /^(.*) has an unterminated string$/,
      key: 'messages:unterminated',
      values: (match) => ({ name: match[1] ?? '' })
    }
  ]
  for (const rule of rules) {
    const match = line.match(rule.pattern)
    if (match) return translate(rule.key, rule.values(match))
  }
  return line
}

export function describeError(message: string, translate: Translate): string {
  return message
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => describeLine(line, translate))
    .join('\n')
}
