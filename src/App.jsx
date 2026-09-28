import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import ComplaintsProvider from './context/ComplaintsProvider'
import { useAuth } from './context/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import ProfilePage from './pages/ProfilePage'
import SubmitComplaintPage from './pages/SubmitComplaintPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import ComplaintDetailsPage from './pages/ComplaintDetailsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminComplaintsPage from './pages/AdminComplaintsPage'
import AdminComplaintDetailsPage from './pages/AdminComplaintDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import { ROLES } from './constants/roles'
import { COMPLAINT_STATUSES as STATUS } from './constants/statuses'
import { ROUTES, getHomePath } from './constants/routes'

// "/" sends signed-in users to their dashboard and everyone else to login.
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? getHomePath(user.role) : ROUTES.LOGIN} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComplaintsProvider>
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
              <Route path={ROUTES.STUDENT_SUBMIT} element={<SubmitComplaintPage />} />
              <Route path={ROUTES.STUDENT_COMPLAINTS} element={<MyComplaintsPage />} />
              <Route
                path={`${ROUTES.STUDENT_COMPLAINTS}/:id`}
                element={<ComplaintDetailsPage />}
              />
              <Route path={ROUTES.STUDENT_PROFILE} element={<ProfilePage />} />
              {/* Wrong URL under /student/: keep the sidebar */}
              <Route path="/student/*" element={<NotFoundPage inLayout />} />
            </Route>

            {/* Admin pages: same layout, admin menu */}
            <Route
              element={
                <ProtectedRoute allowedRole={ROLES.ADMIN}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_COMPLAINTS} element={<AdminComplaintsPage />} />
              <Route
                path={`${ROUTES.ADMIN_COMPLAINTS}/:id`}
                element={<AdminComplaintDetailsPage />}
              />
              {/* The key makes each status page start with its own fresh filters. */}
              <Route
                path={ROUTES.ADMIN_PENDING}
                element={
                  <AdminComplaintsPage
                    key="pending"
                    status={STATUS.PENDING}
                    title="Pending complaints"
                    description="Complaints waiting for review."
                  />
                }
              />
              <Route
                path={ROUTES.ADMIN_IN_PROGRESS}
                element={
                  <AdminComplaintsPage
                    key="in-progress"
                    status={STATUS.IN_PROGRESS}
                    title="In progress complaints"
                    description="Complaints the concerned departments are working on."
                  />
                }
              />
              <Route
                path={ROUTES.ADMIN_RESOLVED}
                element={
                  <AdminComplaintsPage
                    key="resolved"
                    status={STATUS.RESOLVED}
                    title="Resolved complaints"
                    description="Complaints that have been fixed."
                  />
                }
              />
              <Route
                path={ROUTES.ADMIN_REJECTED}
                element={
                  <AdminComplaintsPage
                    key="rejected"
                    status={STATUS.REJECTED}
                    title="Rejected complaints"
                    description="Complaints that could not be acted on."
                  />
                }
              />
              <Route path={ROUTES.ADMIN_PROFILE} element={<ProfilePage />} />
              {/* Wrong URL under /admin/: keep the sidebar */}
              <Route path="/admin/*" element={<NotFoundPage inLayout />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ComplaintsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
