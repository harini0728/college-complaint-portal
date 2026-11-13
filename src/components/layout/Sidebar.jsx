import { useEffect, useId, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronUp,
  Clock,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Hash,
  Loader,
  LogOut,
  User,
  PanelLeftClose,
  XCircle,
  Inbox,
} from 'lucide-react'
import BrandMark from '../BrandMark'
import { ROLES, ROLE_LABELS } from '../../constants/roles'
import { ROUTES, getProfilePath } from '../../constants/routes'
import { getInitials } from '../../utils/complaints'
import './Sidebar.css'

// Which Lucide icon goes with which page.
const ICON_BY_ROUTE = {
  [ROUTES.STUDENT_DASHBOARD]: LayoutDashboard,
  [ROUTES.STUDENT_SUBMIT]: FilePlus2,
  [ROUTES.STUDENT_COMPLAINTS]: ListChecks,
  [ROUTES.STUDENT_PROFILE]: User,
  [ROUTES.ADMIN_DASHBOARD]: LayoutDashboard,
  [ROUTES.ADMIN_COMPLAINTS]: Inbox,
  [ROUTES.ADMIN_PENDING]: Clock,
  [ROUTES.ADMIN_IN_PROGRESS]: Loader,
  [ROUTES.ADMIN_RESOLVED]: CheckCircle2,
  [ROUTES.ADMIN_REJECTED]: XCircle,
  [ROUTES.ADMIN_PROFILE]: User,
}

// Left navigation. A fixed panel on desktop; on tablets and phones it slides in
// as a drawer (opened from the top bar) and closes again on navigation, on
// Escape, or when the backdrop is clicked.
// `items` is a list of { label, to }.
export default function Sidebar({
  id,
  items,
  user,
  open,
  collapsed = false,
  onClose,
  onNavigate,
  onLogout,
}) {
  // The profile row at the bottom opens a small account menu (profile, ID, logout).
  const [accountOpen, setAccountOpen] = useState(false)
  const footerRef = useRef(null)
  const triggerRef = useRef(null)
  const accountMenuId = useId()
  const idLabel = user.role === ROLES.ADMIN ? 'Staff ID' : 'Student ID'

  const closeAccount = () => setAccountOpen(false)

  // Close the menu on Escape (focus goes back to the row) or on any press outside it.
  // That includes the backdrop and the sidebar's own close button.
  useEffect(() => {
    if (!accountOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false)
        triggerRef.current?.focus()
      }
    }
    const handlePointerDown = (event) => {
      if (!footerRef.current?.contains(event.target)) setAccountOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [accountOpen])

  const handleNavigate = () => {
    closeAccount()
    onNavigate?.()
  }

  // Tabbing out of the menu closes it.
  const handleBlur = (event) => {
    if (!footerRef.current?.contains(event.relatedTarget)) closeAccount()
  }

  return (
    <aside
      id={id}
      className={`sidebar${open ? ' sidebar--open' : ''}${collapsed ? ' sidebar--collapsed' : ''}`}
    >
      <div className="sidebar__head">
        <BrandMark inverse />
        <button
          type="button"
          className="sidebar__close"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <PanelLeftClose className="icon" size={20} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        <p className="sidebar__section">{ROLE_LABELS[user.role]} menu</p>
        <ul className="sidebar__list">
          {items.map((item) => {
            const ItemIcon = ICON_BY_ROUTE[item.to] ?? LayoutDashboard
            return (
              <li key={item.to}>
                <NavLink to={item.to} className="sidebar__link" onClick={onNavigate}>
                  <ItemIcon className="icon sidebar__icon" size={19} aria-hidden="true" />
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer" ref={footerRef} onBlur={handleBlur}>
        {accountOpen && (
          <div className="account__menu" id={accountMenuId}>
            <NavLink
              to={getProfilePath(user.role)}
              className="account__item"
              onClick={handleNavigate}
            >
              <User className="icon" size={18} aria-hidden="true" />
              <span>My Profile</span>
            </NavLink>

            {user.id ? (
              <div className="account__info">
                <Hash className="icon" size={18} aria-hidden="true" />
                <div className="account__info-text">
                  <span className="account__info-label">{idLabel}</span>
                  <span className="account__info-value" title={String(user.id)}>
                    {user.id}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="account__separator" role="separator" />

            <button
              type="button"
              className="account__item account__item--danger"
              onClick={onLogout}
            >
              <LogOut className="icon" size={18} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        )}

        <button
          type="button"
          ref={triggerRef}
          className="sidebar__user"
          aria-haspopup="true"
          aria-expanded={accountOpen}
          aria-controls={accountOpen ? accountMenuId : undefined}
          aria-label={`${user.name}, ${ROLE_LABELS[user.role]}. Account menu`}
          onClick={() => setAccountOpen((value) => !value)}
        >
          <span className="avatar avatar--on-dark" aria-hidden="true">
            {getInitials(user.name)}
          </span>
          <span className="sidebar__user-text">
            <span className="sidebar__user-name" title={user.name}>
              {user.name}
            </span>
            <span className="sidebar__user-meta">{ROLE_LABELS[user.role]}</span>
          </span>
          <ChevronUp className="icon sidebar__user-chevron" size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}