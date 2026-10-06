import { Check } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { TextField } from '../../components/ui/TextField'
import { cn } from '../../lib/cn'
import { CATEGORY_COLORS } from '../../types'
import type { Category, CategoryColor } from '../../types'
import { selectCurrentUserId } from '../auth/authSlice'
import { categoryAdded, categoryUpdated, selectUserCategories } from './categoriesSlice'
import { categoryColorClasses, useCategoryLabel } from './categoryStyles'

const NAME_MAX = 30

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  /** Edit this category; omit to create a new one. */
  category?: Category
}

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={category ? t('categories.edit') : t('categories.new')}
    >
      <CategoryForm category={category} onDone={onClose} />
    </Modal>
  )
}

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectCurrentUserId)
  const categories = useAppSelector(selectUserCategories)
  const label = useCategoryLabel()

  const [name, setName] = useState(category ? label(category) : '')
  const [color, setColor] = useState<CategoryColor>(
    category?.color ?? CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
  )
  const [submitted, setSubmitted] = useState(false)

  const trimmed = name.trim()
  const duplicate = categories.some(
    (c) => c.id !== category?.id && label(c).toLowerCase() === trimmed.toLowerCase(),
  )
  const error = !submitted
    ? null
    : !trimmed
      ? t('categories.errors.nameRequired')
      : duplicate
        ? t('categories.errors.nameTaken')
        : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!trimmed || duplicate || !userId) return

    if (category) {
      // Keep the translated built-in name if the user didn't actually change it.
      const nameChanged = trimmed !== label(category)
      dispatch(categoryUpdated({ id: category.id, color, ...(nameChanged && { name: trimmed }) }))
    } else {
      dispatch(categoryAdded({ userId, name: trimmed, color }))
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label={t('categories.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={NAME_MAX}
        error={error}
        data-autofocus
      />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('categories.color')}
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="category-color"
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className="peer sr-only"
                aria-label={t(`colors.${c}`)}
              />
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-full text-white ring-offset-2 ring-offset-white transition',
                  'peer-focus-visible:ring-2 dark:ring-offset-slate-900',
                  categoryColorClasses[c].dot,
                  categoryColorClasses[c].ring,
                  color === c && 'ring-2',
                )}
              >
                {color === c && <Check className="size-4" aria-hidden />}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{category ? t('common.save') : t('common.create')}</Button>
      </div>
    </form>
  )
}
