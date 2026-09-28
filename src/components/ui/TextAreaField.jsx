import { useId } from 'react'
import './TextField.css'
import './FormControls.css'

// Reusable labelled multi-line input with an optional character counter.
//   maxLength:  only used for the counter; the form validation enforces it
// Any other props (value, onChange, onBlur, rows, ref...) go to the <textarea>.
export default function TextAreaField({
  label,
  error,
  hint,
  maxLength,
  value,
  ref,
  ...textareaProps
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')
  const overLimit = maxLength !== undefined && value.length > maxLength

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      <textarea
        id={id}
        ref={ref}
        value={value}
        className="field__input field__textarea"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...textareaProps}
      />

      <div className="field__footer">
        <div>
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
        {maxLength !== undefined && (
          <p
            className={`field__counter${overLimit ? ' field__counter--over' : ''}`}
            aria-hidden="true"
          >
            {value.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
