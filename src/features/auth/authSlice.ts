import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { User } from '../../types'

export interface AuthState {
  users: User[]
  currentUserId: string | null
}

export const initialAuthState: AuthState = {
  users: [],
  currentUserId: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    userRegistered(state, action: PayloadAction<User>) {
      state.users.push(action.payload)
      state.currentUserId = action.payload.id
    },
    loggedIn(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload
    },
    loggedOut(state) {
      state.currentUserId = null
    },
    usernameChanged(state, action: PayloadAction<{ userId: string; username: string }>) {
      const user = state.users.find((u) => u.id === action.payload.userId)
      if (user) user.username = action.payload.username
    },
    passwordChanged(
      state,
      action: PayloadAction<{ userId: string; passwordHash: string; salt: string }>,
    ) {
      const user = state.users.find((u) => u.id === action.payload.userId)
      if (user) {
        user.passwordHash = action.payload.passwordHash
        user.salt = action.payload.salt
      }
    },
  },
})

export const { userRegistered, loggedIn, loggedOut, usernameChanged, passwordChanged } =
  authSlice.actions

export default authSlice.reducer

export const selectUsers = (state: RootState) => state.auth.users
export const selectCurrentUserId = (state: RootState) => state.auth.currentUserId
export const selectCurrentUser = (state: RootState) =>
  state.auth.users.find((u) => u.id === state.auth.currentUserId) ?? null
export const selectIsAuthenticated = (state: RootState) => selectCurrentUser(state) !== null
