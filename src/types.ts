// Domain models. Kept framework-agnostic so they can be reused by a future API/database layer.

export type Priority = 'low' | 'medium' | 'high'

export type Theme = 'light' | 'dark'

export type Language = 'en' | 'fa'

export const CATEGORY_COLORS = [
  'indigo',
  'emerald',
  'amber',
  'rose',
  'sky',
  'violet',
  'orange',
  'teal',
] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]

export interface User {
  id: string
  username: string
  passwordHash: string
  salt: string
  createdAt: string
}

export interface Category {
  id: string
  userId: string
  name: string
  /** Translation key for built-in categories; cleared once the user renames it */
  nameKey?: string
  color: CategoryColor
  createdAt: string
}

export interface Todo {
  id: string
  userId: string
  categoryId: string
  title: string
  description: string
  priority: Priority
  starred: boolean
  completed: boolean
  archived: boolean
  /** ISO date (yyyy-mm-dd) or null */
  dueDate: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
