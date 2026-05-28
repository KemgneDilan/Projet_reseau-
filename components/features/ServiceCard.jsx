"use client"
import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Star } from 'lucide-react'
import { calculateAverageRating, getReviewsFor } from '@/lib/ratingUtils'

export function ServiceCard({ service }) {
  const reviews = getReviewsFor('service', service.id) || []
  const avg = calculateAverageRating(reviews.map(r => ({ rating: r.rating }))) || service.rating || 0

  return (
    <Card className="overflow-hidden border border-charcoal-200 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-charcoal-100 overflow-hidden">
        {service.images && service.images[0] ? (
          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-400">No image</div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-charcoal-900 line-clamp-2">{service.title}</h3>
          <p className="text-sm text-charcoal-600 mt-2 line-clamp-2">{service.description}</p>
          <div className="flex items-center gap-2 mt-3 text-yellow-500 font-bold text-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>{avg > 0 ? avg.toFixed(1) : 'N/A'}</span>
            <span className="text-charcoal-500 font-normal">({reviews.length} avis)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <div className="font-extrabold text-charcoal-900">{service.price} {service.currency}</div>
          <Link href={`/services/${service.id}`}>
            <Button size="sm" variant="outline">Détails</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
