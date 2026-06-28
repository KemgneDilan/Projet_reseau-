"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Star, MapPin, Wifi, Utensils, Dumbbell, Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { getReviewsFor, calculateAverageRating } from '@/lib/ratingUtils'

export function ListingCard({ 
  id, 
  title, 
  location, 
  location,
  rating, 
  reviews, 
  image, 
  amenities = [],
  isFavorited = false,
  relevanceScore,
  onFavorite 
}) {
  const [isFav, setIsFav] = React.useState(isFavorited)

  const amenityIcons = {
    wifi: <Wifi className="h-4 w-4" />,
    kitchen: <Utensils className="h-4 w-4" />,
    gym: <Dumbbell className="h-4 w-4" />,
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Link href={`/listings/${id}`}>
        <div className="group cursor-pointer h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
          {/* Image Container */}
          <div className="relative h-56 md:h-64 overflow-hidden bg-charcoal-100">
            <Image
              src={image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=60"}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />

            {/* Social Match Badge */}
            {relevanceScore !== undefined && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-xs shadow-lg">
                <Sparkles className="h-3.5 w-3.5 fill-white" />
                <span>{relevanceScore}% d'affinité</span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsFav(!isFav)
                onFavorite?.(id, !isFav)
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFav ? "fill-red-500 text-red-500" : "text-charcoal-400"
                }`}
              />
            </button>

            {/* Exchange Badge */}
            <div className="absolute bottom-3 left-3 bg-terracotta-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg text-sm">
              Échange communautaire
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-4">
            {/* Title and Rating */}
            <div className="mb-3">
              <h3 className="font-bold text-lg text-charcoal-900 group-hover:text-terracotta-600 transition-colors line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-charcoal-600">
                <MapPin className="h-4 w-4 text-terracotta-500" />
                <span>{location}</span>
              </div>
            </div>

            {/* Rating (dynamic from persisted reviews) */}
            {(
              (() => {
                try {
                  const rv = getReviewsFor('listing', id)
                  const avg = calculateAverageRating(rv.map(r => ({ rating: r.rating }))) || rating
                  const count = rv.length || reviews
                  return (
                    <div className="flex items-center gap-2 mb-3">
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
                      <span className="text-sm font-semibold text-charcoal-900">
                        {Number(avg).toFixed(1)}
                      </span>
                      <span className="text-sm text-charcoal-500">
                        ({count} avis)
                      </span>
                    </div>
                  )
                } catch (e) {
                  return null
                }
              })()
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {amenities.slice(0, 3).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-charcoal-100 text-charcoal-700 rounded-full"
                  >
                    {amenityIcons[amenity] || <span>•</span>}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Button */}
            <Button
              onClick={(e) => e.preventDefault()}
              className="w-full mt-auto"
              size="sm"
            >
              Voir les détails
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
