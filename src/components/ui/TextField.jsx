import { useId } from 'react'
import './TextField.css'

// Reusable labelled input with hint + error message.
//   label:      visible label text (required for accessibility)
//   error:      error message; when set the field is marked invalid
//   hint:       small helper text under the input
//   endAction:  optional element placed inside the right edge (e.g. Show/Hide button)
// Any other props (type, value, onChange, autoComplete, ref...) go to the <input>.
export default function TextField({
  label,
  error,
  hint,
  endAction,
  ref,
  ...inputProps
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      <div className="field__control">
        <input
          id={id}
          ref={ref}
          className={`field__input${endAction ? ' field__input--has-action' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          {...inputProps}
        />
        {endAction && <div className="field__action">{endAction}</div>}
      </div>

      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
