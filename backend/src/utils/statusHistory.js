// Helpers for Complaint.statusHistory: one entry each time a complaint gets a
// new status, { status, changedAt, adminResponse }.

const PENDING = 'Pending'

// Oldest first. Entries with the same time keep the order they were saved in.
export function sortHistory(entries) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        new Date(a.entry.changedAt) - new Date(b.entry.changedAt) ||
        a.index - b.index,
    )
    .map(({ entry }) => entry)
}

// Complaints created before the history existed have no entries. This gives
// them a starting point from what is stored on the complaint:
//   - "Pending" at the time it was submitted
//   - if it has moved on, its current status (at `resolvedAt` for Resolved,
//     otherwise at `updatedAt` — the real date of that step was never saved)
// Used when such a complaint is read, and once more when an admin first
// updates it, so the starting point is saved before anything changes.
export function buildBaselineHistory({
  status,
  createdAt,
  updatedAt,
  resolvedAt,
  adminResponse,
}) {
  const submittedAt = createdAt ?? updatedAt ?? new Date()
  const history = [{ status: PENDING, changedAt: submittedAt, adminResponse: null }]

  if (status && status !== PENDING) {
    history.push({
      status,
      changedAt: (status === 'Resolved' && resolvedAt) || updatedAt || submittedAt,
      adminResponse: adminResponse ?? null,
    })
  }

  return history
}