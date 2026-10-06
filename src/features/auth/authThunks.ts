import { createAsyncThunk, nanoid } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from '../../app/store'
import { generateSalt, hashPassword, isCryptoAvailable, verifyPassword } from '../../lib/crypto'
import { loggedIn, passwordChanged, selectCurrentUser, userRegistered, usernameChanged } from './authSlice'

// Rejected thunks carry an i18n key (e.g. 'auth.errors.usernameTaken') so the UI can translate it.
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
}>()

export const USERNAME_MIN = 3
export const USERNAME_MAX = 24
export const PASSWORD_MIN = 6

/** Letters (any language), digits, `_`, `.` and `-`. */
const USERNAME_PATTERN = new RegExp(`^[\\p{L}\\p{N}_.-]{${USERNAME_MIN},${USERNAME_MAX}}$`, 'u')

export const validateUsername = (username: string) =>
  USERNAME_PATTERN.test(username) ? null : 'auth.errors.usernameInvalid'

export const validatePassword = (password: string) =>
  password.length >= PASSWORD_MIN ? null : 'auth.errors.passwordTooShort'

const findUserByName = (state: RootState, username: string) =>
  state.auth.users.find((u) => u.username.toLowerCase() === username.toLowerCase())

/** Turns whatever `.unwrap()` threw into an i18n key. */
export const toErrorKey = (error: unknown) =>
  typeof error === 'string' ? error : 'auth.errors.unknown'

interface Credentials {
  username: string
  password: string
}

export const register = createAppAsyncThunk(
  'auth/register',
  async ({ username, password }: Credentials, { getState, dispatch, rejectWithValue }) => {
    const name = username.trim()
    const invalid = validateUsername(name) ?? validatePassword(password)
    if (invalid) return rejectWithValue(invalid)
    if (findUserByName(getState(), name)) return rejectWithValue('auth.errors.usernameTaken')
    if (!isCryptoAvailable()) return rejectWithValue('auth.errors.cryptoUnavailable')

    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)
    dispatch(
      userRegistered({
        id: nanoid(),
        username: name,
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
      }),
    )
  },
)

export const login = createAppAsyncThunk(
  'auth/login',
  async ({ username, password }: Credentials, { getState, dispatch, rejectWithValue }) => {
    if (!isCryptoAvailable()) return rejectWithValue('auth.errors.cryptoUnavailable')
    const user = findUserByName(getState(), username.trim())
    // Same message for unknown user and wrong password, so usernames can't be probed.
    if (!user || !(await verifyPassword(password, user.salt, user.passwordHash))) {
      return rejectWithValue('auth.errors.invalidCredentials')
    }
    dispatch(loggedIn(user.id))
  },
)

export const changeUsername = createAppAsyncThunk(
  'auth/changeUsername',
  async ({ newUsername }: { newUsername: string }, { getState, dispatch, rejectWithValue }) => {
    const user = selectCurrentUser(getState())
    if (!user) return rejectWithValue('auth.errors.notLoggedIn')

    const name = newUsername.trim()
    const invalid = validateUsername(name)
    if (invalid) return rejectWithValue(invalid)
    const existing = findUserByName(getState(), name)
    if (existing && existing.id !== user.id) return rejectWithValue('auth.errors.usernameTaken')

    dispatch(usernameChanged({ userId: user.id, username: name }))
  },
)

export const changePassword = createAppAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { getState, dispatch, rejectWithValue },
  ) => {
    const user = selectCurrentUser(getState())
    if (!user) return rejectWithValue('auth.errors.notLoggedIn')
    if (!isCryptoAvailable()) return rejectWithValue('auth.errors.cryptoUnavailable')
    if (!(await verifyPassword(currentPassword, user.salt, user.passwordHash))) {
      return rejectWithValue('auth.errors.wrongCurrentPassword')
    }
    const invalid = validatePassword(newPassword)
    if (invalid) return rejectWithValue(invalid)

    const salt = generateSalt()
    const passwordHash = await hashPassword(newPassword, salt)
    dispatch(passwordChanged({ userId: user.id, passwordHash, salt }))
  },
)
