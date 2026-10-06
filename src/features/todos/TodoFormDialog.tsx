import { Star } from 'lucide-react'
import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Button } from '../../components/ui/Button'
import { controlClass } from '../../components/ui/controlClass'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { TextField } from '../../components/ui/TextField'
import { cn } from '../../lib/cn'
import type { Priority, Todo } from '../../types'
import { selectCurrentUserId } from '../auth/authSlice'
import { selectUserCategories } from '../categories/categoriesSlice'
import { useCategoryLabel } from '../categories/categoryStyles'
import { PRIORITIES, priorityClasses } from './priorityStyles'
import { todoAdded, todoUpdated } from './todosSlice'

const TITLE_MAX = 120
const DESCRIPTION_MAX = 1000

interface TodoFormDialogProps {
  open: boolean
  onClose: () => void
  /** Edit this todo; omit to create a new one. */
  todo?: Todo
  /** Preselected category for new todos (e.g. the one currently being viewed). */
  defaultCategoryId?: string
  /** Pre-star new todos (e.g. when added from the dashboard). */
  defaultStarred?: boolean
}

export function TodoFormDialog({ open, onClose, todo, defaultCategoryId, defaultStarred }: TodoFormDialogProps) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={todo ? t('todos.edit') : t('todos.new')}>
      <TodoForm
        todo={todo}
        defaultCategoryId={defaultCategoryId}
        defaultStarred={defaultStarred}
        onDone={onClose}
      />
    </Modal>
  )
}

interface TodoFormProps {
  todo?: Todo
  defaultCategoryId?: string
  defaultStarred?: boolean
  onDone: () => void
}

function TodoForm({ todo, defaultCategoryId, defaultStarred, onDone }: TodoFormProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectCurrentUserId)
  const categories = useAppSelector(selectUserCategories)
  const label = useCategoryLabel()
  const ids = { description: useId(), category: useId(), dueDate: useId() }

  const [title, setTitle] = useState(todo?.title ?? '')
  const [description, setDescription] = useState(todo?.description ?? '')
  const [categoryId, setCategoryId] = useState(
    todo?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '',
  )
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '')
  const [starred, setStarred] = useState(todo?.starred ?? defaultStarred ?? false)
  const [submitted, setSubmitted] = useState(false)

  if (categories.length === 0) {
    return <p className="py-4 text-sm text-slate-600 dark:text-slate-300">{t('todos.noCategories')}</p>
  }

  const titleError = submitted && !title.trim() ? t('todos.errors.titleRequired') : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!title.trim() || !categoryId || !userId) return

    const fields = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      dueDate: dueDate || null,
      starred,
    }
    if (todo) dispatch(todoUpdated({ id: todo.id, changes: fields }))
    else dispatch(todoAdded({ ...fields, userId }))
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <TextField
        label={t('todos.fields.title')}
        placeholder={t('todos.fields.titlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={TITLE_MAX}
        error={titleError}
        autoFocus
      />

      <Field label={t('todos.fields.description')} htmlFor={ids.description}>
        <textarea
          id={ids.description}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          placeholder={t('todos.fields.descriptionPlaceholder')}
          className={cn(controlClass(), 'resize-y py-2.5')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('todos.fields.category')} htmlFor={ids.category}>
          <select
            id={ids.category}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={cn(controlClass(), 'h-11')}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {label(c)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('todos.fields.dueDate')} htmlFor={ids.dueDate}>
          <input
            id={ids.dueDate}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={cn(controlClass(), 'h-11')}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('todos.fields.priority')}
        </legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {PRIORITIES.map((p) => (
            <label key={p} className="cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:text-slate-400',
                  priority === p && 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white',
                )}
              >
                <span className={cn('size-2 rounded-full', priorityClasses[p].dot)} aria-hidden />
                {t(`priority.${p}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 has-focus-visible:ring-2 has-focus-visible:ring-brand-500 dark:border-slate-700">
        <input
          type="checkbox"
          checked={starred}
          onChange={(e) => setStarred(e.target.checked)}
          className="peer sr-only"
        />
        <Star
          className={cn(
            'size-5 transition',
            starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600',
          )}
          aria-hidden
        />
        <span className="flex-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            {t('todos.fields.starred')}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{t('todos.fields.starredHint')}</span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{todo ? t('common.save') : t('todos.add')}</Button>
      </div>
    </form>
  )
}
