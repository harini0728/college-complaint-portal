import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { ROUTES, getHomePath } from '../constants/routes'
import './PlaceholderPages.css'

// Two versions:
//   inLayout: a wrong URL under /student/... or /admin/... keeps the sidebar
//   default:  any other wrong URL gets a plain full-page message
export default function NotFoundPage({ inLayout = false }) {
  const { user } = useAuth()
  usePageTitle('Page not found')

  if (inLayout) {
    return (
      <>
        <PageHeader title="Page not found" />
        <Panel title="Page not found">
          <EmptyState
            title="This page does not exist"
            message="The link may be mistyped or out of date. Use the menu, or go back to your dashboard."
            action={<Button to={getHomePath(user.role)}>Go to dashboard</Button>}
          />
        </Panel>
      </>
    )
  }

  return (
    <div className="placeholder">
      <div className="placeholder__card">
        <BrandMark />
        <h1 className="placeholder__title">Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <p>
          <Link to={ROUTES.HOME}>Go to the home page</Link>
        </p>
      </div>
    </div>
  )
}
