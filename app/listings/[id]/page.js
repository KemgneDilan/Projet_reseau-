"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { listings, reviews as allReviews } from "@/lib/mockData"
import { MapPin, Star, Share, Heart, ChevronLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { ReviewSection } from "@/components/ui/ReviewSection"
import { MessagingDrawer } from "@/components/features/MessagingDrawer"

export default function ListingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isMessagingOpen, setIsMessagingOpen] = React.useState(false)

  // Dans une vraie app, on ferait un fetch API
  const listing = listings.find(l => l.id === id)
  const reviews = allReviews.filter(r => r.targetId === id)

  if (!listing) return <div className="p-8 text-center">Logement introuvable</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-terracotta-600">
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">{listing.title}</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex"><Share className="mr-2 h-4 w-4" /> Partager</Button>
            <Button variant="outline" size="sm" className="hidden sm:flex"><Heart className="mr-2 h-4 w-4" /> Sauvegarder</Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-charcoal-600">
          <div className="flex items-center font-semibold text-charcoal-900">
            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
            {listing.rating} ({listing.reviewsCount} avis)
          </div>
          <span>•</span>
          <div className="flex items-center underline">
            <MapPin className="h-4 w-4 mr-1" />
            {listing.location}
          </div>
        </div>
      </div>

      {/* Galerie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-10">
        <div className="h-full">
          <img src={listing.images[0]} alt="Principal" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <img src={listing.images[1] || listing.images[0]} alt="Détail 1" className="w-full h-full object-cover" />
          <img src={listing.images[0]} alt="Détail 2" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-4">À propos de ce logement</h2>
            <p className="text-charcoal-700 leading-relaxed">{listing.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Équipements</h2>
            <div className="grid grid-cols-2 gap-4">
              {listing.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-charcoal-700">
                  <div className="h-2 w-2 bg-terracotta-500 rounded-full" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Localisation ({listing.city})</h2>
            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-charcoal-200">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=MOCK_API_KEY&q=${encodeURIComponent(listing.location)},+Cameroun`}
              ></iframe>
            </div>
            <p className="text-xs text-charcoal-400 mt-2 text-right">L'intégration utilise une URL Iframe Google Maps (Mode développement)</p>
          </section>

          <section className="border-t border-charcoal-100 pt-8">
            <h2 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
              {listing.rating} · {listing.reviewsCount} commentaires
            </h2>
            <ReviewSection reviews={reviews} />
          </section>
        </div>

        {/* Sidebar Réservation */}
        <div className="relative">
          <div className="sticky top-24 bg-white border border-charcoal-200 p-6 rounded-2xl shadow-xl">
            <div className="mb-4">
              <span className="text-2xl font-bold text-charcoal-900">{listing.price.toLocaleString()} {listing.currency}</span>
              <span className="text-charcoal-500"> / nuit</span>
            </div>

            <Button className="w-full h-12 text-lg mb-4">Réserver</Button>
            
            <div className="text-center">
              <p className="text-sm text-charcoal-500 mb-3">Une question sur ce logement ?</p>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-terracotta-200 text-terracotta-700 hover:bg-terracotta-50"
                onClick={() => setIsMessagingOpen(true)}
              >
                <MessageSquare className="h-4 w-4" /> Contacter l'hôte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MessagingDrawer 
        isOpen={isMessagingOpen} 
        onClose={() => setIsMessagingOpen(false)} 
        contactName={`Hôte de ${listing.title}`} 
        role="Hôte" 
      />
    </div>
  )
}
