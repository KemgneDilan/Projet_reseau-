/**
 * @file listingUtils.js
 * @description Utilitaires pour la gestion des annonces et des services
 * R-A1 à R-A6 : Validation maisons/chambres, atomicité, slots temporels, admin
 */

import { HouseStates, HouseEvents, houseNextState, RoomStates } from './stateMachines.js'
import { checkDateOverlap } from './reservationUtils.js'

/**
 * Récupère une maison avec ses chambres associées (R-A1)
 * @param {string} houseId - ID de la maison
 * @returns {object} Maison avec ses chambres { ...house, rooms: [...] }
 */
export const getHouseWithRooms = (houseId) => {
  // Chercher la maison
  const housesKey = `hrs_houses`
  const houses = JSON.parse(localStorage.getItem(housesKey) || '[]')
  const house = houses.find((h) => h.id === houseId)

  if (!house) return null

  // Récupérer ses chambres
  const roomsKey = `hrs_rooms`
  const allRooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
  const rooms = allRooms.filter((r) => r.houseId === houseId)

  const outOfServiceCount = rooms.filter((r) => r.status === RoomStates.OUT_OF_SERVICE).length
  const effectiveRoomCount = rooms.filter((r) => r.status !== RoomStates.OUT_OF_SERVICE).length

  return {
    ...house,
    rooms,
    roomCount: rooms.length,
    effectiveRoomCount,
    outOfServiceCount
  }
}

/**
 * Vérifie si l'état d'une chambre la rend disponible pour réservation
 * @param {string} status - Statut de la chambre
 * @returns {boolean}
 */
const isRoomAvailableStatus = (status) => {
  return [RoomStates.ACTIVE].includes(status)
}

/**
 * Récupère toutes les chambres associées à une maison
 * @param {string} houseId - ID de la maison
 * @returns {object[]}
 */
export const getHouseRooms = (houseId) => {
  const roomsKey = `hrs_rooms`
  const allRooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
  return allRooms.filter((r) => r.houseId === houseId)
}

/**
 * Nombre de chambres disponibles pour une maison (hors hors service)
 * @param {string} houseId - ID de la maison
 * @returns {number}
 */
export const getEffectiveHouseRoomCount = (houseId) => {
  return getHouseRooms(houseId).filter((r) => r.status !== RoomStates.OUT_OF_SERVICE).length
}

/**
 * Vérifie si une chambre est disponible pour les dates fournies
 * @param {string} roomId
 * @param {string} checkIn
 * @param {string} checkOut
 */
export const isRoomBookable = (roomId, checkIn, checkOut) => {
  const roomsKey = `hrs_rooms`
  const allRooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
  const room = allRooms.find((r) => r.id === roomId)
  if (!room) return { bookable: false, reason: 'Chambre introuvable.' }

  if (!isRoomAvailableStatus(room.status)) {
    const label = room.status === RoomStates.OUT_OF_SERVICE ? 'hors service' : 'occupée'
    return { bookable: false, reason: `Cette chambre est actuellement ${label}.` }
  }

  const blockedKey = `hrs_blocked_${roomId}`
  const blockedPeriods = JSON.parse(localStorage.getItem(blockedKey) || '[]')
  for (const blocked of blockedPeriods) {
    if (checkDateOverlap(checkIn, checkOut, blocked.startDate, blocked.endDate)) {
      return { bookable: false, reason: 'Cette chambre est déjà réservée pour les dates sélectionnées.' }
    }
  }

  return { bookable: true, reason: null }
}

/**
 * Vérifie si la maison complète peut être louée pour une plage donnée en tenant compte des chambres hors service
 * @param {string} houseId
 * @param {string} checkIn
 * @param {string} checkOut
 */
