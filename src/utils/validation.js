import { ROLES } from '../constants/roles'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ID_PATTERN = /^[A-Za-z0-9-]{4,20}$/
const MIN_PASSWORD_LENGTH = 6

// Each validator returns an error message, or '' when the value is fine.

export function validateIdentifier(value, role) {
  const text = value.trim()
  const isAdmin = role === ROLES.ADMIN

  if (!text) {
    return isAdmin
      ? 'Enter your staff ID or college email.'
      : 'Enter your student ID or college email.'
  }

  const looksLikeEmail = text.includes('@')
  if (looksLikeEmail && !EMAIL_PATTERN.test(text)) {
    return 'Enter a complete email address, for example name@college.edu.'
  }
  if (!looksLikeEmail && !ID_PATTERN.test(text)) {
    return isAdmin
      ? 'A staff ID has 4 to 20 letters or numbers, with no spaces.'
      : 'A student ID has 4 to 20 letters or numbers, with no spaces.'
  }
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Enter your password.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Your password has at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return ''
}

// Checks the whole login form. Returns an object with only the fields that have errors.
export function validateLogin({ identifier, password, role }) {
  const errors = {}
  const identifierError = validateIdentifier(identifier, role)
  const passwordError = validatePassword(password)
  if (identifierError) errors.identifier = identifierError
  if (passwordError) errors.password = passwordError
  return errors
}
