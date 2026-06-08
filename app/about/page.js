"use client"
import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Users,
  Star,
  ArrowRight,
  Send,
  CheckCircle,
  Home,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/Button"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
})

export default function AboutPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [sent, setSent] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simule un envoi
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  const features = [
    {
      icon: Home,
      color: "terracotta",
      title: "Hébergements de qualité",
      desc: "Des chambres d'hôtes, villas et appartements soigneusement sélectionnés partout au Cameroun et en Afrique centrale.",
    },
    {
      icon: Briefcase,
      color: "blue",
      title: "Services premium",
      desc: "Chefs culinaires, chauffeurs privés, guides touristiques… tous nos prestataires sont vérifiés et notés par la communauté.",
    },
    {
      icon: Shield,
      color: "green",
      title: "Sécurité & confiance",
      desc: "Chaque hôte et prestataire passe par un processus de vérification rigoureux avant d'être référencé sur la plateforme.",
    },
    {
      icon: Zap,
      color: "yellow",
      title: "Réservation instantanée",
      desc: "Confirmez votre réservation en quelques clics avec un paiement sécurisé multi-devises (XAF, EUR, USD…).",
    },
    {
      icon: Globe,
      color: "purple",
      title: "Multi-langues & devises",
      desc: "L'interface est disponible en français et en anglais. Les prix s'affichent dans votre devise préférée.",
    },
    {
      icon: Users,
      color: "orange",
      title: "Support 24/7",
      desc: "Notre équipe est disponible à toute heure pour répondre à vos questions et résoudre vos problèmes.",
    },
  ]

  const contacts = [
    {
      icon: Mail,
      label: "Email général",
      value: "info@loomdaah.com",
      href: "mailto:info@loomdaah.com",
      color: "terracotta",
    },
    {
      icon: Mail,
      label: "Support client",
      value: "support@loomdaah.com",
      href: "mailto:support@loomdaah.com",
      color: "terracotta",
    },
    {
      icon: Mail,
      label: "Partenariats & hôtes",
      value: "partners@loomdaah.com",
      href: "mailto:partners@loomdaah.com",
      color: "terracotta",
    },
    {
      icon: Phone,
      label: "Téléphone",
      value: "+237 6 00 00 00 00",
      href: "tel:+237600000000",
      color: "charcoal",
    },
    {
      icon: MessageSquare,
      label: "WhatsApp",
      value: "+237 6 00 00 00 00",
      href: "https://wa.me/237600000000",
      color: "green",
    },
    {
      icon: MapPin,
      label: "Adresse",
      value: "Melen, Yaoundé, Cameroun",
      href: null,
      color: "charcoal",
    },
  ]

  const colorMap = {
    terracotta: {
      bg: "bg-terracotta-100 dark:bg-terracotta-900/30",
      icon: "text-terracotta-600",
      text: "text-terracotta-600 hover:underline",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      icon: "text-blue-600",
      text: "text-blue-600 hover:underline",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: "text-green-600",
      text: "text-green-600 hover:underline",
    },
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: "text-yellow-600",
      text: "",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      icon: "text-purple-600",
      text: "",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      icon: "text-orange-600",
      text: "",
    },
    charcoal: {
      bg: "bg-charcoal-100 dark:bg-charcoal-700",
      icon: "text-charcoal-600 dark:text-charcoal-300",
      text: "text-charcoal-600 dark:text-charcoal-400",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950">
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 md:py-36">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/75 to-charcoal-900/85" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-2 bg-terracotta-500/20 border border-terracotta-400/40 rounded-full"
          >
            <span className="text-terracotta-300 text-sm font-semibold">
              ✨ À propos de Loomdaah
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            La plateforme qui{" "}
            <span className="bg-gradient-to-r from-terracotta-400 to-orange-400 bg-clip-text text-transparent">
              réunit tout
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg md:text-xl text-charcoal-100 max-w-2xl mx-auto"
          >
            Loomdaah est la première plateforme unifiée d'hébergement et de
            services en Afrique centrale. Hébergements, chefs, guides,
            chauffeurs — tout en un seul endroit.
          </motion.p>
        </div>
      </section>

      {/* ── PLATEFORME INFO ───────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal-900 dark:text-white mb-4">
              Pourquoi choisir Loomdaah ?
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto text-lg">
              Une expérience pensée pour les voyageurs, les hôtes et les
              prestataires de services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const c = colorMap[f.color]
              return (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.08)}
                  className="bg-charcoal-50 dark:bg-charcoal-800 rounded-2xl p-8 border border-charcoal-100 dark:border-charcoal-700 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-xl mb-5 flex items-center justify-center ${c.bg}`}>
                    <f.icon className={`w-7 h-7 ${c.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 dark:text-white mb-3">
                    {f.title}
                  </h3>
                  <p className="text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-terracotta-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "10K+", l: "Logements" },
            { n: "50K+", l: "Utilisateurs" },
            { n: "1 000+", l: "Prestataires" },
            { n: "4.8 ★", l: "Note moyenne" },
          ].map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}>
              <p className="text-4xl font-bold text-terracotta-400 mb-2">{s.n}</p>
              <p className="text-white/70">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONTACT + MESSAGE ─────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal-900 dark:text-white mb-4">
              Contactez-nous
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto text-lg">
              Notre équipe est à votre disposition pour toute question,
              suggestion ou demande de partenariat
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ── Coordonnées ── */}
            <motion.div {...fadeUp(0.1)} className="space-y-4">
              <h3 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">
                Nos coordonnées
              </h3>
              {contacts.map((c, i) => {
                const col = colorMap[c.color]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white dark:bg-charcoal-800 p-5 rounded-2xl border border-charcoal-100 dark:border-charcoal-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`p-3 rounded-full shrink-0 ${col.bg}`}>
                      <c.icon className={`h-5 w-5 ${col.icon}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide">
                        {c.label}
                      </p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className={`font-medium ${col.text}`}
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="font-medium text-charcoal-700 dark:text-charcoal-300">
                          {c.value}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* ── Formulaire ── */}
            <motion.div {...fadeUp(0.2)}>
              <h3 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">
                Laissez-nous un message
              </h3>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-80 bg-white dark:bg-charcoal-800 rounded-2xl border border-charcoal-100 dark:border-charcoal-700 shadow-xl p-10 text-center"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h4 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-2">
                    Message envoyé !
                  </h4>
                  <p className="text-charcoal-600 dark:text-charcoal-400">
                    Merci pour votre message. Notre équipe vous répondra dans
                    les plus brefs délais.
                  </p>
                  <Button
                    className="mt-6"
                    variant="outline"
                    onClick={() => { setSent(false); setFormData({ name: "", email: "", subject: "", message: "" }) }}
                  >
                    Envoyer un autre message
                  </Button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white dark:bg-charcoal-800 p-8 rounded-2xl shadow-xl border border-charcoal-100 dark:border-charcoal-700 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                        Nom complet <span className="text-terracotta-500">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className="w-full p-3 rounded-xl border border-charcoal-200 dark:border-charcoal-600 bg-charcoal-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                        Adresse email <span className="text-terracotta-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.com"
                        className="w-full p-3 rounded-xl border border-charcoal-200 dark:border-charcoal-600 bg-charcoal-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Sujet
                    </label>
                    <input
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Demande d'information, partenariat…"
                      className="w-full p-3 rounded-xl border border-charcoal-200 dark:border-charcoal-600 bg-charcoal-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Votre message <span className="text-terracotta-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail…"
                      className="w-full p-3 rounded-xl border border-charcoal-200 dark:border-charcoal-600 bg-charcoal-50 dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none transition resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Envoi en cours…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA bas de page ──────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-charcoal-950 border-t border-charcoal-100 dark:border-charcoal-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()}>
            <Star className="h-10 w-10 text-terracotta-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-charcoal-900 dark:text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 mb-8">
              Rejoignez des milliers de voyageurs et de prestataires qui font
              confiance à Loomdaah.
            </p>
            <Link href="/login">
              <Button size="xl" className="rounded-full shadow-xl">
                Créer un compte gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
