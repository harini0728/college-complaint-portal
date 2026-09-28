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

// Today as YYYY-MM-DD in the person's own time zone.
export function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Next reference number: CMP-1045 if the highest so far is CMP-1044.
export function generateComplaintId(complaints) {
  const highest = complaints.reduce((max, complaint) => {
    const number = Number(complaint.id.replace('CMP-', ''))
    return Number.isFinite(number) && number > max ? number : max
  }, 1000)
  return `CMP-${highest + 1}`
}

// 1536 -> "1.5 KB"
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Applies the search box and the status filter.
//   query:  matched against id, title, category, location and description
//   status: a status name, or '' for all statuses
export function filterComplaints(complaints, { query = '', status = '' }) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return complaints.filter((complaint) => {
    if (status && complaint.status !== status) return false
    if (words.length === 0) return true

    const haystack = [
      complaint.id,
      complaint.title,
      complaint.category,
      complaint.location,
      complaint.description,
    ]
      .join(' ')
      .toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}

// The steps shown in the status timeline on the details page.
// Each step is 'done', 'current' or 'upcoming'. We only know the submission
// date for now; the backend can add a date for every step later.
export function getTimeline(complaint) {
  const submitted = {
    key: 'submitted',
    label: 'Submitted',
    description: 'Your complaint was received.',
    date: complaint.submittedOn,
  }

  switch (complaint.status) {
    case STATUS.PENDING:
      return [
        { ...submitted, state: 'done' },
        { key: 'review', label: STATUS.PENDING, description: 'Waiting for review by the administration.', state: 'current' },
        { key: 'progress', label: STATUS.IN_PROGRESS, description: 'The concerned department starts work.', state: 'upcoming' },
        { key: 'resolved', label: STATUS.RESOLVED, description: 'The issue is fixed.', state: 'upcoming' },
      ]
    case STATUS.IN_PROGRESS:
      return [
        { ...submitted, state: 'done' },
        { key: 'review', label: 'Reviewed', description: 'The administration reviewed your complaint.', state: 'done' },
        { key: 'progress', label: STATUS.IN_PROGRESS, description: 'The concerned department is working on the issue.', state: 'current' },
        { key: 'resolved', label: STATUS.RESOLVED, description: 'The issue is fixed.', state: 'upcoming' },
      ]
    case STATUS.RESOLVED:
      return [
        { ...submitted, state: 'done' },
        { key: 'review', label: 'Reviewed', description: 'The administration reviewed your complaint.', state: 'done' },
        { key: 'progress', label: STATUS.IN_PROGRESS, description: 'The concerned department worked on the issue.', state: 'done' },
        { key: 'resolved', label: STATUS.RESOLVED, description: 'The issue is fixed.', state: 'current' },
      ]
    case STATUS.REJECTED:
      return [
        { ...submitted, state: 'done' },
        { key: 'review', label: 'Reviewed', description: 'The administration reviewed your complaint.', state: 'done' },
        { key: 'rejected', label: STATUS.REJECTED, description: 'The complaint could not be acted on. See the response.', state: 'current', tone: 'rejected' },
      ]
    default:
      return [{ ...submitted, state: 'current' }]
  }
}
