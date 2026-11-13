import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

// Use this hook to read the current theme ('light' or 'dark') or to change it.
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.')
  }
  return context
}
