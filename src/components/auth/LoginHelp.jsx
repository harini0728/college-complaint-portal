import { useId, useState } from 'react'
import { COLLEGE } from '../../constants/college'
import './LoginHelp.css'

// "Need help signing in?" link that expands a short help panel.
export default function LoginHelp() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="login-help">
      <button
        type="button"
        className="login-help__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        Need help signing in?
      </button>

      {open && (
        <div className="login-help__panel" id={panelId}>
          <p>
            Forgot your password, or can't find your ID? The office can reset
            it for you. Bring your college ID card.
          </p>
          <p>
            <strong>{COLLEGE.helpOffice}</strong>
            <br />
            {COLLEGE.helpHours}
            <br />
            <a href={`mailto:${COLLEGE.helpEmail}`}>{COLLEGE.helpEmail}</a>
          </p>
        </div>
      )}
    </div>
  )
}
