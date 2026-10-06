import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { IconButton } from '../../components/ui/IconButton'
import { Modal } from '../../components/ui/Modal'
import type { Category } from '../../types'
import { selectUserTodos } from '../todos/todosSlice'
import { categoryDeleted, selectUserCategories } from './categoriesSlice'
import { CategoryFormDialog } from './CategoryFormDialog'
import { categoryColorClasses, useCategoryLabel } from './categoryStyles'

interface ManageCategoriesDialogProps {
  open: boolean
  onClose: () => void
}

export function ManageCategoriesDialog({ open, onClose }: ManageCategoriesDialogProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectUserCategories)
  const todos = useAppSelector(selectUserTodos)
  const label = useCategoryLabel()

  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)

  // Counts include archived todos, since deleting a category removes those too.
  const countFor = (id: string) => todos.filter((t) => t.categoryId === id).length

  return (
    <>
      <Modal
        open={open && !editing && !creating && !deleting}
        onClose={onClose}
        title={t('categories.manage')}
        description={t('categories.manageDescription')}
      >
        {categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t('categories.empty')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5">
                <span className={`size-3 shrink-0 rounded-full ${categoryColorClasses[c.color].dot}`} aria-hidden />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100">
                  {label(c)}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">
                  {t('categories.todoCount', { count: countFor(c.id) })}
                </span>
                <IconButton label={t('common.edit')} onClick={() => setEditing(c)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={t('common.delete')} tone="danger" onClick={() => setDeleting(c)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" fullWidth className="mt-4" onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden />
          {t('categories.new')}
        </Button>
      </Modal>

      <CategoryFormDialog open={creating} onClose={() => setCreating(false)} />
      <CategoryFormDialog
        open={!!editing}
        category={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={!!deleting}
        title={t('categories.deleteTitle')}
        message={
          deleting
            ? t('categories.deleteMessage', { name: label(deleting), count: countFor(deleting.id) })
            : ''
        }
        onConfirm={() => deleting && dispatch(categoryDeleted(deleting.id))}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
