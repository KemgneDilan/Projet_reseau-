'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Home, Calendar, MessageSquare, TrendingUp, CreditCard, Users, ArrowRight, CheckCircle, Clock, XCircle, ChevronRight, BarChart2, ArrowLeft, Star } from 'lucide-react'
import { listings as defaultListings } from '@/lib/mockData'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useRouter } from 'next/navigation'
import { EditItemModal } from '@/components/features/EditItemModal'
import Link from 'next/link'
import { calculateAverageRating, getReviewsFor } from '@/lib/ratingUtils'

const mockReviewsByListing = {
  'l1': [
    { author: "Marc Kemajou", rating: 5, comment: "Séjour incroyable ! La vue sur l'océan depuis la piscine est tout simplement magique. Je recommande vivement." },
    { author: "Marie Ngo", rating: 4, comment: "Superbe villa spacieuse, accès direct à la plage. Seul petit bémol : la pression d'eau parfois basse dans les douches, mais le personnel a été très réactif." }
  ],
  'l2': [
    { author: "Jean-Pierre T.", rating: 5, comment: "L'appartement est très propre, moderne et extrêmement sécurisé. Bastos est le quartier parfait pour résider à Yaoundé." },
    { author: "Alice Mbia", rating: 4, comment: "Très bon séjour, l'internet en fibre optique fonctionne à merveille, idéal pour télétravailler." }
  ],
  'l3': [
    { author: "Claude Atangana", rating: 5, comment: "Le cadre de montagne à Buea est magnifique. Le feu de cheminée le soir apporte un charme fou." }
  ]
}

const mockReceivedReservations = [
  {
    id: 101,
    listingTitle: "Villa de Charme au bord de l'Océan",
    guestName: "Alice Mbia",
    guestPhone: "+237 699 88 77 66",
    checkIn: "2026-06-01",
    checkOut: "2026-06-08",
    nights: 7,
    amount: 1050000, // En FCFA
    status: "confirmed",
    guestAvatar: "AM",
    contactId: 1
  },
  {
    id: 102,
    listingTitle: "Appartement Haut-Standing Bastos",
    guestName: "Bob Ndongo",
    guestPhone: "+237 677 55 44 33",
    checkIn: "2026-06-12",
    checkOut: "2026-06-15",
    nights: 3,
    amount: 180000,
    status: "pending",
    guestAvatar: "BN",
    contactId: 2
  },
  {
    id: 103,
    listingTitle: "Chalet Cosy au pied du Mont Cameroun",
    guestName: "Carine Bella",
    guestPhone: "+237 655 22 11 00",
    checkIn: "2026-05-20",
    checkOut: "2026-05-22",
    nights: 2,
    amount: 90000,
    status: "cancelled",
    guestAvatar: "CB",
    contactId: 3
  }
]

