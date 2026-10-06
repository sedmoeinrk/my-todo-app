import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Language, Theme } from '../../types'

export interface SettingsState {
  theme: Theme
  language: Language
}

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

const prefersPersian = () =>
  typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fa')

/** First-visit defaults follow the browser; afterwards the saved choice wins. */
export const getInitialSettingsState = (): SettingsState => ({
  theme: prefersDark() ? 'dark' : 'light',
  language: prefersPersian() ? 'fa' : 'en',
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState: getInitialSettingsState,
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    themeSet(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    languageSet(state, action: PayloadAction<Language>) {
      state.language = action.payload
    },
  },
})

export const { themeToggled, themeSet, languageSet } = settingsSlice.actions

export default settingsSlice.reducer

export const selectTheme = (state: RootState) => state.settings.theme
export const selectLanguage = (state: RootState) => state.settings.language
