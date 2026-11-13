import Complaint from '../models/Complaint.js'
import Counter from '../models/Counter.js'
import { COUNTER_NAME, TICKET_BASE, nextTicketNumber } from './ticketNumbers.js'

// Gives a ticket number to every complaint that does not have one yet (records
// made before tickets existed), oldest first, so the numbers follow the order the
// complaints were filed. Safe to run on every start: complaints that already have
// a number are left exactly as they are. Returns how many were numbered.
export async function backfillTicketNumbers() {
  // If tickets already exist, make sure the counter is not behind the highest one,
  // so new numbers can never collide with old ones.
  const highest = await Complaint.findOne({ ticketNumber: { $ne: null } })
    .sort({ ticketNumber: -1 })
    .select('ticketNumber')
    .lean()
  if (highest) {
    await Counter.updateOne(
      { _id: COUNTER_NAME },
      { $max: { seq: highest.ticketNumber - TICKET_BASE } },
      { upsert: true },
    )
  }

  const missing = await Complaint.find({ ticketNumber: null })
    .sort({ createdAt: 1, _id: 1 })
    .select('_id')
    .lean()

  let numbered = 0
  for (const { _id } of missing) {
    const ticketNumber = await nextTicketNumber()
    // Only fill it in if it is still empty, and leave `updatedAt` alone: this is
    // bookkeeping, not an edit by anyone.
    const result = await Complaint.updateOne(
      { _id, ticketNumber: null },
      { $set: { ticketNumber } },
      { timestamps: false },
    )
    numbered += result.modifiedCount
  }
  return numbered
}