import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'yourjob_theme_mode'

const ThemeContext = createContext(null)

const THEMES = ['dark', 'light']

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    if (savedTheme && THEMES.includes(savedTheme)) return savedTheme
  } catch {
    return 'dark'
  }
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage errors safely.
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