export const canRentWholeHouse = (houseId, checkIn, checkOut) => {
  const houseWithRooms = getHouseWithRooms(houseId)
  if (!houseWithRooms) {
    return { canRentWhole: false, reason: 'Maison introuvable.', effectiveRoomCount: 0 }
  }

  const roomCandidates = houseWithRooms.rooms.filter((room) => room.status !== RoomStates.OUT_OF_SERVICE)
  if (roomCandidates.length === 0) {
    return {
      canRentWhole: false,
      reason: 'Aucune chambre disponible pour louer cette maison dans son entier.',
      effectiveRoomCount: 0
    }
  }

  const unavailableRooms = []
  for (const room of roomCandidates) {
    if (!isRoomAvailableStatus(room.status)) {
      unavailableRooms.push(room.id)
      continue
    }

    const blockedKey = `hrs_blocked_${room.id}`
    const blockedPeriods = JSON.parse(localStorage.getItem(blockedKey) || '[]')
    if (blockedPeriods.some((blocked) => checkDateOverlap(checkIn, checkOut, blocked.startDate, blocked.endDate))) {
      unavailableRooms.push(room.id)
    }
  }

  if (unavailableRooms.length > 0) {
    return {
      canRentWhole: false,
      reason: `Impossible de louer la maison entière car ${unavailableRooms.length} chambre(s) sont déjà occupée(s).`,
      effectiveRoomCount: roomCandidates.length,
      unavailableRoomIds: unavailableRooms
    }
  }

  return {
    canRentWhole: true,
    reason: null,
    effectiveRoomCount: roomCandidates.length,
    outOfServiceCount: houseWithRooms.outOfServiceCount
  }
}

/**
 * Valide qu'une maison peut être publiée (R-A1)
 * Condition: une maison doit contenir au minimum 1 chambre
 * @param {string} houseId - ID de la maison
 * @returns {object} { valid: boolean, message: string|null, roomCount: number }
 */
export const validateHouseBeforePublish = (houseId) => {
  const houseWithRooms = getHouseWithRooms(houseId)

  if (!houseWithRooms) {
    return { valid: false, message: 'Maison non trouvée.', roomCount: 0 }
  }

  if (houseWithRooms.rooms.length === 0) {
    return {
      valid: false,
      message: 'Une maison doit contenir au moins une chambre avant d\'être publiée (R-A1).',
      roomCount: 0
    }
  }

  return {
    valid: true,
    message: `Maison valide avec ${houseWithRooms.rooms.length} chambre(s).`,
    roomCount: houseWithRooms.rooms.length
  }
}

/**
 * Publie une maison (crée une nouvelle version confirmée) (R-A1)
 * @param {string} houseId - ID de la maison
 * @param {string} hostId - ID de l'hôte propriétaire
 * @returns {object} { success: boolean, message: string, publishedHouse: object|null }
 */

export const publishHouse = (houseId, hostId) => {
  const validation = validateHouseBeforePublish(houseId)

  if (!validation.valid) {
    return { success: false, message: validation.message, publishedHouse: null }
  }

  // Marquer comme publié
  const housesKey = `hrs_houses`
  const houses = JSON.parse(localStorage.getItem(housesKey) || '[]')
  const houseIndex = houses.findIndex((h) => h.id === houseId && h.hostId === hostId)

  if (houseIndex === -1) {
    return { success: false, message: 'Maison non trouvée ou accès refusé.', publishedHouse: null }
  }

  const house = houses[houseIndex]
  const currentState = house.status === 'active' ? HouseStates.PUBLISHED : house.status || HouseStates.DRAFT
  house.status = houseNextState(currentState, HouseEvents.PUBLISH)
  house.publishedAt = new Date().toISOString()
  house.version = Math.floor(Date.now() / 1000)

  houses[houseIndex] = house
  localStorage.setItem(housesKey, JSON.stringify(houses))

  return {
    success: true,
    message: `Maison publiée avec ${validation.roomCount} chambre(s).`,
    publishedHouse: house
  }
}

/**
 * Valide l'atomicité d'une chambre (R-A2)
 * Une chambre est une unité atomique, indivisible pour la réservation
 * @param {string} roomId - ID de la chambre
 * @returns {object} { atomic: boolean, message: string }
 */
export const validateRoomAtomicity = (roomId) => {
  const roomsKey = `hrs_rooms`
  const rooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
  const room = rooms.find((r) => r.id === roomId)

  if (!room) {
    return { atomic: false, message: 'Chambre non trouvée.' }
  }

  // Une chambre ne peut pas être subdivisée
  if (room.subRoomIds && room.subRoomIds.length > 0) {
    return { atomic: false, message: 'Cette chambre n\'est pas atomique (contient des sous-divisions).' }
  }

  return { atomic: true, message: 'Chambre atomique.' }
}

