"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Search, Calendar, Star, Users, Briefcase, Settings, 
  LogOut, Menu, X, LayoutDashboard, CreditCard, Box, MapPin, MessageSquare
} from 'lucide-react'

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  // True by default so the sidebar is visible on load (desktop), can be collapsed by clicking toggle.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const role = user?.role || pathname.split('/')[1]
    
    switch (role) {
      case 'client':
        return [
          { href: '/client', label: t('tab_reservations'), icon: LayoutDashboard },
          { href: '/client/search', label: t('nav_search'), icon: Search },
          { href: '/client#reservations', label: t('tab_reservations'), icon: Calendar },
          { href: '/client#favoris', label: t('tab_favorites'), icon: Star },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      case 'host':
        return [
          { href: '/host', label: t('tab_reservations'), icon: LayoutDashboard },
          { href: '/host/listings/new', label: t('host_new_listing'), icon: PlusIcon },
          { href: '/host#reservations', label: t('host_res_received'), icon: Calendar },
          { href: '/host#finances', label: t('host_finances_title'), icon: CreditCard },
          { href: '/messages', label: t('nav_messages'), icon: MessageSquare },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      case 'provider':
        return [
          { href: '/provider', label: 'Tableau de bord', icon: LayoutDashboard },
          { href: '/provider', label: t('provider_services'), icon: Briefcase },
          { href: '/provider#commandes', label: 'Commandes', icon: Calendar },
          { href: '/provider#finances', label: t('provider_finances_title'), icon: CreditCard },
          { href: '/messages', label: t('nav_messages'), icon: MessageSquare },
          { href: '/settings', label: t('nav_settings'), icon: Settings },
        ]
      case 'admin':
        return [
          { href: '/admin', label: 'Vue globale', icon: LayoutDashboard },
          { href: '/admin#users', label: 'Utilisateurs', icon: Users },
          { href: '/admin#annonces', label: 'Annonces', icon: Home },
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

  const links = getSidebarLinks()
  const router = useRouter()

  return (
    <div className="flex h-screen bg-charcoal-50 dark:bg-charcoal-950 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Collapsible Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-charcoal-900 border-r border-charcoal-200 dark:border-charcoal-800 transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0 ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:border-none"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-charcoal-200 dark:border-charcoal-800 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-terracotta-500 p-1.5 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-charcoal-900 dark:text-white">
              H&R&S
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    // Only auto-close on mobile screen sizes
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false)
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 font-medium"
                      : "text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
                  }`}
                >
                  <link.icon className={`h-5 w-5 ${isActive ? "text-terracotta-500" : ""}`} />
                  <span className="truncate">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-charcoal-200 dark:border-charcoal-800 shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-50 dark:hover:bg-charcoal-800 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('host_logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle is always visible on all screens */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white p-1 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-charcoal-500 dark:text-charcoal-400 font-semibold uppercase tracking-wider">
                Interface
              </span>
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-white capitalize leading-none">
                {user?.role === 'provider' ? 'Prestataire' : user?.role === 'host' ? t('host_dashboard') : user?.role || 'Utilisateur'}
              </h2>
            </div>
          </div>

          {/* User profile actions (No notification bell and no currency selection) */}
          <div className="flex items-center gap-4">
            {/* Global back button for provider pages */}
            {user?.role === 'provider' && (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                aria-label="Retour"
              >
                <svg className="h-4 w-4 text-charcoal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}

            <Link href="/settings" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-charcoal-50 dark:bg-charcoal-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
