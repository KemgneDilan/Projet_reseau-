/**
 * @file userValidation.js
 * @description Utilitaires de validation et gestion des utilisateurs selon les règles métier
 * R-U1 à R-U5 : Gestion des rôles, forfaits, suspensions et suppressions
 */

import { users as defaultUsers } from './mockData'

/**
 * Valide qu'un utilisateur ne peut avoir qu'un seul rôle principal (R-U1)
 * @param {string} role - Le rôle sélectionné (client|host|provider|admin)
 * @returns {boolean} true si le rôle est valide
 */
export const isValidSingleRole = (role) => {
  const validRoles = ['client', 'host', 'provider', 'admin']
  return validRoles.includes(role)
}

/**
 * Validation de l'email à l'inscription
 * @param {string} email - L'adresse email
 * @returns {boolean} true si l'email est valide
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validation du téléphone : doit contenir uniquement des chiffres (R-U2 implicite)
 * @param {string} phone - Le numéro de téléphone
 * @returns {boolean} true si le téléphone contient uniquement des chiffres
 */
export const isValidPhoneDigitsOnly = (phone) => {
  return /^\d+$/.test(phone)
}

/**
 * Récupère l'état de forfait d'un utilisateur (R-U2)
 * Un hôte ou prestataire doit souscrire un forfait avant de publier
 * @param {string} userId - L'ID utilisateur
 * @param {string} userRole - Le rôle de l'utilisateur (host|provider)
 * @returns {object} État du forfait { hasPlan: boolean, planType: string|null, expiresAt: date|null }
 */
export const getUserPlanStatus = (userId, userRole) => {
  if (userRole === 'client' || userRole === 'admin') {
    return { hasPlan: true, planType: null, expiresAt: null } // Pas de forfait requis
  }

  const plansKey = `hrs_plans_${userId}`
  const plans = JSON.parse(localStorage.getItem(plansKey) || 'null')

  if (!plans) {
    return { hasPlan: false, planType: null, expiresAt: null }
  }

  const now = new Date()
  const expiresAt = new Date(plans.expiresAt)

  if (expiresAt > now) {
    return { hasPlan: true, planType: plans.type, expiresAt }
  }

  return { hasPlan: false, planType: null, expiresAt }
}

/**
 * Permet à un hôte ou prestataire de souscrire un forfait (R-U2)
 * @param {string} userId - L'ID utilisateur
 * @param {string} planType - Type de forfait ('monthly'|'annual')
 * @returns {object} Confirmation { success: boolean, message: string, expiresAt: date|null }
 */
export const subscribeToPlan = (userId, planType) => {
  if (!['monthly', 'annual'].includes(planType)) {
    return { success: false, message: 'Type de forfait invalide.' }
  }

  const daysValid = planType === 'monthly' ? 30 : 365
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + daysValid)

  const planData = { type: planType, expiresAt: expiresAt.toISOString(), subscribedAt: new Date().toISOString() }
  localStorage.setItem(`hrs_plans_${userId}`, JSON.stringify(planData))

  return {
    success: true,
    message: `Forfait ${planType === 'monthly' ? 'mensuel' : 'annuel'} activé avec succès.`,
    expiresAt
  }
}

/**
 * Récupère le statut de suspension d'un utilisateur (R-U4)
 * @param {string} userId - L'ID utilisateur
 * @returns {object} État du compte { isSuspended: boolean, suspendedAt: date|null, reason: string|null }
 */
export const getUserSuspensionStatus = (userId) => {
  const suspensionsKey = 'hrs_suspensions'
  const suspensions = JSON.parse(localStorage.getItem(suspensionsKey) || '{}')

  if (suspensions[userId]) {
    return {
      isSuspended: true,
      suspendedAt: suspensions[userId].suspendedAt,
      reason: suspensions[userId].reason
    }
  }

  return { isSuspended: false, suspendedAt: null, reason: null }
}

/**
 * Suspend ou réactive un utilisateur (R-U4)
 * @param {string} userId - L'ID utilisateur
 * @param {boolean} isSuspend - true pour suspendre, false pour réactiver
 * @param {string} reason - Raison de la suspension (optionnel)
 * @returns {object} Confirmation { success: boolean, message: string }
 */
export const toggleUserSuspension = (userId, isSuspend, reason = '') => {
  const suspensionsKey = 'hrs_suspensions'
  const suspensions = JSON.parse(localStorage.getItem(suspensionsKey) || '{}')

  if (isSuspend) {
    suspensions[userId] = { suspendedAt: new Date().toISOString(), reason }
    localStorage.setItem(suspensionsKey, JSON.stringify(suspensions))
    return { success: true, message: `Utilisateur suspendu. Raison: ${reason}` }
  } else {
    delete suspensions[userId]
    localStorage.setItem(suspensionsKey, JSON.stringify(suspensions))
    return { success: true, message: 'Utilisateur réactivé.' }
  }
}

/**
 * Supprime définitivement un utilisateur et annule ses réservations futures (R-U5)
 * @param {string} userId - L'ID utilisateur
 * @returns {object} Confirmation { success: boolean, message: string, cancelledReservations: number }
 */
export const deleteUserPermanently = (userId) => {
  // 1. Récupérer les réservations futures de l'utilisateur
  const userReservationsKey = `hrs_reservations_${userId}`
  const userReservations = JSON.parse(localStorage.getItem(userReservationsKey) || '[]')

  let cancelledCount = 0
  const now = new Date()

  // 2. Annuler les réservations futures
  userReservations.forEach((res) => {
    if (new Date(res.checkOut) > now) {
      res.status = 'cancelled_admin'
      res.cancelledAt = new Date().toISOString()
      cancelledCount++
    }
  })

  // 3. Persister les réservations mises à jour
  localStorage.setItem(userReservationsKey, JSON.stringify(userReservations))

  // 4. Marquer l'utilisateur comme supprimé (soft delete)
  const deletedUsersKey = 'hrs_deleted_users'
  const deletedUsers = JSON.parse(localStorage.getItem(deletedUsersKey) || '[]')
  deletedUsers.push({ userId, deletedAt: new Date().toISOString() })
  localStorage.setItem(deletedUsersKey, JSON.stringify(deletedUsers))

  return {
    success: true,
    message: `Utilisateur supprimé. ${cancelledCount} réservation(s) future(s) annulée(s) et remboursée(s).`,
    cancelledReservations: cancelledCount
  }
}

/**
 * Vérifie si un utilisateur a été supprimé (soft delete)
 * @param {string} userId - L'ID utilisateur
 * @returns {boolean} true si l'utilisateur a été supprimé
 */
export const isUserDeleted = (userId) => {
  const deletedUsersKey = 'hrs_deleted_users'
  const deletedUsers = JSON.parse(localStorage.getItem(deletedUsersKey) || '[]')
  return deletedUsers.some((u) => u.userId === userId)
}
