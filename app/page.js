"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Search, Star, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { listings } from "@/lib/mockData"
import { Card, CardContent } from "@/components/ui/Card"

export default function Home() {
  const featuredListings = listings.slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80")' }}
        />
        <div className="absolute inset-0 bg-charcoal-900/60 z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Découvrez des lieux exceptionnels, <br className="hidden md:block"/>
            Vivez des expériences uniques.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-charcoal-100 mb-10 max-w-2xl mx-auto"
          >
            La première plateforme alliant hébergements de prestige et services sur-mesure (chefs, guides, chauffeurs) pour un séjour inoubliable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl hover:scale-105 transition-transform">
                Commencer l'expérience <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Notre Sélection Premium</h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">Explorez nos logements les mieux notés, certifiés pour leur qualité et leur confort exceptionnel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{listing.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 text-charcoal-500 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location}</span>
                    </div>
                    <h3 className="font-semibold text-lg text-charcoal-900 mb-2 truncate">{listing.title}</h3>
                    <p className="text-terracotta-600 font-bold text-lg">
                      {listing.price.toLocaleString()} {listing.currency} <span className="text-charcoal-400 text-sm font-normal">/ nuit</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full">
                Voir tous les logements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">Pourquoi choisir H&R&S ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-terracotta-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Une offre complète</h3>
              <p className="text-charcoal-500">Trouvez non seulement votre hébergement, mais aussi tous les services nécessaires à votre séjour.</p>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-terracotta-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualité certifiée</h3>
              <p className="text-charcoal-500">Chaque hôte et prestataire est vérifié par nos soins pour garantir une expérience sans faille.</p>
            </div>
            <div>
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-terracotta-500">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Paiement local</h3>
              <p className="text-charcoal-500">Payez facilement via Mobile Money (Orange, MTN) ou carte bancaire de manière sécurisée.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
