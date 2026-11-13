import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

// Keep this key in sync with the inline script in index.html.
const STORAGE_KEY = 'ccp_theme'
const THEME_COLOR = { light: '#172554', dark: '#0f172a' }
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

function systemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

// Starts from what index.html already put on <html>, so React and the page agree.
function currentTheme() {
  const applied = document.documentElement.getAttribute('data-theme')
  return applied === 'dark' || applied === 'light' ? applied : readSaved() ?? systemTheme()
}

// Applies the theme to the page. `animate` adds a short-lived class that fades
// colours; it is only present during a switch, so normal rendering pays nothing.
function applyTheme(theme, animate) {
  const root = document.documentElement
  if (animate) {
    root.classList.add('theme-switching')
    window.setTimeout(() => root.classList.remove('theme-switching'), 350)
  }
  root.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}

// Provides the theme to the whole app. The choice is saved in localStorage; until
// the user picks one, the operating system's light/dark setting is followed.
export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(currentTheme)

  const setTheme = useCallback((next) => {
    setThemeState(next)
    applyTheme(next, true)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be blocked; the choice still applies until the page closes.
    }
  }, [])

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme],
  )

  // No saved choice yet: follow the operating system, including live changes.
  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const handleChange = () => {
      if (readSaved()) return
      const next = systemTheme()
      setThemeState(next)
      applyTheme(next, true)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  // Another tab changed the theme: stay in step with it.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      const next = readSaved() ?? systemTheme()
      setThemeState(next)
      applyTheme(next, true)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
