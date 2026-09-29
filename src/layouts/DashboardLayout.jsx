import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../context/useAuth'
import { NAV_BY_ROLE } from '../constants/navigation'
import './DashboardLayout.css'

const MENU_ID = 'app-menu'

// Shell for every signed-in page: a slim icon rail on the left (with the ☰
// button that expands it to show labels), a top bar and the content area.
// Student and admin pages both use this; the menu items depend on the role.
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef(null)
  const menuButtonRef = useRef(null)
  const { pathname } = useLocation()

  const closeMenu = () => setMenuOpen(false)

  // Pressing Escape collapses the menu and returns focus to the ☰ button.
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
    <div className={`shell${menuOpen ? ' shell--menu-open' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar
        id={MENU_ID}
        items={NAV_BY_ROLE[user.role]}
        user={user}
        open={menuOpen}
        onToggle={() => setMenuOpen((isOpen) => !isOpen)}
        onNavigate={closeMenu}
        onLogout={logout}
        toggleRef={menuButtonRef}
      />

      {/* Dims the page behind the expanded menu. Click it to collapse. */}
      <div
        className={`shell__backdrop${menuOpen ? ' shell__backdrop--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="shell__topbar">
        <BrandMark inverse />
      </header>

      <main className="shell__main" id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}