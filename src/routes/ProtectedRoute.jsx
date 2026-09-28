import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROUTES, getHomePath } from '../constants/routes'

// Wrap a page with this to control who can open it.
//   Not signed in       -> sent to the login page
//   Signed in, wrong role -> sent to their own dashboard
export default function ProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (user.role !== allowedRole) {
    return <Navigate to={getHomePath(user.role)} replace />
  }
  return children
}
