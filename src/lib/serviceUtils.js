/**
 * @file serviceUtils.js
 * @description Utilitaires pour la gestion des commandes de service
 * R-R4 à R-R6 : Commandes de service, délais 12h, vérification heures provider, dépendance logement
 */

/**
 * Crée une commande de service en attente de confirmation (R-R4)
 * Les commandes de service ont un délai de 12 heures (vs 24h pour réservations)
 * @param {object} data - {
 *   clientId, providerId, serviceId, startTime, endTime, quantity, totalPrice
 * }
 * @returns {object} Commande de service { id, status: 'pending', expiresAt (12h), ... }
 */
import { ServiceOrderStates, ServiceOrderEvents, serviceOrderNextState } from './stateMachines.js'

export const createServiceOrder = (data) => {
  const orderId = `svc_${Date.now()}`
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 heures (R-R4)

  const order = {
    id: orderId,
    clientId: data.clientId,
    providerId: data.providerId,
    serviceId: data.serviceId,
    startTime: data.startTime,
    endTime: data.endTime,
    quantity: data.quantity,
    totalPrice: data.totalPrice,
    status: ServiceOrderStates.PENDING,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    confirmedAt: null,
    confirmedBy: null,
    completedAt: null,
    cancelledAt: null
  }

  // Persister la commande
  const serviceOrdersKey = `hrs_service_orders_${data.clientId}`
  const orders = JSON.parse(localStorage.getItem(serviceOrdersKey) || '[]')
  localStorage.setItem(serviceOrdersKey, JSON.stringify([order, ...orders]))

  return order
}

/**
 * Récupère toutes les commandes de service en attente d'un provider (R-R4)
 * @param {string} providerId - ID du provider
 * @returns {object[]} Tableau des commandes pendantes
 */
export const getPendingServiceOrdersForProvider = (providerId) => {
  const ordersKey = `hrs_service_orders_pending_${providerId}`
  const pending = JSON.parse(localStorage.getItem(ordersKey) || '[]')
  return pending
}

/**
 * Vérifie la disponibilité d'un provider pour un créneau horaire (R-R5)
 * Empêche les services qui se chevauchent pour le même provider
 * @param {string} providerId - ID du provider
 * @param {string} startTime - Heure de début (ISO)
 * @param {string} endTime - Heure de fin (ISO)
 * @returns {object} { available: boolean, conflict: object|null }
 */
export const validateProviderAvailability = (providerId, startTime, endTime) => {
  const providerOrdersKey = `hrs_service_orders_${providerId}`
  const allOrders = JSON.parse(localStorage.getItem(providerOrdersKey) || '[]')

  // Filtrer les commandes confirmées qui se chevauchent
  for (const order of allOrders) {
    if (order.status === 'confirmed') {
      const orderStart = new Date(order.startTime)
      const orderEnd = new Date(order.endTime)
      const newStart = new Date(startTime)
      const newEnd = new Date(endTime)

      // Vérifier le chevauchement
      if (!(newEnd <= orderStart || newStart >= orderEnd)) {
        return {
          available: false,
          conflict: {
            orderId: order.id,
            conflictStart: order.startTime,
            conflictEnd: order.endTime,
            message: `Conflit avec une autre commande du ${new Date(order.startTime).toLocaleDateString('fr-FR')}`
          }
        }
      }
    }
  }

  return { available: true, conflict: null }
}

/**
 * Confirme une commande de service par le provider (R-R4)
 * Condition: si c'est un service lié à un logement, la réservation du logement doit être confirmée (R-R6)
 * @param {string} providerId - ID du provider
 * @param {string} orderId - ID de la commande
 * @param {string} relatedReservationId - ID de la réservation logement associée (optionnel)
 * @returns {object} { success: boolean, message: string, newStatus: string|null }
 */
