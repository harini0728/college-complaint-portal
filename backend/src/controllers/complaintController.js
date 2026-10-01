import Complaint from '../models/Complaint.js'
import ApiError from '../utils/ApiError.js'
import { ROLES } from '../constants/roles.js'
import { buildBaselineHistory } from '../utils/statusHistory.js'

const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected']
const ADMIN_RESPONSE_MAX_LENGTH = 1000
const SEARCH_MAX_LENGTH = 100
const SORT_OPTIONS = ['newest', 'oldest']
const DEFAULT_SORT = 'newest'

// Reads and validates the admin list query string: ?status=&search=&sort=
// Query values can arrive as arrays (?status=a&status=b), so anything that is
// not a plain string is rejected before it can reach a database query.
// A blank value (?status=) is treated as "not provided".
function parseAdminComplaintQuery(query) {
  const errors = []
  const filters = { status: null, search: null, sort: DEFAULT_SORT }

  const readString = (field) => {
    const value = query[field]
    if (value === undefined) return null
    if (typeof value !== 'string') {
      errors.push({ field, message: `${field} must be a single text value` })
      return null
    }
    return value.trim() || null
  }

  const status = readString('status')
  if (status !== null) {
    if (COMPLAINT_STATUSES.includes(status)) {
      filters.status = status
    } else {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${COMPLAINT_STATUSES.join(', ')}`,
      })
    }
  }

  const search = readString('search')
  if (search !== null) {
    if (search.length > SEARCH_MAX_LENGTH) {
      errors.push({
        field: 'search',
        message: `Search must be at most ${SEARCH_MAX_LENGTH} characters`,
      })
    } else {
      filters.search = search
    }
  }

  const sort = readString('sort')
  if (sort !== null) {
    if (SORT_OPTIONS.includes(sort)) {
      filters.sort = sort
    } else {
      errors.push({
        field: 'sort',
        message: `Sort must be one of: ${SORT_OPTIONS.join(', ')}`,
      })
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors)
  }

  return filters
}

// Escapes regex special characters so the search text is matched literally.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// POST /api/complaints
export async function createComplaint(req, res) {
  const { title, description, category, location, attachment } = req.body ?? {}

  if (!title || !description || !category || !location) {
    throw new ApiError(
      400,
      'Title, description, category, and location are required',
    )
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    location,
    attachment: attachment || null,
    submittedBy: req.user._id,
  })

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint,
  })
}

// GET /api/complaints/my
export async function getMyComplaints(req, res) {
  const complaints = await Complaint.find({
    submittedBy: req.user._id,
  }).sort({ createdAt: -1 })

  res.json({
    success: true,
    complaints,
  })
}

// GET /api/complaints/:id
// Admin: can open any complaint (with the student's name and email).
// Student: can only open their own complaint.
export async function getComplaintById(req, res) {
  const isAdmin = req.user.role === ROLES.ADMIN

  const filter = isAdmin
    ? { _id: req.params.id }
    : { _id: req.params.id, submittedBy: req.user._id }

  const query = Complaint.findOne(filter)
  if (isAdmin) {
    query.populate('submittedBy', 'name email')
  }
  const complaint = await query

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found')
  }

  res.json({
    success: true,
    complaint,
  })
}

// GET /api/complaints  (admin only — enforced in the route)
// Optional query params:
//   status  Pending | In Progress | Resolved | Rejected
//   search  text matched (case-insensitive) in title, description, category, location
//   sort    newest (default) | oldest
// With no params it returns every complaint, newest first.
export async function getAllComplaints(req, res) {
  const { status, search, sort } = parseAdminComplaintQuery(req.query)

  const filter = {}

  if (status) {
    filter.status = status
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i')
    filter.$or = [
      { title: pattern },
      { description: pattern },
      { category: pattern },
      { location: pattern },
    ]
  }

  // _id is a tie-breaker so complaints created in the same millisecond keep a
  // stable order.
  const direction = sort === 'oldest' ? 1 : -1

  const complaints = await Complaint.find(filter)
    .populate('submittedBy', 'name email')
    .sort({ createdAt: direction, _id: direction })

  res.json({
    success: true,
    count: complaints.length,
    filters: { status, search, sort },
    complaints,
  })
}

// PATCH /api/complaints/:id  (admin only — enforced in the route)
// Body: { status?, adminResponse? } — at least one of them is required.
//   status        one of Pending | In Progress | Resolved | Rejected
//   adminResponse text to show the student; "" or null clears it
// Nothing else on the complaint can be changed through this endpoint: the
// fields are picked one by one, so extra keys in the body are ignored (this
// includes statusHistory, which only this function adds to).
// A change to a different status adds an entry to statusHistory with the new
// status, the time, and the response sent in the same request (if any).
// Re-sending the current status, or sending only a response, adds no entry.
export async function updateComplaint(req, res) {
  const body = req.body

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be a JSON object')
  }

  const hasStatus = Object.hasOwn(body, 'status') && body.status !== undefined
  const hasResponse =
    Object.hasOwn(body, 'adminResponse') && body.adminResponse !== undefined

  if (!hasStatus && !hasResponse) {
    throw new ApiError(
      400,
      'Provide at least one of: status, adminResponse',
    )
  }

  // Validate everything first so a bad request never touches the database.
  const errors = []
  let nextResponse

  if (hasStatus && !COMPLAINT_STATUSES.includes(body.status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${COMPLAINT_STATUSES.join(', ')}`,
    })
  }

  if (hasResponse) {
    if (body.adminResponse !== null && typeof body.adminResponse !== 'string') {
      errors.push({
        field: 'adminResponse',
        message: 'Admin response must be a string',
      })
    } else {
      // Empty / whitespace-only text (or null) clears the response.
      nextResponse = body.adminResponse?.trim() || null

      if (nextResponse && nextResponse.length > ADMIN_RESPONSE_MAX_LENGTH) {
        errors.push({
          field: 'adminResponse',
          message: `Admin response must be at most ${ADMIN_RESPONSE_MAX_LENGTH} characters`,
        })
      }
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors)
  }

  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found')
  }

  // Complaints created before the history existed have no entries. Save their
  // starting point now, before the status below is changed.
  if (complaint.statusHistory.length === 0) {
    complaint.statusHistory = buildBaselineHistory(complaint)
  }

  const statusChanged = hasStatus && body.status !== complaint.status

  if (hasStatus) {
    complaint.status = body.status

    // resolvedAt tracks when the complaint was resolved: set it the first time
    // it becomes Resolved, keep it if it is already Resolved, and clear it if
    // the complaint is moved to any other status.
    if (body.status === 'Resolved') {
      complaint.resolvedAt = complaint.resolvedAt ?? new Date()
    } else {
      complaint.resolvedAt = null
    }
  }

  if (hasResponse) {
    complaint.adminResponse = nextResponse
  }

  if (statusChanged) {
    complaint.statusHistory.push({
      status: body.status,
      changedAt: new Date(),
      adminResponse: hasResponse ? nextResponse : null,
    })
  }

  // Validate only what changed, so an older complaint that is missing a field
  // added later (for example `location`) can still get a status update.
  await complaint.save({ validateModifiedOnly: true })
  await complaint.populate('submittedBy', 'name email')

  res.json({
    success: true,
    message: 'Complaint updated successfully',
    complaint,
  })
}