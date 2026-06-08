'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Star,
  Heart,
  MessageSquare,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Home,
  Settings,
} from 'lucide-react'
import { listings, services } from '@/lib/mockData'
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import RatingButton from '@/components/features/RatingButton'

const mockReservations = [
  {
    id: 1,
    listingId: 1,
    title: 'Villa avec vue sur la mer',
    location: 'Kribi',
    checkIn: '2025-04-10',
    checkOut: '2025-04-15',
    status: 'confirmed',
    totalPrice: 500,
    guests: 2,
  },
  {
    id: 2,
    listingId: 2,
    title: 'Appartement cosy en centre-ville',
    location: 'Douala',
    checkIn: '2025-05-01',
    checkOut: '2025-05-05',
    status: 'pending',
    totalPrice: 350,
    guests: 3,
  },
]

const mockFavorites = listings[2] ? [listings[0], listings[1], listings[2]] : [listings[0], listings[1]]

export default function ClientDashboard() {
  const { user, logout, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [favorites, setFavorites] = React.useState([])
  const [reservations, setReservations] = React.useState(mockReservations)
  const [ratingMap, setRatingMap] = React.useState({})

  React.useEffect(() => {
    if (user) {
      const userKey = `hrs_reservations_${user.id}`
      const savedReservations = JSON.parse(localStorage.getItem(userKey) || '[]')
      const merged = [...savedReservations]
      mockReservations.forEach(mockRes => {
        if (!merged.some(r => r.id === mockRes.id)) {
          merged.push(mockRes)
        }
      })
      setReservations(merged)
    }
  }, [user])

  React.useEffect(() => {
    // Load favorites from local storage
    const savedFavIds = JSON.parse(localStorage.getItem('hrs_favorites') || '[]')
    const actualFavorites = savedFavIds.map(id => listings.find(l => l.id === id)).filter(Boolean)
    setFavorites(actualFavorites)
  }, [])

  React.useEffect(() => {
    try {
      const map = {}
      listings.forEach(l => {
        const rv = getReviewsFor('listing', l.id)
        const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating })))
        if (avg) map[l.id] = avg
      })
      setRatingMap(map)
    } catch (e) {
      setRatingMap({})
    }
  }, [])

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'client')) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-charcoal-100 text-charcoal-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return t('res_status_confirmed')
      case 'pending':
        return t('res_status_pending')
      case 'cancelled':
        return t('res_status_cancelled')
      default:
        return status
    }
  }

  if (loading) {
    return <div className="p-8">Chargement…</div>
  }

  if (!user || user.role !== 'client') {
    return <div className="p-8">Accès non autorisé</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-charcoal-900 mb-2">
                {t('client_welcome', { name: user.username || 'Client' })}
              </h1>
              <p className="text-charcoal-600">
                {t('client_subtitle')}
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="lg">
                <Settings className="h-5 w-5 mr-2" />
                {t('client_btn_settings')}
              </Button>
              <Button variant="outline" size="lg" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                {t('client_btn_logout')}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: t('stat_active_reservations'), value: '2', icon: Calendar, color: 'terracotta' },
              { label: t('stat_favorites'), value: favorites.length.toString(), icon: Heart, color: 'red' },
              { label: t('stat_messages'), value: '3', icon: MessageSquare, color: 'blue' },
              { label: t('stat_points'), value: '450', icon: Star, color: 'yellow' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br from-white to-charcoal-50 rounded-xl p-4 border border-charcoal-200 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="reservations" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reservations">{t('tab_reservations')}</TabsTrigger>
            <TabsTrigger value="favoris">{t('tab_favorites')}</TabsTrigger>
            <TabsTrigger value="services">{t('tab_services')}</TabsTrigger>
            <TabsTrigger value="messages">{t('tab_messages')}</TabsTrigger>
          </TabsList>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-charcoal-900">{t('res_title')}</h2>
                <Link href="/client/search">
                  <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    {t('res_new_btn')}
                  </Button>
                </Link>
              </div>

              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation, idx) => (
                    <motion.div
                      key={reservation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-terracotta-500"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="font-bold text-lg text-charcoal-900 mb-2">
                            {reservation.title}
                          </h3>
                          <p className="text-charcoal-600 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-terracotta-500" />
                            {reservation.location}
                          </p>
                        </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-charcoal-700">
                              <Calendar className="h-5 w-5 text-terracotta-500" />
                              <div>
                                <p className="text-sm text-charcoal-600">{t('res_stay')}</p>
                                <p className="font-semibold">
                                  {new Date(reservation.checkIn).toLocaleDateString("fr-FR")} -{" "}
                                  {new Date(reservation.checkOut).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <div>
                              <p className="text-sm text-charcoal-600 mb-1">{t('res_total_price')}</p>
                              <p className="text-2xl font-bold text-terracotta-600">
                                {reservation.totalPrice}€
                              </p>
                            </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(reservation.status)}`}>
                            {getStatusIcon(reservation.status)}
                            {getStatusLabel(reservation.status)}
                          </div>
                        </div>
                      </div>

                      {/* Media Files */}
                      {(reservation.photos?.length > 0 || reservation.video) && (
                        <div className="mt-4 pt-4 border-t border-charcoal-150">
                          <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2.5">
                            Médias joints ({reservation.photos?.length || 0} photo{reservation.photos?.length > 1 ? 's' : ''}, {reservation.video ? '1 vidéo' : 'sans vidéo'})
                          </p>
                          <div className="flex flex-wrap gap-3 items-center">
                            {reservation.photos?.map((photo, pIdx) => (
                              <div key={pIdx} className="w-16 h-16 rounded-lg overflow-hidden border border-charcoal-200 bg-charcoal-50 flex items-center justify-center shrink-0 shadow-sm relative group">
                                {photo.data && photo.data !== 'placeholder' ? (
                                  <img
                                    src={photo.data}
                                    alt={photo.name}
                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                      const w = window.open()
                                      w.document.write(`<img src="${photo.data}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`)
                                    }}
                                  />
                                ) : (
                                  <div className="text-[10px] text-charcoal-400 font-semibold p-1 truncate text-center">
                                    📷 {photo.name}
                                  </div>
                                )}
                              </div>
                            ))}

                            {reservation.video && (
                              <div className="w-40 h-16 rounded-lg overflow-hidden border border-charcoal-200 bg-charcoal-900 flex items-center justify-center shrink-0 shadow-sm relative">
                                {reservation.video.data && reservation.video.data !== 'placeholder' ? (
                                  <video
                                    src={reservation.video.data}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-[9px] text-white p-2 font-semibold text-center truncate">
                                    🎥 {reservation.video.name}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-charcoal-200 flex gap-2 flex-wrap">
                        <Link href={`/messages?contact=${reservation.id}`}>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t('res_contact_host')}
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          {t('res_details')}
                        </Button>
                        {reservation.status === 'confirmed' && (
                          <RatingButton
                            item={{ id: reservation.listingId, title: reservation.title }}
                            type="accommodation"
                            isCompleted={true}
                            onRatingSubmitted={(review) => {
                              console.log('Review submitted:', review)
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-16 w-16 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-600 text-lg mb-6">{t('res_empty_title')}</p>
                  <Link href="/client/search">
                    <Button>
                      {t('res_empty_btn')}
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favoris" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-charcoal-900 mb-6">{t('fav_title')}</h2>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((listing, idx) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link href={`/listings/${listing.id}`}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden bg-charcoal-100 group">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <button className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors">
                              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                            </button>
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-charcoal-900 mb-1">
                              {listing.title}
                            </h3>
                            <p className="text-sm text-charcoal-600 mb-4 flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-terracotta-500" />
                              {listing.location}
                            </p>

                            <div className="flex items-center gap-2 mb-4">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                 <span className="font-semibold text-charcoal-900">
                                   {(ratingMap[listing.id] || listing.rating || 0).toFixed(1)}
                                 </span>
                                 <span className="text-sm text-charcoal-500">
                                   ({listing.reviews || listing.reviewsCount} {t('fav_reviews')})
                                 </span>
                             </div>
 
                             <p className="text-lg font-bold text-terracotta-600 mt-auto">
                               {listing.price}€<span className="text-sm text-charcoal-600">{t('fav_per_night')}</span>
                             </p>
                          </div>

                          <div className="p-4 border-t border-charcoal-200 flex gap-2">
                            <Button className="flex-1" size="sm">
                              {t('fav_book_now')}
                            </Button>
                            <RatingButton
                              item={{ id: listing.id, title: listing.title }}
                              type="accommodation"
                              isCompleted={true}
                              onRatingSubmitted={(review) => {
                                console.log('Review submitted:', review)
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-600 text-lg mb-6">
                    {t('fav_empty_title')}
                  </p>
                  <Link href="/client/search">
                    <Button>
                      {t('fav_empty_btn')}
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-bold text-charcoal-900 mb-6">{t('tab_services')}</h2>
              
              {/* Mock booked services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.slice(0, 3).map((service, idx) => {
                  const serviceBooking = {
                    id: service.id,
                    title: service.title,
                    date: '2025-04-12',
                    status: 'completed',
                  }

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-charcoal-100"
                    >
                      <div className="h-40 overflow-hidden bg-charcoal-200">
                        {service.images && service.images[0] ? (
                          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-100 to-orange-100">
                            <span className="text-charcoal-400">Service</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-charcoal-900 mb-2">{service.title}</h3>
                        <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">{service.description}</p>

                        <div className="flex items-center gap-2 mb-4">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-charcoal-900">
                            {(() => {
                              try {
                                const rv = getReviewsFor('service', service.id)
                                const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating })))
                                return (avg || service.rating || 0).toFixed(1)
                              } catch (e) {
                                return (service.rating || 0).toFixed(1)
                              }
                            })()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            {t('res_details')}
                          </Button>
                          <RatingButton
                            item={{ id: service.id, title: service.title }}
                            type="service"
                            isCompleted={serviceBooking.status === 'completed'}
                            onRatingSubmitted={(review) => {
                              console.log('Service review submitted:', review)
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {services.slice(0, 3).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-charcoal-600 text-lg">
                    {t('services_wip')}
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <MessageSquare className="h-16 w-16 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-600 text-lg">
                {t('messages_empty')}
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
  )
}
