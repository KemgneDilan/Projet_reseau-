"use client"
import * as React from "react"
import Link from "next/link"
import { Home, Search, MessageSquare, Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/lib/auth"

export function Navbar() {
  const { user, logout, isLoading } = useAuth()

  const getDashboardLink = () => {
    if (!user) return "/login"
    return `/${user.role}`
  }

  return (
    <nav className="fixed top-0 w-full z-40 glass shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-terracotta-500 text-white p-2 rounded-lg">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-terracotta-900 hidden sm:block">H&R&S</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isLoading && user ? (
              <>
                <Link href={getDashboardLink()}>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Mon Espace ({user.role})
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5 text-charcoal-700" />
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
                <div className="flex items-center space-x-2 ml-2">
                  <div className="h-8 w-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-bold border border-terracotta-200">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-charcoal-900 hidden md:block">{user.username}</span>
                </div>
                <Button variant="ghost" size="icon" title="Déconnexion" onClick={logout} className="ml-2">
                  <LogOut className="h-5 w-5 text-charcoal-500" />
                </Button>
              </>
            ) : !isLoading ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button className="hidden sm:flex">Inscription</Button>
                </Link>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}

