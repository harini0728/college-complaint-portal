import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { findUser } from '../data/users'

const STORAGE_KEY = 'ccp_user'
const FAKE_NETWORK_DELAY_MS = 700

// Read the saved user (if any) so a page refresh keeps you signed in.
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

  // Frontend-only login: checks the dummy accounts after a short fake delay
  // so the loading state is visible. Replace with an API call later.
  const login = useCallback(async ({ identifier, password, role }) => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_NETWORK_DELAY_MS))

    const foundUser = findUser({ identifier, password, role })
    if (!foundUser) {
      return {
        ok: false,
        error: 'The ID or password is incorrect. Check both and try again.',
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser))
    setUser(foundUser)
    return { ok: true, user: foundUser }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
