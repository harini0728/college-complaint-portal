import { ROLES } from '../constants/roles'

// TEMPORARY dummy accounts so we can test login without a backend.
// These are replaced by real authentication when the backend is built.
const USERS = [
  {
    id: 'CS21B001',
    name: 'Priya Raman',
    email: 'student@college.edu',
    password: 'student123',
    role: ROLES.STUDENT,
    department: 'Computer Science',
  },
  {
    id: 'ADM001',
    name: 'Dr. Meenakshi Sundaram',
    email: 'admin@college.edu',
    password: 'admin123',
    role: ROLES.ADMIN,
    department: 'Student Affairs Office',
  },
]

// Shown in the "Demo credentials" box on the login page (remove before deploying).
export const DEMO_ACCOUNTS = USERS.map(({ role, id, email, password }) => ({
  role,
  id,
  email,
  password,
}))

// The user object we keep in the app. It never includes the password.
function toPublicUser({ id, name, email, role, department }) {
  return { id, name, email, role, department }
}

// Finds the account matching what was typed. Returns the public user or null.
// The identifier can be a student/staff ID or an email (case-insensitive).
export function findUser({ identifier, password, role }) {
  const typed = identifier.trim().toLowerCase()
  const match = USERS.find(
    (user) =>
      user.role === role &&
      user.password === password &&
      (user.id.toLowerCase() === typed || user.email.toLowerCase() === typed),
  )
  return match ? toPublicUser(match) : null
}
