import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext(null)

const STORAGE_KEY = 'theme'
const DARK_CLASS = 'dark'

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored === DARK_CLASS
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? DARK_CLASS : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
