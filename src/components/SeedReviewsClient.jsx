'use client'

import React from 'react'
import { seedReviewsFromMockData } from '@/lib/ratingUtils'

export default function SeedReviewsClient() {
  React.useEffect(() => {
    try {
      seedReviewsFromMockData()
    } catch (e) {
      // ignore
    }
  }, [])

  return null
}
