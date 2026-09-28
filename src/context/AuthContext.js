import { createContext } from 'react'

// Holds { user, login, logout } for the whole app. See AuthProvider.jsx.
export const AuthContext = createContext(null)
