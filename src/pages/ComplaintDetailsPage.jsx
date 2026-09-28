import { Link, useLocation, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import StatusTimeline from '../components/StatusTimeline'
import Button from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { useStudentComplaints } from '../hooks/useStudentComplaints'
import { COMPLAINT_STATUSES as STATUS, STATUS_DESCRIPTIONS } from '../constants/statuses'
import { ROUTES } from '../constants/routes'
import { formatDate, formatFileSize } from '../utils/complaints'
import './ComplaintDetailsPage.css'

const BACK_BUTTON = (
  <Button variant="secondary" to={ROUTES.STUDENT_COMPLAINTS}>
    Back to my complaints
  </Button>
)

export default function ComplaintDetailsPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const { complaints, loading } = useStudentComplaints(user.id)

  if (loading) {
    return (
      <>
        <PageHeader title="Complaint details" action={BACK_BUTTON} />
        <div className="details__loading" aria-busy="true" aria-label="Loading complaint">
          <span className="skeleton details__skeleton-title" />
          <span className="skeleton details__skeleton-line" />
          <span className="skeleton details__skeleton-line" />
          <span className="skeleton details__skeleton-line details__skeleton-line--short" />
        </div>
      </>
    )
  }

  // Only the student's own complaints are searched, so someone else's ID also lands here.
  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return (
      <>
        <PageHeader title="Complaint details" action={BACK_BUTTON} />
        <Panel title="Complaint not found">
          <EmptyState
            title="We could not find this complaint"
            message={`There is no complaint with the reference ${id} in your account. Check the number, or open the complaint from your list.`}
            action={<Button to={ROUTES.STUDENT_COMPLAINTS}>Go to my complaints</Button>}
          />
        </Panel>
      </>
    )
  }

  const { attachment } = complaint
  const isImage = attachment?.type.startsWith('image/')
  const hasResponse = Boolean(complaint.adminResponse)

  return (
    <>
      <PageHeader
        title={complaint.title}
        description={`${complaint.id} · Submitted on ${formatDate(complaint.submittedOn)}`}
        action={BACK_BUTTON}
      />

      {state?.justSubmitted && (
        <div className="details__success" role="status">
          <strong>Your complaint has been submitted.</strong> Your reference number is{' '}
          {complaint.id}. You can follow its progress on this page or in{' '}
          <Link to={ROUTES.STUDENT_COMPLAINTS}>My complaints</Link>.
        </div>
      )}

      <div className="details">
        <div className="details__main">
          <Panel title="Complaint">
            <div className="panel-body details__body">
              <div className="details__status">
                <StatusBadge status={complaint.status} />
                <span className="details__status-text">
                  {STATUS_DESCRIPTIONS[complaint.status]}
                </span>
              </div>

              <dl className="detail-list">
                <div className="detail-list__item">
                  <dt>Complaint ID</dt>
                  <dd>{complaint.id}</dd>
                </div>
                <div className="detail-list__item">
                  <dt>Category</dt>
                  <dd>{complaint.category}</dd>
                </div>
                <div className="detail-list__item">
                  <dt>Location</dt>
                  <dd>{complaint.location}</dd>
                </div>
                <div className="detail-list__item">
                  <dt>Submitted on</dt>
                  <dd>{formatDate(complaint.submittedOn)}</dd>
                </div>
              </dl>

              <div>
                <h3 className="details__subheading">Description</h3>
                <p className="details__description">{complaint.description}</p>
              </div>

              <div>
                <h3 className="details__subheading">Attachment</h3>
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
                      <span className="details__muted">
                        ({formatFileSize(attachment.size)}, opens in a new tab)
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="details__muted">No file was attached.</p>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Response from the administration">
            <div className="panel-body">
              {hasResponse ? (
                <>
                  <p className="details__response">{complaint.adminResponse}</p>
                  {complaint.status === STATUS.REJECTED && (
                    <p className="details__muted details__response-note">
                      If you disagree, you can submit a new complaint with more details.
                    </p>
                  )}
                </>
              ) : (
                <p className="details__muted">
                  There is no response yet. The administration replies here once your
                  complaint has been reviewed.
                </p>
              )}
            </div>
          </Panel>
        </div>

        <aside className="details__aside">
          <Panel title="Status timeline">
            <div className="panel-body">
              <StatusTimeline complaint={complaint} />
            </div>
          </Panel>
        </aside>
      </div>
    </>
  )
}
