import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate, getTicketLabel } from '../utils/complaints'
import './ComplaintList.css'

// A list of complaints, one row each. Each row is a link to that complaint.
//   getLink:     function that turns a complaint into a URL
//   showStudent: also show who submitted each complaint (admin pages)
export default function ComplaintList({ complaints, getLink, showStudent = false }) {
  return (
    <ul className="complaint-list">
      {complaints.map((complaint) => (
        <li key={complaint.id}>
          <Link className="complaint-item" to={getLink(complaint)}>
            <div className="complaint-item__main">
              <span className="complaint-item__title">{complaint.title}</span>
              <span className="complaint-item__meta">
                <span className="complaint-item__id">{getTicketLabel(complaint)}</span>
                {showStudent && (
                  <span>
                    {complaint.submittedBy.name} ({complaint.submittedBy.email || complaint.submittedBy.id})
                  </span>
                )}
                <span>{complaint.category}</span>
                <span>{formatDate(complaint.submittedOn)}</span>
              </span>
            </div>
            <span className="complaint-item__end">
              <StatusBadge status={complaint.status} />
              <ChevronRight className="icon complaint-item__chevron" size={18} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

// Grey placeholder rows shown while complaints load.
export function ComplaintListSkeleton({ rows = 3 }) {
  return (
    <ul className="complaint-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="complaint-item complaint-item--skeleton">
          <span className="skeleton complaint-item__skeleton-title" />
          <span className="skeleton complaint-item__skeleton-meta" />
        </li>
      ))}
    </ul>
  )
}