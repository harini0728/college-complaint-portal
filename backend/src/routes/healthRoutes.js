import { Router } from 'express'
import mongoose from 'mongoose'
import { env } from '../config/env.js'

const router = Router()

const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }

// GET /api/health — for you, uptime monitors, and deployment health checks.
router.get('/', (_req, res) => {
  const database = DB_STATES[mongoose.connection.readyState] ?? 'unknown'
  const healthy = database === 'connected'

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database,
  })
})

export default router
