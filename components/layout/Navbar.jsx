"use client"
import * as React from "react"
import Link from "next/link"
import { Home, Search, MessageSquare, Menu, User, LogOut, Heart, Calendar, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/app/contexts/AuthContext"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { motion } from "framer-motion"
import { MiniChat } from "@/components/features/MiniChat"

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const { t, lang } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const [isMiniChatOpen, setIsMiniChatOpen] = React.useState(false)

  const navigationLinks = [
    { href: "/", label: t('nav_home'), id: 'home' },
    { href: "/client/search", label: t('nav_search'), id: 'search' },
    { href: "/map", label: t('nav_map'), id: 'map' },
  ]

  const userMenuItems = [
    { label: t('nav_profile'), icon: User, href: `/${user?.role}` },
    { label: t('nav_reservations'), icon: Calendar, href: `/${user?.role}` },
    { label: t('nav_messages'), icon: MessageSquare, href: `/messages` },
    { label: t('nav_settings'), icon: Settings, href: `/settings` },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-terracotta-500 to-orange-500 text-white p-2 rounded-lg">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 to-orange-600 hidden sm:block">
                Loomdaah
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link key={link.id} href={link.href}>
                <Button variant="ghost" className="rounded-lg">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden sm:flex items-center gap-2 relative">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-charcoal-100"
                      onClick={() => setIsMiniChatOpen(true)}
                    >
                      <MessageSquare className="h-5 w-5 text-charcoal-700" />
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    </Button>
                    <MiniChat isOpen={isMiniChatOpen} onClose={() => setIsMiniChatOpen(false)} />
                  </div>

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-charcoal-900 hidden lg:block max-w-[100px] truncate">
                        {user.username}
                      </span>
                      <ChevronDown className="h-4 w-4 text-charcoal-500" />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-charcoal-200 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-charcoal-200">
                          <p className="text-xs text-charcoal-600 font-semibold">{t('nav_logged_as')}</p>
                          <p className="text-sm font-bold text-charcoal-900 mt-1">{user.username}</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">{t('nav_role')}: {user.role}</p>
                        </div>

                        <div className="py-2">
                          {userMenuItems.map((item) => (
                            <Link key={item.label} href={item.href}>
                              <button
                                onClick={() => setIsUserMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                              >
                                <item.icon className="h-4 w-4 text-terracotta-500" />
                                {item.label}
                              </button>
                            </Link>
                          ))}
                        </div>

                        <div className="px-4 py-3 border-t border-charcoal-200">
                          <Button
                            onClick={logout}
                            variant="destructive"
                            className="w-full justify-center"
                            size="sm"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {t('nav_logout')}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : !isLoading ? (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost">{t('nav_login')}</Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button className="rounded-full">{t('nav_register')}</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-charcoal-200 bg-charcoal-50 py-4 space-y-2"
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-lg"
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {!user && !isLoading && (
              <div className="pt-4 border-t border-charcoal-200 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    {t('nav_login')}
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full">{t('nav_register')}</Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-4 border-t border-charcoal-200 space-y-2">
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav_logout')}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}
