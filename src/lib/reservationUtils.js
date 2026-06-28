/**
 * @file reservationUtils.js
 * @description Utilitaires pour la gestion des réservations et commandes
 * R-R1 à R-R6 : Gestion des statuts, délais de confirmation, chevauchement, etc.
 */

import { ReservationStates, ReservationEvents, reservationNextState, isFinalReservationState } from './stateMachines.js'

/**
 * Vérifie si deux plages de dates se chevauchent (R-A3, R-R5)
 * @param {string} startA - Date de début A (YYYY-MM-DD)
 * @param {string} endA - Date de fin A (YYYY-MM-DD)
 * @param {string} startB - Date de début B (YYYY-MM-DD)
 * @param {string} endB - Date de fin B (YYYY-MM-DD)
 * @returns {boolean} true si les plages se chevauchent
 */
export const checkDateOverlap = (startA, endA, startB, endB) => {
  return !(new Date(endA) <= new Date(startB) || new Date(startA) >= new Date(endB))
}

/**
 * Vérifie la disponibilité d'une ou plusieurs chambres (R-A3, R-A4)
 * @param {string|string[]} roomIds - ID(s) des chambres à vérifier
 * @param {string} checkIn - Date d'arrivée (YYYY-MM-DD)
 * @param {string} checkOut - Date de départ (YYYY-MM-DD)
 * @returns {object} { available: boolean, unavailableRoomId: string|null, reason: string|null }
 */
export const checkRoomAvailability = (roomIds, checkIn, checkOut) => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds]

  for (const roomId of roomIdArray) {
    const blockedKey = `hrs_blocked_${roomId}`
    const blockedPeriods = JSON.parse(localStorage.getItem(blockedKey) || '[]')

    for (const blocked of blockedPeriods) {
      if (checkDateOverlap(checkIn, checkOut, blocked.startDate, blocked.endDate)) {
        return {
          available: false,
          unavailableRoomId: roomId,
          reason: `La chambre est déjà réservée du ${blocked.startDate} au ${blocked.endDate}.`
        }
      }
    }
  }

  return { available: true, unavailableRoomId: null, reason: null }
}

/**
 * Vérifie la disponibilité d'une maison entière (toutes ses chambres) (R-A4)
 * @param {string} houseId - ID de la maison
 * @param {string[]} roomIds - IDs des chambres de la maison
 * @param {string} checkIn - Date d'arrivée (YYYY-MM-DD)
 * @param {string} checkOut - Date de départ (YYYY-MM-DD)
 * @returns {object} { available: boolean, unavailableRoomIds: string[], message: string|null }
 */
export const checkHouseAvailability = (houseId, roomIds, checkIn, checkOut) => {
  const unavailable = []

  for (const roomId of roomIds) {
    const blockedKey = `hrs_blocked_${roomId}`
    const blockedPeriods = JSON.parse(localStorage.getItem(blockedKey) || '[]')

    for (const blocked of blockedPeriods) {
      if (checkDateOverlap(checkIn, checkOut, blocked.startDate, blocked.endDate)) {
        unavailable.push(roomId)
        break
      }
    }
  }

  if (unavailable.length > 0) {
    return {
      available: false,
      unavailableRoomIds: unavailable,
      message: `La maison n'est pas complètement disponible pour ces dates. ${unavailable.length}/${roomIds.length} chambre(s) occupée(s).`
    }
  }

  return { available: true, unavailableRoomIds: [], message: null }
}

/**
 * Crée une réservation en statut "pending" avec verrouillage immédiat des dates (R-R1)
 * @param {object} data - Données de la réservation {
 *   userId, listingId, checkIn, checkOut, guests, totalPrice, entityType (Room|House|Listing)
 * }
 * @returns {object} Réservation créée { id, status: 'pending', createdAt, expiresAt }
 */

export const createPendingReservation = (data) => {
  const reservationId = `res_${Date.now()}`
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 heures (R-R2)

  const reservation = {
    id: reservationId,
    userId: data.userId,
    listingId: data.listingId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    totalPrice: data.totalPrice,
    entityType: data.entityType || 'Listing',
    status: ReservationStates.PENDING,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    confirmedAt: null,
    confirmedBy: null
  }

  // Persister la réservation
  const userReservationsKey = `hrs_reservations_${data.userId}`
  const prevReservations = JSON.parse(localStorage.getItem(userReservationsKey) || '[]')
  localStorage.setItem(userReservationsKey, JSON.stringify([reservation, ...prevReservations]))

  return reservation
}

/**
 * Récupère toutes les réservations en attente de confirmation d'un hôte (R-R2)
 * @param {string} hostId - ID de l'hôte
 * @returns {object[]} Tableau des réservations pendantes
 */
export const getPendingReservationsForHost = (hostId) => {
  const pendingKey = `hrs_pending_reservations_${hostId}`
  const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')
  return pending
}

/**
 * Accepte ou refuse une réservation (R-R2, R-R3)
 * @param {string} hostId - ID de l'hôte
 * @param {string} reservationId - ID de la réservation
 * @param {boolean} accept - true pour accepter, false pour refuser
 * @param {string} reason - Raison du refus (optionnel)
 * @returns {object} { success: boolean, message: string, newStatus: string }
 */
