import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer, { initialAuthState } from '../features/auth/authSlice'
import type { AuthState } from '../features/auth/authSlice'
import categoriesReducer, { initialCategoriesState } from '../features/categories/categoriesSlice'
import type { CategoriesState } from '../features/categories/categoriesSlice'
import settingsReducer, { getInitialSettingsState } from '../features/settings/settingsSlice'
import type { SettingsState } from '../features/settings/settingsSlice'
import todosReducer, { initialTodosState } from '../features/todos/todosSlice'
import type { TodosState } from '../features/todos/todosSlice'
import { localStorageAdapter } from '../lib/storage'
import type { StorageAdapter } from '../lib/storage'

const rootReducer = combineReducers({
  auth: authReducer,
  todos: todosReducer,
  categories: categoriesReducer,
  settings: settingsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

/** Swap this for an API-backed adapter when a real database is added. */
const storage: StorageAdapter = localStorageAdapter

const PERSISTED_KEYS = ['auth', 'todos', 'categories', 'settings'] as const

/** Merge saved data over defaults so newly added fields always exist. */
const loadPreloadedState = (): RootState => ({
  auth: { ...initialAuthState, ...storage.load<AuthState>('auth') },
  todos: { ...initialTodosState, ...storage.load<TodosState>('todos') },
  categories: { ...initialCategoriesState, ...storage.load<CategoriesState>('categories') },
  settings: { ...getInitialSettingsState(), ...storage.load<SettingsState>('settings') },
})

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPreloadedState(),
})

// Save each slice only when it actually changed (Redux keeps unchanged slices by reference).
let previousState = store.getState()
store.subscribe(() => {
  const state = store.getState()
  for (const key of PERSISTED_KEYS) {
    if (state[key] !== previousState[key]) storage.save(key, state[key])
  }
  previousState = state
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
