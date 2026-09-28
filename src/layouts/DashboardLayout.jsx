import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../context/useAuth'
import { NAV_BY_ROLE } from '../constants/navigation'
import './DashboardLayout.css'

const SIDEBAR_ID = 'app-sidebar'

// Shell for every signed-in page: sidebar + content area.
// Student and admin pages both use this; the menu items depend on the role.
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  const closeMenu = () => setMenuOpen(false)

  // Pressing Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // New page: start at the top and move keyboard / screen reader focus to the
  // content, so people do not have to tab through the sidebar again.
  // Only the path matters, so changing a filter (?q=...) does not trigger this.
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Top bar: only visible on small screens */}
      <header className="shell__topbar">
        <button
          type="button"
          className="shell__menu-button"
          aria-expanded={menuOpen}
          aria-controls={SIDEBAR_ID}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Menu
        </button>
        <BrandMark />
      </header>

      <Sidebar
        id={SIDEBAR_ID}
        items={NAV_BY_ROLE[user.role]}
        user={user}
        open={menuOpen}
        onNavigate={closeMenu}
        onLogout={logout}
      />

      {menuOpen && <div className="shell__backdrop" onClick={closeMenu} aria-hidden="true" />}

      <main className="shell__main" id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
