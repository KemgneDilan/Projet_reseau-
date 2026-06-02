/**
 * @file adminUtils.js
 * @description Utilitaires pour les fonctions administrateur de modération
 * R-AD1 à R-AD4 : Suspension d'utilisateurs, modification de config, consultation des transactions
 */

/**
 * Vérifie si un utilisateur est suspendu (R-AD1, R-U4)
 * @param {string} userId - ID de l'utilisateur
 * @returns {object} { suspended: boolean, reason: string|null, suspendedAt: string|null }
 */
export const checkUserSuspension = (userId) => {
  const suspensionsKey = 'hrs_suspensions'
  const suspensions = JSON.parse(localStorage.getItem(suspensionsKey) || '[]')

  const suspension = suspensions.find((s) => s.userId === userId && s.active === true)

  if (suspension) {
    return {
      suspended: true,
      reason: suspension.reason,
      suspendedAt: suspension.suspendedAt,
      suspensionId: suspension.id
    }
  }

  return { suspended: false, reason: null, suspendedAt: null }
}

/**
 * Suspend un utilisateur (R-AD1)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} reason - Raison de la suspension
 * @param {string} adminId - ID de l'admin effectuant l'action
 * @returns {object} { success: boolean, message: string }
 */
export const adminSuspendUser = (userId, reason, adminId) => {
  // Vérifier qu'il n'est pas déjà suspendu
  const { suspended } = checkUserSuspension(userId)

  if (suspended) {
    return { success: false, message: 'Utilisateur déjà suspendu.' }
  }

  const suspensionId = `susp_${Date.now()}`
  const now = new Date().toISOString()

  const suspension = {
    id: suspensionId,
    userId,
    reason,
    active: true,
    suspendedAt: now,
    suspendedBy: adminId,
    liftedAt: null
  }

  const suspensionsKey = 'hrs_suspensions'
  const suspensions = JSON.parse(localStorage.getItem(suspensionsKey) || '[]')
  suspensions.push(suspension)
  localStorage.setItem(suspensionsKey, JSON.stringify(suspensions))

  // Enregistrer l'action dans le log admin
  logAdminAction(adminId, 'suspend_user', userId, reason)

  return {
    success: true,
    message: `Utilisateur ${userId} suspendu pour raison: "${reason}"`
  }
}

/**
 * Lève la suspension d'un utilisateur (R-AD1)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} adminId - ID de l'admin effectuant l'action
 * @returns {object} { success: boolean, message: string }
 */
export const adminLiftSuspension = (userId, adminId) => {
  const { suspended, suspensionId } = checkUserSuspension(userId)

  if (!suspended) {
    return { success: false, message: 'Utilisateur n\'est pas suspendu.' }
  }

  const suspensionsKey = 'hrs_suspensions'
  const suspensions = JSON.parse(localStorage.getItem(suspensionsKey) || '[]')
  const suspensionIndex = suspensions.findIndex((s) => s.id === suspensionId)

  if (suspensionIndex === -1) {
    return { success: false, message: 'Suspension non trouvée.' }
  }

  suspensions[suspensionIndex].active = false
  suspensions[suspensionIndex].liftedAt = new Date().toISOString()
  suspensions[suspensionIndex].liftedBy = adminId

  localStorage.setItem(suspensionsKey, JSON.stringify(suspensions))

  logAdminAction(adminId, 'lift_suspension', userId, 'Suspension levée')

  return {
    success: true,
    message: `Suspension de ${userId} levée.`
  }
}

/**
 * Met à jour les taux de commission (R-AD3)
 * @param {number} lodgingRate - Nouveau taux logements (0-1)
 * @param {number} serviceRate - Nouveau taux services (0-1)
 * @param {string} adminId - ID de l'admin effectuant l'action
 * @returns {object} { success: boolean, message: string, newConfig: object|null }
 */
