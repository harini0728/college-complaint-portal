import { useLocation, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import { ComplaintListSkeleton } from '../components/ComplaintList'
import AdminComplaintTable from '../components/admin/AdminComplaintTable'
import { useAllComplaints } from '../hooks/useAllComplaints'
import { COMPLAINT_CATEGORIES } from '../constants/categories'
import { STATUS_LIST } from '../constants/statuses'
import { filterAdminComplaints, sortComplaints } from '../utils/complaints'
import './AdminComplaintsPage.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

// Only accept a URL value that really is one of the options.
const pick = (value, options) => (options.includes(value) ? value : '')

// One page for "All Complaints" and for the Pending / In Progress / Resolved /
// Rejected pages. Give it `status` to lock the list to one status.
// The search and filters live in the URL (?q=fan&category=Hostel), so going to a
// complaint and coming back keeps them.
export default function AdminComplaintsPage({
  status: lockedStatus,
  title = 'All complaints',
  description = 'Search, filter and open any complaint.',
}) {
  const { complaints, loading } = useAllComplaints()
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  const query = params.get('q') ?? ''
  const category = pick(params.get('category'), COMPLAINT_CATEGORIES)
  const status = lockedStatus ?? pick(params.get('status'), STATUS_LIST)
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest'

  const setParam = (key, value) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const clearFilters = () =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        ;['q', 'category', 'status'].forEach((key) => next.delete(key))
        return next
      },
      { replace: true },
    )

  const inScope = lockedStatus
    ? complaints.filter((complaint) => complaint.status === lockedStatus)
    : complaints
  const filtered = sortComplaints(
    filterAdminComplaints(complaints, { query, category, status }),
    sort,
  )
  const hasFilters = query.trim() !== '' || category !== '' || (!lockedStatus && status !== '')
  const noun = inScope.length === 1 ? 'complaint' : 'complaints'
  const summary = hasFilters
    ? `Showing ${filtered.length} of ${inScope.length} ${noun}`
    : `${inScope.length} ${noun}`

  return (
    <>
      <PageHeader title={title} description={description} />

      <Panel title={lockedStatus ? `${lockedStatus} complaints` : 'All complaints'}>
        {!loading && inScope.length > 0 && (
          <>
            <div className="admin-filters">
              <div className="admin-filters__search">
                <TextField
                  type="search"
                  label="Search"
                  name="search"
                  placeholder="Complaint ID, title or student"
                  value={query}
                  onChange={(event) => setParam('q', event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="admin-filters__select">
                <SelectField
                  label="Category"
                  name="category"
                  options={COMPLAINT_CATEGORIES}
                  placeholder="All categories"
                  value={category}
                  onChange={(event) => setParam('category', event.target.value)}
                />
              </div>
              {!lockedStatus && (
                <div className="admin-filters__select">
                  <SelectField
                    label="Status"
                    name="status"
                    options={STATUS_LIST}
                    placeholder="All statuses"
                    value={status}
                    onChange={(event) => setParam('status', event.target.value)}
                  />
                </div>
              )}
              <div className="admin-filters__select">
                <SelectField
                  label="Sort by date"
                  name="sort"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(event) => setParam('sort', event.target.value)}
                />
              </div>
              {hasFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>

            <p className="admin-filters__summary" role="status">
              {summary}
            </p>
          </>
        )}

        {loading && <ComplaintListSkeleton rows={5} />}

        {!loading && inScope.length === 0 && (
          <EmptyState
            title={
              lockedStatus
                ? `No ${lockedStatus.toLowerCase()} complaints`
                : 'No complaints yet'
            }
            message={
              lockedStatus
                ? 'Complaints will appear here when their status is set to this one.'
                : 'Complaints submitted by students will appear here.'
            }
          />
        )}

        {!loading && inScope.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="No complaints match your filters"
            message="Try a different search word, or choose another category or status."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <AdminComplaintTable
            complaints={filtered}
            from={`${location.pathname}${location.search}`}
          />
        )}
      </Panel>
    </>
  )
}
