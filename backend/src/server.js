import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'
import { backfillTicketNumbers } from './utils/backfillTicketNumbers.js'

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message)
    process.exit(1)
  }

  // Give older complaints their ticket numbers. If this fails the app still works
  // (the frontend falls back to the old reference) and it is retried next start.
  try {
    const numbered = await backfillTicketNumbers()
    if (numbered > 0) console.log(`Ticket numbers added to ${numbered} existing complaint(s)`)
  } catch (err) {
    console.error('Could not add ticket numbers to existing complaints:', err.message)
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