export const adminUpdateCommissionRates = (lodgingRate, serviceRate, adminId) => {
  if (lodgingRate < 0 || lodgingRate > 1 || serviceRate < 0 || serviceRate > 1) {
    return { success: false, message: 'Les taux doivent être entre 0 et 1.', newConfig: null }
  }

  const newConfig = {
    lodgingCommission: lodgingRate,
    serviceCommission: serviceRate,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId
  }

  localStorage.setItem('hrs_commission_rates', JSON.stringify(newConfig))

  logAdminAction(adminId, 'update_commission_rates', 'platform', `Logements: ${(lodgingRate * 100).toFixed(1)}%, Services: ${(serviceRate * 100).toFixed(1)}%`)

  return {
    success: true,
    message: `Commissions mises à jour. Logements: ${(lodgingRate * 100).toFixed(1)}%, Services: ${(serviceRate * 100).toFixed(1)}%`,
    newConfig
  }
}

/**
 * Met à jour les poids de scoring (R-AD3)
 * @param {object} weights - Nouveaux poids { distance, price, rating, social, history }
 * @param {string} adminId - ID de l'admin effectuant l'action
 * @returns {object} { success: boolean, message: string, normalizedWeights: object|null }
 */
export const adminUpdateScoringWeights = (weights, adminId) => {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0)

  if (total === 0) {
    return { success: false, message: 'La somme des poids ne peut pas être 0.', normalizedWeights: null }
  }

  // Normalisation automatique
  const normalized = {}
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = value / total
  }

  const config = {
    ...normalized,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId
  }

  localStorage.setItem('hrs_scoring_weights', JSON.stringify(config))

  logAdminAction(adminId, 'update_scoring_weights', 'platform', `Distance: ${(config.distance * 100).toFixed(0)}%, Price: ${(config.price * 100).toFixed(0)}%, Rating: ${(config.rating * 100).toFixed(0)}%`)

  return {
    success: true,
    message: 'Poids de scoring mis à jour et normalisés.',
    normalizedWeights: config
  }
}

/**
 * Récupère toutes les transactions de la plateforme (R-AD4)
 * @param {object} filters - Filtres optionnels { type, status, dateFrom, dateTo, userId }
 * @returns {object[]} Tableau des transactions
 */
export const adminViewAllTransactions = (filters = {}) => {
  const transactions = []

  // Collecte des paiements de tous les utilisateurs
  for (let key in localStorage) {
    if (key.startsWith('hrs_payments_')) {
      const payments = JSON.parse(localStorage.getItem(key) || '[]')
      transactions.push(...payments.map((p) => ({ ...p, type: 'payment', source: 'payment' })))
    }
  }

  // Collecte des remboursements
  const refunds = JSON.parse(localStorage.getItem('hrs_refunds') || '[]')
  transactions.push(...refunds.map((r) => ({ ...r, type: 'refund', source: 'refund' })))

  // Collecte des réservations (comme transactions)
  for (let key in localStorage) {
    if (key.startsWith('hrs_reservations_')) {
      const reservations = JSON.parse(localStorage.getItem(key) || '[]')
      transactions.push(...reservations.map((r) => ({ ...r, type: 'reservation', source: 'reservation' })))
    }
  }

  // Appliquer les filtres
  let filtered = transactions

  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type)
  }

  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status)
  }

  if (filters.userId) {
    filtered = filtered.filter((t) => t.userId === filters.userId || t.providerId === filters.userId)
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    filtered = filtered.filter((t) => new Date(t.createdAt || t.processedAt) >= from)
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    filtered = filtered.filter((t) => new Date(t.createdAt || t.processedAt) <= to)
  }

  // Tri par date décroissante
  return filtered.sort((a, b) => new Date(b.createdAt || b.processedAt) - new Date(a.createdAt || a.processedAt))
}

/**
 * Effectue un remboursement manuel (R-AD4)
 * @param {string} transactionId - ID de la transaction originale
 * @param {number} amount - Montant à rembourser
 * @param {string} reason - Raison du remboursement
 * @param {string} adminId - ID de l'admin effectuant l'action
 * @returns {object} { success: boolean, message: string, refundId: string|null }
 */
