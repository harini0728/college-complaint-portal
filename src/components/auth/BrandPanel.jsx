import BrandMark from '../BrandMark'
import StatusBadge from '../StatusBadge'
import { COMPLAINT_STATUSES, STATUS_DESCRIPTIONS } from '../../constants/statuses'
import './BrandPanel.css'

// The stages a complaint normally moves through, in order.
const LIFECYCLE = [
  COMPLAINT_STATUSES.PENDING,
  COMPLAINT_STATUSES.IN_PROGRESS,
  COMPLAINT_STATUSES.RESOLVED,
]

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <BrandMark inverse />

      <div className="brand-panel__body">
        <p className="brand-panel__headline">
          Report a campus issue and follow it until it is fixed.
        </p>
        <p className="brand-panel__intro">
          Every complaint moves through these stages. You can check where yours
          stands at any time.
        </p>

        <ol className="lifecycle">
          {LIFECYCLE.map((status) => (
            <li key={status} className="lifecycle__step">
              <StatusBadge status={status} />
              <p>{STATUS_DESCRIPTIONS[status]}</p>
            </li>
          ))}
        </ol>

        <p className="brand-panel__note">
          A complaint that cannot be acted on is marked{' '}
          <StatusBadge status={COMPLAINT_STATUSES.REJECTED} />, with a reason.
        </p>
      </div>
    </aside>
  )
}
