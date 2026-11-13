import Counter from '../models/Counter.js'

export const COUNTER_NAME = 'complaintTicket'

// The first ticket is #1001: counter value 1 -> ticket 1001.
export const TICKET_BASE = 1000

// Returns the next ticket number (1001, 1002, ...). The increment happens inside
// MongoDB in one step, so two complaints created at the same moment never get the
// same number, even with several servers running.
export async function nextTicketNumber() {
  const options = { new: true, upsert: true, setDefaultsOnInsert: true }

  let counter
  try {
    counter = await Counter.findOneAndUpdate({ _id: COUNTER_NAME }, { $inc: { seq: 1 } }, options)
  } catch (err) {
    // Two requests creating the very first counter at once: one loses the race
    // with a duplicate-key error. The counter exists now, so just try again.
    if (err?.code !== 11000) throw err
    counter = await Counter.findOneAndUpdate({ _id: COUNTER_NAME }, { $inc: { seq: 1 } }, options)
  }

  return TICKET_BASE + counter.seq
}