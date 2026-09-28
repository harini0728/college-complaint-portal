import { useEffect, useState } from 'react'
import { getComplaintsForStudent } from '../data/complaints'

const FAKE_NETWORK_DELAY_MS = 500

// Returns { complaints, loading } for one student.
// The short delay imitates a real request so the loading state is visible.
// When the backend exists, only the inside of this hook changes.
export function useStudentComplaints(studentId) {
  const [state, setState] = useState({ complaints: [], loading: true })

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({ complaints: getComplaintsForStudent(studentId), loading: false })
    }, FAKE_NETWORK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [studentId])

  return state
}
