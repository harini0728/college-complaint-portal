// The four stages of a complaint.
export const COMPLAINT_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
}

// What each status means, in words a student understands.
export const STATUS_DESCRIPTIONS = {
  [COMPLAINT_STATUSES.PENDING]:
    'We have received your complaint and it is waiting for review.',
  [COMPLAINT_STATUSES.IN_PROGRESS]:
    'The concerned department is working on the issue.',
  [COMPLAINT_STATUSES.RESOLVED]:
    'The issue is fixed. Any response from the administration is shown with it.',
  [COMPLAINT_STATUSES.REJECTED]:
    'The complaint could not be acted on. The reason is shared with you.',
}
