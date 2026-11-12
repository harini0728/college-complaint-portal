import { ClipboardCheck } from 'lucide-react'
import { COLLEGE } from '../constants/college'
import './BrandMark.css'

// Logo + portal name. Use inverse on dark (navy) backgrounds.
export default function BrandMark({ inverse = false }) {
  return (
    <div className={`brand${inverse ? ' brand--inverse' : ''}`}>
      <span className="brand__logo" aria-hidden="true">
        <ClipboardCheck className="icon" size={20} strokeWidth={2.2} />
      </span>
      <span className="brand__name">{COLLEGE.portalName}</span>
    </div>
  )
}
