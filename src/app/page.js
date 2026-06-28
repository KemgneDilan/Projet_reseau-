"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Award,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ListingCard } from "@/components/features/ListingCard"
import { listings } from "@/lib/mockData"
import { services } from "@/lib/mockData"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'

export default function Home() {
  const featuredListings = listings.slice(0, 6)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/70 via-charcoal-900/60 to-charcoal-900/50 z-10" />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-2 bg-terracotta-500/20 border border-terracotta-400/40 rounded-full"
          >
            <span className="text-terracotta-300 text-sm font-semibold">
              ✨ Bienvenue sur Loomdaah
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-sm"
          >
            Ta maison est chez moi
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-charcoal-100 mb-12 max-w-2xl mx-auto drop-shadow-sm"
          >
            Vivez des experiences uniques et exceptionnelles en famille
          </motion.p>


          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button
                size="xl"
                className="rounded-full shadow-xl hover:shadow-2xl"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline" className="rounded-full">
                En savoir plus
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-charcoal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Logements" },
              { number: "50K+", label: "Utilisateurs" },
              { number: "1000+", label: "Prestataires" },
              { number: "4.8★", label: "Note moyenne" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <p className="text-4xl font-bold text-terracotta-600 mb-2">
                  {stat.number}
                </p>
                <p className="text-charcoal-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-charcoal-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
              Pourquoi choisir Loomdaah ?
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto text-lg">
              Une plateforme complète pensée pour offrir la meilleure expérience
              à nos utilisateurs
            </p>
          </motion.div>

          <div className="overflow-hidden relative w-full py-4">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-charcoal-50 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-charcoal-50 to-transparent z-10" />

            {/* Défilement continu horizontal (Marquee) */}
            <motion.div
              className="flex gap-8 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            >
              {(() => {
                const features = [
                  { icon: MapPin, title: "Une offre complète", description: "Trouvez votre hébergement et tous les services nécessaires en un seul endroit.", color: "terracotta" },
                  { icon: ShieldCheck, title: "Sécurité garantie", description: "Tous nos partenaires sont vérifiés pour assurer votre tranquillité d'esprit.", color: "green" },
                  { icon: Zap, title: "Réservation rapide", description: "Confirmez votre réservation en quelques clics, paiement sécurisé en ligne.", color: "yellow" },
                  { icon: Globe, title: "Multi-devises", description: "Payez dans votre devise préférée avec conversion automatique.", color: "blue" },
                  { icon: Users, title: "Support 24/7", description: "Notre équipe est toujours disponible pour répondre à vos questions.", color: "purple" },
                  { icon: TrendingUp, title: "Système de notation", description: "Lisez les avis vérifiés des utilisateurs pour faire le meilleur choix.", color: "orange" }
                ];
                return [...features, ...features].map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-charcoal-900 rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-charcoal-100 dark:border-charcoal-800 w-[350px] md:w-[400px] shrink-0 whitespace-normal"
                  >
                    <div className={`w-14 h-14 rounded-lg mb-4 flex items-center justify-center bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                      <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-charcoal-600 dark:text-charcoal-400">{feature.description}</p>
                  </div>
                ));
              })()}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
              Nos meilleures sélections
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Découvrez les logements les plus appréciés de nos clients
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing, idx) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ListingCard
                  {...listing}
                  onFavorite={(id, fav) =>
                    console.log(`Listing ${id} favorited: ${fav}`)
                  }
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full">
                Explorez plus de logements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-24 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
              Nos services premium
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Complétez votre séjour avec nos services exclusifs : chauffeurs, chefs privés, guides touristiques, et bien plus
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-charcoal-100"
              >
                <div className="h-48 overflow-hidden bg-charcoal-200 relative">
                  {service.images && service.images[0] ? (
                    <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-100 to-orange-100">
                      <span className="text-charcoal-400">Service</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-semibold text-charcoal-900 shadow">
                    {service.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-charcoal-900">
                        {(() => {
                          try {
                            const reviews = getReviewsFor('service', service.id)
                            const avg = calculateAverageRating(reviews.map(r => ({ rating: r.rating })))
                            return (avg || service.rating || 0).toFixed(1)
                          } catch (e) {
                            return (service.rating || 0).toFixed(1)
                          }
                        })()}
                      </span>
                    </div>
                    <span className="font-bold text-terracotta-600">
                      {service.price} XAF
                    </span>
                  </div>
                  <Link href="/login">
                    <Button size="sm" className="w-full">
                      Réserver ce service
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full">
                Explorer tous les services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      <section className="py-24 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
              Comment ça marche ?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Recherchez",
                description: "Trouvez votre hébergement idéal",
              },
              {
                step: "2",
                title: "Réservez",
                description: "Confirmez votre réservation en ligne",
              },
              {
                step: "3",
                title: "Payez",
                description: "Paiement sécurisé et multi-devises",
              },
              {
                step: "4",
                title: "Profitez",
                description: "Vivez une expérience inoubliable",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta-500 text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-charcoal-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-terracotta-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt pour l'aventure ?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Rejoignez des milliers de voyageurs satisfaits et réservez dès
              maintenant
            </p>
            <Link href="/login">
              <Button
                size="xl"
                className="bg-terracotta-500 hover:bg-terracotta-600 rounded-full"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
