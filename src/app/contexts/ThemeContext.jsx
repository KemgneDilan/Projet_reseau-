"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check localStorage or system preference on mount
    const storedTheme = localStorage.getItem('hrs_theme')
    if (storedTheme === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
      localStorage.setItem('hrs_theme', 'light')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('hrs_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('hrs_theme', 'light')
      }
      return newValue
    })
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
