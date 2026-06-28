"use client"
import * as React from "react"

const AuthContext = React.createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Initialiser le compte admin par défaut si aucun utilisateur n'existe
    if (!localStorage.getItem('hrs_users')) {
      const admin = { id: 'admin1', username: 'admin', phone: '0000', role: 'admin', password: 'admin', city: 'Yaoundé' }
      localStorage.setItem('hrs_users', JSON.stringify([admin]))
    }
    const storedUser = localStorage.getItem('hrs_current_user')
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('hrs_current_user')
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false)
  }, [])

  /**
   * Retourne { success, user } ou { success: false, message }
   * La redirection est gérée dans le composant de page (qui a accès à useRouter).
   */
  const login = (identifier, password) => {
    const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
    const foundUser = users.find(
      u => (u.username === identifier || u.phone === identifier) && u.password === password
    )
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('hrs_current_user', JSON.stringify(foundUser))
      return { success: true, user: foundUser }
    }
    return { success: false, message: "Identifiant ou mot de passe incorrect." }
  }

  /**
   * Retourne { success, user } ou { success: false, message }
   * La redirection est gérée dans le composant de page.
   */
  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')

    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: "Ce nom d'utilisateur est déjà pris." }
    }
    if (users.find(u => u.phone === userData.phone)) {
      return { success: false, message: "Ce numéro de téléphone est déjà utilisé." }
    }

    const newUser = { ...userData, id: `u_${Date.now()}` }
    users.push(newUser)
    localStorage.setItem('hrs_users', JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem('hrs_current_user', JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hrs_current_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => React.useContext(AuthContext)
