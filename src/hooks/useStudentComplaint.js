import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchStudentComplaint } from '../services/complaintsApi'

// Loads one of the signed-in student's complaints from GET /api/complaints/:id.
// The backend only returns a complaint that belongs to this student, so someone
// else's id comes back as "not found".
//
// Returns:
//   complaint  the complaint, or null
//   loading    true until the response arrives
//   error      an Error to show (network / server problem), or null
//   notFound   true when there is no such complaint in this student's account
//   reload     fetch again
export function useStudentComplaint(id) {
  const { logout } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  // `key` says which request the stored result belongs to, so a result for an
  // earlier id or an earlier attempt is never shown for the current one.
  const [result, setResult] = useState({ key: null, complaint: null, error: null })

  const requestKey = JSON.stringify([id, reloadCount])

  useEffect(() => {
    const controller = new AbortController()

    fetchStudentComplaint(id, controller.signal)
      .then((complaint) => setResult({ key: requestKey, complaint, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return // leaving the page or a newer request
        // The saved login is no longer valid: sign out, and the router sends the student to /login.
        if (error.status === 401) logout()
        setResult({ key: requestKey, complaint: null, error })
      })

    return () => controller.abort()
  }, [id, requestKey, logout])

  const reload = useCallback(() => setReloadCount((current) => current + 1), [])

  const settled = result.key === requestKey
  const error = settled ? result.error : null
  // A malformed id makes the backend answer 400 ("Invalid _id"); to the student that is also "not found".
  const notFound = error?.status === 404 || error?.status === 400

  return {
    complaint: settled ? result.complaint : null,
    loading: !settled,
    error: notFound ? null : error,
    notFound,
    reload,
  }
}