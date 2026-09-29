import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  // Fail fast (10s) instead of hanging forever if the database is unreachable.
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10_000 })

  // Log host/db only — never the connection string, it may contain a password.
  const { host, name } = mongoose.connection
  console.log(`MongoDB connected: ${host}/${name}`)

  // Only after the first successful connect: report later drops/recoveries.
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'))
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message))
}

export async function disconnectDB() {
  await mongoose.connection.close()
}
