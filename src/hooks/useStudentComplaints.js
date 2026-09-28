import { useEffect, useMemo, useState } from 'react'
import { useComplaints } from '../context/useComplaints'

const FAKE_NETWORK_DELAY_MS = 500

// Returns { complaints, loading } for one student.
// The short delay imitates a real request so the loading state is visible.
// When the backend exists, only the inside of this hook changes.
export function useStudentComplaints(studentId) {
  const { complaints: allComplaints } = useComplaints()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), FAKE_NETWORK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [studentId])

  const complaints = useMemo(
    () => allComplaints.filter((complaint) => complaint.submittedBy.id === studentId),
    [allComplaints, studentId],
  )

  return { complaints, loading }
}
