import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'

// "In Progress" -> "in-progress" (used for CSS class names)
export function statusSlug(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

// "2026-09-24" -> "24 Sep 2026"
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Newest first. Returns a new array and leaves the original untouched.
export function sortNewestFirst(complaints) {
  return [...complaints].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
}

// How many complaints are in each status.
export function countByStatus(complaints) {
  const countOf = (status) =>
    complaints.filter((complaint) => complaint.status === status).length

  return {
    total: complaints.length,
    pending: countOf(STATUS.PENDING),
    inProgress: countOf(STATUS.IN_PROGRESS),
    resolved: countOf(STATUS.RESOLVED),
    rejected: countOf(STATUS.REJECTED),
  }
}