export default function HostDashboard() {
  const { user, logout, loading } = useAuth()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const [myListings, setMyListings] = React.useState([])
  const [editingItem, setEditingItem] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState('dashboard')

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'host')) {
      router.push('/login')
    }
  }, [user, loading, router])

  React.useEffect(() => {
    if (user) {
      const local = localStorage.getItem(`hrs_listings_${user.id}`)
      if (local) {
        setMyListings(JSON.parse(local))
      } else {
        const initial = defaultListings.filter((l) => l.hostId === user.id || l.hostId === 'u2')
        setMyListings(initial)
      }
    }
  }, [user])

  // Hash-based Tab Routing
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#annonces') setActiveTab('annonces')
      else if (hash === '#reservations') setActiveTab('reservations')
      else if (hash === '#finances') setActiveTab('finances')
      else setActiveTab('dashboard')
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleSave = (updatedItem) => {
    const updatedList = myListings.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    setMyListings(updatedList)
    if (user) {
      localStorage.setItem(`hrs_listings_${user.id}`, JSON.stringify(updatedList))
    }
  }

  const navigateToHash = (hash) => {
    window.location.hash = hash
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleBack = () => {
    router.back()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30 flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" /> {t('res_status_confirmed')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> {t('res_status_pending')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" /> {t('res_status_cancelled')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-charcoal-500">Chargement…</div>
  }

  if (!user || user.role !== 'host') {
    return <div className="p-8 text-center text-charcoal-500 font-semibold">Accès non autorisé</div>
  }

  // Calculate earnings for chart and accounting
  const totalEarnings = mockReceivedReservations
    .filter(r => r.status === 'confirmed')
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Listing rendering component to avoid code duplication
  const renderListingCard = (listing) => {
    const reviews = getReviewsFor('listing', listing.id) || mockReviewsByListing[listing.id] || []
    const avgRating = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || listing.rating || 0

    return (
      <Card key={listing.id} className="overflow-hidden border border-charcoal-200 dark:border-charcoal-800 flex flex-col h-full bg-white dark:bg-charcoal-900 shadow-sm hover:shadow-md transition-shadow">
        <div className="h-44 overflow-hidden relative shrink-0">
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          <Badge className={`absolute top-2 right-2 border-none shadow-sm ${listing.status === 'inactive' ? 'bg-charcoal-500 text-white' : 'bg-white text-charcoal-900'}`}>
            {listing.status === 'inactive' ? t('host_inactive') : t('host_active')}
          </Badge>
        </div>
        <CardContent className="p-4 flex flex-col flex-1 justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-charcoal-900 dark:text-white truncate" title={listing.title}>
              {listing.title}
            </h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 text-xs truncate">
              {listing.location}
            </p>
            
            {/* Stars rating Display */}
            <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</span>
              <span className="text-charcoal-400 dark:text-charcoal-500 font-normal">
                ({reviews.length > 0 ? `${reviews.length} ${t('fav_reviews')}` : t('host_no_reviews')})
              </span>
            </div>

            <p className="text-charcoal-600 dark:text-charcoal-300 text-xs line-clamp-2 leading-relaxed">
              {listing.description}
            </p>

            {/* Guest Reviews Section under each listing */}
            <div className="pt-3 border-t border-charcoal-150 dark:border-charcoal-800/80">
              <span className="text-[11px] font-bold text-charcoal-800 dark:text-charcoal-200 block mb-2 uppercase tracking-wide">
                {t('host_reviews_label')} ({reviews.length})
              </span>
              {reviews.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {reviews.map((rev, index) => (
                    <div key={index} className="text-[11px] bg-charcoal-50 dark:bg-charcoal-950/40 p-2.5 rounded-lg border border-charcoal-200/50 dark:border-charcoal-800/50 space-y-1">
                      <div className="flex justify-between items-center font-semibold text-charcoal-900 dark:text-charcoal-200">
                        <span>{rev.author}</span>
                        <span className="text-yellow-500 flex items-center gap-0.5">★ {rev.rating}</span>
                      </div>
                      <p className="text-charcoal-600 dark:text-charcoal-400 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-charcoal-400 dark:text-charcoal-500 italic mt-1">
                  {t('host_no_reviews')}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-charcoal-100 dark:border-charcoal-800 shrink-0">
            <span className="font-extrabold text-charcoal-900 dark:text-white text-sm">
              {formatPrice(listing.price)} 
              <span className="text-[10px] font-normal text-charcoal-500"> {t('host_price_per_night')}</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => setEditingItem(listing)}>
              {t('host_details_label')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header with Back button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-charcoal-200 dark:border-charcoal-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white">{t('host_dashboard')}</h1>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
            {t('host_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleBack} className="gap-2 border-charcoal-300 dark:border-charcoal-700">
            <ArrowLeft className="h-4 w-4" /> {t('host_back')}
          </Button>
          <Link href="/host/listings/new">
            <Button className="gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium shadow-md">
              <Plus className="h-4 w-4" /> {t('host_new_listing')}
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="border-charcoal-300 dark:border-charcoal-700">
            {t('host_logout')}
          </Button>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Revenues */}
              <div 
                onClick={() => navigateToHash('finances')}
                className="cursor-pointer group relative bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-charcoal-400 group-hover:text-terracotta-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('host_total_earnings')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                  {formatPrice(totalEarnings)}
                </h3>
                <span className="text-xs text-green-600 dark:text-green-400 mt-2 block font-medium">{t('host_realtime')}</span>
              </div>

              {/* Stat 2: Reservations */}
              <div 
                onClick={() => navigateToHash('reservations')}
                className="cursor-pointer group relative bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-charcoal-400 group-hover:text-terracotta-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('host_res_received')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                  {mockReceivedReservations.length}
                </h3>
                <span className="text-xs text-charcoal-500 mt-2 block">1 {t('host_pending_validation')}</span>
              </div>

              {/* Stat 3: Nouveaux Messages */}
              <Link href="/messages" className="group bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-charcoal-400 group-hover:text-terracotta-500 transition-colors" />
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('host_unread_messages')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">3</h3>
                <span className="text-xs text-terracotta-500 font-semibold mt-2 block flex items-center gap-1">
                  {t('host_access_messages')} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Quick Actions (Shortcut bar) is removed as requested by the user */}

            {/* Small Listings Showcase */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-charcoal-900 dark:text-white">{t('host_main_listings')}</h2>
                <Button variant="ghost" size="sm" onClick={() => navigateToHash('annonces')} className="text-terracotta-500 font-semibold hover:text-terracotta-600">
                  Voir tout ({myListings.length})
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myListings.slice(0, 3).map((listing) => renderListingCard(listing))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: ANNONCES (LOGEMENTS) */}
        {activeTab === 'annonces' && (
          <motion.div
            key="annonces"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Home className="h-6 w-6 text-terracotta-500" /> {t('host_my_listings')} ({myListings.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing) => renderListingCard(listing))}
            </div>
          </motion.div>
        )}

        {/* TAB: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <motion.div
            key="reservations"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-6 w-6 text-terracotta-500" /> {t('host_res_received')}
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {t('host_res_received_desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-charcoal-50 dark:bg-charcoal-950/20 text-charcoal-600 dark:text-charcoal-400 text-xs font-bold uppercase border-b border-charcoal-200 dark:border-charcoal-800">
                      <th className="p-4">{t('host_my_listings')}</th>
                      <th className="p-4">{t('host_client_label')}</th>
                      <th className="p-4">{t('host_dates_label')}</th>
                      <th className="p-4">{t('host_amount_label')}</th>
                      <th className="p-4">{t('host_status_label')}</th>
                      <th className="p-4 text-right">{t('host_actions_label')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {mockReceivedReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50 transition-colors">
                        {/* Listing Name */}
                        <td className="p-4 font-semibold text-charcoal-900 dark:text-white max-w-[200px] truncate">
                          {reservation.listingTitle}
                        </td>
                        {/* Guest Profile */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-terracotta-500 flex items-center justify-center font-bold text-white text-xs">
                              {reservation.guestAvatar}
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal-900 dark:text-white">{reservation.guestName}</p>
                              <p className="text-xs text-charcoal-500">{reservation.guestPhone}</p>
                            </div>
                          </div>
                        </td>
                        {/* Booking Dates */}
                        <td className="p-4">
                          <div className="text-charcoal-900 dark:text-white">
                            Du {reservation.checkIn} au {reservation.checkOut}
                          </div>
                          <div className="text-xs text-charcoal-500 font-medium">
                            {reservation.nights} nuits
                          </div>
                        </td>
                        {/* Amount in FCFA */}
                        <td className="p-4 font-bold text-charcoal-950 dark:text-white">
                          {formatPrice(reservation.amount)}
                        </td>
                        {/* Status Badge */}
                        <td className="p-4">
                          {getStatusBadge(reservation.status)}
                        </td>
                        {/* Contact Action */}
                        <td className="p-4 text-right">
                          <Link href={`/messages?contact=${reservation.contactId}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 border-charcoal-300 dark:border-charcoal-700">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {t('host_contact_btn')}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: FINANCES */}
        {activeTab === 'finances' && (
          <motion.div
            key="finances"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-terracotta-500" /> {t('host_finances_title')}
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {t('host_finances_desc')}
              </p>
            </div>

            {/* Balances summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">{t('host_total_ca')}</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1 text-green-600 dark:text-green-400">
                    {formatPrice(totalEarnings)}
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">{t('host_ca_desc')}</span>
                </CardContent>
              </Card>

              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">{t('host_average_cart')}</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                    {formatPrice(Math.round(totalEarnings / 2))}
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">{t('host_cart_desc')}</span>
                </CardContent>
              </Card>

              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">{t('host_occupancy_rate')}</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                    68%
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">{t('host_occupancy_desc')}</span>
                </CardContent>
              </Card>
            </div>

            {/* Custom Bar Chart per listing (Visuellement splendide avec SVG/CSS) */}
            <Card className="border border-charcoal-200 dark:border-charcoal-800">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-terracotta-500" />
                    {t('host_stats_per_listing')}
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    {t('host_stats_desc')}
                  </p>
                </div>

                {/* SVG/CSS Bar Chart */}
                <div className="space-y-5 pt-4">
                  {[
                    { title: "Villa de Charme au bord de l'Océan", nights: 14, color: "from-terracotta-500 to-orange-500", percentage: "100%" },
                    { title: "Appartement Haut-Standing Bastos", nights: 8, color: "from-orange-400 to-yellow-500", percentage: "57%" },
                    { title: "Chalet Cosy au pied du Mont Cameroun", nights: 5, color: "from-charcoal-600 to-charcoal-800", percentage: "35%" }
                  ].map((item) => (
                    <div key={item.title} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">{item.title}</span>
                        <span className="font-bold text-charcoal-900 dark:text-white">{item.nights} {t('host_nights_reserved')}</span>
                      </div>
                      <div className="h-4 w-full bg-charcoal-100 dark:bg-charcoal-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: item.percentage }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing listings modal */}
      {editingItem && (
        <EditItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          type="listing"
          onSave={handleSave}
        />
      )}
    </div>
  )
}
