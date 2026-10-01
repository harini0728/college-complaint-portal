import mongoose from 'mongoose'
import { buildBaselineHistory, sortHistory } from '../utils/statusHistory.js'

const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected']

// One entry per status change. `adminResponse` is the response the admin sent
// together with that change (null when there was none). Entries are only ever
// added, never edited.
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    adminResponse: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false },
)

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title must be at most 150 characters'],
    },

    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },

    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      trim: true,
    },

    location: {
      type: String,
      required: [true, 'Complaint location is required'],
      trim: true,
      minlength: [3, 'Location must be at least 3 characters'],
      maxlength: [100, 'Location must be at most 100 characters'],
    },

    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'Pending',
    },

    // Every status the complaint has had, oldest first. The first entry is
    // added automatically when the complaint is created.
    statusHistory: {
      type: [statusHistorySchema],
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    attachment: {
      type: String,
      default: null,
    },

    adminResponse: {
      type: String,
      default: null,
      trim: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// A new complaint starts its history with its first status ("Pending"). Doing
// it here means every way of creating a complaint gets it.
complaintSchema.pre('validate', async function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() })
  }
})

complaintSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v

    // Always send the history oldest first. Complaints created before the
    // history existed get a starting point built from what is stored on them.
    if (Array.isArray(ret.statusHistory)) {
      ret.statusHistory =
        ret.statusHistory.length > 0
          ? sortHistory(ret.statusHistory)
          : buildBaselineHistory(ret)
    }

    return ret
  },
})

export default mongoose.model('Complaint', complaintSchema)