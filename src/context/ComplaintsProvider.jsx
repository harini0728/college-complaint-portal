import { useCallback, useMemo, useState } from 'react'
import { ComplaintsContext } from './ComplaintsContext'
import { COMPLAINTS } from '../data/complaints'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { buildHistory, generateComplaintId, todayISO } from '../utils/complaints'

// Keeps complaints in memory so a new complaint shows up on every page.
// Students add complaints and admins update them; both sides read the same list,
// so a change made by one is visible to the other straight away.
// It starts from the dummy data and resets when the page is refreshed.
// When the backend exists, addComplaint and updateComplaint become API calls.
export default function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState(() =>
    COMPLAINTS.map((complaint) => ({ ...complaint, history: buildHistory(complaint) })),
  )

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
        history: [{ status: STATUS.PENDING, date: todayISO() }],
        submittedBy: {
          id: student.id,
          name: student.name,
          department: student.department,
        },
      }
      // Functional form: never overwrites an admin update that happened meanwhile.
      // (The ID comes from the current list. The backend will assign IDs later.)
      setComplaints((current) => [complaint, ...current])
      return complaint
    },
    [complaints],
  )

  // Admin action: set the status and the response for one complaint.
  // A new timeline entry is added only when the status really changes.
  const updateComplaint = useCallback((id, { status, adminResponse }) => {
    setComplaints((current) =>
      current.map((complaint) => {
        if (complaint.id !== id) return complaint
        const changed = status !== complaint.status
        return {
          ...complaint,
          status,
          adminResponse,
          history: changed
            ? [...complaint.history, { status, date: todayISO() }]
            : complaint.history,
        }
      }),
    )
  }, [])

  const value = useMemo(
    () => ({ complaints, addComplaint, updateComplaint }),
    [complaints, addComplaint, updateComplaint],
  )

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>
}
