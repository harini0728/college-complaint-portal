import { ROLES } from './roles'
import { ROUTES } from './routes'

// The sidebar links for each role. Logout is a button at the bottom of the
// sidebar, so it is not listed here.
export const NAV_BY_ROLE = {
  [ROLES.STUDENT]: [
    { label: 'Dashboard', to: ROUTES.STUDENT_DASHBOARD },
    { label: 'Submit Complaint', to: ROUTES.STUDENT_SUBMIT },
    { label: 'My Complaints', to: ROUTES.STUDENT_COMPLAINTS },
    { label: 'Profile', to: ROUTES.STUDENT_PROFILE },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD },
    { label: 'All Complaints', to: ROUTES.ADMIN_COMPLAINTS },
    { label: 'Pending', to: ROUTES.ADMIN_PENDING },
    { label: 'In Progress', to: ROUTES.ADMIN_IN_PROGRESS },
    { label: 'Resolved', to: ROUTES.ADMIN_RESOLVED },
    { label: 'Rejected', to: ROUTES.ADMIN_REJECTED },
    { label: 'Profile', to: ROUTES.ADMIN_PROFILE },
  ],
}
