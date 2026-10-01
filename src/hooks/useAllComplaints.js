import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchAdminComplaints } from '../services/complaintsApi'

const NO_FILTERS = {}

// Loads the complaints for the admin pages from GET /api/complaints.
//   filters: { status, search, sort }  (all optional; the server applies them,
//            and returns newest first unless sort is 'oldest')
//
// Returns:
//   complaints  the current results
//   count       how many the server found
//   loading     true while there is nothing to show yet (first load, or a retry after an error)
//   refreshing  true while new results load and the old ones are still on screen
//   error       an Error to show, or null
//   reload      fetch again
export function useAllComplaints(filters = NO_FILTERS) {
  const { logout } = useAuth()
  const { status = '', search = '', sort = 'newest' } = filters

  const [reloadCount, setReloadCount] = useState(0)
  // `key` says which request the stored result belongs to.
  const [result, setResult] = useState({ key: null, complaints: [], count: 0, error: null })

  const requestKey = JSON.stringify([status, search, sort, reloadCount])

  useEffect(() => {
    const controller = new AbortController()

    fetchAdminComplaints({ status, search, sort }, controller.signal)
      .then(({ complaints, count }) => {
        setResult({ key: requestKey, complaints, count, error: null })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return // a newer request replaced this one
        // The saved login is no longer valid: sign out, and the router sends the admin to /login.
        if (error.status === 401) logout()
        setResult({ key: requestKey, complaints: [], count: 0, error })
      })

    // Leaving the page, or changing a filter, cancels the request still in flight.
    return () => controller.abort()
  }, [requestKey, status, search, sort, logout])

  const reload = useCallback(() => setReloadCount((current) => current + 1), [])

  const settled = result.key === requestKey
  const loading = !settled && (result.key === null || result.error !== null)
  const refreshing = !settled && !loading

  return {
    complaints: result.complaints,
    count: result.count,
    loading,
    refreshing,
    error: settled ? result.error : null,
    reload,
  }
}
