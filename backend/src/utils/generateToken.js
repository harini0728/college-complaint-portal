import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// The token only carries the user id (as `sub`) and role. Everything else is
// looked up from the database on each request, so it is never stale.
export function generateToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user._id),
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  })
}
