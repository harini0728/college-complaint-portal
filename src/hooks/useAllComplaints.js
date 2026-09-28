import { useComplaints } from '../context/useComplaints'
import { useFakeLoading } from './useFakeLoading'

// Returns { complaints, loading } with every complaint, for the admin pages.
// When the backend exists, only the inside of this hook changes.
export function useAllComplaints() {
  const { complaints } = useComplaints()
  const loading = useFakeLoading()

  return { complaints, loading }
}
