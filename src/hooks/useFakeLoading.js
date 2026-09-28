import { useEffect, useState } from 'react'

const FAKE_NETWORK_DELAY_MS = 500

// Returns true for a short moment after the page opens, so the loading
// skeletons are visible. Delete this hook when real API calls exist:
// the loading flag will then come from the request itself.
export function useFakeLoading() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), FAKE_NETWORK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  return loading
}
