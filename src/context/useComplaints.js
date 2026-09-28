import { useContext } from 'react'
import { ComplaintsContext } from './ComplaintsContext'

// Use this hook to read every complaint or to add a new one.
export function useComplaints() {
  const context = useContext(ComplaintsContext)
  if (!context) {
    throw new Error('useComplaints must be used inside <ComplaintsProvider>.')
  }
  return context
}
