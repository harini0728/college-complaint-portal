import { formatDateTime, getTimeline } from '../utils/complaints'
import './StatusTimeline.css'

const STATE_TEXT = {
  done: 'Completed',
  current: 'Current step',
  upcoming: 'Not reached yet',
}

// Vertical list of the stages a complaint moves through, oldest first. Each step
// shows when it happened and the admin's response sent with it, if any.
export default function StatusTimeline({ complaint }) {
  const steps = getTimeline(complaint)

  return (
    <ol className="timeline">
      {steps.map((step) => (
        <li
          key={step.key}
          className={`timeline__step timeline__step--${step.state}${
            step.tone ? ` timeline__step--${step.tone}` : ''
          }`}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <span className="timeline__marker" aria-hidden="true" />
          <div className="timeline__body">
            <p className="timeline__label">
              {step.label}
              <span className="visually-hidden"> ({STATE_TEXT[step.state]})</span>
            </p>
            {step.date && <p className="timeline__date">{formatDateTime(step.date)}</p>}
            <p className="timeline__text">{step.description}</p>
            {step.response && (
              <p className="timeline__response">
                <span className="visually-hidden">Response from the administration: </span>
                {step.response}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}