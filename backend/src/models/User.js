import mongoose from 'mongoose'
import { ROLES, ROLE_LIST } from '../constants/roles.js'
import { hashPassword } from '../utils/password.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index in MongoDB
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        // bcrypt only uses the first 72 bytes, so refuse anything longer
        // rather than silently ignoring the rest.
        validator: (value) => Buffer.byteLength(value, 'utf8') <= 72,
        message: 'Password must be at most 72 bytes long',
      },
      select: false, // never returned by queries unless explicitly requested
    },
    role: {
      type: String,
      enum: { values: ROLE_LIST, message: 'Role must be student or admin' },
      default: ROLES.STUDENT,
    },
  },
  { timestamps: true },
)

// Hash the password whenever it is set or changed. Validation (above) runs
// first against the plain text; this hook then swaps in the hash before saving.
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password)
  }
})

// Shape of the user in every API response: no password, no __v.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  },
})

export default mongoose.model('User', userSchema)
