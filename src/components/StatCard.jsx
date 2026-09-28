import { statusSlug } from '../utils/complaints'
import './StatCard.css'

// One number with a label. Put several inside a <dl className="stats">.
//   status:   optional complaint status, adds a matching coloured dot
//   loading:  shows a grey placeholder instead of the number
export default function StatCard({ label, value, status, loading = false }) {
  return (
    <div className="stat-card">
      <dt className="stat-card__label">
        {status && (
          <span
            className={`stat-card__dot stat-card__dot--${statusSlug(status)}`}
            aria-hidden="true"
          />
        )}
        {label}
      </dt>
      <dd className="stat-card__value">
        {loading ? <span className="skeleton stat-card__skeleton" /> : value}
      </dd>
    </div>
  )
}
