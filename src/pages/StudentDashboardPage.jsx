import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import ComplaintList, { ComplaintListSkeleton } from '../components/ComplaintList'
import { useAuth } from '../context/useAuth'
import { useStudentComplaints } from '../hooks/useStudentComplaints'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { ROUTES, studentComplaintPath } from '../constants/routes'
import { countByStatus, sortNewestFirst } from '../utils/complaints'

const RECENT_COUNT = 5

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const { complaints, loading } = useStudentComplaints(user.id)

  const counts = countByStatus(complaints)
  const recent = sortNewestFirst(complaints).slice(0, RECENT_COUNT)
  const firstName = user.name.split(' ')[0]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your complaints stand today."
        action={<Button to={ROUTES.STUDENT_SUBMIT}>Submit a complaint</Button>}
      />

      <dl className="stats" aria-busy={loading}>
        <StatCard label="Total complaints" value={counts.total} loading={loading} />
        <StatCard
          label={STATUS.PENDING}
          status={STATUS.PENDING}
          value={counts.pending}
          loading={loading}
        />
        <StatCard
          label={STATUS.IN_PROGRESS}
          status={STATUS.IN_PROGRESS}
          value={counts.inProgress}
          loading={loading}
        />
        <StatCard
          label={STATUS.RESOLVED}
          status={STATUS.RESOLVED}
          value={counts.resolved}
          loading={loading}
        />
      </dl>

      <Panel
        title="Recent complaints"
        action={
          !loading && recent.length > 0 && (
            <Link to={ROUTES.STUDENT_COMPLAINTS}>View all complaints</Link>
          )
        }
      >
        {loading && <ComplaintListSkeleton />}

        {!loading && recent.length === 0 && (
          <EmptyState
            title="You have not submitted any complaints"
            message="When something on campus needs attention, report it here and follow its progress."
            action={<Button to={ROUTES.STUDENT_SUBMIT}>Submit a complaint</Button>}
          />
        )}

        {!loading && recent.length > 0 && (
          <ComplaintList
            complaints={recent}
            getLink={(complaint) => studentComplaintPath(complaint.id)}
          />
        )}
      </Panel>
    </>
  )
}