/**
 * Valide qu'un créneau horaire d'un service ne se chevauche pas avec d'autres (R-A5)
 * Empêche les conflits de temps pour les services d'un même provider
 * @param {string} serviceId - ID du service
 * @param {string} providerId - ID du provider
 * @param {string} startTime - Heure début (ISO)
 * @param {string} endTime - Heure fin (ISO)
 * @returns {object} { valid: boolean, conflict: object|null }
 */
export const validateServiceTimeSlot = (serviceId, providerId, startTime, endTime) => {
  // Chercher les services existants du provider
  const servicesKey = `hrs_services_${providerId}`
  const services = JSON.parse(localStorage.getItem(servicesKey) || '[]')

  const newStart = new Date(startTime)
  const newEnd = new Date(endTime)

  for (const service of services) {
    if (service.id !== serviceId && service.status === 'active') {
      const existingStart = new Date(service.startTime)
      const existingEnd = new Date(service.endTime)

      // Vérifier le chevauchement
      if (!(newEnd <= existingStart || newStart >= existingEnd)) {
        return {
          valid: false,
          conflict: {
            conflictingServiceId: service.id,
            conflictingServiceName: service.name,
            existingStart: service.startTime,
            existingEnd: service.endTime,
            message: `Chevauchement avec le service "${service.name}" du ${new Date(service.startTime).toLocaleDateString('fr-FR')}`
          }
        }
      }
    }
  }

  return { valid: true, conflict: null }
}

/**
 * Désactive une annonce (R-A6 - admin moderation)
 * La désactivation masque l'annonce mais ne la supprime pas
 * @param {string} listingId - ID de l'annonce
 * @param {string} reason - Raison de la désactivation
 * @param {string} adminId - ID de l'admin
 * @returns {object} { success: boolean, message: string }
 */
export const adminDisableListing = (listingId, reason, adminId) => {
  // Chercher l'annonce (peut être listing, house ou room)
  let found = false
  let itemType = null

  // Chercher dans les listings
  const listingsKey = `hrs_listings`
  const listings = JSON.parse(localStorage.getItem(listingsKey) || '[]')
  const listingIndex = listings.findIndex((l) => l.id === listingId)

  if (listingIndex !== -1) {
    listings[listingIndex].status = 'disabled'
    listings[listingIndex].disabledAt = new Date().toISOString()
    listings[listingIndex].disabledReason = reason
    listings[listingIndex].disabledBy = adminId
    localStorage.setItem(listingsKey, JSON.stringify(listings))
    found = true
    itemType = 'listing'
  }

  // Chercher dans les maisons
  if (!found) {
    const housesKey = `hrs_houses`
    const houses = JSON.parse(localStorage.getItem(housesKey) || '[]')
    const houseIndex = houses.findIndex((h) => h.id === listingId)

    if (houseIndex !== -1) {
      houses[houseIndex].status = 'disabled'
      houses[houseIndex].disabledAt = new Date().toISOString()
      houses[houseIndex].disabledReason = reason
      houses[houseIndex].disabledBy = adminId
      localStorage.setItem(housesKey, JSON.stringify(houses))
      found = true
      itemType = 'house'
    }
  }

  // Chercher dans les chambres
  if (!found) {
    const roomsKey = `hrs_rooms`
    const rooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
    const roomIndex = rooms.findIndex((r) => r.id === listingId)

    if (roomIndex !== -1) {
      rooms[roomIndex].status = 'disabled'
      rooms[roomIndex].disabledAt = new Date().toISOString()
      rooms[roomIndex].disabledReason = reason
      rooms[roomIndex].disabledBy = adminId
      localStorage.setItem(roomsKey, JSON.stringify(rooms))
      found = true
      itemType = 'room'
    }
  }

  if (!found) {
    return { success: false, message: 'Annonce non trouvée.' }
  }

  // Enregistrer l'action dans un log admin
  const adminActionsKey = 'hrs_admin_actions'
  const actions = JSON.parse(localStorage.getItem(adminActionsKey) || '[]')
  actions.push({
    id: `action_${Date.now()}`,
    type: 'disable_listing',
    targetId: listingId,
    targetType: itemType,
    reason,
    performedBy: adminId,
    performedAt: new Date().toISOString()
  })
  localStorage.setItem(adminActionsKey, JSON.stringify(actions))

  return {
    success: true,
    message: `Annonce (${itemType}) désactivée pour raison: "${reason}"`
  }
}

