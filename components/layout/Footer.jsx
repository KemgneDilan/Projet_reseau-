import * as React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-charcoal-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-charcoal-900">À propos</h4>
            <ul className="space-y-2 text-sm text-charcoal-500">
              <li><Link href="#" className="hover:text-terracotta-500">Qui sommes-nous ?</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Carrières</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Investisseurs</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-charcoal-900">Communauté</h4>
            <ul className="space-y-2 text-sm text-charcoal-500">
              <li><Link href="#" className="hover:text-terracotta-500">Diversité et intégration</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Accessibilité</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Partenaires</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-charcoal-900">Hôtes & Prestataires</h4>
            <ul className="space-y-2 text-sm text-charcoal-500">
              <li><Link href="#" className="hover:text-terracotta-500">Devenir hôte</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Proposer un service</Link></li>
              <li><Link href="#" className="hover:text-terracotta-500">Ressources</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-charcoal-900">Assistance</h4>
            <ul className="space-y-2 text-sm text-charcoal-500">
              <li><Link href="/about" className="hover:text-terracotta-500 transition-colors">Centre d&apos;aide</Link></li>
              <li><Link href="/about" className="hover:text-terracotta-500 transition-colors">À propos d&apos;H&R&S</Link></li>
              <li><Link href="/about" className="hover:text-terracotta-500 transition-colors">Conditions d&apos;utilisation</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-charcoal-100 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-charcoal-500">
            © 2026 Houses & Rooms & Services, Inc. Tous droits réservés.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm text-charcoal-500">
            <Link href="#" className="hover:text-terracotta-500">Confidentialité</Link>
            <Link href="#" className="hover:text-terracotta-500">Conditions</Link>
            <Link href="#" className="hover:text-terracotta-500">Plan du site</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
