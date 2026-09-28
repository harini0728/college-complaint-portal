import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import DetailList from '../components/DetailList'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import { useStudentComplaints } from '../hooks/useStudentComplaints'
import { useAllComplaints } from '../hooks/useAllComplaints'
import { COLLEGE } from '../constants/college'
import { COMPLAINT_STATUSES as STATUS } from '../constants/statuses'
import { ROLES, ROLE_LABELS } from '../constants/roles'
import { countByStatus } from '../utils/complaints'
import './ProfilePage.css'

// One profile page for both roles. The details are read-only for now:
// they come from the college records, so changes go through the office.
export default function ProfilePage() {
  const { user } = useAuth()
  const isAdmin = user.role === ROLES.ADMIN

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details on the portal."
      />

      <div className="profile">
        <Panel title="Account details">
          <div className="panel-body">
            <DetailList
              items={[
                { label: 'Name', value: user.name },
                { label: isAdmin ? 'Staff ID' : 'Student ID', value: user.id },
                { label: 'Email', value: user.email },
                { label: 'Role', value: ROLE_LABELS[user.role] },
                { label: 'Department', value: user.department },
              ]}
            />
            <p className="profile__note">
              These details come from the college records. To correct them, contact{' '}
              {COLLEGE.helpOffice} at{' '}
              <a href={`mailto:${COLLEGE.helpEmail}`}>{COLLEGE.helpEmail}</a> ({COLLEGE.helpHours}).
            </p>
          </div>
        </Panel>

        <Panel title={isAdmin ? 'Complaints on the portal' : 'My complaints at a glance'}>
          <div className="panel-body">
            {isAdmin ? <AdminSummary /> : <StudentSummary studentId={user.id} />}
          </div>
        </Panel>
      </div>
    </>
  )
}

function Summary({ complaints, loading }) {
  const counts = countByStatus(complaints)
  return (
    <dl className="stats profile__stats" aria-busy={loading}>
      <StatCard label="Total" value={counts.total} loading={loading} />
      <StatCard label={STATUS.PENDING} status={STATUS.PENDING} value={counts.pending} loading={loading} />
      <StatCard label={STATUS.IN_PROGRESS} status={STATUS.IN_PROGRESS} value={counts.inProgress} loading={loading} />
      <StatCard label={STATUS.RESOLVED} status={STATUS.RESOLVED} value={counts.resolved} loading={loading} />
    </dl>
  )
}

function StudentSummary({ studentId }) {
  const { complaints, loading } = useStudentComplaints(studentId)
  return <Summary complaints={complaints} loading={loading} />
}

function AdminSummary() {
  const { complaints, loading } = useAllComplaints()
  return <Summary complaints={complaints} loading={loading} />
}
