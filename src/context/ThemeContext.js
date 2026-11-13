import { createContext } from 'react'

// Holds { theme, setTheme, toggleTheme } for the whole app. See ThemeProvider.jsx.
export const ThemeContext = createContext(null)
