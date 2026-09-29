import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { generateToken } from '../utils/generateToken.js'
import { DUMMY_HASH, verifyPassword } from '../utils/password.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Only accept real strings. This blocks NoSQL-injection payloads such as
// { "email": { "$gt": "" } } from ever reaching a database query.
const isString = (value) => typeof value === 'string'

function collectRegisterErrors({ name, email, password }) {
  const errors = []

  if (!isString(name) || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' })
  }
  if (!isString(email) || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' })
  }
  if (!isString(password) || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' })
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one letter and one number' })
  }

  return errors
}

// POST /api/auth/register
// Public sign-up always creates a STUDENT. The `role` field in the request body
// is ignored on purpose, otherwise anyone could register themselves as admin.
// Admins are created with `npm run seed:admin`.
export async function register(req, res) {
  const { name, email, password } = req.body ?? {}

  const errors = collectRegisterErrors({ name, email, password })
  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors)
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (await User.exists({ email: normalizedEmail })) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  const user = await User.create({ name, email: normalizedEmail, password })

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user),
    user,
  })
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body ?? {}

  if (!isString(email) || !isString(password) || !email.trim() || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  // `password` is select:false in the schema, so ask for it explicitly here.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')

  // Always run one bcrypt comparison (against a dummy hash if the user doesn't
  // exist) so timing doesn't reveal whether the email is registered.
  const passwordMatches = await verifyPassword(password, user ? user.password : DUMMY_HASH)

  if (!user || !passwordMatches) {
    // Same message for both cases so the response doesn't leak which one failed.
    throw new ApiError(401, 'Invalid email or password')
  }

  res.json({
    success: true,
    message: 'Logged in successfully',
    token: generateToken(user),
    user, // toJSON strips the password
  })
}

// GET /api/auth/me  (protected)
export function getMe(req, res) {
  res.json({ success: true, user: req.user })
}
