import { NavLink } from 'react-router-dom'
import { ROLE_LABELS } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import './Sidebar.css'

// Small line icons for the menu. Each one is a few SVG shapes.
const ICON_PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  note: 'M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1ZM14.5 3.5V8h4.2M9 12.5h6M9 16h6',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  progress: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4',
  check: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l3 3 5-6',
  cross: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  logout: 'M15 4h-4a2 2 0 0 0-2 2v3M9 15v3a2 2 0 0 0 2 2h4M16 12H3.5M6.5 8.5 3 12l3.5 3.5M20 4v16',
  dot: 'M12 12h.01',
}

// Which icon goes with which page.
const ICON_BY_ROUTE = {
  [ROUTES.STUDENT_DASHBOARD]: 'home',
  [ROUTES.STUDENT_SUBMIT]: 'note',
  [ROUTES.STUDENT_COMPLAINTS]: 'list',
  [ROUTES.STUDENT_PROFILE]: 'user',
  [ROUTES.ADMIN_DASHBOARD]: 'home',
  [ROUTES.ADMIN_COMPLAINTS]: 'list',
  [ROUTES.ADMIN_PENDING]: 'clock',
  [ROUTES.ADMIN_IN_PROGRESS]: 'progress',
  [ROUTES.ADMIN_RESOLVED]: 'check',
  [ROUTES.ADMIN_REJECTED]: 'cross',
  [ROUTES.ADMIN_PROFILE]: 'user',
}

function Icon({ name }) {
  return (
    <svg
      className="sidebar__icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name] ?? ICON_PATHS.dot} />
    </svg>
  )
}

// Left navigation. Collapsed it is a slim rail of icons; the ☰ button at the
// top expands it to show each icon with its label (and collapses it again).
// `items` is a list of { label, to }.
export default function Sidebar({
  id,
  items,
  user,
  open,
  onToggle,
  onNavigate,
  onLogout,
  toggleRef,
}) {
  return (
    <aside id={id} className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__head">
        <button
          type="button"
          ref={toggleRef}
          className="sidebar__toggle"
          aria-label={open ? 'Collapse menu' : 'Expand menu'}
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        <ul className="sidebar__list">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="sidebar__link"
                aria-label={item.label}
                title={open ? undefined : item.label}
                onClick={onNavigate}
              >
                <Icon name={ICON_BY_ROUTE[item.to]} />
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__user-name">{user.name}</span>
          <span className="sidebar__user-meta">
            {ROLE_LABELS[user.role]}, {user.id}
          </span>
        </div>
        <button
          type="button"
          className="sidebar__link sidebar__logout"
          aria-label="Logout"
          title={open ? undefined : 'Logout'}
          onClick={onLogout}
        >
          <Icon name="logout" />
          <span className="sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  )
}