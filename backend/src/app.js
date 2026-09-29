import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import routes from './routes/index.js'

// The Express app is built here, separately from server.js, so it can be
// imported in tests without opening a port or a database connection.
const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true)
      }

      // Allow any localhost/127.0.0.1 port during development
      if (
        !env.isProduction &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true)
      }

      // Allow configured origins
      if (env.clientOrigins.includes(origin)) {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '10kb' }))
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'))
}

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
