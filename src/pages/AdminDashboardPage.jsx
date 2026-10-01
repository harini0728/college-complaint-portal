import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Button from '../components/ui/Button'
import ComplaintList, { ComplaintListSkeleton } from '../components/ComplaintList'
import { StatusBreakdown, CategoryBreakdown } from '../components/admin/AdminCharts'
import { useAuth } from '../context/useAuth'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { ROUTES, adminComplaintPath } from '../constants/routes'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  // Counts, category totals and the newest complaints all come from the server.
  const { counts, categories, recent, loading, error, reload } = useAdminDashboard()

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name}`}
        tabTitle="Admin dashboard"
        description={`${user.department ? `${user.department}. ` : ''}Here is where all complaints stand today.`}
        action={<Button to={ROUTES.ADMIN_COMPLAINTS}>View all complaints</Button>}
      />

      {error && (
        <Panel title="Complaints">
          <ErrorState
            title="We could not load the complaints"
            message={error.message}
            onRetry={reload}
          />
        </Panel>
      )}

      {!error && (
      <>
      <dl className="stats admin-stats" aria-busy={loading}>
        <StatCard label="Total complaints" value={counts.total} loading={loading} />
        <StatCard label={STATUS.PENDING} status={STATUS.PENDING} value={counts.pending} loading={loading} />
        <StatCard label={STATUS.IN_PROGRESS} status={STATUS.IN_PROGRESS} value={counts.inProgress} loading={loading} />
        <StatCard label={STATUS.RESOLVED} status={STATUS.RESOLVED} value={counts.resolved} loading={loading} />
        <StatCard label={STATUS.REJECTED} status={STATUS.REJECTED} value={counts.rejected} loading={loading} />
      </dl>

      <div className="admin-dashboard">
        <Panel
          title="Recent complaints"
          action={
            !loading && recent.length > 0 && (
              <Link to={ROUTES.ADMIN_COMPLAINTS}>View all complaints</Link>
            )
          }
        >
          {loading && <ComplaintListSkeleton />}

          {!loading && recent.length === 0 && (
            <EmptyState
              title="No complaints yet"
              message="Complaints submitted by students will appear here."
            />
          )}

          {!loading && recent.length > 0 && (
            <ComplaintList
              complaints={recent}
              showStudent
              getLink={(complaint) => adminComplaintPath(complaint.id)}
            />
          )}
        </Panel>

        <div className="admin-dashboard__side">
          <Panel title="By status">
            <div className="panel-body">
              {loading ? <span className="skeleton admin-dashboard__skeleton" /> : <StatusBreakdown counts={counts} />}
            </div>
          </Panel>
          <Panel title="By category">
            <div className="panel-body">
              {loading ? (
                <span className="skeleton admin-dashboard__skeleton" />
              ) : (
                <CategoryBreakdown categories={categories} />
              )}
            </div>
          </Panel>
        </div>
      </div>
      </>
      )}
    </>
  )
}