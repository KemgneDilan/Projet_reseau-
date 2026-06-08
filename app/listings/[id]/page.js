"use client"
import React, { useEffect, useMemo, useState } from "react"
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
  X,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { listings, houses, rooms } from "@/lib/mockData"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { useAuth } from "@/app/contexts/AuthContext"
import { useCurrency } from "@/app/contexts/CurrencyContext"

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { formatPrice } = useCurrency()

  const roomDetail = rooms.find((r) => String(r.id) === String(id))
  const houseDetail = houses.find((h) => String(h.id) === String(id))
  const allEntities = [...listings, ...houses, ...rooms]

  const listing = useMemo(() => {
    if (roomDetail) return roomDetail
    if (houseDetail) return houseDetail
    return allEntities.find((l) => String(l.id) === String(id)) || listings[0]
  }, [id, roomDetail, houseDetail, allEntities])

  const houseForRoom = roomDetail ? houses.find((h) => h.id === roomDetail.houseId) : houseDetail
  const houseRooms = houseForRoom ? rooms.filter((room) => houseForRoom.roomsIds.includes(room.id)) : []
  const activeHouseRooms = houseRooms.filter((room) => room.status === 'active')
  const isRoomListing = Boolean(roomDetail)
  const isHouseListing = Boolean(houseDetail)
  const isMixedHouse = Boolean(houseForRoom)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [reviews, setReviews] = useState(() => {
    try {
      return getReviewsFor('listing', listing.id)
    } catch (e) {
      return []
    }
  })
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [guests, setGuests] = useState(1)
  const [bookingMode, setBookingMode] = useState(isRoomListing ? 'room' : isHouseListing ? 'whole' : 'listing')
  const [selectedRoomIds, setSelectedRoomIds] = useState(isRoomListing ? [listing.id] : [])
  const [video, setVideo] = useState(null)
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('hrs_favorites') || '[]')
    setIsFavorited(savedFavs.includes(listing.id))
  }, [listing.id])

  useEffect(() => {
    if (isRoomListing) {
      setBookingMode('room')
      setSelectedRoomIds([listing.id])
    } else if (isHouseListing) {
      setBookingMode('whole')
      setSelectedRoomIds([])
    } else {
      setBookingMode('listing')
      setSelectedRoomIds([listing.id])
    }
  }, [id, isRoomListing, isHouseListing, listing.id])

  useEffect(() => {
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

  const toggleFavorite = () => {
    const savedFavs = JSON.parse(localStorage.getItem('hrs_favorites') || '[]')
    if (isFavorited) {
      localStorage.setItem('hrs_favorites', JSON.stringify(savedFavs.filter((favId) => favId !== listing.id)))
      setIsFavorited(false)
    } else {
      localStorage.setItem('hrs_favorites', JSON.stringify([...savedFavs, listing.id]))
      setIsFavorited(true)
    }
  }

  const selectedRooms = useMemo(() => {
    if (bookingMode === 'whole' && houseForRoom) {
      return activeHouseRooms
    }

    if (bookingMode === 'room' && isRoomListing) {
      return [listing]
    }

    if (bookingMode === 'rooms' && selectedRoomIds.length > 0) {
      return rooms.filter((room) => selectedRoomIds.includes(room.id))
    }

    if (isHouseListing && selectedRoomIds.length === 0) {
      return activeHouseRooms
    }

    return [listing]
  }, [bookingMode, selectedRoomIds, houseForRoom, isRoomListing, isHouseListing, listing, activeHouseRooms])

  const pricePerNight = useMemo(() => {
    if (bookingMode === 'whole' && isHouseListing && listing.price) {
      return listing.price
    }
    if ((bookingMode === 'whole' || bookingMode === 'rooms') && selectedRooms.length) {
      return selectedRooms.reduce((sum, room) => sum + (room.price || 0), 0)
    }
    return listing.price || selectedRooms.reduce((sum, room) => sum + (room.price || 0), 0)
  }, [bookingMode, isHouseListing, listing.price, selectedRooms])

  const calculateNights = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const totalPrice = nights * pricePerNight
  const depositPrice = Math.round(totalPrice * 0.1)
  const grandTotal = Math.round(totalPrice * 1.1)

  const images = listing.images || [
    listing.image,
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  ]

  const handleAddReview = (e) => {
    e.preventDefault()
    if (userRating === 0) {
      return alert("Veuillez sélectionner une note.")
    }

    const newReview = {
      id: Date.now(),
      user: "Moi",
      rating: userRating,
      text: userComment,
    }

    const savedReviews = JSON.parse(localStorage.getItem(`hrs_reviews_${listing.id}`) || '[]')
    savedReviews.unshift(newReview)
    localStorage.setItem(`hrs_reviews_${listing.id}`, JSON.stringify(savedReviews))
    setReviews((prevReviews) => [newReview, ...prevReviews])
    setUserRating(0)
    setUserComment("")
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Veuillez sélectionner un fichier vidéo.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La vidéo est trop grande. Veuillez choisir une vidéo de moins de 2 Mo.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setVideo({
        name: file.name,
        type: file.type,
        data: event.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 5) {
      alert('Vous pouvez télécharger jusqu’à 5 photos au maximum.')
      return
    }
    
    let loaded = 0
    const newPhotos = [...photos]
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner uniquement des images.')
        return
      }
      if (file.size > 1 * 1024 * 1024) {
        alert(`L'image ${file.name} est trop grande. Veuillez choisir des images de moins de 1 Mo.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        newPhotos.push({
          name: file.name,
          type: file.type,
          data: event.target.result
        })
        loaded++
        if (loaded === files.length) {
          setPhotos(newPhotos)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index))
  }

  const removeVideo = () => {
    setVideo(null)
  }

  const handleReservation = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return alert('Veuillez sélectionner des dates valides.')
    if (!user) return alert('Veuillez vous connecter pour réserver.')

    if (bookingMode === 'rooms' && selectedRoomIds.length === 0) {
      return alert('Veuillez sélectionner au moins une chambre.')
    }

    if (nights <= 0) return alert('Les dates sont invalides.')

    if (selectedRooms.some((room) => room.status !== 'active')) {
      return alert('Une des chambres sélectionnées n’est pas disponible.')
    }

    const isOverlap = (aStart, aEnd, bStart, bEnd) => {
      return !(new Date(aEnd) <= new Date(bStart) || new Date(aStart) >= new Date(bEnd))
    }

    for (const room of selectedRooms) {
      const blockedKey = `hrs_blocked_${room.id}`
      const blocked = JSON.parse(localStorage.getItem(blockedKey) || '[]')
      for (const b of blocked) {
        if (isOverlap(startDate, endDate, b.startDate, b.endDate)) {
          return alert(`Les dates choisies sont déjà réservées pour la chambre ${room.title}.`)
        }
      }
    }

    const reservationId = `res_${Date.now()}`
    const reservation = {
      id: reservationId,
      listingId: listing.id,
      roomIds: selectedRooms.map((room) => room.id),
      targetType: isHouseListing || (isMixedHouse && bookingMode === 'whole') ? 'house' : 'room',
      title: listing.title,
      location: listing.location || listing.city,
      checkIn: startDate,
      checkOut: endDate,
      status: 'pending',
      totalPrice: grandTotal,
      nights,
      guests,
      createdAt: new Date().toISOString(),
      userId: user.id,
      video,
      photos,
    }

    const userKey = `hrs_reservations_${user.id}`
    const prev = JSON.parse(localStorage.getItem(userKey) || '[]')
    try {
      localStorage.setItem(userKey, JSON.stringify([reservation, ...prev]))
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
        const simplifiedReservation = {
          ...reservation,
          video: video ? { name: video.name, type: video.type, data: 'placeholder' } : null,
          photos: photos.map(p => ({ name: p.name, type: p.type, data: 'placeholder' }))
        }
        localStorage.setItem(userKey, JSON.stringify([simplifiedReservation, ...prev]))
        alert('Attention : Les fichiers multimédias étant trop volumineux, ils ont été enregistrés sans stockage local complet pour éviter de saturer l’espace.')
      } else {
        throw e
      }
    }

    for (const room of selectedRooms) {
      const blockedKey = `hrs_blocked_${room.id}`
      const blocked = JSON.parse(localStorage.getItem(blockedKey) || '[]')
      blocked.push({ reservationId, startDate, endDate })
      localStorage.setItem(blockedKey, JSON.stringify(blocked))
    }

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          amount: grandTotal,
          currency: 'XAF',
          description: `Réservation de ${selectedRooms.length} chambre(s) à ${listing.title}`,
          userId: user.id,
          roomIds: selectedRooms.map((room) => room.id),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Échec de l’API de paiement')
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
        return
      }
      alert('Paiement initialisé avec succès. Vous pouvez continuer vers la page de paiement.')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Impossible d’initialiser le paiement pour le moment.')
    }

    router.push('/client')
  }

  const setRoomSelection = (roomId) => {
    setSelectedRoomIds((current) => {
      if (current.includes(roomId)) {
        return current.filter((id2) => id2 !== roomId)
      }
      return [...current, roomId]
    })
  }

  return (
    <div className="min-h-screen bg-charcoal-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-charcoal-900" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
                >
                  <ChevronRight className="h-6 w-6 text-charcoal-900" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`}
                />
              ))}
            </div>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all">
                <Share2 className="h-5 w-5 text-charcoal-900" />
              </button>
              <button
                onClick={toggleFavorite}
                className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-charcoal-400'}`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-charcoal-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="h-5 w-5 text-terracotta-500" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 py-4 border-y border-charcoal-200">
                {(() => {
                  try {
                    const avg = calculateAverageRating(reviews.map((r) => ({ rating: r.rating }))) || listing.rating
                    const count = reviews.length || listing.reviews || listing.reviewsCount
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.floor(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-300'}`}
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

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-4">À propos de ce logement</h2>
              <p className="text-charcoal-700 leading-relaxed mb-6">{listing.description || 'Découvrez cette magnifique propriété avec vue exceptionnelle. Idéale pour les couples ou les petits groupes, elle offre tout le confort nécessaire pour un séjour inoubliable.'}</p>

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

              <div className="mt-6">
                <h3 className="font-bold text-charcoal-900 mb-4">Équipements populaires</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Wifi, label: 'WiFi gratuit' },
                    { icon: Utensils, label: 'Cuisine équipée' },
                    { icon: Users, label: 'Espace de vie' },
                    { icon: Calendar, label: 'Séjour flexible' },
                    { icon: Dumbbell, label: 'Salle de gym' },
                    { icon: MessageSquare, label: 'Support 24/7' },
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

            {(isHouseListing || isMixedHouse) && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Chambres disponibles</h2>
                <div className="grid gap-4">
                  {houseRooms.map((room) => (
                    <div key={room.id} className="rounded-2xl border border-charcoal-200 p-4 bg-charcoal-50">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-charcoal-900">{room.title}</h3>
                          <p className="text-sm text-charcoal-600">{room.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-charcoal-900">{formatPrice(room.price)}</p>
                          <p className="text-xs text-charcoal-500">/nuit</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-charcoal-600">
                        {room.amenities?.map((amenity, idx) => (
                          <span key={idx} className="rounded-full bg-white px-2 py-1 border border-charcoal-200">{amenity}</span>
                        ))}
                        {room.status !== 'active' && <span className="rounded-full bg-red-100 text-red-700 px-2 py-1">Hors service</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">Ajouter un avis</h2>
              <form onSubmit={handleAddReview} className="mb-8 space-y-4 bg-charcoal-50 dark:bg-charcoal-800 p-4 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">Note :</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition-colors ${star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-300 dark:text-charcoal-600'}`}
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

              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-6">Avis des clients</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-charcoal-200 dark:border-charcoal-700 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">
                        {review.user.substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-charcoal-900 dark:text-white">{review.user}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-300 dark:text-charcoal-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-charcoal-600 dark:text-charcoal-400 text-sm">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">Voir tous les avis</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-xl p-6 shadow-xl sticky top-24 space-y-4">
              <div className="pb-6 border-b border-charcoal-200">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-terracotta-600">{formatPrice(pricePerNight)}</span>
                  <span className="text-charcoal-600">/nuit</span>
                </div>
                <p className="text-sm text-charcoal-500">TVA incluse</p>
              </div>

              {user?.role === 'host' || user?.role === 'provider' ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 text-orange-800 dark:text-orange-300 text-sm">
                  <p className="font-semibold mb-1">Espace {user?.role === 'host' ? 'Hôte' : 'Prestataire'}</p>
                  <p>En tant que {user?.role === 'host' ? 'hôte' : 'prestataire'}, vous ne pouvez pas effectuer de réservations sur la plateforme.</p>
                </div>
              ) : (
                <form onSubmit={handleReservation} className="space-y-4">
                  {(isHouseListing || isRoomListing) && isMixedHouse && (
                    <div className="space-y-4 rounded-2xl border border-charcoal-200 bg-charcoal-50 p-4 dark:border-charcoal-700 dark:bg-charcoal-900">
                      <p className="font-semibold text-charcoal-900 dark:text-white">Choisissez votre réservation</p>

                      {isRoomListing && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 px-3 py-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bookingMode"
                              value="room"
                              checked={bookingMode === 'room'}
                              onChange={() => setBookingMode('room')}
                              className="h-4 w-4 text-terracotta-600"
                            />
                            <span className="text-sm text-charcoal-700 dark:text-charcoal-300">Réserver cette chambre seulement</span>
                          </label>
                          <label className="flex items-center gap-3 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 px-3 py-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bookingMode"
                              value="whole"
                              checked={bookingMode === 'whole'}
                              onChange={() => {
                                setBookingMode('whole')
                                setSelectedRoomIds([])
                              }}
                              className="h-4 w-4 text-terracotta-600"
                            />
                            <span className="text-sm text-charcoal-700 dark:text-charcoal-300">Réserver la maison entière</span>
                          </label>
                        </div>
                      )}

                      {isHouseListing && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 px-3 py-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bookingMode"
                              value="whole"
                              checked={bookingMode === 'whole'}
                              onChange={() => {
                                setBookingMode('whole')
                                setSelectedRoomIds([])
                              }}
                              className="h-4 w-4 text-terracotta-600"
                            />
                            <span className="text-sm text-charcoal-700 dark:text-charcoal-300">Louer la maison entière</span>
                          </label>
                          <label className="flex items-center gap-3 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 px-3 py-2 cursor-pointer">
                            <input
                              type="radio"
                              name="bookingMode"
                              value="rooms"
                              checked={bookingMode === 'rooms'}
                              onChange={() => setBookingMode('rooms')}
                              className="h-4 w-4 text-terracotta-600"
                            />
                            <span className="text-sm text-charcoal-700 dark:text-charcoal-300">Choisir une ou plusieurs chambres</span>
                          </label>
                        </div>
                      )}

                      {bookingMode === 'rooms' && houseRooms.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {houseRooms.map((room) => (
                            <label
                              key={room.id}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer ${room.status !== 'active' ? 'border-charcoal-300 dark:border-charcoal-700 bg-charcoal-100 dark:bg-charcoal-900 text-charcoal-400 cursor-not-allowed' : 'border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950'}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoomIds.includes(room.id)}
                                onChange={() => setRoomSelection(room.id)}
                                disabled={room.status !== 'active'}
                                className="h-4 w-4 text-terracotta-600"
                              />
                              <div className="flex-1 text-sm">
                                <div className="font-medium text-charcoal-800 dark:text-white">{room.title}</div>
                                <div className="text-charcoal-500 dark:text-charcoal-400 text-xs">{formatPrice(room.price)} / nuit</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
                      onChange={(e) => setGuests(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Media Uploads */}
                  <div className="space-y-4 rounded-2xl border border-charcoal-200 bg-charcoal-50 p-4 dark:border-charcoal-700 dark:bg-charcoal-900">
                    <p className="font-semibold text-charcoal-900 dark:text-white text-xs">Fichiers multimédias de la réservation (Optionnel)</p>
                    
                    {/* Photos upload */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-charcoal-700 dark:text-charcoal-350">
                        Photos (Jusqu'à 5, max 1 Mo chacune)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="reservation-photos"
                          multiple
                          accept="image/*"
                          onChange={handlePhotosChange}
                          disabled={photos.length >= 5}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={photos.length >= 5}
                          onClick={() => document.getElementById('reservation-photos').click()}
                          className="w-full text-xs"
                        >
                          📷 Ajouter des photos ({photos.length}/5)
                        </Button>
                      </div>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-charcoal-200 bg-white dark:bg-charcoal-950">
                              <img
                                src={photo.data}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video upload */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-charcoal-700 dark:text-charcoal-350">
                        Vidéo (Max 1, max 2 Mo)
                      </label>
                      {!video ? (
                        <div>
                          <input
                            type="file"
                            id="reservation-video"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('reservation-video').click()}
                            className="w-full text-xs"
                          >
                            🎥 Ajouter une vidéo
                          </Button>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border border-charcoal-200 bg-charcoal-900 p-1 flex flex-col items-center">
                          <video
                            src={video.data}
                            controls
                            className="w-full max-h-24 rounded object-cover"
                          />
                          <div className="flex justify-between items-center w-full px-2 py-1 text-xs text-white">
                            <span className="truncate max-w-[80%] font-medium">{video.name}</span>
                            <button
                              type="button"
                              onClick={removeVideo}
                              className="p-1 rounded bg-red-500 hover:bg-red-600 transition-colors text-[10px]"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="bg-charcoal-50 rounded-lg p-4 space-y-2 text-sm border border-charcoal-200">
                      <div className="flex justify-between">
                        <span className="text-charcoal-600">{nights} nuits × {formatPrice(pricePerNight)}</span>
                        <span className="text-charcoal-900 font-semibold">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-600">Frais de service (10%)</span>
                        <span className="text-charcoal-900 font-semibold">{formatPrice(depositPrice)}</span>
                      </div>
                      <div className="border-t border-charcoal-300 pt-2 flex justify-between">
                        <span className="font-semibold text-charcoal-900">Total</span>
                        <span className="text-lg font-bold text-terracotta-600">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full">Réserver maintenant</Button>
                  <Link href={`/messages?contact=${listing.hostId || 1}`} className="w-full">
                    <Button type="button" variant="outline" size="lg" className="w-full">Contacter le propriétaire</Button>
                  </Link>
                </form>
              )}

              <div className="pt-6 border-t border-charcoal-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">JD</div>
                  <div>
                    <p className="font-semibold text-charcoal-900">Jean Dupont</p>
                    <p className="text-sm text-charcoal-500">Hôte depuis 3 ans</p>
                  </div>
                </div>
                <p className="text-sm text-charcoal-600 mb-4 pb-4 border-b border-charcoal-200">⚡ Taux de réponse rapide • Généralement répond en moins d'une heure</p>
                <Button variant="outline" className="w-full">Voir le profil de l'hôte</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

