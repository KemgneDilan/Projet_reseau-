"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-terracotta-600 mb-6">{t('about_title')}</h1>
          <div className="prose prose-lg text-charcoal-700 dark:text-charcoal-300">
            <p className="mb-4">{t('about_p1')}</p>
            <p className="mb-4">{t('about_p2')}</p>
            <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white mt-8 mb-4">{t('about_vision_title')}</h2>
            <p className="mb-4">{t('about_vision_p')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
