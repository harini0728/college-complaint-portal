import { COMPLAINT_STATUSES as STATUS } from '../../constants/statuses'
import { percentOf, statusSlug } from '../../utils/complaints'
import './AdminCharts.css'

const STATUS_ROWS = [
  { status: STATUS.PENDING, key: 'pending' },
  { status: STATUS.IN_PROGRESS, key: 'inProgress' },
  { status: STATUS.RESOLVED, key: 'resolved' },
  { status: STATUS.REJECTED, key: 'rejected' },
]

// One stacked bar split by status, with a legend that lists the exact numbers.
// Made with plain CSS, so no chart library is needed.
//   counts: the object returned by countByStatus()
export function StatusBreakdown({ counts }) {
  if (counts.total === 0) {
    return <p className="charts__empty">No complaints have been submitted yet.</p>
  }

  return (
    <div className="charts">
      <div className="status-bar" aria-hidden="true">
        {STATUS_ROWS.filter((row) => counts[row.key] > 0).map((row) => (
          <span
            key={row.key}
            className={`status-bar__segment status-bar__segment--${statusSlug(row.status)}`}
            style={{ width: `${percentOf(counts[row.key], counts.total)}%` }}
          />
        ))}
      </div>

      <ul className="legend">
        {STATUS_ROWS.map((row) => (
          <li key={row.key} className="legend__item">
            <span
              className={`legend__dot legend__dot--${statusSlug(row.status)}`}
              aria-hidden="true"
            />
            <span className="legend__label">{row.status}</span>
            <span className="legend__value">
              {counts[row.key]} ({percentOf(counts[row.key], counts.total)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// A horizontal bar for each category that has complaints.
//   categories: the array returned by countByCategory()
export function CategoryBreakdown({ categories }) {
  if (categories.length === 0) {
    return <p className="charts__empty">No complaints have been submitted yet.</p>
  }
  const highest = categories[0].count

  return (
    <ul className="category-bars">
      {categories.map(({ category, count }) => (
        <li key={category} className="category-bars__item">
          <div className="category-bars__row">
            <span>{category}</span>
            <span className="category-bars__count">{count}</span>
          </div>
          <div className="category-bars__track" aria-hidden="true">
            <span
              className="category-bars__fill"
              style={{ width: `${percentOf(count, highest)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
