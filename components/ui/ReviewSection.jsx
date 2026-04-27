import * as React from "react"
import { Star } from "lucide-react"

export function ReviewSection({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-charcoal-500">Aucun avis pour le moment.</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-charcoal-100 pb-4 last:border-0 last:pb-0">
          <div className="flex items-center space-x-2 mb-2">
            {/* Si l'auteur était populé, on afficherait son image. Ici on mock un avatar */}
            <div className="h-8 w-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 font-semibold text-xs">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-900">Utilisateur</p>
              <p className="text-xs text-charcoal-500">{new Date(review.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-charcoal-200"}`}
              />
            ))}
          </div>
          <p className="text-sm text-charcoal-700">{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
