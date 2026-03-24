import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()
const PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'flipper2026'

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('auth') === 'true'
  )

  const login = (password) => {
    if (password === PASSWORD) {
      localStorage.setItem('auth', 'true')
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}