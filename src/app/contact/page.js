"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function ContactPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-linear-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-charcoal-900 dark:text-white mb-4">{t('contact_title')}</h1>
          <p className="text-lg text-charcoal-600 dark:text-charcoal-400 mb-12">{t('contact_subtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-charcoal-800 p-6 rounded-2xl shadow-sm border border-charcoal-100 dark:border-charcoal-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-terracotta-100 dark:bg-terracotta-900/30 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-terracotta-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{t('contact_email_general')}</h3>
                    <a href="mailto:info@hrs.com" className="text-terracotta-600 hover:underline">info@hrs.com</a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-terracotta-100 dark:bg-terracotta-900/30 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-terracotta-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{t('contact_email_support')}</h3>
                    <a href="mailto:support@hrs.com" className="text-terracotta-600 hover:underline">support@hrs.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-terracotta-100 dark:bg-terracotta-900/30 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-terracotta-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{t('contact_email_partners')}</h3>
                    <a href="mailto:partners@hrs.com" className="text-terracotta-600 hover:underline">partners@hrs.com</a>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-charcoal-800 p-6 rounded-2xl shadow-sm border border-charcoal-100 dark:border-charcoal-700">
                 <div className="flex items-center gap-4 mb-4">
                  <div className="bg-charcoal-100 dark:bg-charcoal-700 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-charcoal-700 dark:text-charcoal-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">Téléphone</h3>
                    <a href="tel:+237600000000" className="text-charcoal-600 dark:text-charcoal-400">+237 6 00 00 00 00</a>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                  <div className="bg-charcoal-100 dark:bg-charcoal-700 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-charcoal-700 dark:text-charcoal-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">Adresse</h3>
                    <p className="text-charcoal-600 dark:text-charcoal-400">Melen, Yaoundé, Cameroun</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-charcoal-800 p-8 rounded-2xl shadow-xl">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    {t('contact_form_name')}
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    {t('contact_form_email')}
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    {t('contact_form_message')}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none"
                  ></textarea>
                </div>
                <Button className="w-full" size="lg">
                  {t('contact_form_send')}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
