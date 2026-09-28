import { useRef, useState } from 'react'
import Button from '../ui/Button'
import SelectField from '../ui/SelectField'
import TextAreaField from '../ui/TextAreaField'
import { COMPLAINT_STATUSES as STATUS, STATUS_LIST } from '../../constants/statuses'
import { ADMIN_RESPONSE_MAX, validateAdminUpdate } from '../../utils/validation'
import './ComplaintManager.css'

const FAKE_NETWORK_DELAY_MS = 600

// The admin's form: change the status and write a response for the student.
//   onSave(id, { status, adminResponse }) updates the shared complaint state.
// The response box starts empty. A new response replaces the previous one;
// leaving it empty keeps the previous one.
export default function ComplaintManager({ complaint, onSave }) {
  const [status, setStatus] = useState(complaint.status)
  const [response, setResponse] = useState('')
  const [touched, setTouched] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'info', text }

  const responseRef = useRef(null)

  const statusChanged = status !== complaint.status
  const hasNewResponse = response.trim() !== ''
  // Rejecting needs a fresh explanation; the old response was written for another status.
  const requireResponse = status === STATUS.REJECTED && complaint.status !== STATUS.REJECTED

  const errors = validateAdminUpdate({ status, response, requireResponse })
  const responseError = touched || attempted ? errors.response : undefined

  const handleStatusChange = (event) => {
    setStatus(event.target.value)
    setFeedback(null)
  }

  const handleResponseChange = (event) => {
    setResponse(event.target.value)
    setFeedback(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAttempted(true)
    setFeedback(null)

    if (errors.response) {
      responseRef.current?.focus()
      return
    }
    if (!statusChanged && !hasNewResponse) {
      setFeedback({
        type: 'info',
        text: 'There is nothing to save yet. Change the status or write a new response first.',
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, FAKE_NETWORK_DELAY_MS))

    onSave(complaint.id, {
      status,
      adminResponse: hasNewResponse ? response.trim() : complaint.adminResponse,
    })

    const parts = []
    if (statusChanged) parts.push(`Status changed from ${complaint.status} to ${status}.`)
    if (hasNewResponse) parts.push('Your response was saved.')
    parts.push('The student can now see the update.')

    setIsSaving(false)
    setResponse('')
    setTouched(false)
    setAttempted(false)
    setFeedback({ type: 'success', text: parts.join(' ') })
  }

  return (
    <form className="manager" onSubmit={handleSubmit} noValidate>
      <div>
        <h3 className="manager__heading">Previous response</h3>
        {complaint.adminResponse ? (
          <p className="manager__previous">{complaint.adminResponse}</p>
        ) : (
          <p className="manager__muted">No response has been sent to the student yet.</p>
        )}
      </div>

      <SelectField
        label="Status"
        name="status"
        options={STATUS_LIST}
        value={status}
        onChange={handleStatusChange}
        error={errors.status}
        disabled={isSaving}
      />

      <TextAreaField
        ref={responseRef}
        label="New response to the student"
        name="response"
        rows={5}
        maxLength={ADMIN_RESPONSE_MAX}
        value={response}
        onChange={handleResponseChange}
        onBlur={() => setTouched(true)}
        error={responseError}
        hint={
          requireResponse
            ? 'Required. Tell the student why this complaint is being rejected.'
            : 'The student sees this on their complaint page. It replaces the previous response. Leave empty to keep the previous one.'
        }
        disabled={isSaving}
      />

      <div className="manager__actions">
        <Button type="submit" loading={isSaving} loadingText="Saving…">
          Save changes
        </Button>
      </div>

      {/* Always in the page so screen readers announce the message when it appears. */}
      <div
        role="status"
        className={`manager__feedback${feedback ? ` manager__feedback--${feedback.type}` : ''}`}
      >
        {feedback?.text}
      </div>
    </form>
  )
}
