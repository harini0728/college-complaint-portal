import StatusBadge from '../StatusBadge'
import Button from '../ui/Button'
import { adminComplaintPath } from '../../constants/routes'
import { formatDate } from '../../utils/complaints'
import './AdminComplaintTable.css'

// Table of complaints for the admin. On small screens every row turns into a card.
//   from: the page to return to from the details page (keeps the filters)
export default function AdminComplaintTable({ complaints, from }) {
  return (
    <table className="admin-table">
      <caption className="visually-hidden">Complaints</caption>
      <thead>
        <tr>
          <th scope="col">Complaint</th>
          <th scope="col">Student</th>
          <th scope="col">Category</th>
          <th scope="col">Location</th>
          <th scope="col">Submitted</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="visually-hidden">Action</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {complaints.map((complaint) => (
          <tr key={complaint.id}>
            <th scope="row" className="admin-table__complaint">
              <span className="admin-table__title">{complaint.title}</span>
              <span className="admin-table__id">{complaint.id}</span>
            </th>
            <td data-label="Student">
              {complaint.submittedBy.name}
              <span className="admin-table__sub">{complaint.submittedBy.id}</span>
            </td>
            <td data-label="Category">{complaint.category}</td>
            <td data-label="Location">{complaint.location}</td>
            <td data-label="Submitted">{formatDate(complaint.submittedOn)}</td>
            <td data-label="Status">
              <StatusBadge status={complaint.status} />
            </td>
            <td className="admin-table__action">
              <Button
                to={adminComplaintPath(complaint.id)}
                state={{ from }}
                variant="secondary"
                className="btn--small"
              >
                View{' '}
                <span className="visually-hidden">complaint {complaint.id}</span>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
