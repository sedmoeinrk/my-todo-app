import { Archive } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../app/hooks'
import { EmptyState } from '../components/ui/EmptyState'
import { TodoList } from '../features/todos/TodoList'
import { selectArchivedTodos } from '../features/todos/todosSlice'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function ArchivePage() {
  const { t } = useTranslation()
  const archived = useAppSelector(selectArchivedTodos)
  useDocumentTitle(t('archive.title'))

  // Most recently archived first.
  const sorted = useMemo(
    () => [...archived].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [archived],
  )

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('archive.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('archive.subtitle')}</p>
      </header>
      <TodoList
        todos={sorted}
        empty={<EmptyState icon={Archive} title={t('archive.emptyTitle')} description={t('archive.emptyDescription')} />}
      />
    </div>
  )
}
