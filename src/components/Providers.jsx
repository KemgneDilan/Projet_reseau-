'use client'

import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { CurrencyProvider } from '@/app/contexts/CurrencyContext'
import SeedReviewsClient from './SeedReviewsClient'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <SeedReviewsClient />
            {children}
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
