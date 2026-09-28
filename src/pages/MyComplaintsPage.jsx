import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import ComplaintList, { ComplaintListSkeleton } from '../components/ComplaintList'
import { useAuth } from '../context/useAuth'
import { useStudentComplaints } from '../hooks/useStudentComplaints'
import { STATUS_LIST } from '../constants/statuses'
import { ROUTES, studentComplaintPath } from '../constants/routes'
import { filterComplaints, sortNewestFirst } from '../utils/complaints'
import './MyComplaintsPage.css'


export default function MyComplaintsPage() {
  const { user } = useAuth()
  const { complaints, loading } = useStudentComplaints(user.id)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const filtered = sortNewestFirst(filterComplaints(complaints, { query, status }))
  const hasFilters = query.trim() !== '' || status !== ''

  const clearFilters = () => {
    setQuery('')
    setStatus('')
  }

  const summary = hasFilters
    ? `Showing ${filtered.length} of ${complaints.length} ${
        complaints.length === 1 ? 'complaint' : 'complaints'
      }`
    : `${complaints.length} ${complaints.length === 1 ? 'complaint' : 'complaints'}`

  return (
    <>
      <PageHeader
        title="My complaints"
        description="Search your complaints and follow their progress."
        action={<Button to={ROUTES.STUDENT_SUBMIT}>Submit a complaint</Button>}
      />

      <Panel title="All complaints">
        {/* The filter bar only makes sense once there is something to filter. */}
        {!loading && complaints.length > 0 && (
          <div className="filters">
            <div className="filters__search">
              <TextField
                type="search"
                label="Search"
                name="search"
                placeholder="Title, ID, category or location"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="filters__status">
              <SelectField
                label="Status"
                name="status"
                options={STATUS_LIST}
                placeholder="All statuses"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              />
            </div>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && complaints.length > 0 && (
          <p className="filters__summary" role="status">
            {summary}
          </p>
        )}

        {loading && <ComplaintListSkeleton rows={4} />}

        {!loading && complaints.length === 0 && (
          <EmptyState
            title="You have not submitted any complaints"
            message="When something on campus needs attention, report it here and follow its progress."
            action={<Button to={ROUTES.STUDENT_SUBMIT}>Submit a complaint</Button>}
          />
        )}

        {!loading && complaints.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="No complaints match your search"
            message="Try a different word, or choose another status."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <ComplaintList
            complaints={filtered}
            getLink={(complaint) => studentComplaintPath(complaint.id)}
          />
        )}
      </Panel>
    </>
  )
}
