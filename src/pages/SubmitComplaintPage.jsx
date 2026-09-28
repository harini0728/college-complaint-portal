import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import TextAreaField from '../components/ui/TextAreaField'
import FileField from '../components/ui/FileField'
import { useAuth } from '../context/useAuth'
import { useComplaints } from '../context/useComplaints'
import { COMPLAINT_CATEGORIES } from '../constants/categories'
import { ROUTES, studentComplaintPath } from '../constants/routes'
import { ATTACHMENT_RULES, COMPLAINT_LIMITS, validateComplaint } from '../utils/validation'
import './SubmitComplaintPage.css'

const FAKE_NETWORK_DELAY_MS = 700
const FIELD_ORDER = ['title', 'category', 'location', 'description', 'attachment']
const EMPTY_VALUES = { title: '', category: '', location: '', description: '' }

export default function SubmitComplaintPage() {
  const { user } = useAuth()
  const { addComplaint } = useComplaints()
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY_VALUES)
  const [attachment, setAttachment] = useState(null)

  // Which fields the person has left, so we don't show errors before they type.
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleRef = useRef(null)
  const categoryRef = useRef(null)
  const locationRef = useRef(null)
  const descriptionRef = useRef(null)
  const attachmentRef = useRef(null)
  const fieldRefs = {
    title: titleRef,
    category: categoryRef,
    location: locationRef,
    description: descriptionRef,
    attachment: attachmentRef,
  }

  // Validation runs on every render, so errors disappear as soon as they are fixed.
  const errors = validateComplaint({ ...values, attachment })
  const errorCount = Object.keys(errors).length
  const visibleError = (field) =>
    touched[field] || attempted ? errors[field] : undefined

  const markTouched = (field) =>
    setTouched((current) => ({ ...current, [field]: true }))

  const handleChange = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }))

  const handleAttachmentChange = (file) => {
    setAttachment(file)
    markTouched('attachment')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAttempted(true)

    // Stop here and move focus to the first field that needs fixing.
    const firstInvalid = FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus()
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, FAKE_NETWORK_DELAY_MS))

    const complaint = addComplaint(
      {
        title: values.title.trim(),
        category: values.category,
        location: values.location.trim(),
        description: values.description.trim(),
        attachment: attachment
          ? {
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
              url: URL.createObjectURL(attachment),
            }
          : null,
      },
      user,
    )

    navigate(studentComplaintPath(complaint.id), { state: { justSubmitted: true } })
  }

  return (
    <>
      <PageHeader
        title="Submit a complaint"
        description="Tell us what needs attention. All fields are required except the attachment."
      />

      <div className="submit">
        <Panel title="Complaint details">
          <form className="submit__form panel-body" onSubmit={handleSubmit} noValidate>
            {attempted && errorCount > 0 && (
              <div className="submit__alert" role="alert">
                {errorCount === 1
                  ? 'One field needs your attention. Fix it and submit again.'
                  : `${errorCount} fields need your attention. Fix them and submit again.`}
              </div>
            )}

            <TextField
              ref={titleRef}
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange('title')}
              onBlur={() => markTouched('title')}
              error={visibleError('title')}
              hint="A short summary, for example “Water leakage in Block B washroom”."
              disabled={isSubmitting}
              autoComplete="off"
            />

            <div className="submit__row">
              <SelectField
                ref={categoryRef}
                label="Category"
                name="category"
                options={COMPLAINT_CATEGORIES}
                placeholder="Choose a category"
                value={values.category}
                onChange={handleChange('category')}
                onBlur={() => markTouched('category')}
                error={visibleError('category')}
                disabled={isSubmitting}
              />

              <TextField
                ref={locationRef}
                label="Location"
                name="location"
                value={values.location}
                onChange={handleChange('location')}
                onBlur={() => markTouched('location')}
                error={visibleError('location')}
                hint="Building, floor or room."
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <TextAreaField
              ref={descriptionRef}
              label="Description"
              name="description"
              rows={6}
              maxLength={COMPLAINT_LIMITS.descriptionMax}
              value={values.description}
              onChange={handleChange('description')}
              onBlur={() => markTouched('description')}
              error={visibleError('description')}
              hint="What is the problem, since when, and how does it affect you?"
              disabled={isSubmitting}
            />

            <FileField
              inputRef={attachmentRef}
              label="Attachment (optional)"
              accept={ATTACHMENT_RULES.accept}
              file={attachment}
              onChange={handleAttachmentChange}
              onBlur={() => markTouched('attachment')}
              error={visibleError('attachment')}
              hint={ATTACHMENT_RULES.hint}
            />

            <div className="submit__actions">
              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Submitting…"
              >
                Submit complaint
              </Button>
              <Button variant="secondary" to={ROUTES.STUDENT_COMPLAINTS}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </>
  )
}
