import { useMemo } from 'react'
import { useComplaints } from '../context/useComplaints'
import { useFakeLoading } from './useFakeLoading'

// Returns { complaints, loading } for one student.
// When the backend exists, only the inside of this hook changes.
export function useStudentComplaints(studentId) {
  const { complaints: allComplaints } = useComplaints()
  const loading = useFakeLoading()

  const complaints = useMemo(
    () => allComplaints.filter((complaint) => complaint.submittedBy.id === studentId),
    [allComplaints, studentId],
  )

  return { complaints, loading }
}
