import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Category, CategoryColor } from '../../types'
import { userRegistered } from '../auth/authSlice'

export interface CategoriesState {
  items: Category[]
}

export const initialCategoriesState: CategoriesState = {
  items: [],
}

/** Seeded for every new user. `nameKey` lets the name follow the UI language. */
const DEFAULT_CATEGORIES: { name: string; nameKey: string; color: CategoryColor }[] = [
  { name: 'Personal', nameKey: 'categories.defaults.personal', color: 'indigo' },
  { name: 'Work', nameKey: 'categories.defaults.work', color: 'emerald' },
  { name: 'Shopping', nameKey: 'categories.defaults.shopping', color: 'amber' },
]

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: initialCategoriesState,
  reducers: {
    categoryAdded: {
      reducer(state, action: PayloadAction<Category>) {
        state.items.push(action.payload)
      },
      prepare(input: { userId: string; name: string; color: CategoryColor }) {
        return {
          payload: { ...input, id: nanoid(), createdAt: new Date().toISOString() } as Category,
        }
      },
    },
    categoryUpdated(
      state,
      action: PayloadAction<{ id: string; name?: string; color?: CategoryColor }>,
    ) {
      const { id, name, color } = action.payload
      const category = state.items.find((c) => c.id === id)
      if (!category) return
      if (name !== undefined && name !== category.name) {
        category.name = name
        delete category.nameKey
      }
      if (color !== undefined) category.color = color
    },
    /** Also removes the category's todos (see todosSlice extraReducers). */
    categoryDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userRegistered, (state, action) => {
      const createdAt = new Date().toISOString()
      for (const def of DEFAULT_CATEGORIES) {
        state.items.push({ ...def, id: nanoid(), userId: action.payload.id, createdAt })
      }
    })
  },
})

export const { categoryAdded, categoryUpdated, categoryDeleted } = categoriesSlice.actions

export default categoriesSlice.reducer

export const selectUserCategories = createSelector(
  [(state: RootState) => state.categories.items, (state: RootState) => state.auth.currentUserId],
  (items, userId) => items.filter((c) => c.userId === userId),
)

export const selectCategoryById = (state: RootState, id: string | undefined) =>
  state.categories.items.find((c) => c.id === id && c.userId === state.auth.currentUserId)
