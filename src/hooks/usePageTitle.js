import { useEffect } from 'react'
import { COLLEGE } from '../constants/college'

// Sets the browser tab title, e.g. "My complaints · College Complaint Portal".
// Screen readers announce it when the page changes.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} · ${COLLEGE.portalName}`
  }, [title])
}
