'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { users as mockUsers } from '@/lib/mockData'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentMode, setCurrentModeState] = useState('client')

  // Initialize users in localStorage for demo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('hrs_users')) {
        // Enforce that mock users have kycStatus and interests
        const preparedMockUsers = mockUsers.map(u => ({
          ...u,
          kycStatus: u.role === 'admin' ? 'validated' : (u.role === 'host' ? 'validated' : 'none'),
          interests: u.interests || (
            u.id === 'u1' ? ['cuisine local', 'randonnée', 'lecture', 'voyages'] :
            u.id === 'u2' ? ['cuisine local', 'lecture', 'voyages', 'photographie'] :
            u.id === 'u3' ? ['cuisine local', 'voyages', 'musique'] : []
          ),
          role: u.role === 'admin' ? 'admin' : 'client' // clean all providers/hosts to client role for unified design
        }))
        localStorage.setItem('hrs_users', JSON.stringify(preparedMockUsers))
      }
    }
  }, [])

  // Bootstrap: restore session and mode from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('hrs_current_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('hrs_current_user')
        }
      }
      const storedMode = localStorage.getItem('hrs_current_mode')
      if (storedMode) {
        setCurrentModeState(storedMode)
      }
      setLoading(false)
    }
  }, [])

  const setCurrentMode = useCallback((mode) => {
    setCurrentModeState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('hrs_current_mode', mode)
    }
  }, [])

  const login = useCallback(async (emailOrPhone, password) => {
    try {
      // Try API first
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrPhone, password }),
        })
        if (res.ok) {
          const { data } = await res.json()
          const userData = data.data || data.user
          localStorage.setItem('accessToken', data.accessToken || data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          setUser(userData)
          localStorage.setItem('hrs_current_user', JSON.stringify(userData))
          toast.success('Connexion réussie!')
          return userData
        }
      } catch (apiError) {
        // Fallback to localStorage (demo mode)
        console.log('API not available, using demo mode')
      }

      // Demo mode: use localStorage
      const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      const foundUser = users.find(
        (u) => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password
      )

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem('hrs_current_user', JSON.stringify(foundUser))
        
        // Reset current mode to client by default upon new login, unless already set
        const storedMode = localStorage.getItem('hrs_current_mode') || 'client'
        setCurrentModeState(storedMode)
        
        toast.success('Connexion réussie!')
        return foundUser
      }

      throw new Error('Email/Téléphone ou mot de passe incorrect')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion'
      toast.error(message)
      throw error
    }
  }, [])

  const register = useCallback(async (formData) => {
    try {
      const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      
      if (users.some(u => u.email === formData.email)) {
        throw new Error('Cette adresse email est déjà utilisée')
      }
      
      if (users.some(u => u.phone === formData.phone)) {
        throw new Error('Ce numéro de téléphone est déjà utilisé')
      }

      // Try API first
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'client' }),
        })
        if (res.ok) {
          const { data } = await res.json()
          const userData = data.data || data.user
          localStorage.setItem('accessToken', data.accessToken || data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          setUser(userData)
          localStorage.setItem('hrs_current_user', JSON.stringify(userData))
          toast.success('Inscription réussie!')
          return userData
        }
      } catch (apiError) {
        console.log('API not available, using demo mode')
      }

      // Demo mode: add to localStorage
      const newUser = {
        id: `user_${Date.now()}`,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'client', // Forced Client by default
        kycStatus: 'none', // Default KYC status
        interests: [], // Default interests
        city: formData.city || '',
        ratings: [],
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem('hrs_users', JSON.stringify(users))
      setUser(newUser)
      localStorage.setItem('hrs_current_user', JSON.stringify(newUser))
      setCurrentModeState('client')
      localStorage.setItem('hrs_current_mode', 'client')
      toast.success('Inscription réussie!')
      return newUser
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur d\'inscription'
      toast.error(message)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('hrs_current_user')
    localStorage.removeItem('hrs_current_mode')
    setUser(null)
    setCurrentModeState('client')
    toast.success('Déconnecté avec succès')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('hrs_current_user', JSON.stringify(updated))
      
      // Update in hrs_users list too!
      const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      const index = users.findIndex(u => u.id === prev.id)
      if (index !== -1) {
        users[index] = { ...users[index], ...updates }
        localStorage.setItem('hrs_users', JSON.stringify(users))
      }
      
      return updated
    })
  }, [])

  const getActiveUser = () => {
    if (!user) return null
    if (user.role === 'admin') return user
    return {
      ...user,
      role: currentMode === 'host' ? 'host' : 'client'
    }
  }

  const isRole = (...roles) => {
    const activeUser = getActiveUser()
    return activeUser && roles.includes(activeUser.role)
  }

  return (
    <AuthContext.Provider
      value={{ 
        user: getActiveUser(), 
        loading, 
        currentMode, 
        setCurrentMode, 
        login, 
        register, 
        logout, 
        updateUser, 
        isRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
