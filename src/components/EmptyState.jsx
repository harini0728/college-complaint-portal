import './EmptyState.css'

// Shown when a list has nothing in it. Always say what to do next via `action`.
export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  )
}
