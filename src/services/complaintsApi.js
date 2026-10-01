import { apiRequest } from '../utils/api'
import { normalizeHistory } from '../utils/complaints'

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
    // The status timeline, from the backend's `statusHistory` (oldest first).
    history: normalizeHistory(raw.statusHistory),
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

// GET /api/complaints/:id as a student.
// Same endpoint as above; the backend only returns the complaint when it belongs
// to the signed-in student, and answers 404 for anyone else's.
export async function fetchStudentComplaint(id, signal) {
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