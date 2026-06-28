'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import RatingModal from './RatingModal'

/**
 * RatingButton Component
 * Triggers rating modal for accommodations or services
 * 
 * @param {object} item - The item to rate (should have id, title)
 * @param {string} type - Type: 'accommodation' or 'service'
 * @param {boolean} isCompleted - Whether user has completed the booking/order
 * @param {function} onRatingSubmitted - Callback after rating is submitted
 */
export default function RatingButton({ 
  item, 
  type = 'accommodation',
  isCompleted = true,
  onRatingSubmitted 
}) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)

  const handleRatingSubmit = (reviewData) => {
    if (onRatingSubmitted) {
      onRatingSubmitted(reviewData)
    }
    // Modal will auto-close after success animation
  }

  // Don't show button if booking/order not completed
  if (!isCompleted) {
    return null
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsRatingModalOpen(true)}
        className="border-terracotta-200 text-terracotta-600 hover:bg-terracotta-50 flex items-center gap-2"
      >
        <Star className="h-4 w-4" />
        Noter
      </Button>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        title={item?.title || 'Cet item'}
        type={type}
        item={item}
      />
    </>
  )
}
