import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../context/useAuth'
import { NAV_BY_ROLE } from '../constants/navigation'
import { ROLE_LABELS } from '../constants/roles'
import { getInitials } from '../utils/complaints'
import './DashboardLayout.css'

const MENU_ID = 'app-menu'
const DESKTOP_QUERY = '(min-width: 1024px)'

// Shell for every signed-in page: the navy sidebar (a drawer on tablets and
// phones, opened with the menu button), a top bar and the content area.
// Student and admin pages both use this; the menu items depend on the role.
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => readCollapsed(user.role))
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  const mainRef = useRef(null)
  const menuButtonRef = useRef(null)
  const { pathname } = useLocation()

  const closeMenu = () => setMenuOpen(false)

  // Pressing Escape closes the drawer and returns focus to the menu button.
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
    <div
      className={`shell${menuOpen ? ' shell--menu-open' : ''}${
        collapsed ? ' shell--collapsed' : ''
      }`}
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar
        id={MENU_ID}
        items={NAV_BY_ROLE[user.role]}
        user={user}
        open={menuOpen}
        onClose={closeMenu}
        onNavigate={closeMenu}
        onLogout={logout}
      />

      {/* Dims the page behind the open drawer. Click it to close. */}
      <div
        className={`shell__backdrop${menuOpen ? ' shell__backdrop--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="shell__topbar">
        <button
          type="button"
          ref={menuButtonRef}
          className="shell__menu-button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <Menu className="icon" size={22} aria-hidden="true" />
        </button>

        <div className="shell__brand">
          <BrandMark />
        </div>

        <div className="shell__user">
          <div className="shell__user-text">
            <span className="shell__user-name">{user.name}</span>
            <span className="shell__user-role">{ROLE_LABELS[user.role]}</span>
          </div>
          <span className="avatar" aria-hidden="true">
            {getInitials(user.name)}
          </span>
        </div>
      </header>

      <main className="shell__main" id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
