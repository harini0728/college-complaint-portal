import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'

const STORAGE_KEY = 'ccp_user'
const TOKEN_KEY = 'ccp_token'
const API_URL = 'http://localhost:5000/api'

// Read the saved user so a page refresh keeps you signed in.
function loadStoredUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  // Login using the real backend API.
  const login = useCallback(async ({ identifier, password, role }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identifier,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          ok: false,
          error: data?.message || 'The ID or password is incorrect. Check both and try again.',
        }
      }

      // Backend returns the authenticated user and JWT.
      const loggedInUser = data.user

      // Keep role validation on the frontend because the current
      // login page allows the user to select a role.
      if (role && loggedInUser.role !== role) {
        return {
          ok: false,
          error: `This account is registered as ${loggedInUser.role}. Please select the correct role.`,
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
      localStorage.setItem(TOKEN_KEY, data.token)

      setUser(loggedInUser)

      return {
        ok: true,
        user: loggedInUser,
      }
    } catch (error) {
      console.error('Login error:', error)

      return {
        ok: false,
        error: 'Unable to connect to the server. Make sure the backend is running on port 5000.',
      }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}