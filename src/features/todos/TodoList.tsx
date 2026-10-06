import type { ReactNode } from 'react'
import type { Todo } from '../../types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  showCategory?: boolean
  empty: ReactNode
}

export function TodoList({ todos, showCategory, empty }: TodoListProps) {
  if (todos.length === 0) return <>{empty}</>
  return (
    <ul className="space-y-2.5">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} showCategory={showCategory} />
      ))}
    </ul>
  )
}
