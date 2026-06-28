"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { MapPin, Sliders, X, Filter } from "lucide-react"
import { SearchBar } from "@/components/features/SearchBar"
import { ListingCard } from "@/components/features/ListingCard"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { listings } from "@/lib/mockData"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'
import { useAuth } from "@/app/contexts/AuthContext"
import { calculateRelevanceScore } from "@/lib/scoringUtils"

export default function ClientSearchPage() {
  const { user } = useAuth()

  const [results, setResults] = React.useState(() => {
    const travelerId = user?.id
    return listings.map((l) => ({
      type: 'listing',
      data: { ...l, relevanceScore: calculateRelevanceScore(l, { travelerId }) }
    })).sort((a, b) => b.data.relevanceScore - a.data.relevanceScore)
  })
  const [searchTarget, setSearchTarget] = React.useState('listings') // listings only
  const [searchMode, setSearchMode] = React.useState('keywords') // keywords | filters
  const [showFilters, setShowFilters] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const [filters, setFilters] = React.useState({
    rating: 0,
    amenities: [],
  })

  // Re-rank results when user changes (e.g. logs in or changes interests)
  React.useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(prev => {
        const travelerId = user.id
        return prev.map(item => {
          if (item.type === 'listing') {
            return {
              ...item,
              data: { ...item.data, relevanceScore: calculateRelevanceScore(item.data, { travelerId }) }
            }
          }
          return item
        }).sort((a, b) => {
          if (a.type === 'listing' && b.type === 'listing') {
            return b.data.relevanceScore - a.data.relevanceScore
          }
          return 0
        })
      })
    }
  }, [user])

  const [searchParams, setSearchParams] = React.useState(null)
  const [ratingMap, setRatingMap] = React.useState({})

  const handleSearch = async (params) => {
    setIsLoading(true)
    setSearchParams(params)
    
    // Simuler une requête API
    setTimeout(() => {
      const resultsList = []
      const travelerId = user?.id

      const filtered = listings.filter((listing) => {
        const listingAvg = ratingMap[listing.id] || listing.rating || 0
        const matchRating = !filters.rating || listingAvg >= filters.rating
        if (params?.q) {
          return (listing.title + ' ' + listing.description).toLowerCase().includes(params.q.toLowerCase()) && matchRating
        }
        return matchRating
      }).map(l => {
        const score = calculateRelevanceScore(l, { travelerId })
        return {
          type: 'listing',
          data: { ...l, relevanceScore: score }
        }
      })

      // Sort by social affinity score
      filtered.sort((a, b) => b.data.relevanceScore - a.data.relevanceScore)
      resultsList.push(...filtered)

      setResults(resultsList)
      setIsLoading(false)
    }, 500)
  }


  React.useEffect(() => {
    // build a quick map of listingId -> average rating from persisted reviews
    try {
      const map = {}
      listings.forEach(l => {
        const rv = getReviewsFor('listing', l.id)
        const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating })))
        if (avg) map[l.id] = avg
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRatingMap(map)
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRatingMap({})
    }
  }, [])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleFavorite = (id, isFavorited) => {
    console.log(`Listing ${id} favorited:`, isFavorited)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-charcoal-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-charcoal-900 mb-4">
            Découvrez des chambres d&apos;exception
          </h1>
          <p className="text-charcoal-600 text-lg">
            Trouvez l&apos;hébergement parfait pour votre séjour
          </p>
        </motion.div>

        {/* Search Controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">Mode de recherche:</label>
              <button onClick={() => setSearchMode('keywords')} className={`px-3 py-2 rounded-lg ${searchMode==='keywords' ? 'bg-terracotta-500 text-white' : 'bg-charcoal-100'}`}>Mots-clés</button>
              <button onClick={() => setSearchMode('filters')} className={`px-3 py-2 rounded-lg ${searchMode==='filters' ? 'bg-terracotta-500 text-white' : 'bg-charcoal-100'}`}>Filtres</button>
            </div>
          </div>

          {searchMode === 'keywords' && (
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} className="w-full" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 ${
              showFilters || searchMode === 'filters' ? "block" : "hidden lg:block"
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


                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Note minimale
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
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

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Équipements
                  </label>
                  <div className="space-y-2">
                    {["wifi", "kitchen", "gym"].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange("amenities", [
                                ...filters.amenities,
                                amenity,
                              ])
                            } else {
                              handleFilterChange(
                                "amenities",
                                filters.amenities.filter((a) => a !== amenity)
                              )
                            }
                          }}
                          className="h-4 w-4 rounded border-charcoal-300 text-terracotta-500"
                        />
                        <span className="text-sm text-charcoal-700 capitalize">
                          {amenity === "wifi"
                            ? "WiFi"
                            : amenity === "kitchen"
                            ? "Cuisine"
                            : "Salle de gym"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({
                      rating: 0,
                      amenities: [],
                      category: ''
                    })
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal-900">
                {results.length} résultat{results.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-terracotta-500 text-white rounded-lg"
              >
                <Sliders className="h-4 w-4" />
                Filtres
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin h-12 w-12 text-terracotta-500 mb-4">
                    ⏳
                  </div>
                  <p className="text-charcoal-600">Recherche en cours...</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((item, idx) => (
                  <motion.div
                    key={(item.data && item.data.id) || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ListingCard {...item.data} onFavorite={handleFavorite} />
                  </motion.div>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-charcoal-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-charcoal-600 mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <Button onClick={() => {
                    setFilters({
                      rating: 0,
                      amenities: [],
                    })
                  }}>
                    Réinitialiser la recherche
                  </Button>
                </div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
