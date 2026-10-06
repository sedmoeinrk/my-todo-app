// Persistence abstraction. The app only talks to `StorageAdapter`, so localStorage
// can later be swapped for an API/database adapter without touching the slices.

export interface StorageAdapter {
  load<T>(key: string): T | undefined
  save<T>(key: string, value: T): void
  remove(key: string): void
}

const PREFIX = 'my-todo-app:'

/** Bump when the stored shape changes; older data is then ignored (or migrated). */
const SCHEMA_VERSION = 1

interface Envelope<T> {
  version: number
  data: T
}

export const localStorageAdapter: StorageAdapter = {
  load<T>(key: string): T | undefined {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as Envelope<T>
      if (parsed.version !== SCHEMA_VERSION) return undefined
      return parsed.data
    } catch {
      return undefined
    }
  },

  save<T>(key: string, value: T) {
    try {
      const envelope: Envelope<T> = { version: SCHEMA_VERSION, data: value }
      localStorage.setItem(PREFIX + key, JSON.stringify(envelope))
    } catch {
      // Storage full or unavailable (e.g. private mode) — keep running in memory.
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      // ignore
    }
  },
}
