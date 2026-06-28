/**
 * @file paymentUtils.js
 * @description Utilitaires pour la gestion des paiements, commissions et forfaits
 * R-P1 à R-P6 : Paiements intermédiés, commissions, webhooks Stripe, remboursements
 */

import { PaymentStates, PaymentEvents, paymentNextState } from './stateMachines.js'

/**
 * Configuration des commissions par défaut (R-P2, R-P3)
 */
export const DEFAULT_COMMISSION_CONFIG = {
  lodgingCommission: 0.15, // 15% pour logements
  serviceCommission: 0.20, // 20% pour services
  adminConfigurable: true
}

/**
 * Récupère la configuration des commissions (R-P2)
 * @returns {object} Configuration { lodgingCommission, serviceCommission, lastUpdated }
 */
export const getCommissionConfig = () => {
  const configKey = 'hrs_commission_config'
  const config = JSON.parse(localStorage.getItem(configKey) || 'null')

  if (config) {
    return config
  }

  return {
    lodgingCommission: DEFAULT_COMMISSION_CONFIG.lodgingCommission,
    serviceCommission: DEFAULT_COMMISSION_CONFIG.serviceCommission,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Met à jour la configuration des commissions (admin only) (R-P2, R-AD3)
 * @param {number} lodgingRate - Taux de commission logements (0-1)
 * @param {number} serviceRate - Taux de commission services (0-1)
 * @returns {object} { success: boolean, message: string, newConfig: object|null }
 */
export const updateCommissionConfig = (lodgingRate, serviceRate) => {
  if (lodgingRate < 0 || lodgingRate > 1 || serviceRate < 0 || serviceRate > 1) {
    return { success: false, message: 'Les taux doivent être entre 0 et 1.' }
  }

  const newConfig = {
    lodgingCommission: lodgingRate,
    serviceCommission: serviceRate,
    lastUpdated: new Date().toISOString()
  }

  localStorage.setItem('hrs_commission_config', JSON.stringify(newConfig))

  return {
    success: true,
    message: `Commissions mises à jour. Logements: ${(lodgingRate * 100).toFixed(1)}%, Services: ${(serviceRate * 100).toFixed(1)}%`,
    newConfig
  }
}

/**
 * Récupère le forfait actif d'un utilisateur et son coefficient α de réduction (R-P3)
 * @param {string} userId - ID utilisateur
 * @returns {object} { planType: string|null, alphaFactor: number, discountPercent: number }
 */
export const getUserPlanAlpha = (userId) => {
  const plansKey = `hrs_plans_${userId}`
  const plan = JSON.parse(localStorage.getItem(plansKey) || 'null')

  if (!plan || new Date(plan.expiresAt) < new Date()) {
    return { planType: null, alphaFactor: 1.0, discountPercent: 0 }
  }

  // Forfait annuel = 20% réduction; forfait mensuel = 5% réduction (exemple)
  const alphaFactors = {
    monthly: 0.95, // 5% réduction
    annual: 0.80 // 20% réduction
  }

  const alphaFactor = alphaFactors[plan.type] || 1.0
  const discountPercent = (1 - alphaFactor) * 100

  return { planType: plan.type, alphaFactor, discountPercent: Math.round(discountPercent) }
}

/**
 * Calcule le montant net reçu par le fournisseur après commission (R-P1)
 * @param {number} grossAmount - Montant brut (avant commission)
 * @param {string} entityType - Type d'entité ('lodging'|'service')
 * @param {string} providerId - ID du fournisseur (pour appliquer α si forfait)
 * @returns {object} {
 *   grossAmount, commissionRate, planDiscount, alphaFactor,
 *   commissionAmount, netAmount, platformRevenue
 * }
 */
export const calculateNetPayment = (grossAmount, entityType, providerId) => {
  const config = getCommissionConfig()
  const baseRate = entityType === 'lodging' ? config.lodgingCommission : config.serviceCommission

  const { alphaFactor } = getUserPlanAlpha(providerId)

  // Commission après réduction plan (α)
  const finalRate = baseRate * alphaFactor
  const commissionAmount = Math.round(grossAmount * finalRate)
  const netAmount = grossAmount - commissionAmount

  return {
    grossAmount,
    commissionRate: (finalRate * 100).toFixed(1) + '%',
    planDiscount: (alphaFactor * 100).toFixed(1) + '%',
    alphaFactor,
    commissionAmount,
    netAmount,
    platformRevenue: commissionAmount
  }
}

/**
 * Crée une transaction de paiement en attente (avant webhook Stripe) (R-P6)
 * @param {object} data - { reservationId, userId, providerId, amount, paymentMethod }
 * @returns {object} Transaction { id, status: 'pending', createdAt, stripeCheckoutUrl: string (simulé) }
 */

export const createPendingPayment = (data) => {
  const paymentId = `pay_${Date.now()}`
  const now = new Date()

  // Simulation Stripe checkout URL (à remplacer par l'intégration réelle)
  const stripeCheckoutUrl = `https://checkout.stripe.com/pay/cs_test_${paymentId}`

  const payment = {
    id: paymentId,
    reservationId: data.reservationId,
    userId: data.userId,
    providerId: data.providerId,
    amount: data.amount,
    paymentMethod: data.paymentMethod || 'card',
    status: PaymentStates.PENDING,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 min
    stripeCheckoutUrl,
    stripeSessionId: null,
    webhookReceivedAt: null
  }

  // Persister le paiement
  const paymentsKey = `hrs_payments_${data.userId}`
  const payments = JSON.parse(localStorage.getItem(paymentsKey) || '[]')
  localStorage.setItem(paymentsKey, JSON.stringify([payment, ...payments]))

  return payment
}

/**
 * Simule la réception d'un webhook Stripe (R-P6)
 * En production, le backend reçoit le webhook et met à jour le statut
 * @param {string} paymentId - ID du paiement
 * @param {string} status - Statut retourné par Stripe ('succeeded'|'failed')
 * @param {object} webhookData - Données du webhook (simulées)
 * @returns {object} { success: boolean, message: string, paymentUpdated: object|null }
 */
export const processPaymentWebhook = (paymentId, status, webhookData = {}) => {
  if (!['succeeded', 'failed'].includes(status)) {
    return { success: false, message: 'Statut de webhook invalide.' }
  }

  // Chercher le paiement dans tous les utilisateurs (simplification)
  const paymentsKeyPrefix = 'hrs_payments_'
  let payment = null
  let userId = null

  // Itérer sur le localStorage pour trouver le paiement (limitation du localStorage)
  for (let key in localStorage) {
    if (key.startsWith(paymentsKeyPrefix)) {
      const payments = JSON.parse(localStorage.getItem(key) || '[]')
      const found = payments.find((p) => p.id === paymentId)
      if (found) {
        payment = found
        userId = key.replace(paymentsKeyPrefix, '')
        break
      }
    }
  }

  if (!payment) {
    return { success: false, message: 'Paiement non trouvé.' }
  }

  const event = status === 'succeeded' ? PaymentEvents.SUCCEED : PaymentEvents.FAIL
  payment.status = paymentNextState(payment.status, event)
  payment.webhookReceivedAt = new Date().toISOString()
  payment.webhookData = webhookData

  if (status === 'succeeded') {
    // Marquer la réservation comme payée
    const userReservationsKey = `hrs_reservations_${userId}`
    const reservations = JSON.parse(localStorage.getItem(userReservationsKey) || '[]')
    const reservation = reservations.find((r) => r.id === payment.reservationId)
    if (reservation) {
      reservation.paymentStatus = 'paid'
      reservation.paidAt = new Date().toISOString()
      localStorage.setItem(userReservationsKey, JSON.stringify(reservations))
    }
  }

  localStorage.setItem(`hrs_payments_${userId}`, JSON.stringify(payments.map((p) => (p.id === paymentId ? payment : p))))

  return {
    success: true,
    message: status === 'succeeded' ? 'Paiement confirmé.' : 'Paiement échoué.',
    paymentUpdated: payment
  }
}

/**
 * Traite un remboursement partiel ou total (R-P5, R-AD4)
 * @param {string} reservationId - ID de la réservation
 * @param {number} amount - Montant à rembourser (en FCFA)
 * @param {string} reason - Raison du remboursement
 * @returns {object} { success: boolean, message: string, refundId: string|null }
 */
export const processRefund = (reservationId, amount, reason) => {
  const refundId = `refund_${Date.now()}`
  const now = new Date().toISOString()

  const refund = {
    id: refundId,
    reservationId,
    amount,
    reason,
    status: 'processed',
    processedAt: now,
    processedBy: 'admin' // À adapter selon le contexte
  }

  // Persister le remboursement
  const refundsKey = 'hrs_refunds'
  const refunds = JSON.parse(localStorage.getItem(refundsKey) || '[]')
  refunds.push(refund)
  localStorage.setItem(refundsKey, JSON.stringify(refunds))

  // Mettre à jour le paiement lié en statut remboursé si possible
  for (let key in localStorage) {
    if (key.startsWith('hrs_payments_')) {
      const payments = JSON.parse(localStorage.getItem(key) || '[]')
      const paymentIndex = payments.findIndex((p) => p.reservationId === reservationId)
      if (paymentIndex !== -1) {
        const payment = payments[paymentIndex]
        if (payment.status === PaymentStates.PAID) {
          payment.status = paymentNextState(payment.status, PaymentEvents.REFUND)
          payments[paymentIndex] = payment
          localStorage.setItem(key, JSON.stringify(payments))
        }
        break
      }
    }
  }

  return {
    success: true,
    message: `Remboursement de ${amount} FCFA traité. Référence: ${refundId}`,
    refundId
  }
}

/**
 * Récupère toutes les transactions (pour l'admin) (R-AD4)
 * @returns {object[]} Tableau de toutes les transactions
 */
export const getAllTransactions = () => {
  const transactions = []

  // Collecte des paiements
  for (let key in localStorage) {
    if (key.startsWith('hrs_payments_')) {
      const payments = JSON.parse(localStorage.getItem(key) || '[]')
      transactions.push(...payments.map((p) => ({ ...p, type: 'payment' })))
    }
  }

  // Collecte des remboursements
  const refunds = JSON.parse(localStorage.getItem('hrs_refunds') || '[]')
  transactions.push(...refunds.map((r) => ({ ...r, type: 'refund' })))

  return transactions.sort((a, b) => new Date(b.createdAt || b.processedAt) - new Date(a.createdAt || a.processedAt))
}
