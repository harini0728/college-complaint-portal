import { statusSlug } from '../utils/complaints'
import './StatusBadge.css'

// Coloured pill showing a complaint status. The text always says the status,
// so meaning never depends on colour alone.
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${statusSlug(status)}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {status}
    </span>
  )
}
