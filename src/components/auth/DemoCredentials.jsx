import { DEMO_ACCOUNTS } from '../../data/users'
import { ROLE_LABELS } from '../../constants/roles'
import Button from '../ui/Button'
import './DemoCredentials.css'

// TEMPORARY helper for testing: shows the dummy accounts and fills the form.
// Delete this component (and its use in LoginPage) once real login exists.
export default function DemoCredentials({ onFill }) {
  return (
    <details className="demo">
      <summary className="demo__summary">Demo accounts for testing</summary>
      <ul className="demo__list">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.role} className="demo__item">
            <div>
              <strong>{ROLE_LABELS[account.role]}</strong>
              <div className="demo__creds">
                {account.email}
                <br />
                Password: {account.password}
              </div>
            </div>
            <Button variant="secondary" onClick={() => onFill(account)}>
              Fill in
            </Button>
          </li>
        ))}
      </ul>
    </details>
  )
}