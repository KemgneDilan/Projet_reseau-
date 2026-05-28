"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Star, MapPin, Filter, X } from "lucide-react"
import { SearchBar } from "@/components/features/SearchBar"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const mockServices = [
  {
    id: 1,
    title: "Chef cuisinier privé",
    provider: "Michel Auguste",
    category: "Gastronomie",
    image: "https://images.unsplash.com/photo-1604874891534-94c1c5c9ce3e?auto=format&fit=crop&w=500&q=60",
    price: 150,
    rating: 4.9,
    reviews: 45,
    location: "Kribi, Douala",
    description: "Chef professionnel avec 15 ans d'expérience. Spécialiste de la cuisine camerounaise et internationale.",
  },
  {
    id: 2,
    title: "Guide touristique local",
    provider: "Sarah Njong",
    category: "Tourisme",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=500&q=60",
    price: 80,
    rating: 4.8,
    reviews: 32,
    location: "Douala, Yaoundé",
    description: "Découvrez la culture locale avec un guide passionné qui parle français et anglais.",
  },
  {
    id: 3,
    title: "Chauffeur privé VIP",
    provider: "Jean-Paul Nguini",
    category: "Transport",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?auto=format&fit=crop&w=500&q=60",
    price: 100,
    rating: 4.7,
    reviews: 28,
    location: "Yaoundé",
    description: "Service de transport haut de gamme avec chauffeur courtois et expérimenté.",
  },
  {
    id: 4,
    title: "Cours de danse camerounaise",
    provider: "Grace Fobasso",
    category: "Loisirs",
    image: "https://images.unsplash.com/photo-1516635099255-56aed270549d?auto=format&fit=crop&w=500&q=60",
    price: 60,
    rating: 4.9,
    reviews: 18,
    location: "Douala",
    description: "Apprenez les danses traditionnelles camerounaises avec une danseuse professionnelle.",
  },
  {
    id: 5,
    title: "Massothérapie relaxante",
    provider: "Dr. Amandine Tekah",
    category: "Bien-être",
    image: "https://images.unsplash.com/photo-1544161515-81aae3ff8d5f?auto=format&fit=crop&w=500&q=60",
    price: 70,
    rating: 4.8,
    reviews: 42,
    location: "Kribi",
    description: "Massage thérapeutique pour détente et relaxation. Certifiée internationalement.",
  },
  {
    id: 6,
    title: "Photographe professionnel",
    provider: "Albert Toh",
    category: "Événements",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=500&q=60",
    price: 200,
    rating: 4.9,
    reviews: 35,
    location: "Yaoundé, Douala",
    description: "Photographie professionnelle pour vos événements, mariages et séances photos.",
  },
]

export default function ServicesPage() {
  const [services, setServices] = React.useState(mockServices)
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({
    category: "",
    priceMin: 0,
    priceMax: 500,
    rating: 0,
  })
  const [ratingMap, setRatingMap] = React.useState({})

  const categories = ["Gastronomie", "Tourisme", "Transport", "Loisirs", "Bien-être", "Événements"]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Filtrer les services using persisted avg ratings when available
    let filtered = mockServices.filter((service) => {
      const matchCategory = !newFilters.category || service.category === newFilters.category
      const matchPrice = service.price >= newFilters.priceMin && service.price <= newFilters.priceMax
      const avg = ratingMap[service.id] || service.rating || 0
      const matchRating = !newFilters.rating || avg >= newFilters.rating
      return matchCategory && matchPrice && matchRating
    })

    setServices(filtered)
  }

  React.useEffect(() => {
    try {
      const map = {}
      mockServices.forEach(s => {
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
                    Prix
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal-600 w-12">
                        Min: {filters.priceMin}€
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={filters.priceMin}
                        onChange={(e) =>
                          handleFilterChange("priceMin", parseInt(e.target.value))
                        }
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-charcoal-600 w-12">
                        Max: {filters.priceMax}€
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={filters.priceMax}
                        onChange={(e) =>
                          handleFilterChange("priceMax", parseInt(e.target.value))
                        }
                        className="flex-1"
                      />
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
                      priceMax: 500,
                      rating: 0,
                    })
                    setServices(mockServices)
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
                          src={service.image}
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
                          par <span className="font-semibold">{service.provider}</span>
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
                                  const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating }))) || service.rating
                                  const count = rv.length || service.reviews
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
                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(service.rating) ? "fill-yellow-400 text-yellow-400" : "text-charcoal-300"}`} />
                                      ))}
                                      <span className="font-semibold text-charcoal-900">{service.rating}</span>
                                      <span className="text-sm text-charcoal-500">({service.reviews} avis)</span>
                                    </>
                                  )
                                }
                              })()}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-charcoal-600 mb-4">
                          <MapPin className="h-4 w-4 text-terracotta-500" />
                          {service.location}
                        </div>

                        {/* Price and CTA */}
                        <div className="border-t border-charcoal-200 pt-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-charcoal-600">À partir de</p>
                            <p className="text-2xl font-bold text-terracotta-600">
                              {service.price}€<span className="text-sm text-charcoal-600">/h</span>
                            </p>
                          </div>
                          <Button size="sm">Réserver</Button>
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
                    priceMax: 500,
                    rating: 0,
                  })
                  setServices(mockServices)
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
