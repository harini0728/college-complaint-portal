import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

// Requires a valid `Authorization: Bearer <token>` header and attaches the
// logged-in user to `req.user`. Expired/invalid tokens are turned into clean
// 401 responses by the error handler.
export async function protect(req, _res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authenticated. Please log in.')
  }

  const token = header.slice('Bearer '.length).trim()

  // Pinning the algorithm stops "alg: none" / algorithm-swap attacks.
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })

  // Load the user fresh: if the account was deleted or its role changed since
  // the token was issued, the request is judged on current data.
  const user = await User.findById(payload.sub)
  if (!user) {
    throw new ApiError(401, 'The account for this token no longer exists')
  }

  req.user = user
  next()
}

// Use after `protect`, e.g. router.get('/x', protect, authorize('admin'), handler)
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action')
    }
    next()
  }
}
