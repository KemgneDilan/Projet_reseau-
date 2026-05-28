"use client"
import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { DashboardLayout } from './DashboardLayout'

export function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'host') {
      const publicPaths = ['/', '/about', '/contact', '/client/search', '/map']
      if (publicPaths.includes(pathname) || pathname.startsWith('/client/search') || pathname.startsWith('/services')) {
        router.push('/host')
      }
    }
    
    if (user?.role === 'provider') {
      const blockedPaths = ['/', '/about', '/contact', '/client/search', '/map', '/client']
      if (blockedPaths.some(path => pathname.startsWith(path))) {
        router.push('/provider')
      }
    }
  }, [user, pathname, router])

  // Dashboard routes that should use the Sidebar layout instead of standard Navbar/Footer
  const isDashboardRoute = pathname.startsWith('/client') || 
                           pathname.startsWith('/host') || 
                           pathname.startsWith('/provider') || 
                           pathname.startsWith('/admin') ||
                           pathname.startsWith('/settings')

  if (isDashboardRoute) {
    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 mt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}
