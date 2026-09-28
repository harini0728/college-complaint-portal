import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// Use this hook in any component to read the signed-in user or to log in/out.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
