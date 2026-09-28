import { useId } from 'react'
import './Panel.css'

// White block with a heading, used for tables and lists on the dashboards.
// `action` is an optional link or button next to the heading.
export default function Panel({ title, action, children }) {
  const headingId = useId()

  return (
    <section className="panel" aria-labelledby={headingId}>
      <div className="panel__header">
        <h2 className="panel__title" id={headingId}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
