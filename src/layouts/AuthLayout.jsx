import BrandPanel from '../components/auth/BrandPanel'
import { COLLEGE } from '../constants/college'
import './AuthLayout.css'

// Two-column shell for signed-out pages: brand panel on the left,
// page content (the login form) on the right. Stacks on small screens.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <BrandPanel />

      <main className="auth-layout__main" id="main-content">
        <div className="auth-layout__content">{children}</div>
        <footer className="auth-layout__footer">
          &copy; {new Date().getFullYear()} {COLLEGE.portalName}
        </footer>
      </main>
    </div>
  )
}
