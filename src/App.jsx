import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import { ROLES } from './constants/roles'
import { ROUTES, getHomePath } from './constants/routes'

// "/" sends signed-in users to their dashboard and everyone else to login.
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? getHomePath(user.role) : ROUTES.LOGIN} replace />
}

// Shorthand for a page that is not built yet.
const soon = (title) => <ComingSoonPage title={title} />

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomeRedirect />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Student pages: all share the sidebar layout */}
          <Route
            element={
              <ProtectedRoute allowedRole={ROLES.STUDENT}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.STUDENT_DASHBOARD} element={<StudentDashboardPage />} />
            <Route path={ROUTES.STUDENT_SUBMIT} element={soon('Submit Complaint')} />
            <Route path={ROUTES.STUDENT_COMPLAINTS} element={soon('My Complaints')} />
            <Route
              path={`${ROUTES.STUDENT_COMPLAINTS}/:id`}
              element={soon('Complaint Details')}
            />
            <Route path={ROUTES.STUDENT_PROFILE} element={soon('Profile')} />
          </Route>

          {/* Admin pages: same layout, admin menu */}
          <Route
            element={
              <ProtectedRoute allowedRole={ROLES.ADMIN}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.ADMIN_DASHBOARD} element={soon('Admin Dashboard')} />
            <Route path={ROUTES.ADMIN_COMPLAINTS} element={soon('All Complaints')} />
            <Route path={ROUTES.ADMIN_PENDING} element={soon('Pending Complaints')} />
            <Route path={ROUTES.ADMIN_IN_PROGRESS} element={soon('In Progress Complaints')} />
            <Route path={ROUTES.ADMIN_RESOLVED} element={soon('Resolved Complaints')} />
            <Route path={ROUTES.ADMIN_PROFILE} element={soon('Profile')} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
