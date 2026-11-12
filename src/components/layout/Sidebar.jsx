import { NavLink } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Loader,
  LogOut,
  User,
  X,
  XCircle,
  Inbox,
} from 'lucide-react'
import BrandMark from '../BrandMark'
import { ROLE_LABELS } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
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
          aria-label="Close menu"
          onClick={onClose}
        >
          <X className="icon" size={20} aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        <p className="sidebar__section">{ROLE_LABELS[user.role]} menu</p>
        <ul className="sidebar__list">
          {items.map((item) => {
            const ItemIcon = ICON_BY_ROUTE[item.to] ?? LayoutDashboard
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="sidebar__link"
                  title={collapsed ? item.label : undefined}
                  onClick={onNavigate}
                >
                  <ItemIcon className="icon sidebar__icon" size={19} aria-hidden="true" />
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="avatar avatar--on-dark" aria-hidden="true">
            {getInitials(user.name)}
          </span>
          <div className="sidebar__user-text">
            <span className="sidebar__user-name">{user.name}</span>
            <span className="sidebar__user-meta">
              {ROLE_LABELS[user.role]}, {user.id}
            </span>
          </div>
        </div>
        <button type="button" className="sidebar__link sidebar__logout" onClick={onLogout}>
          <LogOut className="icon sidebar__icon" size={19} aria-hidden="true" />
          <span className="sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  )
}
