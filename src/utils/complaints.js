import { COMPLAINT_STATUSES as STATUS, STATUS_LIST } from '../constants/statuses'

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

// "2026-09-30T14:05:00.000Z" -> "30 Sep 2026, 7:35 pm" in the viewer's own time
// zone. A date with no time ("2026-09-24") is shown as a date only.
export function formatDateTime(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value)

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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

// A complaint's history is [{ status, date, response }], oldest first. The first
// entry is the submission; after it comes one entry each time an admin changed
// the status, with the time of the change and the response sent with it ('' if none).
//
// The backend sends it as `statusHistory`: [{ status, changedAt, adminResponse }].
// This turns that into the shape above, in time order, and skips entries that
// are unusable. Returns [] when there is no history.
export function normalizeHistory(statusHistory) {
  if (!Array.isArray(statusHistory)) return []

  return statusHistory
    .filter((entry) => entry && STATUS_LIST.includes(entry.status) && entry.changedAt)
    .map((entry, index) => ({
      index,
      status: entry.status,
      date: entry.changedAt,
      response: entry.adminResponse || '',
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.index - b.index)
    .map(({ status, date, response }) => ({ status, date, response }))
}

// Only used when a complaint has no history at all. Builds a simple one from
// its current status (the dates of the middle steps are unknown, so left out).
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
// history (oldest first), followed by the stages that are still ahead. A step
// carries the admin response sent with that status change, when there was one.
export function getTimeline(complaint) {
  const history = complaint.history?.length ? complaint.history : buildHistory(complaint)

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
      response: entry.response || undefined,
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