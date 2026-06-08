"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { services } from "@/lib/mockData"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { MapPin, Star, Share, Heart, ChevronLeft, MessageSquare, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ReviewSection } from "@/components/ui/ReviewSection"
import { MessagingDrawer } from "@/components/features/MessagingDrawer"
import { useAuth } from "@/app/contexts/AuthContext"

export default function ServicePage() {
  const { id } = useParams()
  const router = useRouter()
  const [isMessagingOpen, setIsMessagingOpen] = React.useState(false)
  const { user } = useAuth()

  const service = services.find(s => s.id === id)
  const [reviews, setReviews] = React.useState(() => {
    try {
      return getReviewsFor('service', id)
    } catch (e) {
      return []
    }
  })

  React.useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail || {}
      if (detail?.targetType === 'service' && String(detail?.targetId) === String(id)) {
        try {
          setReviews(getReviewsFor('service', id))
        } catch (e) {}
      }
    }
    window.addEventListener('hrs:review-added', handler)
    return () => window.removeEventListener('hrs:review-added', handler)
  }, [id])

  if (!service) return <div className="p-8 text-center">Service introuvable</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-terracotta-600">
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {service.category}
            </span>
            <h1 className="text-3xl font-bold text-charcoal-900 mb-2">{service.title}</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex"><Share className="mr-2 h-4 w-4" /> Partager</Button>
            <Button variant="outline" size="sm" className="hidden sm:flex"><Heart className="mr-2 h-4 w-4" /> Sauvegarder</Button>
          </div>
        </div>
          <div className="flex items-center space-x-4 text-sm text-charcoal-600">
          <div className="flex items-center font-semibold text-charcoal-900">
            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
            {(() => {
              try {
                const avg = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || service.rating || 0
                return `${Number(avg).toFixed(1)} (${reviews.length} avis)`
              } catch (e) {
                return `${service.rating} (${service.reviewsCount} avis)`
              }
            })()}
          </div>
        </div>
      </div>

      <div className="h-[40vh] md:h-[50vh] rounded-2xl overflow-hidden mb-10">
        <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-4">À propos de ce service</h2>
            <p className="text-charcoal-700 leading-relaxed">{service.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Inclus dans la prestation</h2>
            <ul className="space-y-3">
              <li className="flex items-start text-charcoal-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <span>Prestation réalisée par un professionnel qualifié et vérifié.</span>
              </li>
              <li className="flex items-start text-charcoal-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <span>Assurance couvrante incluse pour la durée de la prestation.</span>
              </li>
              <li className="flex items-start text-charcoal-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <span>Support client Loomdaah disponible 24/7 en cas de problème.</span>
              </li>
            </ul>
          </section>

          <section className="border-t border-charcoal-100 pt-8">
            <h2 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
              {(() => {
                try {
                  const avg = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || service.rating || 0
                  return `${Number(avg).toFixed(1)} · ${reviews.length} commentaires`
                } catch (e) {
                  return `${service.rating} · ${service.reviewsCount} commentaires`
                }
              })()}
            </h2>
            <ReviewSection reviews={reviews} />
          </section>
        </div>

        {/* Sidebar Réservation */}
        <div className="relative">
          <div className="sticky top-24 bg-white border border-charcoal-200 p-6 rounded-2xl shadow-xl">
            <div className="mb-4">
              <span className="text-2xl font-bold text-charcoal-900">{service.price.toLocaleString()} {service.currency}</span>
              <span className="text-charcoal-500"> / {service.unit}</span>
            </div>

            {user?.role === 'host' || user?.role === 'provider' ? (
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 text-orange-800 dark:text-orange-300 text-sm mb-4">
                <p className="font-semibold mb-1">Espace {user?.role === 'host' ? 'Hôte' : 'Prestataire'}</p>
                <p>En tant que {user?.role === 'host' ? 'hôte' : 'prestataire'}, vous ne pouvez pas commander de services sur la plateforme.</p>
              </div>
            ) : (
              <Button className="w-full h-12 text-lg mb-4">Commander ce service</Button>
            )}
            
            <div className="text-center">
              <p className="text-sm text-charcoal-500 mb-3">Besoin d'un devis personnalisé ?</p>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-terracotta-200 text-terracotta-700 hover:bg-terracotta-50"
                onClick={() => setIsMessagingOpen(true)}
              >
                <MessageSquare className="h-4 w-4" /> Discuter avec le prestataire
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MessagingDrawer 
        isOpen={isMessagingOpen} 
        onClose={() => setIsMessagingOpen(false)} 
        contactName={`Prestataire : ${service.title}`} 
        role="Prestataire" 
      />
    </div>
  )
}
