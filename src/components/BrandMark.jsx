import { COLLEGE } from '../constants/college'
import './BrandMark.css'

// Logo + portal name. Use inverse on dark (teal) backgrounds.
export default function BrandMark({ inverse = false }) {
  return (
    <div className={`brand${inverse ? ' brand--inverse' : ''}`}>
      <svg
        className="brand__logo"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="7" fill="currentColor" />
        <path
          d="M9 16.5l4.5 4.5L23 11.5"
          fill="none"
          stroke="var(--brand-check)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="brand__name">{COLLEGE.portalName}</span>
    </div>
  )
}
