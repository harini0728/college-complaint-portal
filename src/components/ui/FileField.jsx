import { useId } from 'react'
import { formatFileSize } from '../../utils/complaints'
import './TextField.css'
import './FormControls.css'

// Labelled file picker with a Remove button.
//   file:      the chosen File (or null); the parent keeps it in state
//   onChange:  called with the chosen File, or null when removed
//   inputRef:  ref to the <input>, so the parent can move focus to it
export default function FileField({
  label,
  error,
  hint,
  file,
  onChange,
  onBlur,
  accept,
  inputRef,
}) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  const handleChange = (event) => onChange(event.target.files?.[0] ?? null)

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = '' // lets the same file be chosen again
      inputRef.current.focus()
    }
    onChange(null)
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>

      <div className="field__file-row">
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={accept}
          className="field__input field__file"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          onChange={handleChange}
          onBlur={onBlur}
        />
        {file && (
          <button type="button" className="field__file-remove" onClick={handleRemove}>
            Remove
            <span className="visually-hidden"> {file.name}</span>
          </button>
        )}
      </div>

      {file && (
        <p className="field__hint">
          {file.name} ({formatFileSize(file.size)})
        </p>
      )}
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
