import { Router } from 'express'
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
} from '../controllers/complaintController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.post('/', createComplaint)
router.get('/my', getMyComplaints)
router.get('/:id', getComplaintById)

export default router