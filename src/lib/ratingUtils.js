/**
 * Calculate the average rating from an array of reviews
 * @param {Array} reviews - Array of review objects with 'rating' property
 * @returns {number} Average rating rounded to 1 decimal place, or 0 if no reviews
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0
  }

  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
  const average = sum / reviews.length

  // Round to 1 decimal place
  return Math.round(average * 10) / 10
}

/**
 * Persist a review into local storage and return the saved review
 * review must include: targetType ('listing'|'service'), targetId, rating, comment, authorId, authorName, date
 */
import { reviews as mockReviews } from './mockData'

export const addReview = (review) => {
  if (!review || !review.targetType || !review.targetId) {
    throw new Error('Invalid review payload')
  }

  const key = 'hrs_reviews'
  const raw = localStorage.getItem(key) || '[]'
  const all = JSON.parse(raw)
  const toSave = {
    id: `rv_${Date.now()}`,
    targetType: review.targetType,
    targetId: review.targetId,
    rating: Number(review.rating) || 0,
    comment: review.comment || '',
    authorId: review.authorId || null,
    authorName: review.authorName || null,
    date: review.date || new Date().toISOString(),
  }

  all.push(toSave)
  localStorage.setItem(key, JSON.stringify(all))
  // Dispatch a global event so client components can refresh their state
  try {
    if (typeof window !== 'undefined' && window?.CustomEvent) {
      window.dispatchEvent(new CustomEvent('hrs:review-added', { detail: { targetType: toSave.targetType, targetId: toSave.targetId, review: toSave } }))
    }
  } catch (e) {
    // ignore
  }

  return toSave
}

/**
 * Get reviews for a specific target (listing or service)
 * @param {'listing'|'service'} targetType
 * @param {string} targetId
 * @returns {Array} reviews
 */
export const getReviewsFor = (targetType, targetId) => {
  try {
    const raw = localStorage.getItem('hrs_reviews') || '[]'
    const all = JSON.parse(raw)
    return all.filter(r => r.targetType === targetType && String(r.targetId) === String(targetId))
  } catch (e) {
    return []
  }
}

/**
 * Get rating statistics from reviews
 * @param {Array} reviews - Array of review objects
 * @returns {Object} Object with averageRating, totalReviews, and ratingBreakdown
 */
export const getRatingStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    }
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach((review) => {
    const rating = Math.round(review.rating)
    if (rating >= 1 && rating <= 5) {
      breakdown[rating]++
    }
  })

  return {
    averageRating: calculateAverageRating(reviews),
    totalReviews: reviews.length,
    ratingBreakdown: breakdown,
  }
}

/**
 * Format rating with star count
 * @param {number} rating - Rating number (0-5)
 * @returns {Object} Object with stars (array of full/half/empty) and rounded value
 */
export const formatRating = (rating) => {
  const rounded = Math.round(rating * 2) / 2
  const stars = []

  for (let i = 0; i < 5; i++) {
    if (rounded >= i + 1) {
      stars.push('full')
    } else if (rounded >= i + 0.5) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }

  return {
    stars,
    value: rounded,
  }
}

/**
 * Seed localStorage 'hrs_reviews' from mockData reviews if empty.
 */
export const seedReviewsFromMockData = () => {
  if (typeof window === 'undefined') return
  try {
    const key = 'hrs_reviews'
    const raw = localStorage.getItem(key)
    if (raw && raw !== '[]') return // already seeded or user has data

    const toSave = Array.isArray(mockReviews) ? mockReviews.map((r, idx) => ({ id: r.id || `seed_${idx}`, ...r })) : []
    localStorage.setItem(key, JSON.stringify(toSave))
    // notify listeners
    try {
      if (window?.CustomEvent) {
        window.dispatchEvent(new CustomEvent('hrs:reviews-seeded', { detail: { count: toSave.length } }))
      }
    } catch (e) {}
  } catch (e) {
    // ignore
  }
}
