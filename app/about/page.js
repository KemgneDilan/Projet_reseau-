"use client"
import * as React from "react"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-terracotta-600 mb-6">À propos de H&R&S</h1>
        <div className="prose prose-lg text-charcoal-700">
          <p className="mb-4">
            Houses & Rooms & Services (H&R&S) est la plateforme de référence au Cameroun pour la location de 
            chambres d'hôtes premium, d'appartements de haut-standing, et la réservation de services exclusifs.
          </p>
          <p className="mb-4">
            Notre mission est de connecter des voyageurs exigeants avec des hôtes locaux passionnés et des prestataires 
            de services de qualité (chauffeurs, cuisiniers, guides), afin d'offrir une expérience de séjour inoubliable.
          </p>
          <h2 className="text-2xl font-bold text-charcoal-900 mt-8 mb-4">Notre Vision</h2>
          <p className="mb-4">
            Nous croyons que chaque séjour devrait être unique. C'est pourquoi nous avons créé une marketplace 
            transparente et sécurisée, où la confiance et la qualité sont au centre de chaque interaction.
          </p>
          <h2 className="text-2xl font-bold text-charcoal-900 mt-8 mb-4">Conditions d'Utilisation</h2>
          <p>
            Cette page est un espace réservé. Les conditions générales d'utilisation complètes seront publiées ici prochainement.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
