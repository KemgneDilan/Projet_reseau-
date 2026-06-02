/**
 * @file currencyUtils.js
 * @description Utilitaires pour la gestion multi-devise
 * R-T4 : Support des devises XAF, EUR, NGN, KES, USD avec taux de change statiques
 */

/**
 * Taux de change statiques (R-T4)
 * Référence : 1 EUR = base pour tous les autres taux
 * À mettre à jour via configuration admin
 */
export const EXCHANGE_RATES = {
  EUR: 1.0,
  XAF: 655.957, // 1 EUR = 655.957 XAF (Franc CFA d'Afrique Centrale)
  NGN: 767.5, // 1 EUR = 767.5 Naira Nigérian
  KES: 147.5, // 1 EUR = 147.5 Shilling Kényan
  USD: 1.1 // 1 EUR = 1.1 USD
}

/**
 * Configuration des devises supportées
 */
export const SUPPORTED_CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', region: 'Europe' },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA', region: 'Afrique Centrale' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Naira Nigérian', region: 'Nigéria' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Shilling Kényan', region: 'Kenya' },
  USD: { code: 'USD', symbol: '$', name: 'Dollar US', region: 'Monde' }
}

/**
 * Récupère les taux de change actuels (R-T4)
 * @returns {object} Objet des taux { EUR: 1.0, XAF: 655.957, ... }
 */
export const getExchangeRates = () => {
  const ratesKey = 'hrs_exchange_rates'
  const customRates = JSON.parse(localStorage.getItem(ratesKey) || 'null')

  if (customRates) {
    return customRates
  }

  return EXCHANGE_RATES
}

/**
 * Met à jour les taux de change (admin only) (R-T4)
 * @param {object} newRates - Nouveaux taux { EUR: 1.0, XAF: ..., ... }
 * @param {string} adminId - ID de l'admin effectuant la mise à jour
 * @returns {object} { success: boolean, message: string, rates: object|null }
 */
export const adminUpdateExchangeRates = (newRates, adminId) => {
  // Validation minimale
  if (!newRates.EUR || newRates.EUR !== 1.0) {
    return { success: false, message: 'EUR doit être la devise de référence avec un taux de 1.0', rates: null }
  }

  // Vérifier que tous les taux sont positifs
  for (const [currency, rate] of Object.entries(newRates)) {
    if (rate <= 0) {
      return { success: false, message: `Le taux pour ${currency} doit être positif.`, rates: null }
    }
  }

  const config = {
    ...newRates,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId
  }

  localStorage.setItem('hrs_exchange_rates', JSON.stringify(config))

  return {
    success: true,
    message: 'Taux de change mis à jour.',
    rates: config
  }
}

/**
 * Convertit un montant d'une devise à une autre (R-T4)
 * @param {number} amount - Montant à convertir
 * @param {string} fromCurrency - Devise source (EUR, XAF, etc.)
 * @param {string} toCurrency - Devise cible
 * @returns {number} Montant converti arrondi à 2 décimales
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return parseFloat(amount.toFixed(2))
  }

  const rates = getExchangeRates()

  if (!rates[fromCurrency] || !rates[toCurrency]) {
    console.warn(`Devise non supportée: ${fromCurrency} -> ${toCurrency}`)
    return amount
  }

  // Convertir vers EUR comme devise intermédiaire
  const amountInEUR = amount / rates[fromCurrency]

  // Convertir de EUR vers la devise cible
  const converted = amountInEUR * rates[toCurrency]

  return parseFloat(converted.toFixed(2))
}

/**
 * Formate un montant avec la devise appropriée (R-T4)
 * @param {number} amount - Montant
 * @param {string} currency - Code devise (EUR, XAF, etc.)
 * @returns {string} Montant formaté (ex: "100,50 €" ou "65 595,70 FCFA")
 */
export const formatCurrency = (amount, currency) => {
  const currencyConfig = SUPPORTED_CURRENCIES[currency]

  if (!currencyConfig) {
    return `${amount} ${currency}`
  }

  // Détermine le nombre de décimales selon la devise
  const decimals = currency === 'XAF' ? 0 : 2

  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return `${formatted} ${currencyConfig.symbol}`
}

