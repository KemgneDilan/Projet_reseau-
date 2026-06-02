'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Briefcase, Star, TrendingUp, CreditCard, MessageSquare, ArrowLeft, Upload, X, BarChart2, CheckCircle } from 'lucide-react'
import { services as defaultServices } from '@/lib/mockData'
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

const mockServiceReviews = {
  's1': [
    { author: "Client A", rating: 5, comment: "Service excellent et ponctuel !" },
    { author: "Client B", rating: 4, comment: "Très satisfait, je recommande." }
  ],
  's2': [
    { author: "Client C", rating: 5, comment: "Professionnel et de qualité." }
  ],
  's3': []
}

const mockCompletedOrders = [
  {
    id: 201,
    serviceName: "Chauffeur VIP - Transfer Aéroport",
    clientName: "Marc Kemajou",
    clientPhone: "+237 699 88 77 66",
    date: "2026-05-20",
    amount: 50000,
    status: "completed"
  },
  {
    id: 202,
    serviceName: "Chef Cuisinier - Dîner privé",
    clientName: "Alice Mbia",
    clientPhone: "+237 699 88 77 66",
    date: "2026-05-18",
    amount: 200000,
    status: "completed"
  },
  {
    id: 203,
    serviceName: "Guide Touristique - Visite Douala",
    clientName: "Jean-Pierre T.",
    clientPhone: "+237 677 55 44 33",
    date: "2026-05-15",
    amount: 75000,
    status: "completed"
  }
]