export const adminTriggerRefund = (transactionId, amount, reason, adminId) => {
  const refundId = `admin_refund_${Date.now()}`

  const refund = {
    id: refundId,
    originalTransactionId: transactionId,
    amount,
    reason,
    triggeredBy: adminId,
    status: 'processed',
    processedAt: new Date().toISOString()
  }

  // Persister le remboursement
  const refundsKey = 'hrs_refunds'
  const refunds = JSON.parse(localStorage.getItem(refundsKey) || '[]')
  refunds.push(refund)
  localStorage.setItem(refundsKey, JSON.stringify(refunds))

  logAdminAction(adminId, 'trigger_refund', transactionId, `Remboursement de ${amount} FCFA: ${reason}`)

  return {
    success: true,
    message: `Remboursement de ${amount} FCFA déclenché. Ref: ${refundId}`,
    refundId
  }
}

/**
 * Récupère le journal des actions administrateur (R-AD4)
 * @param {object} filters - Filtres optionnels { performedBy, actionType, dateFrom, dateTo }
 * @returns {object[]} Tableau des actions admin triées par date
 */
export const adminViewActionLog = (filters = {}) => {
  const actionsKey = 'hrs_admin_actions'
  const actions = JSON.parse(localStorage.getItem(actionsKey) || '[]')

  let filtered = actions

  if (filters.performedBy) {
    filtered = filtered.filter((a) => a.performedBy === filters.performedBy)
  }

  if (filters.actionType) {
    filtered = filtered.filter((a) => a.type === filters.actionType)
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    filtered = filtered.filter((a) => new Date(a.performedAt) >= from)
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    filtered = filtered.filter((a) => new Date(a.performedAt) <= to)
  }

  // Tri par date décroissante
  return filtered.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt))
}

/**
 * Récupère les statistiques globales de la plateforme (optionnel)
 * @returns {object} Stats { totalUsers, activeListings, monthlyRevenue, etc. }
 */
export const adminGetPlatformStats = () => {
  const users = JSON.parse(localStorage.getItem('hrs_users') || '[]')
  const houses = JSON.parse(localStorage.getItem('hrs_houses') || '[]')
  const rooms = JSON.parse(localStorage.getItem('hrs_rooms') || '[]')
  const listings = JSON.parse(localStorage.getItem('hrs_listings') || '[]')

  const activeListings = [
    ...houses.filter((h) => h.status === 'active'),
    ...rooms.filter((r) => r.status === 'active'),
    ...listings.filter((l) => l.status === 'active')
  ]

  let totalRevenue = 0
  let monthlyRevenue = 0

  for (let key in localStorage) {
    if (key.startsWith('hrs_payments_')) {
      const payments = JSON.parse(localStorage.getItem(key) || '[]')
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      payments.forEach((p) => {
        if (p.status === 'completed') {
          totalRevenue += p.amount
          if (new Date(p.createdAt) >= startOfMonth) {
            monthlyRevenue += p.amount
          }
        }
      })
    }
  }

  const suspensions = JSON.parse(localStorage.getItem('hrs_suspensions') || '[]')
  const activeSuspensions = suspensions.filter((s) => s.active === true)

  return {
    totalUsers: users.length,
    activeListings: activeListings.length,
    houseCount: houses.filter((h) => h.status === 'active').length,
    roomCount: rooms.filter((r) => r.status === 'active').length,
    activeServiceCount: Object.keys(localStorage).filter((k) => k.startsWith('hrs_services_')).length,
    activeSuspensions: activeSuspensions.length,
    totalRevenue: Math.round(totalRevenue),
    monthlyRevenue: Math.round(monthlyRevenue),
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Enregistre une action admin dans le journal (utilitaire interne)
 * @param {string} adminId - ID de l'admin
 * @param {string} actionType - Type d'action
 * @param {string} targetId - ID de la cible
 * @param {string} description - Description de l'action
 */
const logAdminAction = (adminId, actionType, targetId, description) => {
  const actionsKey = 'hrs_admin_actions'
  const actions = JSON.parse(localStorage.getItem(actionsKey) || '[]')

  actions.push({
    id: `action_${Date.now()}`,
    type: actionType,
    targetId,
    description,
    performedBy: adminId,
    performedAt: new Date().toISOString()
  })

  localStorage.setItem(actionsKey, JSON.stringify(actions))
}
