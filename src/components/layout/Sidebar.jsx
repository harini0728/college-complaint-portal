import { NavLink } from 'react-router-dom'
import BrandMark from '../BrandMark'
import Button from '../ui/Button'
import { ROLE_LABELS } from '../../constants/roles'
import './Sidebar.css'

// Left navigation. `items` is a list of { label, to }.
// `open` only matters on small screens, where the sidebar slides in over the page.
export default function Sidebar({ id, items, user, open, onNavigate, onLogout }) {
  return (
    <aside id={id} className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <BrandMark inverse />
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        <ul className="sidebar__list">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="sidebar__link"
                onClick={onNavigate}
              >
                {item.label}
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
        <Button variant="secondary" block onClick={onLogout}>
          Log out
        </Button>
      </div>
    </aside>
  )
}
