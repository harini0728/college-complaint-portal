import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { apiRequest } from '../utils/api'

// ---------- Backend -> UI shape ----------
// The pages were built around a slightly different complaint object than the
// backend sends, so every complaint goes through mapAdminComplaint() first.

// Only links a browser can safely open. Anything else (for example a
// "javascript:" link) is dropped.
const SAFE_URL = /^(https?:|blob:)/i

function mapAttachment(attachment) {
  if (!attachment) return null

  if (typeof attachment === 'string') {
    if (!SAFE_URL.test(attachment)) return null
    return { name: attachment.split('/').pop() || 'Attachment', type: '', size: null, url: attachment }
  }

  if (typeof attachment === 'object' && SAFE_URL.test(attachment.url ?? '')) {
    return {
      name: attachment.name || 'Attachment',
      type: attachment.type || '',
      size: typeof attachment.size === 'number' ? attachment.size : null,
      url: attachment.url,
    }
  }

  return null
}

// The backend does not store a status history, so the timeline is built from
// what it does store. Only the resolved date is known exactly (`resolvedAt`);
// the other steps are shown without a date rather than with a wrong one.
function buildHistory(status, submittedOn, resolvedAt) {
  const history = [{ status: STATUS.PENDING, date: submittedOn }]
  if (status === STATUS.IN_PROGRESS) {
    history.push({ status: STATUS.IN_PROGRESS })
  } else if (status === STATUS.RESOLVED) {
    history.push({ status: STATUS.IN_PROGRESS }, { status: STATUS.RESOLVED, date: resolvedAt || undefined })
  } else if (status === STATUS.REJECTED) {
    history.push({ status: STATUS.REJECTED })
  }
  return history
}

export function mapAdminComplaint(raw) {
  // For admins the backend fills in submittedBy as { id, name, email }.
  // It can be null if that student's account was deleted.
  const student = raw.submittedBy && typeof raw.submittedBy === 'object' ? raw.submittedBy : {}
  const submittedOn = raw.createdAt || raw.updatedAt || ''

  return {
    ...raw,
    id: raw.id || raw._id,
    submittedOn,
    submittedBy: {
      id: student.id || student._id || (typeof raw.submittedBy === 'string' ? raw.submittedBy : ''),
      name: student.name || 'Unknown student',
      email: student.email || '',
      department: student.department || '',
    },
    attachment: mapAttachment(raw.attachment),
    adminResponse: raw.adminResponse || '',
    history: buildHistory(raw.status, submittedOn, raw.resolvedAt),
  }
}

// ---------- Requests (admin only) ----------

// GET /api/complaints?status=&search=&sort=
// Resolves with { complaints, count }.
export async function fetchAdminComplaints({ status, search, sort } = {}, signal) {
  const data = await apiRequest('/complaints', { params: { status, search, sort }, signal })
  const complaints = (data.complaints ?? []).map(mapAdminComplaint)
  return { complaints, count: data.count ?? complaints.length }
}

// GET /api/complaints/:id
export async function fetchAdminComplaint(id, signal) {
  const data = await apiRequest(`/complaints/${encodeURIComponent(id)}`, { signal })
  return mapAdminComplaint(data.complaint)
}

// PATCH /api/complaints/:id   changes: { status?, adminResponse? }
export async function patchComplaint(id, changes) {
  const data = await apiRequest(`/complaints/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: changes,
  })
  return mapAdminComplaint(data.complaint)
}
