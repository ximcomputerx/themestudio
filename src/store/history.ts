export interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
  gesture: string | null
}

const HISTORY_LIMIT = 100

export function commitHistory<T>(
  state: HistoryState<T>,
  next: T,
  mode: 'push' | 'coalesce',
  key: string,
  same: (left: T, right: T) => boolean
): HistoryState<T> {
  if (same(state.present, next)) return state
  if (mode === 'coalesce' && state.gesture === key) {
    return { ...state, present: next, future: [] }
  }
  return {
    past: [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    gesture: mode === 'coalesce' ? key : null
  }
}

export function endGesture<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.gesture === null) return state
  return { ...state, gesture: null }
}

export function undoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.past.length === 0) return { ...state, gesture: null }
  const previous = state.past[state.past.length - 1] as T
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
    gesture: null
  }
}

export function redoHistory<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) return { ...state, gesture: null }
  const [next, ...rest] = state.future
  return {
    past: [...state.past, state.present].slice(-HISTORY_LIMIT),
    present: next as T,
    future: rest,
    gesture: null
  }
}
