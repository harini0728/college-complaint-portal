import { useLocation, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import ComplaintOverview from '../components/ComplaintOverview'
import StatusTimeline from '../components/StatusTimeline'
import { ComplaintListSkeleton } from '../components/ComplaintList'
import ComplaintManager from '../components/admin/ComplaintManager'
import { useComplaints } from '../context/useComplaints'
import { useAllComplaints } from '../hooks/useAllComplaints'
import { ROUTES } from '../constants/routes'
import { formatDate } from '../utils/complaints'
import './AdminComplaintDetailsPage.css'

export default function AdminComplaintDetailsPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { updateComplaint } = useComplaints()
  const { complaints, loading } = useAllComplaints()

  // Go back to the list the admin came from, with its filters.
  const backButton = (
    <Button variant="secondary" to={state?.from ?? ROUTES.ADMIN_COMPLAINTS}>
      Back to complaints
    </Button>
  )

  if (loading) {
    return (
      <>
        <PageHeader title="Complaint details" action={backButton} />
        <Panel title="Complaint">
          <ComplaintListSkeleton rows={3} />
        </Panel>
      </>
    )
  }

  const complaint = complaints.find((item) => item.id === id)

  if (!complaint) {
    return (
      <>
        <PageHeader title="Complaint details" action={backButton} />
        <Panel title="Complaint not found">
          <EmptyState
            title="We could not find this complaint"
            message={`There is no complaint with the reference ${id}. Check the number, or open the complaint from the list.`}
            action={<Button to={ROUTES.ADMIN_COMPLAINTS}>Go to all complaints</Button>}
          />
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={complaint.title}
        description={`${complaint.id} · Submitted by ${complaint.submittedBy.name} on ${formatDate(complaint.submittedOn)}`}
        action={backButton}
      />

      <div className="admin-details">
        <div className="admin-details__main">
          <Panel title="Complaint">
            <div className="panel-body">
              <ComplaintOverview complaint={complaint} showStudent showStatusDescription={false} />
            </div>
          </Panel>

          <Panel title="Manage complaint">
            <div className="panel-body">
              <ComplaintManager complaint={complaint} onSave={updateComplaint} />
            </div>
          </Panel>
        </div>

        <aside className="admin-details__aside">
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
