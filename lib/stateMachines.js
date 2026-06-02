/**
 * @file stateMachines.js
 * @description Définit les machines d'états pour les entités principales
 *              (Réservation, Maison, Paiement, Commande de service).
 *              Ces transitions respectent les automates de conception.
 */

/** Réservation: états possibles */
export const ReservationStates = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
})

/** Evénements pour réservation */
export const ReservationEvents = Object.freeze({
  CONFIRM: 'confirm',
  REJECT: 'reject',
  CANCEL: 'cancel',
  COMPLETE: 'complete',
  EXPIRE: 'expire'
})

export function reservationNextState(currentState, event) {
  switch (currentState) {
    case ReservationStates.PENDING:
      if (event === ReservationEvents.CONFIRM) return ReservationStates.CONFIRMED
      if (event === ReservationEvents.REJECT) return ReservationStates.CANCELLED
      if (event === ReservationEvents.CANCEL) return ReservationStates.CANCELLED
      if (event === ReservationEvents.EXPIRE) return ReservationStates.EXPIRED
      break

    case ReservationStates.CONFIRMED:
      if (event === ReservationEvents.COMPLETE) return ReservationStates.COMPLETED
      if (event === ReservationEvents.CANCEL) return ReservationStates.CANCELLED
      break

    case ReservationStates.COMPLETED:
    case ReservationStates.CANCELLED:
    case ReservationStates.EXPIRED:
      return currentState
  }

  return currentState
}

/** Maison: états */
export const HouseStates = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
})

export const HouseEvents = Object.freeze({
  PUBLISH: 'publish',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
  MODIFY: 'modify'
})

export function houseNextState(currentState, event) {
  switch (currentState) {
    case HouseStates.DRAFT:
      if (event === HouseEvents.PUBLISH) return HouseStates.PUBLISHED
      break
    case HouseStates.PUBLISHED:
      if (event === HouseEvents.ARCHIVE) return HouseStates.ARCHIVED
      if (event === HouseEvents.MODIFY) return HouseStates.PUBLISHED
      break
    case HouseStates.ARCHIVED:
      if (event === HouseEvents.RESTORE) return HouseStates.PUBLISHED
      break
  }
  return currentState
}

/** Chambre: états */
export const RoomStates = Object.freeze({
  ACTIVE: 'active',
  OUT_OF_SERVICE: 'out_of_service',
  ARCHIVED: 'archived'
})

export const RoomEvents = Object.freeze({
  MARK_OUT_OF_SERVICE: 'mark_out_of_service',
  RESTORE: 'restore',
  ARCHIVE: 'archive'
})

export function roomNextState(currentState, event) {
  switch (currentState) {
    case RoomStates.ACTIVE:
      if (event === RoomEvents.MARK_OUT_OF_SERVICE) return RoomStates.OUT_OF_SERVICE
      if (event === RoomEvents.ARCHIVE) return RoomStates.ARCHIVED
      break
    case RoomStates.OUT_OF_SERVICE:
      if (event === RoomEvents.RESTORE) return RoomStates.ACTIVE
      if (event === RoomEvents.ARCHIVE) return RoomStates.ARCHIVED
      break
    case RoomStates.ARCHIVED:
      if (event === RoomEvents.RESTORE) return RoomStates.ACTIVE
      break
  }
  return currentState
}

/** Paiement: états */
export const PaymentStates = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
})

export const PaymentEvents = Object.freeze({
  SUCCEED: 'succeed',
  FAIL: 'fail',
  REFUND: 'refund'
})

export function paymentNextState(currentState, event) {
  switch (currentState) {
    case PaymentStates.PENDING:
      if (event === PaymentEvents.SUCCEED) return PaymentStates.PAID
      if (event === PaymentEvents.FAIL) return PaymentStates.FAILED
      break
    case PaymentStates.PAID:
      if (event === PaymentEvents.REFUND) return PaymentStates.REFUNDED
      break
    case PaymentStates.FAILED:
    case PaymentStates.REFUNDED:
      return currentState
  }
  return currentState
}

/** Commande de service: états */
export const ServiceOrderStates = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
})

export const ServiceOrderEvents = Object.freeze({
  CONFIRM: 'confirm',
  COMPLETE: 'complete',
  CANCEL: 'cancel',
  EXPIRE: 'expire'
})

export function serviceOrderNextState(currentState, event) {
  switch (currentState) {
    case ServiceOrderStates.PENDING:
      if (event === ServiceOrderEvents.CONFIRM) return ServiceOrderStates.CONFIRMED
      if (event === ServiceOrderEvents.CANCEL) return ServiceOrderStates.CANCELLED
      if (event === ServiceOrderEvents.EXPIRE) return ServiceOrderStates.EXPIRED
      break
    case ServiceOrderStates.CONFIRMED:
      if (event === ServiceOrderEvents.COMPLETE) return ServiceOrderStates.COMPLETED
      if (event === ServiceOrderEvents.CANCEL) return ServiceOrderStates.CANCELLED
      break
    case ServiceOrderStates.COMPLETED:
    case ServiceOrderStates.CANCELLED:
    case ServiceOrderStates.EXPIRED:
      return currentState
  }
  return currentState
}

export const isFinalReservationState = (state) =>
  [ReservationStates.COMPLETED, ReservationStates.CANCELLED, ReservationStates.EXPIRED].includes(state)

export default {
  reservationNextState,
  ReservationStates,
  ReservationEvents,
  houseNextState,
  HouseStates,
  HouseEvents,
  roomNextState,
  RoomStates,
  RoomEvents,
  paymentNextState,
  PaymentStates,
  PaymentEvents,
  serviceOrderNextState,
  ServiceOrderStates,
  ServiceOrderEvents,
  isFinalReservationState
}
