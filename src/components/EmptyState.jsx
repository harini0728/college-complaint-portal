import { Inbox } from 'lucide-react'
import './EmptyState.css'

// Shown when a list has nothing in it. Always say what to do next via `action`.
// `icon` is an optional Lucide icon component (defaults to an inbox).
export default function EmptyState({ title, message, action, icon: StateIcon = Inbox, tone }) {
  return (
    <div className="empty-state">
      <span className={`empty-state__icon${tone ? ` empty-state__icon--${tone}` : ''}`} aria-hidden="true">
        <StateIcon className="icon" size={24} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  )
}
