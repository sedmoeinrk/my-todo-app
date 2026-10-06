import { Archive, ArchiveRestore, CalendarDays, Check, Pencil, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { IconButton } from '../../components/ui/IconButton'
import { cn } from '../../lib/cn'
import { formatDate, todayISO } from '../../lib/date'
import type { Todo } from '../../types'
import { selectCategoryById } from '../categories/categoriesSlice'
import { categoryColorClasses, useCategoryLabel } from '../categories/categoryStyles'
import { priorityClasses } from './priorityStyles'
import { TodoFormDialog } from './TodoFormDialog'
import { todoDeleted, todoToggledArchived, todoToggledCompleted, todoToggledStarred } from './todosSlice'

interface TodoItemProps {
  todo: Todo
  /** Show the category badge (useful when listing all categories). */
  showCategory?: boolean
}

export function TodoItem({ todo, showCategory = true }: TodoItemProps) {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const category = useAppSelector((state) => selectCategoryById(state, todo.categoryId))
  const label = useCategoryLabel()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const today = todayISO()
  const overdue = !!todo.dueDate && !todo.completed && todo.dueDate < today
  const dueToday = !!todo.dueDate && todo.dueDate === today

  return (
    <li
      className={cn(
        'group flex flex-wrap items-start gap-3 rounded-2xl sm:flex-nowrap bg-white p-3.5 ring-1 ring-slate-200 transition sm:p-4',
        'hover:shadow-md hover:shadow-slate-900/5 dark:bg-slate-900 dark:ring-slate-800',
        todo.archived && 'opacity-80',
      )}
    >
      {/* complete toggle */}
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.completed ? t('todos.actions.uncomplete') : t('todos.actions.complete')}
        disabled={todo.archived}
        onClick={() => dispatch(todoToggledCompleted(todo.id))}
        className={cn(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          todo.completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 hover:border-brand-500 dark:border-slate-600',
          todo.archived && 'cursor-not-allowed',
        )}
      >
        {todo.completed && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
      </button>

      {/* content */}
      <div className="min-w-0 flex-1">
        {/* dir="auto": user text keeps its own direction (e.g. English title in Persian UI) */}
        <p
          dir="auto"
          className={cn(
            'font-medium break-words text-slate-900 dark:text-slate-100',
            todo.completed && 'text-slate-400 line-through dark:text-slate-500',
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p dir="auto" className="mt-0.5 line-clamp-2 text-sm break-words text-slate-500 dark:text-slate-400">
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={cn('rounded-md px-2 py-0.5 font-medium', priorityClasses[todo.priority].badge)}>
            {t(`priority.${todo.priority}`)}
          </span>
          {showCategory && category && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium',
                categoryColorClasses[category.color].soft,
              )}
            >
              <span className={cn('size-1.5 rounded-full', categoryColorClasses[category.color].dot)} aria-hidden />
              {label(category)}
            </span>
          )}
          {todo.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium',
                overdue
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              <CalendarDays className="size-3" aria-hidden />
              {dueToday ? t('todos.due.today') : formatDate(todo.dueDate, i18n.language)}
              {overdue && ` · ${t('todos.due.overdue')}`}
            </span>
          )}
        </div>
      </div>

      {/* actions */}
      <div className="-me-1.5 flex shrink-0 items-center gap-0.5 max-sm:-mt-1 max-sm:-mb-1.5 max-sm:basis-full max-sm:justify-end sm:-mt-1">
        {!todo.archived && (
          <IconButton
            label={todo.starred ? t('todos.actions.unstar') : t('todos.actions.star')}
            tone="star"
            active={todo.starred}
            aria-pressed={todo.starred}
            onClick={() => dispatch(todoToggledStarred(todo.id))}
          >
            <Star className={cn('size-4', todo.starred && 'fill-current')} />
          </IconButton>
        )}
        {!todo.archived && (
          <IconButton label={t('common.edit')} onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </IconButton>
        )}
        <IconButton
          label={todo.archived ? t('todos.actions.unarchive') : t('todos.actions.archive')}
          onClick={() => dispatch(todoToggledArchived(todo.id))}
        >
          {todo.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        </IconButton>
        <IconButton label={t('common.delete')} tone="danger" onClick={() => setConfirmingDelete(true)}>
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      <TodoFormDialog open={editing} onClose={() => setEditing(false)} todo={todo} />
      <ConfirmDialog
        open={confirmingDelete}
        title={t('todos.deleteTitle')}
        message={t('todos.deleteMessage', { title: todo.title })}
        onConfirm={() => dispatch(todoDeleted(todo.id))}
        onClose={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
