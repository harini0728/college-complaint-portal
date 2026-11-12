import { AlertTriangle, RotateCw } from 'lucide-react'
import EmptyState from './EmptyState'
import Button from './ui/Button'

// Shown when something failed to load. `onRetry` adds a "Try again" button.
export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
}) {
  return (
    <div role="alert">
      <EmptyState
        icon={AlertTriangle}
        tone="danger"
        title={title}
        message={message}
        action={
          onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCw className="icon" size={16} aria-hidden="true" />
              Try again
            </Button>
          )
        }
      />
    </div>
  )
}
