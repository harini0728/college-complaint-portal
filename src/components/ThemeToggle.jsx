import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/useTheme'
import './ThemeToggle.css'

// Sun/Moon button that switches between the light and dark theme.
// Shows the current theme: a navy Sun in light mode, a white Moon in dark mode.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <Moon className="icon" size={20} aria-hidden="true" />
      ) : (
        <Sun className="icon" size={20} aria-hidden="true" />
      )}
    </button>
  )
}
