import { Link, useLocation, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import ComplaintOverview from '../components/ComplaintOverview'
import StatusTimeline from '../components/StatusTimeline'
import ErrorState from '../components/ErrorState'
import Button from '../components/ui/Button'
import { useStudentComplaint } from '../hooks/useStudentComplaint'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { ROUTES } from '../constants/routes'
import { formatDate } from '../utils/complaints'
import './ComplaintDetailsPage.css'

const BACK_BUTTON = (
  <Button variant="secondary" to={ROUTES.STUDENT_COMPLAINTS}>
    Back to my complaints
  </Button>
)

export default function ComplaintDetailsPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { complaint, loading, error, notFound, reload } = useStudentComplaint(id)

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

  // The server could not be reached, or failed: say so and let the student retry.
  if (error) {
    return (
      <>
        <PageHeader title="Complaint details" action={BACK_BUTTON} />
        <Panel title="Complaint">
          <ErrorState
            title="We could not load this complaint"
            message={error.message}
            onRetry={reload}
          />
        </Panel>
      </>
    )
  }

  // The backend only returns the student's own complaints, so someone else's ID also lands here.
  if (notFound || !complaint) {
    return (
      <>
        <PageHeader title="Complaint details" action={BACK_BUTTON} />
        <Panel title="Complaint not found">
          <EmptyState
            title="We could not find this complaint"
            message={`There is no complaint with the reference ${id} in your account. Check the reference, or open the complaint from your list.`}
            action={<Button to={ROUTES.STUDENT_COMPLAINTS}>Go to my complaints</Button>}
          />
        </Panel>
      </>
    )
  }

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
            <div className="panel-body">
              <ComplaintOverview complaint={complaint} />
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