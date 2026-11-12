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

// Each role remembers its own sidebar choice (student and admin are independent).
const collapsedKey = (role) => `ccp_sidebar_collapsed_${role}`

function readCollapsed(role) {
  try {
    return localStorage.getItem(collapsedKey(role)) === '1'
  } catch {
    return false
  }
}

// Shell for every signed-in page: the navy sidebar, a top bar and the content area.
// Desktop (1024px and up): the sidebar can be hidden completely (button in the sidebar
// header) and brought back with the menu button at the top-left. While hidden, the
// content area uses the full width. The choice is remembered per role.
// Tablets and phones: the sidebar is an off-canvas drawer with a backdrop.
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

  // Track the breakpoint. Growing into desktop closes any open drawer.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event) => {
      setIsDesktop(event.matches)
      if (event.matches) setMenuOpen(false)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const handleToggle = () => {
    if (!isDesktop) {
      setMenuOpen((isOpen) => !isOpen)
      return
    }
    const next = !collapsed
    setCollapsed(next)
    // The sidebar's own button disappears with the sidebar, so hand focus to the
    // menu button (and back again) to keep keyboard users oriented.
    window.requestAnimationFrame(() => {
      if (next) menuButtonRef.current?.focus()
    })
    try {
      localStorage.setItem(collapsedKey(user.role), next ? '1' : '0')
    } catch {
      // Storage can be blocked; the sidebar still works for this visit.
    }
  }

  const expanded = isDesktop ? !collapsed : menuOpen
  const toggleLabel = expanded ? 'Close sidebar' : 'Open sidebar'

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
        collapsed={isDesktop && collapsed}
        onClose={handleToggle}
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
          aria-label={toggleLabel}
          aria-expanded={expanded}
          aria-controls={MENU_ID}
          onClick={handleToggle}
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