/**
 * Supprime une annonce définitivement (R-A6 - admin moderation)
 * Annule toutes les réservations futures avec remboursement intégral
 * @param {string} listingId - ID de l'annonce
 * @param {string} reason - Raison de la suppression
 * @param {string} adminId - ID de l'admin
 * @returns {object} { success: boolean, message: string, cancelledReservationCount: number }
 */
export const adminDeleteListing = (listingId, reason, adminId) => {
  let cancelledCount = 0
  const itemType = detectListingType(listingId)

  if (!itemType) {
    return { success: false, message: 'Annonce non trouvée.', cancelledReservationCount: 0 }
  }

  // Trouver toutes les réservations liées à cette annonce
  const affectedReservationIds = []

  for (let key in localStorage) {
    if (key.startsWith('hrs_reservations_')) {
      const reservations = JSON.parse(localStorage.getItem(key) || '[]')
      const clientId = key.replace('hrs_reservations_', '')

      reservations.forEach((res) => {
        if (res.listingId === listingId && ['pending', 'confirmed'].includes(res.status)) {
          affectedReservationIds.push({ reservationId: res.id, clientId })
        }
      })
    }
  }

  // Annuler les réservations avec remboursement intégral
  affectedReservationIds.forEach(({ reservationId, clientId }) => {
    const key = `hrs_reservations_${clientId}`
    const reservations = JSON.parse(localStorage.getItem(key) || '[]')
    const resIndex = reservations.findIndex((r) => r.id === reservationId)

    if (resIndex !== -1) {
      const reservation = reservations[resIndex]
      reservation.status = 'cancelled_by_admin'
      reservation.cancelledAt = new Date().toISOString()
      reservation.cancellationReason = `Annonce supprimée: ${reason}`
      reservation.refundAmount = reservation.totalPrice

      reservations[resIndex] = reservation
      localStorage.setItem(key, JSON.stringify(reservations))
      cancelledCount++
    }
  })

  // Supprimer l'annonce
  deleteListingByType(listingId, itemType)

  // Enregistrer l'action admin
  const adminActionsKey = 'hrs_admin_actions'
  const actions = JSON.parse(localStorage.getItem(adminActionsKey) || '[]')
  actions.push({
    id: `action_${Date.now()}`,
    type: 'delete_listing',
    targetId: listingId,
    targetType: itemType,
    reason,
    affectedReservations: cancelledCount,
    performedBy: adminId,
    performedAt: new Date().toISOString()
  })
  localStorage.setItem(adminActionsKey, JSON.stringify(actions))

  return {
    success: true,
    message: `Annonce supprimée. ${cancelledCount} réservation(s) annulée(s) avec remboursement intégral.`,
    cancelledReservationCount: cancelledCount
  }
}

/**
 * Détecte le type d'une annonce
 * @param {string} listingId - ID de l'annonce
 * @returns {string|null} 'listing'|'house'|'room'|null
 */
const detectListingType = (listingId) => {
  if (JSON.parse(localStorage.getItem(`hrs_listings`) || '[]').some((l) => l.id === listingId)) return 'listing'
  if (JSON.parse(localStorage.getItem(`hrs_houses`) || '[]').some((h) => h.id === listingId)) return 'house'
  if (JSON.parse(localStorage.getItem(`hrs_rooms`) || '[]').some((r) => r.id === listingId)) return 'room'
  return null
}

/**
 * Supprime une annonce d'un type donné
 * @param {string} listingId - ID de l'annonce
 * @param {string} itemType - 'listing'|'house'|'room'
 */
const deleteListingByType = (listingId, itemType) => {
  if (itemType === 'listing') {
    const listings = JSON.parse(localStorage.getItem(`hrs_listings`) || '[]')
    const filtered = listings.filter((l) => l.id !== listingId)
    localStorage.setItem(`hrs_listings`, JSON.stringify(filtered))
  } else if (itemType === 'house') {
    const houses = JSON.parse(localStorage.getItem(`hrs_houses`) || '[]')
    const filtered = houses.filter((h) => h.id !== listingId)
    localStorage.setItem(`hrs_houses`, JSON.stringify(filtered))
  } else if (itemType === 'room') {
    const rooms = JSON.parse(localStorage.getItem(`hrs_rooms`) || '[]')
    const filtered = rooms.filter((r) => r.id !== listingId)
    localStorage.setItem(`hrs_rooms`, JSON.stringify(filtered))
  }
}
