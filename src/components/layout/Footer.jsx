"use client"
import Link from "next/link"
import { Mail, Phone, MapPin, Share2, Home } from "lucide-react"

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

import { useLanguage } from "@/app/contexts/LanguageContext"

export function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-900 text-charcoal-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-linear-to-br from-terracotta-500 to-orange-500 text-white p-2 rounded-lg">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Loomdaah</span>
            </div>
            <p className="text-charcoal-400 text-sm mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              {[
                { icon: Share2, href: "#" },
                { icon: TwitterIcon, href: "#" },
                { icon: InstagramIcon, href: "#" },
                { icon: LinkedinIcon, href: "#" },
              ].map((social, idx) => (
                <Link key={idx} href={social.href}>
                  <button className="p-2 rounded-lg bg-charcoal-800 hover:bg-terracotta-500 transition-colors">
                    <social.icon className="h-5 w-5" />
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer_nav')}</h4>
            <ul className="space-y-2 text-charcoal-400 text-sm">
              <li>
                <Link href="/" className="hover:text-terracotta-400 transition-colors">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link href="/client/search" className="hover:text-terracotta-400 transition-colors">
                  {t('nav_search')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-terracotta-400 transition-colors">
                  {t('nav_map')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-terracotta-400 transition-colors">
                  {t('nav_about')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-terracotta-400 transition-colors">
                  {t('footer_blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer_support')}</h4>
            <ul className="space-y-2 text-charcoal-400 text-sm">
              <li>
                <Link href="/help" className="hover:text-terracotta-400 transition-colors">
                  {t('footer_help')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-terracotta-400 transition-colors">
                  {t('nav_contact')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-terracotta-400 transition-colors">
                  {t('footer_faq')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-terracotta-400 transition-colors">
                  {t('footer_terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-terracotta-400 transition-colors">
                  {t('footer_privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer_contact_us')}</h4>
            <ul className="space-y-3 text-charcoal-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-terracotta-500 shrink-0 mt-0.5" />
                <span>Melen, Yaoundé, Cameroun</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-terracotta-500 shrink-0" />
                <a href="tel:+237600000000" className="hover:text-terracotta-400 transition-colors">
                  +237 6 00 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-terracotta-500 shrink-0" />
                <a href="mailto:info@hrs.com" className="hover:text-terracotta-400 transition-colors">
                  info@hrs.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-charcoal-400 text-sm">
            <p>
              © {currentYear} Loomdaah. {t('footer_rights')}
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-terracotta-400 transition-colors">
                {t('footer_terms')}
              </Link>
              <Link href="/privacy" className="hover:text-terracotta-400 transition-colors">
                {t('footer_privacy')}
              </Link>
              <Link href="/cookies" className="hover:text-terracotta-400 transition-colors">
                {t('footer_cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
