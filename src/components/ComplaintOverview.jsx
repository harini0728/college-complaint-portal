import StatusBadge from './StatusBadge'
import DetailList from './DetailList'
import { STATUS_DESCRIPTIONS } from '../constants/statuses'
import { formatDate, formatFileSize } from '../utils/complaints'
import './ComplaintOverview.css'

// The body of a complaint's details: status, facts, description and attachment.
// Used by the student page and the admin page.
//   showStudent:           also shows who submitted it (admin only)
//   showStatusDescription: the sentence under the badge is written for students
export default function ComplaintOverview({
  complaint,
  showStudent = false,
  showStatusDescription = true,
}) {
  const { attachment, submittedBy } = complaint
  const isImage = attachment?.type.startsWith('image/')

  return (
    <div className="overview">
      <div className="overview__status">
        <StatusBadge status={complaint.status} />
        {showStatusDescription && (
          <span className="overview__muted">{STATUS_DESCRIPTIONS[complaint.status]}</span>
        )}
      </div>

      {showStudent && (
        <div>
          <h3 className="overview__subheading">Submitted by</h3>
          <DetailList
            columns={3}
            items={[
              { label: 'Student', value: submittedBy.name },
              { label: 'Student ID', value: submittedBy.id },
              { label: 'Department', value: submittedBy.department },
            ]}
          />
        </div>
      )}

      <DetailList
        items={[
          { label: 'Complaint ID', value: complaint.id },
          { label: 'Category', value: complaint.category },
          { label: 'Location', value: complaint.location },
          { label: 'Submitted on', value: formatDate(complaint.submittedOn) },
        ]}
      />

      <div>
        <h3 className="overview__subheading">Description</h3>
        <p className="overview__description">{complaint.description}</p>
      </div>

      <div>
        <h3 className="overview__subheading">Attachment</h3>
        {attachment ? (
          <div className="attachment">
            {isImage && (
              <a href={attachment.url} target="_blank" rel="noreferrer">
                <img
                  className="attachment__preview"
                  src={attachment.url}
                  alt={`Preview of ${attachment.name}`}
                />
              </a>
            )}
            <p>
              <a href={attachment.url} target="_blank" rel="noreferrer">
                {attachment.name}
              </a>{' '}
              <span className="overview__muted">
                ({formatFileSize(attachment.size)}, opens in a new tab)
              </span>
            </p>
          </div>
        ) : (
          <p className="overview__muted">No file was attached.</p>
        )}
      </div>
    </div>
  )
}
