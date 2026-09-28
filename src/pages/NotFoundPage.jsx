import { Link } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { ROUTES } from '../constants/routes'
import './PlaceholderPages.css'

export default function NotFoundPage() {
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