export const confirmServiceOrder = (providerId, orderId, relatedReservationId = null) => {
  // 1. Vérifier la dépendance logement (R-R6)
  if (relatedReservationId) {
    // Chercher la réservation dans le localStorage
    let reservation = null

    for (let key in localStorage) {
      if (key.startsWith('hrs_reservations_')) {
        const reservations = JSON.parse(localStorage.getItem(key) || '[]')
        const found = reservations.find((r) => r.id === relatedReservationId)
        if (found) {
          reservation = found
          break
        }
      }
    }

    if (reservation && reservation.status !== 'confirmed') {
      return {
        success: false,
        message: 'La réservation du logement associée ne doit pas être confirmée. Service non autorisé.',
        newStatus: null
      }
    }
  }

  // 2. Récupérer la commande
  let order = null
  let clientId = null

  for (let key in localStorage) {
    if (key.startsWith('hrs_service_orders_')) {
      const orders = JSON.parse(localStorage.getItem(key) || '[]')
      const found = orders.find((o) => o.id === orderId)
      if (found) {
        order = found
        clientId = key.replace('hrs_service_orders_', '')
        break
      }
    }
  }

  if (!order) {
    return { success: false, message: 'Commande non trouvée.', newStatus: null }
  }

  if (order.status !== ServiceOrderStates.PENDING) {
    return { success: false, message: 'Cette commande n\'est pas en attente.', newStatus: null }
  }

  const now = new Date()

  // Vérifier l'expiration (12 heures)
  if (new Date(order.expiresAt) < now) {
    order.status = serviceOrderNextState(order.status, ServiceOrderEvents.EXPIRE)
    if (clientId) {
      const key = `hrs_service_orders_${clientId}`
      const orders = JSON.parse(localStorage.getItem(key) || '[]')
      const index = orders.findIndex((o) => o.id === orderId)
      if (index >= 0) {
        orders[index] = order
        localStorage.setItem(key, JSON.stringify(orders))
      }
    }
    return { success: false, message: 'Le délai de 12 heures a expiré.', newStatus: 'expired' }
  }

  // 3. Confirmer la commande
  order.status = 'confirmed'
  order.confirmedAt = now.toISOString()
  order.confirmedBy = providerId

  // Persister
  if (clientId) {
    const key = `hrs_service_orders_${clientId}`
    const orders = JSON.parse(localStorage.getItem(key) || '[]')
    const index = orders.findIndex((o) => o.id === orderId)
    if (index >= 0) {
      orders[index] = order
      localStorage.setItem(key, JSON.stringify(orders))
    }

    // Ajouter à la liste des commandes confirmées du provider
    const providerOrdersKey = `hrs_service_orders_confirmed_${providerId}`
    const confirmedOrders = JSON.parse(localStorage.getItem(providerOrdersKey) || '[]')
    confirmedOrders.push(order)
    localStorage.setItem(providerOrdersKey, JSON.stringify(confirmedOrders))
  }

  return {
    success: true,
    message: 'Commande confirmée.',
    newStatus: 'confirmed'
  }
}

/**
 * Annule une commande de service (R-R4)
 * @param {string} clientId - ID du client
 * @param {string} orderId - ID de la commande
 * @param {string} reason - Raison de l'annulation
 * @returns {object} { success: boolean, message: string, refundAmount: number|null }
 */
export const cancelServiceOrder = (clientId, orderId, reason = '') => {
  const orderKey = `hrs_service_orders_${clientId}`
  const orders = JSON.parse(localStorage.getItem(orderKey) || '[]')

  const orderIndex = orders.findIndex((o) => o.id === orderId)
  if (orderIndex === -1) {
    return { success: false, message: 'Commande non trouvée.', refundAmount: null }
  }

  const order = orders[orderIndex]

  if (![ServiceOrderStates.PENDING, ServiceOrderStates.CONFIRMED].includes(order.status)) {
    return { success: false, message: 'Cette commande ne peut pas être annulée.', refundAmount: null }
  }

  const now = new Date()
  const serviceStart = new Date(order.startTime)
  const hoursBeforeService = (serviceStart - now) / (1000 * 60 * 60)

  // Politique d'annulation: remboursement 100% si >24h avant, 50% si 6-24h, 0% si <6h
  let refundPercent = 100
  if (hoursBeforeService < 24) refundPercent = 50
  if (hoursBeforeService < 6) refundPercent = 0

  const refundAmount = Math.round((order.totalPrice * refundPercent) / 100)

  order.status = serviceOrderNextState(order.status, ServiceOrderEvents.CANCEL)
  order.cancelledAt = now.toISOString()
  order.cancellationReason = reason
  order.refundAmount = refundAmount

  orders[orderIndex] = order
  localStorage.setItem(orderKey, JSON.stringify(orders))

  return {
    success: true,
    message: `Commande annulée. Remboursement: ${refundPercent}% (${refundAmount} FCFA).`,
    refundAmount
  }
}

/**
 * Marque une commande comme complétée (R-R4)
 * @param {string} clientId - ID du client
 * @param {string} orderId - ID de la commande
 * @returns {object} { success: boolean, message: string }
 */
export const completeServiceOrder = (clientId, orderId) => {
  const orderKey = `hrs_service_orders_${clientId}`
  const orders = JSON.parse(localStorage.getItem(orderKey) || '[]')

  const orderIndex = orders.findIndex((o) => o.id === orderId)
  if (orderIndex === -1) {
    return { success: false, message: 'Commande non trouvée.' }
  }

  const order = orders[orderIndex]

  if (order.status !== ServiceOrderStates.CONFIRMED) {
    return { success: false, message: 'Seule une commande confirmée peut être marquée comme complétée.' }
  }

  order.status = serviceOrderNextState(order.status, ServiceOrderEvents.COMPLETE)
  order.completedAt = new Date().toISOString()

  orders[orderIndex] = order
  localStorage.setItem(orderKey, JSON.stringify(orders))

  return {
    success: true,
    message: 'Commande marquée comme complétée.'
  }
}

/**
 * Récupère toutes les commandes de service d'un client (R-R4)
 * @param {string} clientId - ID du client
 * @param {string} filter - Filtre: 'all'|'pending'|'confirmed'|'completed'
 * @returns {object[]} Tableau des commandes filtrées
 */
export const getClientServiceOrders = (clientId, filter = 'all') => {
  const orderKey = `hrs_service_orders_${clientId}`
  const orders = JSON.parse(localStorage.getItem(orderKey) || '[]')

  if (filter === 'all') return orders

  return orders.filter((o) => o.status === filter)
}
