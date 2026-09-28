import { ROLES } from './roles'

// All page URLs in one place. Add new pages here as we build them.
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_SUBMIT: '/student/submit',
  STUDENT_COMPLAINTS: '/student/complaints',
  STUDENT_PROFILE: '/student/profile',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_PENDING: '/admin/pending',
  ADMIN_IN_PROGRESS: '/admin/in-progress',
  ADMIN_RESOLVED: '/admin/resolved',
  ADMIN_PROFILE: '/admin/profile',
}

// URL of one complaint's detail page, e.g. /student/complaints/CMP-1042
export function studentComplaintPath(id) {
  return `${ROUTES.STUDENT_COMPLAINTS}/${id}`
}

// Where each role lands after signing in.
export function getHomePath(role) {
  return role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD
}
