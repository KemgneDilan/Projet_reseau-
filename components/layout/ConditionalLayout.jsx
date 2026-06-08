"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { DashboardLayout } from './DashboardLayout'

export function ConditionalLayout({ children }) {
  const pathname = usePathname()

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
