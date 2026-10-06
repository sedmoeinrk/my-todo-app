import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Priority, Todo } from '../../types'
import { categoryDeleted } from '../categories/categoriesSlice'

export interface TodosState {
  items: Todo[]
}

export const initialTodosState: TodosState = {
  items: [],
}

export interface NewTodo {
  userId: string
  categoryId: string
  title: string
  description?: string
  priority?: Priority
  starred?: boolean
  dueDate?: string | null
}

export type TodoChanges = Partial<
  Pick<Todo, 'title' | 'description' | 'categoryId' | 'priority' | 'dueDate' | 'starred'>
>

export const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 }

const touch = (todo: Todo) => {
  todo.updatedAt = new Date().toISOString()
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: initialTodosState,
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<Todo>) {
        state.items.unshift(action.payload)
      },
      prepare(input: NewTodo) {
        const now = new Date().toISOString()
        const todo: Todo = {
          id: nanoid(),
          userId: input.userId,
          categoryId: input.categoryId,
          title: input.title.trim(),
          description: input.description?.trim() ?? '',
          priority: input.priority ?? 'medium',
          starred: input.starred ?? false,
          completed: false,
          archived: false,
          dueDate: input.dueDate ?? null,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        }
        return { payload: todo }
      },
    },
    todoUpdated(state, action: PayloadAction<{ id: string; changes: TodoChanges }>) {
      const todo = state.items.find((t) => t.id === action.payload.id)
      if (!todo) return
      Object.assign(todo, action.payload.changes)
      touch(todo)
    },
    todoToggledCompleted(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (!todo) return
      todo.completed = !todo.completed
      todo.completedAt = todo.completed ? new Date().toISOString() : null
      touch(todo)
    },
    todoToggledStarred(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (!todo) return
      todo.starred = !todo.starred
      touch(todo)
    },
    todoToggledArchived(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload)
      if (!todo) return
      todo.archived = !todo.archived
      touch(todo)
    },
    todoDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(categoryDeleted, (state, action) => {
      state.items = state.items.filter((t) => t.categoryId !== action.payload)
    })
  },
})

export const {
  todoAdded,
  todoUpdated,
  todoToggledCompleted,
  todoToggledStarred,
  todoToggledArchived,
  todoDeleted,
} = todosSlice.actions

export default todosSlice.reducer

/* ---------- selectors ---------- */

/** Most important first: priority, then nearest due date (none last), then newest. */
export const compareByImportance = (a: Todo, b: Todo) =>
  PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
  (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') ||
  b.createdAt.localeCompare(a.createdAt)

export const selectUserTodos = createSelector(
  [(state: RootState) => state.todos.items, (state: RootState) => state.auth.currentUserId],
  (items, userId) => items.filter((t) => t.userId === userId),
)

export const selectActiveTodos = createSelector([selectUserTodos], (todos) =>
  todos.filter((t) => !t.archived),
)

export const selectArchivedTodos = createSelector([selectUserTodos], (todos) =>
  todos.filter((t) => t.archived),
)

/** Active todos, optionally limited to one category (`null` = all categories). */
export const selectTodosByCategory = createSelector(
  [selectActiveTodos, (_state: RootState, categoryId: string | null) => categoryId],
  (todos, categoryId) => (categoryId ? todos.filter((t) => t.categoryId === categoryId) : todos),
)

/** The dashboard's "top 5": starred, still open, sorted by importance. */
export const selectTopStarredTodos = createSelector([selectActiveTodos], (todos) =>
  todos
    .filter((t) => t.starred && !t.completed)
    .sort(compareByImportance)
    .slice(0, 5),
)

export const selectTodoStats = createSelector(
  [selectActiveTodos, selectArchivedTodos],
  (active, archived) => ({
    total: active.length,
    open: active.filter((t) => !t.completed).length,
    completed: active.filter((t) => t.completed).length,
    starred: active.filter((t) => t.starred).length,
    archived: archived.length,
  }),
)

export const selectTodoCountByCategory = createSelector([selectActiveTodos], (todos) => {
  const counts: Record<string, number> = {}
  for (const t of todos) {
    if (!t.completed) counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1
  }
  return counts
})
