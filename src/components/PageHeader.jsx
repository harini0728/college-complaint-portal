import './PageHeader.css'

// Title block at the top of every page. `action` is an optional button on the right.
export default function PageHeader({ title, description, action }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}
