import { useLocation, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import ErrorState from '../components/ErrorState'
import { ComplaintListSkeleton } from '../components/ComplaintList'
import AdminComplaintTable from '../components/admin/AdminComplaintTable'
import { useAllComplaints } from '../hooks/useAllComplaints'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { COMPLAINT_CATEGORIES } from '../constants/categories'
import { STATUS_LIST } from '../constants/statuses'
import './AdminComplaintsPage.css'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

// The backend accepts a search of up to 100 characters.
const SEARCH_MAX_LENGTH = 100

// Only accept a URL value that really is one of the options.
const pick = (value, options) => (options.includes(value) ? value : '')

// One page for "All Complaints" and for the Pending / In Progress / Resolved /
// Rejected pages. Give it `status` to lock the list to one status.
// The search and filters live in the URL (?q=fan&category=Hostel), so going to a
// complaint and coming back keeps them.
// The complaints come from the backend: status, search and sort are applied by
// the server (newest first by default). The category filter has no backend
// support, so it narrows down the results that come back.
export default function AdminComplaintsPage({
  status: lockedStatus,
  title = 'All complaints',
  description = 'Search, filter and open any complaint.',
}) {
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  const query = params.get('q') ?? ''
  const category = pick(params.get('category'), COMPLAINT_CATEGORIES)
  const status = lockedStatus ?? pick(params.get('status'), STATUS_LIST)
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest'

  // The input updates at once; the server is asked after a short pause in typing.
  const search = useDebouncedValue(query.trim().slice(0, SEARCH_MAX_LENGTH), 300)
  const {
    complaints: inScope,
    loading,
    refreshing,
    error,
    reload,
  } = useAllComplaints({ status, search, sort })

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

  const filtered = category
    ? inScope.filter((complaint) => complaint.category === category)
    : inScope
  const hasFilters = query.trim() !== '' || category !== '' || (!lockedStatus && status !== '')
  const noun = filtered.length === 1 ? 'complaint' : 'complaints'
  const summary = loading
    ? 'Loading complaints…'
    : refreshing
      ? 'Updating results…'
      : category && filtered.length !== inScope.length
      ? `Showing ${filtered.length} of ${inScope.length} ${noun}`
      : `${filtered.length} ${noun}`
  // Keep the search and filters on screen once there is something to filter, and
  // also while filters are active, so a search with no results can be cleared.
  // (While filters are active they never disappear, so typing is not interrupted.)
  const showControls = hasFilters || (!loading && inScope.length > 0)

  return (
    <>
      <PageHeader title={title} description={description} />

      <Panel title={lockedStatus ? `${lockedStatus} complaints` : 'All complaints'}>
        {showControls && (
          <>
            <div className="admin-filters">
              <div className="admin-filters__search">
                <TextField
                  type="search"
                  label="Search"
                  name="search"
                  placeholder="Title, description, category or location"
                  value={query}
                  onChange={(event) => setParam('q', event.target.value)}
                  autoComplete="off"
                  maxLength={SEARCH_MAX_LENGTH}
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

        {!loading && error && (
          <ErrorState
            title="We could not load the complaints"
            message={error.message}
            onRetry={reload}
          />
        )}

        {!loading && !error && filtered.length === 0 && !hasFilters && (
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

        {!loading && !error && filtered.length === 0 && hasFilters && (
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

        {!loading && !error && filtered.length > 0 && (
          <div
            className={refreshing ? 'admin-results admin-results--refreshing' : 'admin-results'}
            aria-busy={refreshing}
          >
            <AdminComplaintTable
              complaints={filtered}
              from={`${location.pathname}${location.search}`}
            />
          </div>
        )}
      </Panel>
    </>
  )
}
