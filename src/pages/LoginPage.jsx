import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import RoleSwitch from '../components/auth/RoleSwitch'
import LoginHelp from '../components/auth/LoginHelp'
import DemoCredentials from '../components/auth/DemoCredentials'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../constants/roles'
import { getHomePath } from '../constants/routes'
import { validateLogin } from '../utils/validation'
import './LoginPage.css'

export default function LoginPage() {
  const { user, login } = useAuth()

  const [role, setRole] = useState(ROLES.STUDENT)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Which fields the person has left, so we don't show errors before they type.
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)

  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const identifierRef = useRef(null)
  const passwordRef = useRef(null)

  // Already signed in? Skip the login page.
  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  // Validation runs on every render, so errors disappear as soon as they are fixed.
  const errors = validateLogin({ identifier, password, role })
  const visibleError = (field) =>
    touched[field] || attempted ? errors[field] : undefined

  const markTouched = (field) =>
    setTouched((current) => ({ ...current, [field]: true }))

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setFormError('')
  }

  const handleFillDemo = (account) => {
    setRole(account.role)
    setIdentifier(account.id)
    setPassword(account.password)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAttempted(true)
    setFormError('')

    // Stop here and move focus to the first field that needs fixing.
    if (errors.identifier) {
      identifierRef.current?.focus()
      return
    }
    if (errors.password) {
      passwordRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    const result = await login({ identifier, password, role })
    if (!result.ok) {
      setFormError(result.error)
      setIsSubmitting(false)
    }
    // On success the user is set, and this page redirects (see the check above).
  }

  const identifierLabel =
    role === ROLES.ADMIN ? 'Staff ID or email' : 'Student ID or email'

  return (
    <AuthLayout>
      <div className="login">
        <div className="login__header">
          <h1 className="login__title">Sign in</h1>
          <p className="login__subtitle">
            Use your college ID or email to continue.
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="login__alert" role="alert">
              {formError}
            </div>
          )}

          <RoleSwitch
            value={role}
            onChange={handleRoleChange}
            disabled={isSubmitting}
          />

          <TextField
            ref={identifierRef}
            label={identifierLabel}
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            onBlur={() => markTouched('identifier')}
            error={visibleError('identifier')}
            disabled={isSubmitting}
          />

          <TextField
            ref={passwordRef}
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => markTouched('password')}
            error={visibleError('password')}
            disabled={isSubmitting}
            endAction={
              <button
                type="button"
                className="login__toggle"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />

          <Button
            type="submit"
            block
            loading={isSubmitting}
            loadingText="Signing in…"
          >
            Sign in
          </Button>
        </form>

        <LoginHelp />
        <DemoCredentials onFill={handleFillDemo} />
      </div>
    </AuthLayout>
  )
}
