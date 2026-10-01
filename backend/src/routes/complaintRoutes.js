import { Router } from 'express'
import {
  createComplaint,
  getAllComplaints,
  getComplaintSummary,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
} from '../controllers/complaintController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { ROLES } from '../constants/roles.js'

const router = Router()

router.use(protect)

// Student
router.post('/', createComplaint)
router.get('/my', getMyComplaints)

// Admin
// Must stay above '/:id', otherwise "summary" would be read as a complaint id.
router.get('/summary', authorize(ROLES.ADMIN), getComplaintSummary)
router.get('/', authorize(ROLES.ADMIN), getAllComplaints)

// Shared: admin can open any complaint, a student only their own
router.get('/:id', getComplaintById)

// Admin only: update status and/or admin response.
// Students get 403 here, so they can never edit a complaint.
router.patch('/:id', authorize(ROLES.ADMIN), updateComplaint)

export default router