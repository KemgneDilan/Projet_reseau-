/**
 * ============================================================
 * Loomdaah – Fuzzy Search Utility
 * Levenshtein distance-based fuzzy matching for listing names
 * ============================================================
 */

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
function levenshtein(a, b) {
  const matrix = []
  const aLen = a.length
  const bLen = b.length

  if (aLen === 0) return bLen
  if (bLen === 0) return aLen

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // suppression
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      )
    }
  }

  return matrix[bLen][aLen]
}

/**
 * Normalise une chaîne pour la comparaison (minuscules, sans accents)
 * @param {string} str 
 * @returns {string}
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Vérifie si une chaîne contient un sous-ensemble de la query
 * @param {string} text - Texte dans lequel chercher
 * @param {string} query - Terme de recherche
 * @returns {boolean}
 */
function containsSubstring(text, query) {
  return normalize(text).includes(normalize(query))
}

/**
 * Calcule un score de similarité entre 0 et 1 (1 = identique)
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number}
 */
function similarity(str1, str2) {
  const a = normalize(str1)
  const b = normalize(str2)
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

/**
 * Effectue une recherche floue sur une liste d'items
 * @param {string} query - Terme de recherche saisi par l'utilisateur
 * @param {Array} items - Liste d'objets à rechercher
 * @param {Array<string>} fields - Noms des champs sur lesquels chercher (ex: ['title', 'location', 'description'])
 * @param {number} threshold - Seuil de similarité minimale (0-1, défaut 0.3)
 * @returns {Array} - Items triés par pertinence (les plus pertinents en premier)
 */
export function fuzzySearch(query, items, fields = ['title'], threshold = 0.3) {
  if (!query || query.trim().length === 0) return items

  const normalizedQuery = normalize(query)

  const scored = items.map((item) => {
    let bestScore = 0

    for (const field of fields) {
      const value = item[field]
      if (!value || typeof value !== 'string') continue

      // 1. Correspondance exacte par sous-chaîne (score très élevé)
      if (containsSubstring(value, query)) {
        const subScore = normalizedQuery.length / normalize(value).length
        bestScore = Math.max(bestScore, 0.7 + subScore * 0.3)
      }

      // 2. Similarité par mot individuel
      const words = normalize(value).split(/\s+/)
      for (const word of words) {
        const wordSim = similarity(word, normalizedQuery)
        bestScore = Math.max(bestScore, wordSim)
      }

      // 3. Similarité globale
      const globalSim = similarity(value, query)
      bestScore = Math.max(bestScore, globalSim * 0.8)
    }

    return { item, score: bestScore }
  })

  return scored
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item)
}

/**
 * Retourne les suggestions de noms qui correspondent au query
 * @param {string} query 
 * @param {Array} items 
 * @param {string} field - Champ à afficher dans les suggestions
 * @param {number} maxResults 
 * @returns {Array<{item, label, score}>}
 */
export function getSuggestions(query, items, field = 'title', maxResults = 5) {
  if (!query || query.trim().length < 2) return []

  const normalizedQuery = normalize(query)

  const scored = items.map((item) => {
    const value = item[field]
    if (!value) return { item, label: '', score: 0 }

    let score = 0

    // Substring match
    if (containsSubstring(value, query)) {
      score = 0.9
    }

    // Word-level similarity
    const words = normalize(value).split(/\s+/)
    for (const word of words) {
      const wordSim = similarity(word, normalizedQuery)
      score = Math.max(score, wordSim)
    }

    return { item, label: value, score }
  })

  return scored
    .filter((s) => s.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
}
