import { NavLink } from 'react-router-dom'
import BrandMark from '../BrandMark'
import Button from '../ui/Button'
import { ROLE_LABELS } from '../../constants/roles'
import './Sidebar.css'

// Left-side navigation panel. It slides in from the left when the ⋮ button in
// the top bar is clicked. `items` is a list of { label, to }.
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