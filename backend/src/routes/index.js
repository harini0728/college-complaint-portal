import { Router } from 'express'
import authRoutes from './authRoutes.js'
import healthRoutes from './healthRoutes.js'
import complaintRoutes from './complaintRoutes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/complaints', complaintRoutes)

export default router