/**
 * Obtient la devise par défaut selon la région de l'utilisateur
 * @param {string} userRegion - Région de l'utilisateur
 * @returns {string} Code devise (EUR par défaut)
 */
export const getDefaultCurrencyForRegion = (userRegion) => {
  const regionToCurrency = {
    'Afrique Centrale': 'XAF',
    'Nigéria': 'NGN',
    'Kenya': 'KES',
    'Europe': 'EUR',
    'Monde': 'USD'
  }

  return regionToCurrency[userRegion] || 'EUR'
}

/**
 * Crée un objet de prix multi-devise (R-T4)
 * @param {number} baseAmount - Montant en EUR
 * @returns {object} Prix dans toutes les devises supportées
 */
export const createMultiCurrencyPrice = (baseAmount) => {
  const rates = getExchangeRates()
  const multiPrice = {}

  for (const [currency, rate] of Object.entries(rates)) {
    multiPrice[currency] = parseFloat((baseAmount * rate).toFixed(2))
  }

  return multiPrice
}

/**
 * Récupère la devise de l'utilisateur ou la devise par défaut (R-T4)
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Code devise
 */
export const getUserCurrency = (userId) => {
  const preferencesKey = `hrs_preferences_${userId}`
  const preferences = JSON.parse(localStorage.getItem(preferencesKey) || 'null')

  if (preferences && preferences.currency && SUPPORTED_CURRENCIES[preferences.currency]) {
    return preferences.currency
  }

  // Par défaut: EUR
  return 'EUR'
}

/**
 * Met à jour la devise préférée de l'utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} currency - Code devise
 * @returns {object} { success: boolean, message: string }
 */
export const setUserCurrency = (userId, currency) => {
  if (!SUPPORTED_CURRENCIES[currency]) {
    return { success: false, message: `Devise non supportée: ${currency}` }
  }

  const preferencesKey = `hrs_preferences_${userId}`
  const preferences = JSON.parse(localStorage.getItem(preferencesKey) || '{}')

  preferences.currency = currency
  preferences.updatedAt = new Date().toISOString()

  localStorage.setItem(preferencesKey, JSON.stringify(preferences))

  return {
    success: true,
    message: `Devise mise à jour à ${currency}`
  }
}

/**
 * Calcule le prix final avec conversion de devise (R-T4, R-P1)
 * Utile pour afficher les prix aux clients dans leur devise
 * @param {number} basePrice - Prix de base en EUR
 * @param {string} clientCurrency - Devise du client
 * @param {object} commissionConfig - Configuration des commissions { lodging: 0.15, ... }
 * @returns {object} {
 *   basePrice, clientCurrency, convertedPrice, commissionRate, platformFee,
 *   clientPaymentAmount, currencySymbol
 * }
 */
export const calculateFinalPriceWithCurrency = (basePrice, clientCurrency, commissionConfig = {}) => {
  const lodgingCommission = commissionConfig.lodging || 0.15

  const convertedPrice = convertCurrency(basePrice, 'EUR', clientCurrency)
  const platformFee = parseFloat((convertedPrice * lodgingCommission).toFixed(2))
  const clientPaymentAmount = parseFloat((convertedPrice + platformFee).toFixed(2))

  const currencyConfig = SUPPORTED_CURRENCIES[clientCurrency] || { symbol: '€' }

  return {
    basePrice,
    baseCurrency: 'EUR',
    clientCurrency,
    convertedPrice,
    commissionRate: `${(lodgingCommission * 100).toFixed(1)}%`,
    platformFee,
    clientPaymentAmount,
    currencySymbol: currencyConfig.symbol,
    formattedPayment: formatCurrency(clientPaymentAmount, clientCurrency),
    formattedFee: formatCurrency(platformFee, clientCurrency)
  }
}

/**
 * Récupère tous les taux et devises supportées (pour l'affichage)
 * @returns {object} { rates: {...}, currencies: {...} }
 */
export const getCurrencyInfo = () => {
  return {
    rates: getExchangeRates(),
    currencies: SUPPORTED_CURRENCIES,
    timestamp: new Date().toISOString()
  }
}
