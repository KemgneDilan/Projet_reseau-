"use client"
import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Utensils,
  Dumbbell,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MessageSquare,
  Bed,
  Bath,
  Wind,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { listings } from "@/lib/mockData"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { MessagingDrawer } from "@/components/features/MessagingDrawer"

import { useAuth } from "@/app/contexts/AuthContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrency()
  const listing = listings.find((l) => l.id === parseInt(id)) || listings[0]
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMessagingOpen, setIsMessagingOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [guests, setGuests] = useState(1)
  
  // Favorites Logic
  const [isFavorited, setIsFavorited] = useState(false)
  React.useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('hrs_favorites') || '[]')
    if (savedFavs.includes(listing.id)) {
      setIsFavorited(true)
    }
  }, [listing.id])

  const toggleFavorite = () => {
    const savedFavs = JSON.parse(localStorage.getItem('hrs_favorites') || '[]')
    if (isFavorited) {
      const newFavs = savedFavs.filter(id => id !== listing.id)
      localStorage.setItem('hrs_favorites', JSON.stringify(newFavs))
      setIsFavorited(false)
    } else {
      savedFavs.push(listing.id)
      localStorage.setItem('hrs_favorites', JSON.stringify(savedFavs))
      setIsFavorited(true)
    }
  }

  // Reviews Logic
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [reviews, setReviews] = useState(() => {
    try {
      return getReviewsFor('listing', listing.id)
    } catch (e) {
      return []
    }
  })

  React.useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail || {}
      if (detail?.targetType === 'listing' && String(detail?.targetId) === String(listing.id)) {
        try {
          setReviews(getReviewsFor('listing', listing.id))
        } catch (e) {}
      }
    }
    window.addEventListener('hrs:review-added', handler)
    return () => window.removeEventListener('hrs:review-added', handler)
  }, [listing.id])

  const handleAddReview = (e) => {
    e.preventDefault()
    if (userRating === 0) {
      return alert("Veuillez sélectionner une note.")
    }
    const newReview = {
      id: Date.now(),
      user: "Moi",
      rating: userRating,
      text: userComment
    }
    const savedReviews = JSON.parse(localStorage.getItem(`hrs_reviews_${listing.id}`) || '[]')
    savedReviews.push(newReview)
    localStorage.setItem(`hrs_reviews_${listing.id}`, JSON.stringify(savedReviews))
    
    setReviews([newReview, ...reviews])
    setUserRating(0)
    setUserComment("")
  }

  const images = listing.images || [
    listing.image,
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505873242700-f289a29e7e0f?auto=format&fit=crop&w=800&q=80",
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleReservation = (e) => {
    e.preventDefault()
    console.log("Réservation:", { startDate, endDate, guests })
    // Rediriger vers la page de paiement
  }

  const calculateNights = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const totalPrice = nights * listing.price

  return (
    <div className="min-h-screen bg-charcoal-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-charcoal-600 mb-6"
        >
          <Link href="/client/search" className="hover:text-terracotta-600 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Recherche
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-semibold">{listing.title}</span>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="relative h-96 md:h-[32rem] bg-charcoal-200">
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-charcoal-900" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
                >
                  <ChevronRight className="h-6 w-6 text-charcoal-900" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all">
                <Share2 className="h-5 w-5 text-charcoal-900" />
              </button>
              <button
                onClick={toggleFavorite}
                className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-charcoal-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Header Info */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="h-5 w-5 text-terracotta-500" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 py-4 border-y border-charcoal-200">
                {(() => {
                  try {
                    const avg = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || listing.rating
                    const count = reviews.length || listing.reviews || listing.reviewsCount
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(avg) ? "fill-yellow-400 text-yellow-400" : "text-charcoal-300"}`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-charcoal-900">{Number(avg).toFixed(1)}</span>
                        <span className="text-charcoal-600">({count} avis)</span>
                      </>
                    )
                  } catch (e) {
                    return null
                  }
                })()}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">
                À propos de ce logement
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-6">
                {listing.description || "Découvrez cette magnifique propriété avec vue exceptionnelle. Idéale pour les couples ou les petits groupes, elle offre tout le confort nécessaire pour un séjour inoubliable."}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-charcoal-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta-100 rounded-lg">
                    <Bed className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-600">Chambres</p>
                    <p className="font-semibold text-charcoal-900">2</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta-100 rounded-lg">
                    <Bath className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-600">Salles de bain</p>
                    <p className="font-semibold text-charcoal-900">2</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta-100 rounded-lg">
                    <Users className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-600">Hôtes</p>
                    <p className="font-semibold text-charcoal-900">4</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-terracotta-100 rounded-lg">
                    <Wind className="h-5 w-5 text-terracotta-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-600">Surface</p>
                    <p className="font-semibold text-charcoal-900">120m²</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <h3 className="font-bold text-charcoal-900 mb-4">Équipements populaires</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Wifi, label: "WiFi gratuit" },
                    { icon: Utensils, label: "Cuisine équipée" },
                    { icon: Users, label: "Espace de vie" },
                    { icon: Calendar, label: "Séjour flexible" },
                    { icon: Dumbbell, label: "Salle de gym" },
                    { icon: MessageSquare, label: "Support 24/7" },
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg">
                        <amenity.icon className="h-5 w-5 text-terracotta-600" />
                      </div>
                      <span className="text-sm text-charcoal-700 font-medium">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">
                Ajouter un avis
              </h2>
              <form onSubmit={handleAddReview} className="mb-8 space-y-4 bg-charcoal-50 dark:bg-charcoal-800 p-4 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Note :</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-charcoal-300 dark:text-charcoal-600"
                        }`}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="w-full p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none min-h-[100px]"
                  required
                />
                <Button type="submit">Publier mon avis</Button>
              </form>

              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">
                Avis des clients
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-charcoal-200 dark:border-charcoal-700 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">
                        {review.user.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-charcoal-900 dark:text-white">
                            {review.user}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-charcoal-300 dark:text-charcoal-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-charcoal-600 dark:text-charcoal-400 text-sm">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">
                Voir tous les avis
              </Button>
            </div>
          </motion.div>

          {/* Sidebar - Reservation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-xl p-6 shadow-xl sticky top-24 space-y-4">
              {/* Price Display */}
              <div className="pb-6 border-b border-charcoal-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-terracotta-600">
                    {formatPrice(listing.price)}
                  </span>
                  <span className="text-charcoal-600">/nuit</span>
                </div>
                <p className="text-sm text-charcoal-500">TVA incluse</p>
              </div>

              {user?.role === 'host' ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 text-orange-800 dark:text-orange-300 text-sm">
                  <p className="font-semibold mb-1">Espace Hôte</p>
                  <p>En tant qu'hôte, vous ne pouvez pas effectuer de réservations sur la plateforme.</p>
                </div>
              ) : (
                /* Reservation Form */
                <form onSubmit={handleReservation} className="space-y-4">
                  <div>
                    <Input
                      type="date"
                      label="Arrivée"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="date"
                      label="Départ"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="number"
                      label="Nombre de personnes"
                      min="1"
                      max="8"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      required
                    />
                  </div>

                  {/* Calculation */}
                  {nights > 0 && (
                    <div className="bg-charcoal-50 rounded-lg p-4 space-y-2 text-sm border border-charcoal-200">
                      <div className="flex justify-between">
                        <span className="text-charcoal-600">{nights} nuits × {formatPrice(listing.price)}</span>
                        <span className="text-charcoal-900 font-semibold">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-600">Frais de service (10%)</span>
                        <span className="text-charcoal-900 font-semibold">{formatPrice(Math.round(totalPrice * 0.1))}</span>
                      </div>
                      <div className="border-t border-charcoal-300 pt-2 flex justify-between">
                        <span className="font-semibold text-charcoal-900">Total</span>
                        <span className="text-lg font-bold text-terracotta-600">
                          {formatPrice(Math.round(totalPrice * 1.1))}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full">
                    Réserver maintenant
                  </Button>
                  <Link href={`/messages?contact=${listing.hostId || 1}`} className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Contacter le propriétaire
                    </Button>
                  </Link>
                </form>
              )}

              {/* Host Info */}
              <div className="pt-6 border-t border-charcoal-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900">
                      Jean Dupont
                    </p>
                    <p className="text-sm text-charcoal-500">Hôte depuis 3 ans</p>
                  </div>
                </div>
                <p className="text-sm text-charcoal-600 mb-4 pb-4 border-b border-charcoal-200">
                  ⚡ Taux de réponse rapide • Généralement répond en moins d'une heure
                </p>
                <Button variant="outline" className="w-full">
                  Voir le profil de l'hôte
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

