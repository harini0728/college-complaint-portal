// Creates the first admin account (public registration can only create students).
// Usage: set ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env, then run
//   npm run seed:admin
import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'
import { ROLES } from '../constants/roles.js'

const { ADMIN_NAME = 'Portal Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.')
  process.exit(1)
}

try {
  await connectDB()
  const email = ADMIN_EMAIL.trim().toLowerCase()
  const existing = await User.findOne({ email })

  if (existing) {
    if (existing.role === ROLES.ADMIN) {
      console.log(`${email} is already an admin. Nothing to do.`)
    } else {
      existing.role = ROLES.ADMIN
      await existing.save()
      console.log(`${email} already existed as a student; promoted to admin.`)
    }
  } else {
    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: ROLES.ADMIN })
    console.log(`Admin created: ${email}`)
  }
} catch (err) {
  console.error('Failed to create admin:', err.message)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
