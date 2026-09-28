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

// ---------- Admin helpers ----------

// Oldest or newest first. Same-day complaints are ordered by their number.
export function sortComplaints(complaints, order = 'newest') {
  const numberOf = (complaint) => Number(complaint.id.replace('CMP-', '')) || 0
  const direction = order === 'oldest' ? 1 : -1
  return [...complaints].sort(
    (a, b) =>
      direction *
      (a.submittedOn.localeCompare(b.submittedOn) || numberOf(a) - numberOf(b)),
  )
}

// The admin search box: matches complaint ID, title, student name and student ID.
// Every word typed must match somewhere ("fan priya" finds Priya's fan complaint).
export function filterAdminComplaints(complaints, { query = '', category = '', status = '' }) {
  const words = query.replace(/#/g, '').trim().toLowerCase().split(/\s+/).filter(Boolean)

  return complaints.filter((complaint) => {
    if (status && complaint.status !== status) return false
    if (category && complaint.category !== category) return false
    if (words.length === 0) return true

    const haystack = [
      complaint.id,
      complaint.title,
      complaint.submittedBy.name,
      complaint.submittedBy.id,
    ]
      .join(' ')
      .toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}

// [{ category, count }] for categories that have complaints, biggest first.
export function countByCategory(complaints) {
  const counts = new Map()
  complaints.forEach((complaint) => {
    counts.set(complaint.category, (counts.get(complaint.category) ?? 0) + 1)
  })
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
}

export function percentOf(count, total) {
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

// ---------- Status history and timeline ----------

// Every complaint keeps a history: [{ status, date }], oldest first. The first
// entry is the submission. The admin adds one entry each time the status changes.
// The dummy complaints have no history yet, so this builds a simple one from
// their current status (the dates of the middle steps are unknown, so left out).
export function buildHistory(complaint) {
  const history = [{ status: STATUS.PENDING, date: complaint.submittedOn }]
  if (complaint.status === STATUS.IN_PROGRESS) {
    history.push({ status: STATUS.IN_PROGRESS })
  }
  if (complaint.status === STATUS.RESOLVED) {
    history.push({ status: STATUS.IN_PROGRESS }, { status: STATUS.RESOLVED })
  }
  if (complaint.status === STATUS.REJECTED) {
    history.push({ status: STATUS.REJECTED })
  }
  return history
}

const STEP_TEXT = {
  [STATUS.PENDING]: 'Waiting for review by the administration.',
  [STATUS.IN_PROGRESS]: 'The concerned department is working on the issue.',
  [STATUS.RESOLVED]: 'The issue is fixed.',
  [STATUS.REJECTED]: 'The complaint could not be acted on. See the response.',
}

// The steps shown in the status timeline (student and admin pages).
// Each step is 'done', 'current' or 'upcoming'. Steps come from the complaint's
// history, followed by the stages that are still ahead.
export function getTimeline(complaint) {
  const history = complaint.history ?? buildHistory(complaint)

  const steps = [
    {
      key: 'submitted',
      label: 'Submitted',
      description: 'The complaint was received.',
      date: complaint.submittedOn,
      state: 'done',
    },
  ]

  history.slice(1).forEach((entry, index) => {
    steps.push({
      key: `change-${index}`,
      label: entry.status,
      description: STEP_TEXT[entry.status],
      date: entry.date,
      state: 'done',
      tone: entry.status === STATUS.REJECTED ? 'rejected' : undefined,
    })
  })

  const latest = history[history.length - 1].status

  // A brand-new complaint has no change yet, so show "Pending" as the current step.
  if (history.length === 1) {
    steps.push({
      key: 'pending',
      label: STATUS.PENDING,
      description: STEP_TEXT[STATUS.PENDING],
      state: 'done',
    })
  }
  steps[steps.length - 1].state = 'current'

  if (latest === STATUS.PENDING) {
    steps.push({ key: 'next-progress', label: STATUS.IN_PROGRESS, description: 'The concerned department starts work.', state: 'upcoming' })
  }
  if (latest === STATUS.PENDING || latest === STATUS.IN_PROGRESS) {
    steps.push({ key: 'next-resolved', label: STATUS.RESOLVED, description: 'The issue is fixed.', state: 'upcoming' })
  }
  return steps
}
