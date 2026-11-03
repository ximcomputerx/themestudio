import type { ThemeDocument } from '../core/types'

export function exportComponentsCss(theme: ThemeDocument): string {
  const name = theme.meta.name.replace(/\*\//g, '').replace(/\/\*/g, '').slice(0, 80)
  return `/* Theme Studio components — ${name}
   Requires variables.css. Glass blur is limited to panels, popovers, and dialogs.
*/
.tg-panel,
.tg-dialog,
.tg-popover {
  background: var(--ts-glass-surface);
  color: var(--ts-color-text);
  border: var(--ts-border-width) solid var(--ts-color-glass-border);
  border-radius: var(--ts-radius-lg);
  box-shadow: var(--ts-shadow-outer), inset 0 1px 0 var(--ts-inner-highlight), var(--ts-glow-border);
  backdrop-filter: var(--ts-backdrop-filter);
  -webkit-backdrop-filter: var(--ts-backdrop-filter);
}

.tg-dialog {
  border-radius: var(--ts-radius-xl);
  background: var(--ts-color-glass-popup);
}

.tg-button,
.tg-input {
  font-family: var(--ts-font-family);
  font-size: var(--ts-font-size);
  font-weight: var(--ts-font-weight);
  line-height: var(--ts-line-height);
  letter-spacing: var(--ts-letter-spacing);
  border-radius: var(--ts-radius-control);
  border: var(--ts-border-width) solid var(--ts-color-border);
  transition:
    background var(--ts-duration-hover) ease,
    border-color var(--ts-duration-hover) ease,
    box-shadow var(--ts-duration-glow) ease,
    transform var(--ts-duration-hover) ease;
}

.tg-button {
  background: var(--ts-color-primary);
  color: var(--ts-color-on-primary);
  box-shadow: var(--ts-glow-button);
  padding: 8px 14px;
  cursor: pointer;
}

.tg-button:hover:not(:disabled),
.tg-button.is-hover {
  background: var(--ts-color-primary-hover);
  box-shadow: var(--ts-glow-button), var(--ts-glow-hover);
}

.tg-button:focus-visible,
.tg-button.is-focus {
  outline: none;
  border-color: var(--ts-color-focus-border);
  box-shadow: var(--ts-glow-focus);
}

.tg-button:active:not(:disabled),
.tg-button.is-active {
  background: var(--ts-color-primary-active);
  box-shadow: var(--ts-glow-active);
}

.tg-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.tg-button-secondary {
  background: var(--ts-color-glass-hover);
  color: var(--ts-color-text-primary);
  box-shadow: none;
}

.tg-input {
  background: var(--ts-color-workspace-background);
  color: var(--ts-color-text-primary);
  padding: 8px 10px;
  width: 100%;
}

.tg-input::placeholder {
  color: var(--ts-color-text-muted);
}

.tg-input:hover {
  border-color: var(--ts-color-hover-border);
}

.tg-input:focus {
  outline: none;
  border-color: var(--ts-color-focus-border);
  box-shadow: var(--ts-glow-focus);
}

.tg-neon-border {
  border: var(--ts-border-width) solid var(--ts-color-active-border);
  box-shadow: var(--ts-glow-border);
}

.tg-terminal {
  background: var(--ts-color-app-background);
  color: var(--ts-color-text-primary);
  font-family: var(--ts-font-mono);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
`
}
