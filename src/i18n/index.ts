import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { store } from '../app/store'
import en from './locales/en'
import fa from './locales/fa'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  // Start in the saved language; useSyncSettings keeps it in sync afterwards.
  lng: store.getState().settings.language,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes output
})

export default i18n
