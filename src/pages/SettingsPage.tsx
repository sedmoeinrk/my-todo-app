import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChangePasswordForm, ChangeUsernameForm } from '../features/auth/AccountForms'
import { AppearanceSettings } from '../features/settings/AppearanceSettings'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h2>
      {children}
    </section>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('settings.title'))

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
      <Section title={t('settings.appearance.title')}>
        <AppearanceSettings />
      </Section>
      <Section title={t('settings.account.title')}>
        <div className="space-y-4">
          <ChangeUsernameForm />
          <ChangePasswordForm />
        </div>
      </Section>
    </div>
  )
}
