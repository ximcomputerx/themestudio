let current: HTMLElement | null = null

export function setInspectedElement(element: HTMLElement | null): void {
  current = element
}

export function getInspectedElement(): HTMLElement | null {
  return current && current.isConnected ? current : null
}

export function readInspectStyle(element: HTMLElement): Record<string, string> {
  const computed = getComputedStyle(element)
  return {
    background: computed.backgroundColor,
    color: computed.color,
    border: `${computed.borderTopWidth} ${computed.borderTopStyle} ${computed.borderTopColor}`,
    borderRadius: computed.borderRadius,
    boxShadow: computed.boxShadow,
    filter: computed.filter,
    backdropFilter: computed.backdropFilter || 'none',
    transition: computed.transition
  }
}
