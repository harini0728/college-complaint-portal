import { useCallback, useMemo, useState } from 'react'
import { ComplaintsContext } from './ComplaintsContext'
import { COMPLAINTS } from '../data/complaints'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { generateComplaintId, todayISO } from '../utils/complaints'

// Keeps complaints in memory so a new complaint shows up on every page.
// It starts from the dummy data and resets when the page is refreshed.
// When the backend exists, addComplaint becomes an API call.
export default function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState(COMPLAINTS)

  const addComplaint = useCallback(
    ({ title, category, location, description, attachment }, student) => {
      const complaint = {
        id: generateComplaintId(complaints),
        title,
        category,
        location,
        description,
        attachment: attachment ?? null,
        submittedOn: todayISO(),
        status: STATUS.PENDING,
        adminResponse: '',
        submittedBy: {
          id: student.id,
          name: student.name,
          department: student.department,
        },
      }
      setComplaints([complaint, ...complaints])
      return complaint
    },
    [complaints],
  )

  const value = useMemo(() => ({ complaints, addComplaint }), [complaints, addComplaint])

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>
}
