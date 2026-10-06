import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { controlClass } from './controlClass'
import { Field } from './Field'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string | null
}

export function TextField({ label, hint, error, type = 'text', className, id, ...props }: TextFieldProps) {
  const { t } = useTranslation()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'

  return (
    <Field label={label} htmlFor={inputId} hint={hint} error={error} className={className}>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(controlClass(error), 'h-11', isPassword && 'pe-11')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? t('common.hidePassword') : t('common.showPassword')}
            className="absolute inset-y-0 end-0 grid w-11 place-items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </Field>
  )
}
