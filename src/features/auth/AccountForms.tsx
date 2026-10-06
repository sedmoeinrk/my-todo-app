import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { selectCurrentUser } from './authSlice'
import { changePassword, changeUsername, toErrorKey } from './authThunks'

type Status = { tone: 'error' | 'success'; key: string } | null

function SettingsCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6 dark:bg-slate-900 dark:ring-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {children}
    </section>
  )
}

export function ChangeUsernameForm() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const [username, setUsername] = useState(user?.username ?? '')
  const [status, setStatus] = useState<Status>(null)
  const [loading, setLoading] = useState(false)

  const unchanged = username.trim() === user?.username

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(changeUsername({ newUsername: username })).unwrap()
      setUsername(username.trim())
      setStatus({ tone: 'success', key: 'settings.account.usernameSaved' })
    } catch (err) {
      setStatus({ tone: 'error', key: toErrorKey(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsCard title={t('settings.account.usernameTitle')} description={t('settings.account.usernameDescription')}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {status && <Alert tone={status.tone}>{t(status.key)}</Alert>}
        <TextField
          label={t('settings.account.newUsername')}
          hint={t('auth.usernameHint')}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setStatus(null)
          }}
          autoComplete="username"
        />
        <div className="flex justify-end">
          <Button type="submit" loading={loading} disabled={unchanged || !username.trim()}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </SettingsCard>
  )
}

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>(null)
  const [loading, setLoading] = useState(false)

  const mismatch = confirm.length > 0 && confirm !== next

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return
    setLoading(true)
    try {
      await dispatch(changePassword({ currentPassword: current, newPassword: next })).unwrap()
      setCurrent('')
      setNext('')
      setConfirm('')
      setStatus({ tone: 'success', key: 'settings.account.passwordSaved' })
    } catch (err) {
      setStatus({ tone: 'error', key: toErrorKey(err) })
    } finally {
      setLoading(false)
    }
  }

  const clearStatus = () => setStatus(null)

  return (
    <SettingsCard title={t('settings.account.passwordTitle')} description={t('settings.account.passwordDescription')}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {status && <Alert tone={status.tone}>{t(status.key)}</Alert>}
        {/* Hidden username field helps password managers update the right entry */}
        <input type="text" autoComplete="username" hidden readOnly />
        <TextField
          label={t('settings.account.currentPassword')}
          type="password"
          value={current}
          onChange={(e) => {
            setCurrent(e.target.value)
            clearStatus()
          }}
          autoComplete="current-password"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('settings.account.newPassword')}
            hint={t('auth.passwordHint')}
            type="password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value)
              clearStatus()
            }}
            autoComplete="new-password"
          />
          <TextField
            label={t('settings.account.confirmNewPassword')}
            error={mismatch ? t('auth.errors.passwordMismatch') : null}
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              clearStatus()
            }}
            autoComplete="new-password"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading} disabled={!current || !next || next !== confirm}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </SettingsCard>
  )
}
