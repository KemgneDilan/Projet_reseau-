"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Star, MapPin, Filter, X } from "lucide-react"
import { SearchBar } from "@/components/features/SearchBar"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/app/contexts/AuthContext"
import { services as defaultServices, users as mockUsers } from "@/lib/mockData"
import { useCurrency } from "@/app/contexts/CurrencyContext"

export default function ServicesPage() {
  const { user } = useAuth()
  const { currency, formatPrice, RATES } = useCurrency()
  const maxPriceLimit = Math.round(50000 * (RATES[currency] || 1))

  const [services, setServices] = React.useState(defaultServices)
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({
    category: "",
    priceMin: 0,
    priceMax: 50000,
    rating: 0,
  })
  const [ratingMap, setRatingMap] = React.useState({})

  // Compute categories dynamically from services database
  const categories = React.useMemo(() => {
    const set = new Set(defaultServices.map(s => s.category))
    return Array.from(set)
  }, [])

  // Synchronize priceMax limit on currency change
  const prevCurrencyRef = React.useRef(currency)
  React.useEffect(() => {
    if (prevCurrencyRef.current !== currency) {
      const rateDiff = (RATES[currency] || 1) / (RATES[prevCurrencyRef.current] || 1)
      setFilters(prev => ({
        ...prev,
        priceMin: Math.min(Math.round(prev.priceMin * rateDiff), maxPriceLimit),
        priceMax: Math.min(Math.round(prev.priceMax * rateDiff), maxPriceLimit)
      }))
      prevCurrencyRef.current = currency
    } else {
      setFilters(prev => ({ ...prev, priceMax: maxPriceLimit }))
    }
  }, [currency, maxPriceLimit, RATES])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Reactive filtering
  React.useEffect(() => {
    const minXAF = filters.priceMin / (RATES[currency] || 1)
    const maxXAF = filters.priceMax / (RATES[currency] || 1)

    let filtered = defaultServices.filter((service) => {
      const matchCategory = !filters.category || service.category === filters.category
      const matchPrice = service.price >= minXAF && service.price <= maxXAF
      const avg = ratingMap[service.id] || service.rating || 0
      const matchRating = !filters.rating || avg >= filters.rating
      return matchCategory && matchPrice && matchRating
    })

    setServices(filtered)
  }, [filters, currency, ratingMap, RATES])

  React.useEffect(() => {
    try {
      const map = {}
      defaultServices.forEach(s => {
        const rv = getReviewsFor('service', s.id)
        const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating })))
        if (avg) map[s.id] = avg
      })
      setRatingMap(map)
    } catch (e) {
      setRatingMap({})
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-charcoal-900 mb-4">
            Marketplace de services
          </h1>
          <p className="text-charcoal-600 text-lg max-w-2xl mx-auto">
            Trouvez les meilleurs prestataires pour compléter votre séjour
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-terracotta-500" />
                  Filtres
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Catégorie
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        !filters.category
                          ? "bg-terracotta-500 text-white"
                          : "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200"
                      }`}
                    >
                      Tous
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleFilterChange("category", cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          filters.category === cat
                            ? "bg-terracotta-500 text-white"
                            : "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Prix du service
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">Montant Minimum</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-charcoal-600 w-24">
                          {formatPrice(filters.priceMin / (RATES[currency] || 1))}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={maxPriceLimit}
                          value={filters.priceMin}
                          onChange={(e) =>
                            handleFilterChange("priceMin", parseInt(e.target.value))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">Montant Maximum</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-charcoal-600 w-24">
                          {formatPrice(filters.priceMax / (RATES[currency] || 1))}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max={maxPriceLimit}
                          value={filters.priceMax}
                          onChange={(e) =>
                            handleFilterChange("priceMax", parseInt(e.target.value))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Note minimale
                  </label>
                  <div className="flex gap-2">
                    {[0, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange("rating", rating)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          filters.rating === rating
                            ? "bg-terracotta-500 text-white"
                            : "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200"
                        }`}
                      >
                        {rating || "Tous"}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({
                      category: "",
                      priceMin: 0,
                      priceMax: maxPriceLimit,
                      rating: 0,
                    })
                    setServices(defaultServices)
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          <motion.div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal-900">
                {services.length} service{services.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white rounded-lg"
              >
                <Filter className="h-4 w-4" />
                Filtres
              </button>
            </div>

            {/* Services Grid */}
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-charcoal-100">
                        <img
                          src={service.images?.[0] || 'https://images.unsplash.com/photo-1604874891534-94c1c5c9ce3e?auto=format&fit=crop&w=500&q=60'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
                        <span className="absolute top-3 right-3 bg-terracotta-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {service.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-charcoal-900 mb-1 group-hover:text-terracotta-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-sm text-charcoal-600 mb-3">
                          par <span className="font-semibold">{mockUsers.find(u => u.id === service.providerId)?.username || "Prestataire"}</span>
                        </p>

                        <p className="text-sm text-charcoal-700 mb-4 flex-1">
                          {service.description}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                              {(() => {
                                try {
                                  const rv = getReviewsFor('service', service.id)
                                  const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating }))) || service.rating || 0
                                  const count = rv.length || service.reviewsCount || 0
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < Math.floor(avg)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-charcoal-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="font-semibold text-charcoal-900">
                                        {Number(avg).toFixed(1)}
                                      </span>
                                      <span className="text-sm text-charcoal-500">
                                        ({count} avis)
                                      </span>
                                    </>
                                  )
                                } catch (e) {
                                  return (
                                    <>
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(service.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-charcoal-300"}`} />
                                      ))}
                                      <span className="font-semibold text-charcoal-900">{service.rating || 0}</span>
                                      <span className="text-sm text-charcoal-500">({service.reviewsCount || 0} avis)</span>
                                    </>
                                  )
                                }
                              })()}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-charcoal-600 mb-4">
                          <MapPin className="h-4 w-4 text-terracotta-500" />
                          {service.location || "Douala/Yaoundé"}
                        </div>

                        {/* Price and CTA */}
                        <div className="border-t border-charcoal-200 pt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-charcoal-600">À partir de</p>
                            <p className="text-2xl font-bold text-terracotta-600">
                              {formatPrice(service.price)}<span className="text-sm text-charcoal-600"> / {service.unit || 'h'}</span>
                            </p>
                          </div>
                          {(!user || (user.role !== 'host' && user.role !== 'provider')) && (
                            <Button size="sm">Réserver</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Search className="h-16 w-16 text-charcoal-300 mb-4" />
                <h3 className="text-2xl font-bold text-charcoal-900 mb-2">
                  Aucun service trouvé
                </h3>
                <p className="text-charcoal-600 mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button onClick={() => {
                  setFilters({
                    category: "",
                    priceMin: 0,
                    priceMax: maxPriceLimit,
                    rating: 0,
                  })
                  setServices(defaultServices)
                }}>
                  Réinitialiser la recherche
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
