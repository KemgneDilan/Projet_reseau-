"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Search, Calendar, Star, Users, Settings, 
  LogOut, Menu, X, LayoutDashboard, CreditCard, Box, MapPin, MessageSquare
} from 'lucide-react'

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [userRole, setUserRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hrs_current_user')
      if (stored) {
        try {
          return JSON.parse(stored).role
        } catch {
          return null
        }
      }
    }
    return null
  })

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (user?.role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole(user.role)
    }
  }, [user])

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const role = userRole || user?.role || pathname.split('/')[1]
    
    switch (role) {
      case 'client':
        return [
          { href: '/', label: t('nav_home'), icon: Home },
          { href: '/client', label: t('tab_reservations'), icon: LayoutDashboard },
          { href: '/client/search', label: t('nav_search'), icon: Search },
          { href: '/client#reservations', label: t('tab_reservations'), icon: Calendar },
          { href: '/client#favoris', label: t('tab_favorites'), icon: Star },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      case 'host':
        return [
          { href: '/', label: t('nav_home'), icon: Home },
          { href: '/host', label: t('host_dashboard'), icon: LayoutDashboard },
          { href: '/host/listings/new', label: t('host_new_listing'), icon: PlusIcon },
          { href: '/host#reservations', label: t('host_res_received'), icon: Calendar },
          { href: '/host#finances', label: t('host_finances_title'), icon: CreditCard },
          { href: '/messages', label: t('nav_messages'), icon: MessageSquare },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      case 'admin':
        return [
          { href: '/', label: t('nav_home'), icon: Home },
          { href: '/admin', label: 'Vue globale', icon: LayoutDashboard },
          { href: '/admin#users', label: 'Utilisateurs', icon: Users },
          { href: '/admin#annonces', label: 'Annonces', icon: Box },
          { href: '/admin#finances', label: 'Finances', icon: CreditCard },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      default:
        return []
    }
  }

  // Simple local fallback icon
  function PlusIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    )
  }

  // Only compute links after mount (client-side) to avoid SSR/CSR hydration mismatch.
  // On the server and first paint, we render an empty nav — identical on both sides.
  const links = isMounted ? getSidebarLinks() : []
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-50 dark:bg-charcoal-950 font-sans">
      <header className="sticky top-0 z-30 bg-white dark:bg-charcoal-950 border-b border-charcoal-200 dark:border-charcoal-800">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-terracotta-500 p-2 rounded-lg shadow-sm">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg text-charcoal-900 dark:text-white">Loomdaah</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-2 overflow-x-auto py-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-terracotta-50 text-terracotta-600 dark:bg-terracotta-900/20 dark:text-terracotta-300'
                      : 'text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 p-2 text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors lg:hidden"
              aria-label="Ouvrir le menu"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/settings" className="flex items-center gap-2 rounded-full bg-charcoal-100 dark:bg-charcoal-900 px-3 py-2 transition-colors hover:bg-charcoal-200 dark:hover:bg-charcoal-800">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-b border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950"
            >
              <div className="space-y-1 px-4 py-3">
                {links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-terracotta-50 text-terracotta-600 dark:bg-terracotta-900/20 dark:text-terracotta-300'
                          : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-2xl bg-charcoal-100 dark:bg-charcoal-900 px-4 py-3 text-sm font-medium text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-200 dark:hover:bg-charcoal-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  {t('host_logout')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 overflow-y-auto bg-charcoal-50 dark:bg-charcoal-950 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
