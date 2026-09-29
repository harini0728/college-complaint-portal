import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

// Runs when no route matched.
export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

// Central error handler: every thrown/rejected error ends up here and leaves
// as the same JSON shape: { success: false, message, errors? }.
// Express identifies it as an error handler by its 4 parameters — keep `_next`.
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || err.status || 500
  let message = err.message || 'Something went wrong'
  let errors = err.errors

  if (err.name === 'ValidationError' && err.errors && !(err instanceof ApiError)) {
    // Mongoose schema validation
    status = 400
    message = 'Validation failed'
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
  } else if (err.code === 11000) {
    // MongoDB duplicate key (e.g. two people registering the same email at once)
    status = 409
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field'
    message = `A record with this ${field} already exists`
  } else if (err.name === 'CastError') {
    // e.g. an invalid ObjectId in a URL
    status = 400
    message = `Invalid ${err.path}`
  } else if (err.name === 'TokenExpiredError') {
    status = 401
    message = 'Your session has expired. Please log in again.'
  } else if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    status = 401
    message = 'Invalid token. Please log in again.'
  } else if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'Request body is not valid JSON'
  } else if (err.type === 'entity.too.large') {
    status = 413
    message = 'Request body is too large'
  }

  if (status >= 500) {
    console.error(err)
    // Don't leak internals of unexpected errors to clients in production.
    if (env.isProduction) message = 'Internal server error'
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!env.isProduction && status >= 500 && { stack: err.stack }),
  })
}
