import Complaint from '../models/Complaint.js'
import ApiError from '../utils/ApiError.js'

// POST /api/complaints
export async function createComplaint(req, res) {
  const { title, description, category, attachment } = req.body ?? {}

  if (!title || !description || !category) {
    throw new ApiError(
      400,
      'Title, description, and category are required',
    )
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
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
export async function getComplaintById(req, res) {
  const complaint = await Complaint.findOne({
    _id: req.params.id,
    submittedBy: req.user._id,
  })

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found')
  }

  res.json({
    success: true,
    complaint,
  })
}