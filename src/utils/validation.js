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

// ---------- Complaint form ----------

export const COMPLAINT_LIMITS = {
  titleMin: 5,
  titleMax: 100,
  locationMin: 3,
  locationMax: 100,
  descriptionMin: 20,
  descriptionMax: 1000,
}

export const ATTACHMENT_RULES = {
  maxBytes: 2 * 1024 * 1024,
  maxLabel: '2 MB',
  types: {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'application/pdf': 'PDF',
  },
  accept: '.jpg,.jpeg,.png,.pdf',
  hint: 'Optional. A JPG, PNG or PDF file, up to 2 MB.',
}

export function validateComplaintTitle(value) {
  const text = value.trim()
  if (!text) return 'Enter a short title for your complaint.'
  if (text.length < COMPLAINT_LIMITS.titleMin) {
    return `The title needs at least ${COMPLAINT_LIMITS.titleMin} characters.`
  }
  if (text.length > COMPLAINT_LIMITS.titleMax) {
    return `Keep the title within ${COMPLAINT_LIMITS.titleMax} characters.`
  }
  return ''
}

export function validateComplaintCategory(value) {
  return value ? '' : 'Choose the category that fits best.'
}

export function validateComplaintLocation(value) {
  const text = value.trim()
  if (!text) return 'Say where the problem is, for example "Hostel Block B, 2nd floor".'
  if (text.length < COMPLAINT_LIMITS.locationMin) {
    return `The location needs at least ${COMPLAINT_LIMITS.locationMin} characters.`
  }
  if (text.length > COMPLAINT_LIMITS.locationMax) {
    return `Keep the location within ${COMPLAINT_LIMITS.locationMax} characters.`
  }
  return ''
}

export function validateComplaintDescription(value) {
  const text = value.trim()
  if (!text) return 'Describe the problem so the right team can act on it.'
  if (text.length < COMPLAINT_LIMITS.descriptionMin) {
    return `Add a little more detail. The description needs at least ${COMPLAINT_LIMITS.descriptionMin} characters.`
  }
  if (text.length > COMPLAINT_LIMITS.descriptionMax) {
    return `Keep the description within ${COMPLAINT_LIMITS.descriptionMax} characters.`
  }
  return ''
}

// The attachment is optional. Only a chosen file can have an error.
export function validateAttachment(file) {
  if (!file) return ''
  if (!ATTACHMENT_RULES.types[file.type]) {
    return 'This file type is not supported. Attach a JPG, PNG or PDF file.'
  }
  if (file.size > ATTACHMENT_RULES.maxBytes) {
    return `This file is too large. Attach a file up to ${ATTACHMENT_RULES.maxLabel}.`
  }
  if (file.size === 0) return 'This file is empty. Choose a different file.'
  return ''
}

// Checks the whole complaint form. Returns an object with only the fields that have errors.
export function validateComplaint({ title, category, location, description, attachment }) {
  const errors = {}
  const checks = {
    title: validateComplaintTitle(title),
    category: validateComplaintCategory(category),
    location: validateComplaintLocation(location),
    description: validateComplaintDescription(description),
    attachment: validateAttachment(attachment),
  }
  Object.entries(checks).forEach(([field, message]) => {
    if (message) errors[field] = message
  })
  return errors
}