export default function ProviderDashboard() {
  const { user, logout, loading } = useAuth()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const [myServices, setMyServices] = React.useState([])
  const [editingItem, setEditingItem] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState('dashboard')
  const [uploadingImages, setUploadingImages] = React.useState({})

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'provider')) {
      router.push('/login')
    }
  }, [user, loading, router])

  React.useEffect(() => {
    if (user) {
      const local = localStorage.getItem(`hrs_services_${user.id}`)
      if (local) {
        setMyServices(JSON.parse(local))
      } else {
        const initial = defaultServices.filter((s) => s.providerId === user.id || s.providerId === 'u3')
        setMyServices(initial)
      }
    }
  }, [user])

  // Hash-based Tab Routing
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#services') setActiveTab('services')
      else if (hash === '#commandes') setActiveTab('commandes')
      else if (hash === '#finances') setActiveTab('finances')
      else setActiveTab('dashboard')
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleSave = (updatedItem) => {
    const updatedList = myServices.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    setMyServices(updatedList)
    if (user) {
      localStorage.setItem(`hrs_services_${user.id}`, JSON.stringify(updatedList))
    }
  }

  const handleImageUpload = async (serviceId, files) => {
    setUploadingImages(prev => ({ ...prev, [serviceId]: true }))
    
    // Simulate image upload
    setTimeout(() => {
      const updatedServices = myServices.map(service => {
        if (service.id === serviceId) {
          const newImages = [...service.images]
          // Add up to 3 new image URLs
          for (let i = 0; i < Math.min(files.length, 3); i++) {
            const reader = new FileReader()
            reader.onload = (e) => {
              newImages.push(e.target.result)
              if (i === Math.min(files.length, 3) - 1) {
                handleSave({ ...service, images: newImages })
              }
            }
            reader.readAsDataURL(files[i])
          }
          return { ...service, images: newImages }
        }
        return service
      })
      
      setUploadingImages(prev => ({ ...prev, [serviceId]: false }))
    }, 1000)
  }

  const handleImageDelete = (serviceId, imageIndex) => {
    const updatedServices = myServices.map(service => {
      if (service.id === serviceId) {
        const newImages = service.images.filter((_, idx) => idx !== imageIndex)
        handleSave({ ...service, images: newImages })
        return { ...service, images: newImages }
      }
      return service
    })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleBack = () => {
    router.back()
  }

  const navigateToHash = (hash) => {
    window.location.hash = hash
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30 flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" /> Complétée
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderServiceCard = (service) => {
    const reviews = getReviewsFor('service', service.id) || mockServiceReviews[service.id] || []
    const avgRating = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || service.rating || 0

    return (
      <Card key={service.id} className="overflow-hidden border border-charcoal-200 dark:border-charcoal-800 flex flex-col h-full bg-white dark:bg-charcoal-900 shadow-sm hover:shadow-md transition-shadow">
        {/* Image carousel with upload */}
        <div className="relative h-44 overflow-hidden bg-charcoal-100 dark:bg-charcoal-800">
          {service.images && service.images.length > 0 ? (
            <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-400">
              {t('img_no_image')}
            </div>
          )}
          <Badge className={`absolute top-2 right-2 border-none shadow-sm ${service.status === 'inactive' ? 'bg-charcoal-500 text-white' : 'bg-white text-charcoal-900'}`}>
            {service.status === 'inactive' ? 'Indisponible' : service.category}
          </Badge>

          {/* Image management overlay */}
          <div className="absolute inset-0 bg-charcoal-900/0 hover:bg-charcoal-900/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 group">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(service.id, Array.from(e.target.files || []))}
                className="hidden"
              />
              <div className="bg-white/90 p-2 rounded-lg hover:bg-white transition-colors">
                <Upload className="h-5 w-5 text-charcoal-900" />
              </div>
            </label>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1 justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-charcoal-900 dark:text-white truncate" title={service.title}>
              {service.title}
            </h3>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</span>
              <span className="text-charcoal-400 dark:text-charcoal-500 font-normal">
                ({reviews.length} {reviews.length === 1 ? 'avis' : 'avis'})
              </span>
            </div>

            <p className="text-charcoal-600 dark:text-charcoal-300 text-xs line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="pt-3 border-t border-charcoal-150 dark:border-charcoal-800/80">
                <span className="text-[11px] font-bold text-charcoal-800 dark:text-charcoal-200 block mb-2 uppercase tracking-wide">
                  Avis ({reviews.length})
                </span>
                <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                  {reviews.map((rev, index) => (
                    <div key={index} className="text-[11px] bg-charcoal-50 dark:bg-charcoal-950/40 p-2 rounded-lg border border-charcoal-200/50 dark:border-charcoal-800/50">
                      <div className="flex justify-between items-center font-semibold text-charcoal-900 dark:text-charcoal-200">
                        <span>{rev.author}</span>
                        <span className="text-yellow-500">★ {rev.rating}</span>
                      </div>
                      <p className="text-charcoal-600 dark:text-charcoal-400 italic mt-1">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-charcoal-100 dark:border-charcoal-800 shrink-0">
            <span className="font-extrabold text-charcoal-900 dark:text-white text-sm">
              {formatPrice(service.price)}
              <span className="text-[10px] font-normal text-charcoal-500"> / {service.unit}</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => setEditingItem(service)}>
              {t('host_details_label')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="p-8 text-center text-charcoal-500">Chargement…</div>
  }

  if (!user || user.role !== 'provider') {
    return <div className="p-8 text-center text-charcoal-500 font-semibold">Accès non autorisé</div>
  }

  const totalEarnings = mockCompletedOrders.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header with Back button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-charcoal-200 dark:border-charcoal-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white">{t('provider_dashboard')}</h1>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
            {t('provider_subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleBack} className="gap-2 border-charcoal-300 dark:border-charcoal-700">
            <ArrowLeft className="h-4 w-4" /> {t('btn_back')}
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
              {/* Stat 1: Total Earnings */}
              <div 
                onClick={() => navigateToHash('finances')}
                className="cursor-pointer group relative bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('provider_total_earnings')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                  {formatPrice(totalEarnings)}
                </h3>
                <span className="text-xs text-green-600 dark:text-green-400 mt-2 block font-medium">{t('host_realtime')}</span>
              </div>

              {/* Stat 2: Total Services */}
              <div 
                onClick={() => navigateToHash('services')}
                className="cursor-pointer group relative bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('provider_total_services')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                  {myServices.length}
                </h3>
              </div>

              {/* Stat 3: Completed Orders */}
              <Link href="/messages" className="group bg-white dark:bg-charcoal-900 rounded-2xl p-6 border border-charcoal-200 dark:border-charcoal-800 shadow-sm hover:shadow-md hover:border-terracotta-500/50 dark:hover:border-terracotta-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-terracotta-50 dark:bg-terracotta-950/20 text-terracotta-500 rounded-xl">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{t('provider_completed_orders')}</p>
                <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                  {mockCompletedOrders.length}
                </h3>
              </Link>
            </div>

            {/* Services Showcase */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-charcoal-900 dark:text-white">{t('provider_services')}</h2>
                <Button variant="ghost" size="sm" onClick={() => navigateToHash('services')} className="text-terracotta-500 font-semibold hover:text-terracotta-600">
                  Voir tout ({myServices.length})
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myServices.slice(0, 3).map((service) => renderServiceCard(service))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: MES SERVICES */}
        {activeTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-terracotta-500" /> {t('provider_services')} ({myServices.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => renderServiceCard(service))}
            </div>
          </motion.div>
        )}

        {/* TAB: COMMANDES COMPLÉTÉES */}
        {activeTab === 'commandes' && (
          <motion.div
            key="commandes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-terracotta-500" /> {t('provider_completed_orders')}
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {t('provider_completed_orders_desc')}
              </p>
            </div>

            <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-charcoal-50 dark:bg-charcoal-950/20 text-charcoal-600 dark:text-charcoal-400 text-xs font-bold uppercase border-b border-charcoal-200 dark:border-charcoal-800">
                      <th className="p-4">Service</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {mockCompletedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50 transition-colors">
                        <td className="p-4 font-semibold text-charcoal-900 dark:text-white max-w-[200px] truncate">
                          {order.serviceName}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-charcoal-900 dark:text-white">{order.clientName}</p>
                            <p className="text-xs text-charcoal-500">{order.clientPhone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-charcoal-900 dark:text-white">
                          {order.date}
                        </td>
                        <td className="p-4 font-bold text-charcoal-950 dark:text-white">
                          {formatPrice(order.amount)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(order.status)}
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
                <CreditCard className="h-6 w-6 text-terracotta-500" /> {t('provider_finances_title')}
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {t('provider_finances_desc')}
              </p>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">{t('provider_total_earnings')}</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1 text-green-600 dark:text-green-400">
                    {formatPrice(totalEarnings)}
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">Pour {mockCompletedOrders.length} commandes</span>
                </CardContent>
              </Card>

              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">Revenu moyen par prestation</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                    {formatPrice(Math.round(totalEarnings / mockCompletedOrders.length))}
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">Basé sur les prestations complétées</span>
                </CardContent>
              </Card>

              <Card className="border border-charcoal-200 dark:border-charcoal-800">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-charcoal-500">Taux de satisfaction</p>
                  <h3 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                    4.8★
                  </h3>
                  <span className="text-xs text-charcoal-400 block mt-2">Note moyenne des clients</span>
                </CardContent>
              </Card>
            </div>

            {/* Services Performance */}
            <Card className="border border-charcoal-200 dark:border-charcoal-800">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-terracotta-500" />
                    Performance par service
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Revenus générés par chaque service
                  </p>
                </div>

                <div className="space-y-5">
                  {[
                    { title: "Chauffeur VIP - Transfer Aéroport", revenue: 150000, percentage: "100%", color: "from-terracotta-500 to-orange-500" },
                    { title: "Chef Cuisinier - Dîner privé", revenue: 400000, percentage: "80%", color: "from-orange-400 to-yellow-500" },
                    { title: "Guide Touristique - Visite Douala", revenue: 75000, percentage: "25%", color: "from-charcoal-600 to-charcoal-800" }
                  ].map((item) => (
                    <div key={item.title} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-charcoal-800 dark:text-charcoal-200">{item.title}</span>
                        <span className="font-bold text-charcoal-900 dark:text-white">{formatPrice(item.revenue)}</span>
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

      {/* Editing services modal */}
      {editingItem && (
        <EditItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          type="service"
          onSave={handleSave}
        />
      )}
    </div>
  )
}