export const confirmOrRejectReservation = (hostId, reservationId, accept, reason = '') => {
  const pendingKey = `hrs_pending_reservations_${hostId}`
  const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')

  const index = pending.findIndex((r) => r.id === reservationId)
  if (index === -1) {
    return { success: false, message: 'Réservation non trouvée.', newStatus: null }
  }

  const reservation = pending[index]
  const now = new Date()

  // Vérifier si la réservation a expiré (R-R2)
  if (new Date(reservation.expiresAt) < now) {
    pending[index].status = reservationNextState(reservation.status, ReservationEvents.EXPIRE)
    pending[index].expiredAt = now.toISOString()
    localStorage.setItem(pendingKey, JSON.stringify(pending))
    return { success: false, message: 'Le délai de 24 heures a expiré.', newStatus: pending[index].status }
  }

  if (accept) {
    pending[index].status = reservationNextState(reservation.status, ReservationEvents.CONFIRM)
    pending[index].confirmedAt = now.toISOString()
    pending[index].confirmedBy = hostId
  } else {
    pending[index].status = reservationNextState(reservation.status, ReservationEvents.REJECT)
    pending[index].rejectionReason = reason
    pending[index].rejectedAt = now.toISOString()

    // Déverrouiller les dates
    // (les dates restent bloquées jusqu'à nouvelle réservation ou expiration)
  }

  localStorage.setItem(pendingKey, JSON.stringify(pending))

  return {
    success: true,
    message: accept ? 'Réservation confirmée.' : 'Réservation refusée.',
    newStatus: pending[index].status
  }
}

/**
 * Annule une réservation (permet une compensation) (R-R3, R-U5)
 * Une réservation confirmée ne peut être annulée que par le client (R-R3)
 * @param {string} userId - ID de l'utilisateur (client)
 * @param {string} reservationId - ID de la réservation
 * @returns {object} { success: boolean, message: string, refundAmount: number|null }
 */
export const cancelReservation = (userId, reservationId) => {
  const userReservationsKey = `hrs_reservations_${userId}`
  const reservations = JSON.parse(localStorage.getItem(userReservationsKey) || '[]')

  const reservation = reservations.find((r) => r.id === reservationId)
  if (!reservation) {
    return { success: false, message: 'Réservation non trouvée.', refundAmount: null }
  }

  if (isFinalReservationState(reservation.status) || reservation.status === ReservationStates.CANCELLED) {
    return { success: false, message: 'Cette réservation ne peut pas être annulée.', refundAmount: null }
  }

  const now = new Date()
  const newStatus = reservationNextState(reservation.status, ReservationEvents.CANCEL)

  if (reservation.status === ReservationStates.CONFIRMED) {
    const checkOut = new Date(reservation.checkOut)
    const daysBeforeCheckOut = Math.ceil((checkOut - now) / (1000 * 60 * 60 * 24))

    let refundPercent = 100
    if (daysBeforeCheckOut < 3) refundPercent = 0 // Pas de remboursement < 3 jours
    else if (daysBeforeCheckOut < 7) refundPercent = 50 // 50% de remboursement < 7 jours

    const refundAmount = Math.round((reservation.totalPrice * refundPercent) / 100)

    reservation.status = newStatus
    reservation.cancelledAt = now.toISOString()
    reservation.refundAmount = refundAmount
    reservation.refundPercent = refundPercent

    localStorage.setItem(userReservationsKey, JSON.stringify(reservations))

    return {
      success: true,
      message: `Réservation annulée. Remboursement: ${refundPercent}% (${refundAmount} FCFA).`,
      refundAmount
    }
  } else if (reservation.status === ReservationStates.PENDING) {
    reservation.status = newStatus
    reservation.cancelledAt = now.toISOString()
    reservation.refundAmount = reservation.totalPrice

    localStorage.setItem(userReservationsKey, JSON.stringify(reservations))

    return {
      success: true,
      message: 'Réservation en attente annulée. Remboursement intégral effectué.',
      refundAmount: reservation.totalPrice
    }
  }

  return { success: false, message: 'Cette réservation ne peut pas être annulée.', refundAmount: null }
}

/**
 * Simule l'expiration automatique des réservations > 24h (R-R2)
 * À appeler périodiquement (e.g., au montage du composant)
 * @param {string} hostId - ID de l'hôte
 * @returns {object} { expiredCount: number, affectedReservations: string[] }
 */
export const checkAndExpireReservations = (hostId) => {
  const pendingKey = `hrs_pending_reservations_${hostId}`
  const pending = JSON.parse(localStorage.getItem(pendingKey) || '[]')

  const now = new Date()
  let expiredCount = 0
  const affectedIds = []

  pending.forEach((r) => {
    if (r.status === ReservationStates.PENDING && new Date(r.expiresAt) < now) {
      r.status = reservationNextState(r.status, ReservationEvents.EXPIRE)
      r.expiredAt = now.toISOString()
      expiredCount++
      affectedIds.push(r.id)
    }
  })

  if (expiredCount > 0) {
    localStorage.setItem(pendingKey, JSON.stringify(pending))
  }

  return { expiredCount, affectedReservations: affectedIds }
}
