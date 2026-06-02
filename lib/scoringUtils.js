/**
 * @file scoringUtils.js
 * @description Utilitaires pour le scoring et la mise en relation
 * R-M1 à R-M5 : Scoring de pertinence, poids configurables, tri et pagination
 */

/**
 * Configuration des poids de scoring par défaut (R-M2, R-M3)
 * La somme des poids doit toujours égaler 1.0 (normalisée)
 */
export const DEFAULT_SCORING_WEIGHTS = {
  distance: 0.25, // Distance géographique
  price: 0.20, // Alignement prix/budget
  rating: 0.30, // Note des clients
  social: 0.15, // Historique social (amis, recommandations)
  history: 0.10 // Historique de l'utilisateur avec ce fournisseur
}

/**
 * Récupère la configuration des poids de scoring (R-M3)
 * @returns {object} Poids { distance, price, rating, social, history, lastUpdated }
 */
export const getScoringWeights = () => {
  const weightsKey = 'hrs_scoring_weights'
  const weights = JSON.parse(localStorage.getItem(weightsKey) || 'null')

  if (weights) {
    return weights
  }

  return {
    ...DEFAULT_SCORING_WEIGHTS,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Met à jour les poids de scoring avec normalisation automatique (R-M3)
 * @param {object} newWeights - { distance, price, rating, social, history }
 * @returns {object} { success: boolean, message: string, weights: object|null, normalizedWeights: object|null }
 */
export const updateScoringWeights = (newWeights) => {
  const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0)

  if (total === 0) {
    return { success: false, message: 'La somme des poids ne peut pas être 0.' }
  }

  // Normalisation automatique
  const normalized = {}
  for (const [key, value] of Object.entries(newWeights)) {
    normalized[key] = value / total
  }

  const config = {
    ...normalized,
    lastUpdated: new Date().toISOString()
  }

  localStorage.setItem('hrs_scoring_weights', JSON.stringify(config))

  return {
    success: true,
    message: 'Poids de scoring mis à jour et normalisés.',
    weights: config,
    normalizedWeights: config
  }
}

/**
 * Calcule le score de distance entre deux points GPS (0-1)
 * @param {number} userLat - Latitude utilisateur
 * @param {number} userLng - Longitude utilisateur
 * @param {number} listingLat - Latitude annonce
 * @param {number} listingLng - Longitude annonce
 * @param {number} maxDistanceKm - Distance max acceptable
 * @returns {number} Score distance (0-1, où 1 = très proche)
 */
export const calculateDistanceScore = (userLat, userLng, listingLat, listingLng, maxDistanceKm = 50) => {
  // Formule de Haversine simplifiée
  const R = 6371 // Rayon terrestre en km
  const dLat = ((listingLat - userLat) * Math.PI) / 180
  const dLng = ((listingLng - userLng) * Math.PI) / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((userLat * Math.PI) / 180) * Math.cos((listingLat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Score: 1 si très proche, 0 si dépasse maxDistance
  return Math.max(0, 1 - distance / maxDistanceKm)
}

/**
 * Calcule le score de prix selon le budget (0-1)
 * @param {number} listingPrice - Prix par nuit/unité
 * @param {number} userBudget - Budget max accepté
 * @returns {number} Score prix (1 = dans budget, 0 = hors budget)
 */
export const calculatePriceScore = (listingPrice, userBudget) => {
  if (listingPrice > userBudget * 1.5) return 0 // Hors budget
  if (listingPrice > userBudget) return 0.5 // Légèrement au-dessus du budget
  if (listingPrice >= userBudget * 0.7) return 1 // Optimal
  return 0.9 // Moins cher que prévu (légèrement moins attrayant)
}

/**
 * Calcule le score de notation moyenne (0-1)
 * @param {number} rating - Note moyenne (0-5)
 * @returns {number} Score notation (0-1)
 */
export const calculateRatingScore = (rating) => {
  return rating / 5
}

/**
 * Calcule le score social basé sur les amis / recommandations (0-1) (R-M2)
 * @param {string} userId - ID utilisateur
 * @param {string} providerId - ID du fournisseur
 * @returns {number} Score social (0-1)
 */
export const calculateSocialScore = (userId, providerId) => {
  // 1. Vérifier si c'est un ami
  const friendsKey = `hrs_friends_${userId}`
  const friends = JSON.parse(localStorage.getItem(friendsKey) || '[]')
  if (friends.includes(providerId)) return 1.0

  // 2. Vérifier si des amis ont recommandé ce fournisseur
  for (const friendId of friends) {
    const friendReviewsKey = `hrs_reviews_from_${friendId}`
    const reviews = JSON.parse(localStorage.getItem(friendReviewsKey) || '[]')
    if (reviews.some((r) => r.targetId === providerId && r.rating >= 4)) {
      return 0.7
    }
  }

  return 0 // Pas de lien social
}

/**
 * Calcule le score d'historique avec le fournisseur (0-1) (R-M2)
 * @param {string} userId - ID utilisateur
 * @param {string} providerId - ID du fournisseur
 * @returns {number} Score historique (0-1)
 */
export const calculateHistoryScore = (userId, providerId) => {
  const userReservationsKey = `hrs_reservations_${userId}`
  const reservations = JSON.parse(localStorage.getItem(userReservationsKey) || '[]')

  const withProvider = reservations.filter((r) => r.providerId === providerId)

  if (withProvider.length === 0) return 0

  // Score augmente avec le nombre de réservations complétées
  const completedCount = withProvider.filter((r) => r.status === 'completed').length
  const successRate = completedCount / withProvider.length

  // Score: 0.3 pour 1 réservation, jusqu'à 1.0 pour 5+ réservations avec bon taux de réussite
  return Math.min(1, 0.3 + successRate * 0.1 * Math.min(completedCount, 5))
}

/**
 * Calcule le score de pertinence global (0-100) (R-M2)
 * @param {object} listing - Annonce { price, rating, lat, lng }
 * @param {object} searchParams - { userId, lat, lng, budget, maxDistance }
 * @returns {number} Score global (0-100)
 */
export const calculateRelevanceScore = (listing, searchParams) => {
  const weights = getScoringWeights()

  const distanceScore = calculateDistanceScore(searchParams.lat, searchParams.lng, listing.lat || 0, listing.lng || 0, searchParams.maxDistance || 50)
  const priceScore = calculatePriceScore(listing.price, searchParams.budget)
  const ratingScore = calculateRatingScore(listing.rating || 0)
  const socialScore = calculateSocialScore(searchParams.userId, listing.hostId || listing.providerId)
  const historyScore = calculateHistoryScore(searchParams.userId, listing.hostId || listing.providerId)

  const totalScore = distanceScore * weights.distance + priceScore * weights.price + ratingScore * weights.rating + socialScore * weights.social + historyScore * weights.history

  return Math.round(totalScore * 100)
}

/**
 * Applique une pénalité aux offres désintermédiées (R-M4)
 * @param {number} baseScore - Score de base (0-100)
 * @param {boolean} isIntermediateMode - true si mode intermédiée (à commission)
 * @param {number} betaFactor - Facteur de pénalité (défaut 0.9)
 * @returns {number} Score ajusté
 */
export const applyIntermediationPenalty = (baseScore, isIntermediateMode, betaFactor = 0.9) => {
  if (isIntermediateMode) {
    return baseScore // Pas de pénalité en mode intermédiée
  }
  return Math.round(baseScore * betaFactor)
}

/**
 * Filtre et trie les annonces par score de pertinence (R-M1, R-M5)
 * @param {object[]} listings - Tableau d'annonces
 * @param {object} searchParams - Critères { userId, lat, lng, budget, maxDistance }
 * @param {number} page - Numéro de page (0-indexed)
 * @param {number} pageSize - Taille page (défaut 20)
 * @returns {object} {
 *   results: object[], page, pageSize, total, totalPages,
 *   filteredOutCount: number
 * }
 */
export const searchAndRankListings = (listings, searchParams, page = 0, pageSize = 20) => {
  // 1. Filtrer les annonces disponibles (R-M1)
  const candidates = listings.filter((l) => l.status === 'active' && l.price <= searchParams.budget * 1.5)

  // 2. Calculer les scores
  const scored = candidates.map((listing) => ({
    ...listing,
    relevanceScore: calculateRelevanceScore(listing, searchParams)
  }))

  // 3. Trier par score décroissant (R-M5)
  const sorted = scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // 4. Paginer (R-M5)
  const startIdx = page * pageSize
  const endIdx = startIdx + pageSize
  const results = sorted.slice(startIdx, endIdx)

  return {
    results,
    page,
    pageSize,
    total: sorted.length,
    totalPages: Math.ceil(sorted.length / pageSize),
    filteredOutCount: listings.length - candidates.length
  }
}
