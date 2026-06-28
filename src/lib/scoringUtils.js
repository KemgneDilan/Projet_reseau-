/**
 * @file scoringUtils.js
 * @description Utilitaires pour le scoring basé sur l'indice de Jaccard
 */

/**
 * Calcule l'indice de Jaccard entre deux ensembles d'intérêts (représentés par des tableaux)
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * @param {string[]} listA
 * @param {string[]} listB
 * @returns {number} Coefficient de Jaccard (entre 0 et 1)
 */
export const calculateJaccardSimilarity = (listA = [], listB = []) => {
  if (!listA.length || !listB.length) return 0

  const setA = new Set(listA.map(i => i.toLowerCase().trim()))
  const setB = new Set(listB.map(i => i.toLowerCase().trim()))

  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])

  return intersection.size / union.size
}

/**
 * Calcule le score d'affinité sociale entre un voyageur et un hôte
 * @param {string} travelerId
 * @param {string} hostId
 * @returns {number} Score de 0 à 100
 */
export const calculateSocialScore = (travelerId, hostId) => {
  if (typeof window === 'undefined') return 0

  try {
    const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
    const traveler = users.find(u => u.id === travelerId)
    const host = users.find(u => u.id === hostId)

    if (!traveler || !host) return 0

    const travelerInterests = traveler.interests || []
    const hostInterests = host.interests || []

    const similarity = calculateJaccardSimilarity(travelerInterests, hostInterests)
    return Math.round(similarity * 100)
  } catch (e) {
    console.error('Error calculating Jaccard similarity', e)
    return 0
  }
}

/**
 * Calcule le score de pertinence global basé principalement sur l'indice de Jaccard
 * @param {object} listing
 * @param {object} searchParams - { travelerId }
 * @returns {number} Score global (0-100)
 */
export const calculateRelevanceScore = (listing, searchParams = {}) => {
  if (!searchParams.travelerId) return 50 // Score par défaut neutre
  return calculateSocialScore(searchParams.travelerId, listing.hostId)
}

/**
 * Filtre et trie les annonces par score d'affinité sociale (Jaccard)
 * @param {object[]} listingsList
 * @param {object} searchParams - { travelerId }
 * @param {number} page
 * @param {number} pageSize
 * @returns {object}
 */
export const searchAndRankListings = (listingsList, searchParams, page = 0, pageSize = 20) => {
  const candidates = listingsList.filter((l) => l.status === 'active')

  const scored = candidates.map((listing) => ({
    ...listing,
    relevanceScore: calculateRelevanceScore(listing, searchParams)
  }))

  // Trier par affinité sociale décroissante
  const sorted = scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

  const startIdx = page * pageSize
  const endIdx = startIdx + pageSize
  const results = sorted.slice(startIdx, endIdx)

  return {
    results,
    page,
    pageSize,
    total: sorted.length,
    totalPages: Math.ceil(sorted.length / pageSize),
    filteredOutCount: listingsList.length - candidates.length
  }
}

