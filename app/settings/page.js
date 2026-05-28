'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Globe, Save, Coins, Info, Mail, MapPin } from 'lucide-react'
import { useTheme } from '@/app/contexts/ThemeContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t, lang, changeLanguage } = useLanguage()
  const { currency, changeCurrency } = useCurrency()
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white">
          {t('nav_settings')}
        </h1>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
          Gérez vos préférences de langue, d'affichage, et consultez les informations légales de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Preference Settings Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
              Préférences utilisateur
            </h2>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-6 w-6 text-terracotta-500" />
                  ) : (
                    <Sun className="h-6 w-6 text-orange-500" />
                  )}
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_appearance')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_theme_desc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    isDarkMode ? 'bg-terracotta-500' : 'bg-charcoal-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Language Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-terracotta-500" />
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_language')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_lang_desc')}
                    </p>
                  </div>
                </div>
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="p-2 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white outline-none shrink-0 text-sm font-medium"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Display Currency Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-terracotta-500" />
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_currency')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_currency_desc')}
                    </p>
                  </div>
                </div>
                <select
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="p-2 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white outline-none shrink-0 text-sm font-medium"
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>

            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-terracotta-500" />
              {t('settings_about_platform')}
            </h2>
            <div className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <div className="bg-charcoal-50 dark:bg-charcoal-950/20 p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-800 mt-2">
                <h3 className="font-semibold text-charcoal-900 dark:text-white mb-1">{t('about_vision_title')}</h3>
                <p className="text-xs text-charcoal-500">{t('about_vision_p')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Headquarters Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-terracotta-500" />
              {t('settings_contact_us')}
            </h2>
            <div className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <p>{t('contact_subtitle')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex gap-3 items-start p-4 bg-charcoal-50 dark:bg-charcoal-950/20 border border-charcoal-200 dark:border-charcoal-800 rounded-xl">
                  <MapPin className="h-5 w-5 text-terracotta-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{t('settings_contact_hq')}</h3>
                    <p className="text-xs text-charcoal-500 mt-1">{t('settings_hq_address')}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-charcoal-50 dark:bg-charcoal-950/20 border border-charcoal-200 dark:border-charcoal-800 rounded-xl">
                  <Mail className="h-5 w-5 text-terracotta-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">Email support</h3>
                    <p className="text-xs text-charcoal-500 mt-1">support@hrs.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => router.push(`/${user.role}`)} className="w-full sm:w-auto font-medium">
            {t('settings_back_dashboard')}
          </Button>
        </div>

      </div>
    </div>
  )
}
