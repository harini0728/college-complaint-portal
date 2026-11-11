import { CheckCircle2, ClipboardList, Clock, Loader, XCircle } from 'lucide-react'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { statusSlug } from '../utils/complaints'
import './StatCard.css'

const ICON_BY_STATUS = {
  [STATUS.PENDING]: Clock,
  [STATUS.IN_PROGRESS]: Loader,
  [STATUS.RESOLVED]: CheckCircle2,
  [STATUS.REJECTED]: XCircle,
}

// One number with a label. Put several inside a <dl className="stats">.
//   status:   optional complaint status, adds a matching coloured icon
//   loading:  shows a grey placeholder instead of the number
export default function StatCard({ label, value, status, loading = false }) {
  const StatIcon = (status && ICON_BY_STATUS[status]) || ClipboardList
  const tone = status ? statusSlug(status) : 'total'

  return (
    <div className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`} aria-hidden="true">
        <StatIcon className="icon" size={20} />
      </span>
      <dt className="stat-card__label">{label}</dt>
      <dd className="stat-card__value">
        {loading ? <span className="skeleton stat-card__skeleton" /> : value}
      </dd>
    </div>
  )
}
