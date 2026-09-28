import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../context/useAuth'
import { NAV_BY_ROLE } from '../constants/navigation'
import './DashboardLayout.css'

const MENU_ID = 'app-menu'

// Shell for every signed-in page: top bar with a three-dot (⋮) button that opens a left-side menu + content area.
// Student and admin pages both use this; the menu items depend on the role.
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef(null)
  const menuButtonRef = useRef(null)
  const { pathname } = useLocation()

  const closeMenu = () => setMenuOpen(false)

  // Pressing Escape closes the menu and returns focus to the ⋮ button.
  useEffect(() => {
    if (!menuOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // New page: start at the top and move keyboard / screen reader focus to the
  // content, so people do not have to tab through the menu again.
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

      {/* Top bar: ⋮ button on the left (always visible), brand next to it */}
      <header className="shell__topbar">
        <button
          type="button"
          ref={menuButtonRef}
          className={`shell__menu-button${menuOpen ? ' shell__menu-button--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
            <circle cx="10" cy="4" r="1.75" fill="currentColor" />
            <circle cx="10" cy="10" r="1.75" fill="currentColor" />
            <circle cx="10" cy="16" r="1.75" fill="currentColor" />
          </svg>
        </button>

        <BrandMark inverse />

        <Sidebar
          id={MENU_ID}
          items={NAV_BY_ROLE[user.role]}
          user={user}
          open={menuOpen}
          onNavigate={closeMenu}
          onLogout={logout}
        />
      </header>

      <div
        className={`shell__backdrop${menuOpen ? ' shell__backdrop--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <main className="shell__main" id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}