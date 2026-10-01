import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchAdminComplaint, patchComplaint } from '../services/complaintsApi'

// Loads one complaint (GET /api/complaints/:id) and saves admin changes to it
// (PATCH /api/complaints/:id).
//
// Returns:
//   complaint  the complaint, or null
//   loading    true until the first response (or the retry after an error)
//   error      an Error to show, or null
//   notFound   true when the server has no complaint with this id
//   reload     fetch again
//   save       save({ status?, adminResponse? }) -> resolves once the page shows
//              the updated complaint; throws an Error with a readable message on failure
export function useAdminComplaint(id) {
  const { logout } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: null, complaint: null, error: null })

  const requestKey = JSON.stringify([id, reloadCount])

  useEffect(() => {
    const controller = new AbortController()

    fetchAdminComplaint(id, controller.signal)
      .then((complaint) => setResult({ key: requestKey, complaint, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        if (error.status === 401) logout()
        setResult({ key: requestKey, complaint: null, error })
      })

    return () => controller.abort()
  }, [id, requestKey, logout])

  const reload = useCallback(() => setReloadCount((current) => current + 1), [])

  const save = useCallback(
    async (changes) => {
      try {
        const updated = await patchComplaint(id, changes)
        // Show the server's copy straight away: no second request needed.
        setResult((current) => ({ ...current, complaint: updated, error: null }))
        return updated
      } catch (error) {
        if (error.status === 401) logout()
        throw error
      }
    },
    [id, logout],
  )

  const settled = result.key === requestKey
  const loading = !settled
  const error = settled ? result.error : null
  // A malformed id makes the backend answer 400 ("Invalid _id"); to the admin that is also "not found".
  const notFound = error?.status === 404 || error?.status === 400

  return {
    complaint: settled ? result.complaint : null,
    loading,
    error: notFound ? null : error,
    notFound,
    reload,
    save,
  }
}
