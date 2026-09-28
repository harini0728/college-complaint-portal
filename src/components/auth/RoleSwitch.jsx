import { ROLES, ROLE_LABELS } from '../../constants/roles'
import './RoleSwitch.css'

const OPTIONS = [ROLES.STUDENT, ROLES.ADMIN]

// Two-option "Student / Admin" selector built from real radio buttons,
// so it works with keyboard (arrow keys) and screen readers.
export default function RoleSwitch({ value, onChange, disabled = false }) {
  return (
    <fieldset className="role-switch" disabled={disabled}>
      <legend className="role-switch__legend">Sign in as</legend>
      <div className="role-switch__options">
        {OPTIONS.map((role) => (
          <label key={role} className="role-switch__option">
            <input
              type="radio"
              name="role"
              value={role}
              checked={value === role}
              onChange={() => onChange(role)}
              className="visually-hidden"
            />
            <span className="role-switch__label">{ROLE_LABELS[role]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
