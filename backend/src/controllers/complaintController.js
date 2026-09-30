import Complaint from '../models/Complaint.js'
import ApiError from '../utils/ApiError.js'
import { ROLES } from '../constants/roles.js'

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

// GET /api/complaints  (admin only)
export async function getAllComplaints(_req, res) {
  const complaints = await Complaint.find()
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 })

  res.json({
    success: true,
    count: complaints.length,
    complaints,
  })
}