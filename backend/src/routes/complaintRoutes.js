import { Router } from 'express'
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
} from '../controllers/complaintController.js'
import { protect, authorize } from '../middleware/authMiddleware.js'
import { ROLES } from '../constants/roles.js'

const router = Router()

router.use(protect)

// Student
router.post('/', createComplaint)
router.get('/my', getMyComplaints)

// Admin
router.get('/', authorize(ROLES.ADMIN), getAllComplaints)

// Shared: admin can open any complaint, a student only their own
router.get('/:id', getComplaintById)

export default router