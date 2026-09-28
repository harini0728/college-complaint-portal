import { useId } from 'react'
import './TextField.css'
import './FormControls.css'

// Reusable labelled dropdown. Same look and error behaviour as TextField.
//   options:      array of strings, or { value, label } objects
//   placeholder:  first, empty option (e.g. "Choose a category")
// Any other props (value, onChange, onBlur, ref...) go to the <select>.
export default function SelectField({
  label,
  error,
  hint,
  options,
  placeholder,
  ref,
  ...selectProps
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

      <select
        id={id}
        ref={ref}
        className="field__input field__select"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const { value, label: optionLabel } =
            typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          )
        })}
      </select>

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
