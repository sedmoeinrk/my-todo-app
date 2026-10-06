import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { AuthLayout } from '../features/auth/AuthLayout'
import { register, toErrorKey, validatePassword, validateUsername } from '../features/auth/authThunks'

export default function RegisterPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Field errors appear only after the first submit attempt, then update live.
  const usernameError = submitted ? validateUsername(username.trim()) : null
  const passwordError = submitted ? validatePassword(password) : null
  const confirmError = submitted && confirm !== password ? 'auth.errors.passwordMismatch' : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setError(null)
    if (validateUsername(username.trim()) || validatePassword(password) || confirm !== password) return

    setLoading(true)
    try {
      await dispatch(register({ username, password })).unwrap()
      navigate('/', { replace: true })
    } catch (err) {
      setError(toErrorKey(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            {t('auth.register.toLogin')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert tone="error">{t(error)}</Alert>}
        <TextField
          label={t('auth.username')}
          hint={t('auth.usernameHint')}
          error={usernameError && t(usernameError)}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
        />
        <TextField
          label={t('auth.password')}
          hint={t('auth.passwordHint')}
          error={passwordError && t(passwordError)}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <TextField
          label={t('auth.confirmPassword')}
          error={confirmError && t(confirmError)}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t('auth.register.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}
