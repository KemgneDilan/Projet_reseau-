'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { users as mockUsers } from '@/lib/mockData'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize users in localStorage for demo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('hrs_users')) {
        localStorage.setItem('hrs_users', JSON.stringify(mockUsers))
      }
    }
  }, [])

  // Bootstrap: restore session from localStorage
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
      setLoading(false)
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
      // Allow login with email OR phone number
      const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      const foundUser = users.find(
        (u) => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password
      )

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem('hrs_current_user', JSON.stringify(foundUser))
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
      // Validate email uniqueness and phone format before registration
      const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      
      // Check if email already exists
      if (users.some(u => u.email === formData.email)) {
        throw new Error('Cette adresse email est déjà utilisée')
      }
      
      // Check if phone already exists
      if (users.some(u => u.phone === formData.phone)) {
        throw new Error('Ce numéro de téléphone est déjà utilisé')
      }

      // Try API first
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
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
        email: formData.email, // Email as unique identifier
        password: formData.password,
        phone: formData.phone, // Phone as alternative login identifier
        role: formData.role || 'client',
        city: formData.city || '',
        ratings: [], // Store ratings given by this user
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem('hrs_users', JSON.stringify(users))
      setUser(newUser)
      localStorage.setItem('hrs_current_user', JSON.stringify(newUser))
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
    setUser(null)
    toast.success('Déconnecté avec succès')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('hrs_current_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const isRole = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, isRole }}
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
