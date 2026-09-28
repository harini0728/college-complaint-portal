import { Link } from 'react-router-dom'
import './Button.css'

// Reusable button.
//   variant:  'primary' (default) | 'secondary'
//   block:    true makes it full width
//   to:       give a URL to render a link that looks like a button
//   loading:  true shows a spinner, disables the button and swaps the label
export default function Button({
  variant = 'primary',
  block = false,
  loading = false,
  loadingText,
  to,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
