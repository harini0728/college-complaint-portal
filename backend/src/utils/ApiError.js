// An error we throw on purpose, carrying the HTTP status to send back.
export default class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors // optional: [{ field, message }]
  }
}
