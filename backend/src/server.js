import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message)
    process.exit(1)
  }

  const server = app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port} (${env.nodeEnv})`)
  })

  // Finish in-flight requests and close the DB cleanly on Ctrl+C / deploy restarts.
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref() // hard stop if something hangs
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
  process.exit(1)
})

start()
