import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchAdminDashboardSummary } from '../services/complaintsApi'

const NO_COUNTS = { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 }
const NO_ITEMS = []

// Loads the numbers and the newest complaints for the admin dashboard from
// GET /api/complaints/summary. The server counts them in MongoDB, so they are
// read again every time the dashboard opens and always match the current statuses.
//
// Returns:
//   counts      { total, pending, inProgress, resolved, rejected }
//   categories  [{ category, count }], biggest first
//   recent      the newest complaints
//   loading     true until the first response (or the retry after an error)
//   error       an Error to show, or null
//   reload      fetch again
export function useAdminDashboard() {
  const { logout } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  // `key` says which request the stored result belongs to.
  const [result, setResult] = useState({ key: null, summary: null, error: null })

  useEffect(() => {
    const controller = new AbortController()

    fetchAdminDashboardSummary(controller.signal)
      .then((summary) => setResult({ key: reloadCount, summary, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return // the page was left, or a retry replaced this request
        // The saved login is no longer valid: sign out, and the router sends the admin to /login.
        if (error.status === 401) logout()
        setResult({ key: reloadCount, summary: null, error })
      })

    return () => controller.abort()
  }, [reloadCount, logout])

  const reload = useCallback(() => setReloadCount((current) => current + 1), [])

  const settled = result.key === reloadCount

  return {
    counts: result.summary?.counts ?? NO_COUNTS,
    categories: result.summary?.categories ?? NO_ITEMS,
    recent: result.summary?.recent ?? NO_ITEMS,
    loading: !settled && (result.key === null || result.error !== null),
    error: settled ? result.error : null,
    reload,
  }
}