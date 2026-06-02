/**
 * @file index.js (Business Rules Implementation Index)
 * @description Centralise tous les utilitaires de règles métier
 * Importe et exporte toutes les fonctions des 7 modules utilitaires
 */

// Règles Utilisateur (R-U1 à R-U5)
export {
  isValidSingleRole,
  isValidEmail,
  isValidPhoneDigitsOnly,
  getUserPlanStatus,
  subscribeToPlan,
  getUserSuspensionStatus,
  toggleUserSuspension,
  deleteUserPermanently,
  isUserDeleted
} from './userValidation.js'

// Règles Réservation (R-R1 à R-R6)
export {
  checkDateOverlap,
  checkRoomAvailability,
  checkHouseAvailability,
  createPendingReservation,
  getPendingReservationsForHost,
  confirmOrRejectReservation,
  cancelReservation,
  checkAndExpireReservations
} from './reservationUtils.js'

// Règles Paiement (R-P1 à R-P6)
export {
  getCommissionConfig,
  updateCommissionConfig,
  getUserPlanAlpha,
  calculateNetPayment,
  createPendingPayment,
  processPaymentWebhook,
  processRefund,
  getAllTransactions,
  DEFAULT_COMMISSION_CONFIG
} from './paymentUtils.js'

// Règles Scoring & Mise en Relation (R-M1 à R-M5)
export {
  getScoringWeights,
  updateScoringWeights,
  calculateDistanceScore,
  calculatePriceScore,
  calculateRatingScore,
  calculateSocialScore,
  calculateHistoryScore,
  calculateRelevanceScore,
  applyIntermediationPenalty,
  searchAndRankListings,
  DEFAULT_SCORING_WEIGHTS
} from './scoringUtils.js'

// Règles Versioning & Offline-first (R-O1 à R-O4)
export {
  generateVersion,
  addVersionToEntity,
  updateEntityVersion,
  createLocalCommand,
  storeLocalCommand,
  getPendingLocalCommands,
  synchronizeLocalCommands,
  resolveVersionConflict,
  cleanupSyncedCommands,
  getSyncStatus
} from './versioningUtils.js'

// Règles Services (R-R4 à R-R6 spécifiques aux services)
export {
  createServiceOrder,
  getPendingServiceOrdersForProvider,
  validateProviderAvailability,
  confirmServiceOrder,
  cancelServiceOrder,
  completeServiceOrder,
  getClientServiceOrders
} from './serviceUtils.js'

// Règles Annonces (R-A1 à R-A6)
export {
  getHouseWithRooms,
  validateHouseBeforePublish,
  publishHouse,
  validateRoomAtomicity,
  validateServiceTimeSlot,
  adminDisableListing,
  adminDeleteListing
} from './listingUtils.js'

export {
  ReservationStates,
  ReservationEvents,
  reservationNextState,
  isFinalReservationState,
  HouseStates,
  HouseEvents,
  houseNextState,
  RoomStates,
  RoomEvents,
  roomNextState,
  PaymentStates,
  PaymentEvents,
  paymentNextState,
  ServiceOrderStates,
  ServiceOrderEvents,
  serviceOrderNextState
} from './stateMachines.js'

// Règles Admin & Modération (R-AD1 à R-AD4)
export {
  checkUserSuspension,
  adminSuspendUser,
  adminLiftSuspension,
  adminUpdateCommissionRates,
  adminUpdateScoringWeights,
  adminViewAllTransactions,
  adminTriggerRefund,
  adminViewActionLog,
  adminGetPlatformStats
} from './adminUtils.js'

// Règles Devise Multi-Devise (R-T4)
export {
  getExchangeRates,
  adminUpdateExchangeRates,
  convertCurrency,
  formatCurrency,
  getDefaultCurrencyForRegion,
  createMultiCurrencyPrice,
  getUserCurrency,
  setUserCurrency,
  calculateFinalPriceWithCurrency,
  getCurrencyInfo,
  EXCHANGE_RATES,
  SUPPORTED_CURRENCIES
} from './currencyUtils.js'

/**
 * Documentation des 34 Règles Métier Implémentées:
 *
 * R-U1: Monorôle
 *   → isValidSingleRole() - Valide qu'un utilisateur a un seul rôle
 *
 * R-U2: Forfait & Abonnement
 *   → getUserPlanStatus(), subscribeToPlan() - Gestion des forfaits mensuels/annuels
 *
 * R-U3: KYC & RGPD
 *   → isValidEmail(), isValidPhoneDigitsOnly() - Validation des données utilisateur
 *
 * R-U4: Suspension
 *   → getUserSuspensionStatus(), toggleUserSuspension() - Suspension temporaire
 *
 * R-U5: Soft Delete
 *   → deleteUserPermanently(), isUserDeleted() - Suppression soft avec refunds
 *
 * R-R1: Réservation Persistante
 *   → createPendingReservation() - Crée réservation en statut pending
 *
 * R-R2: Délai 24h
 *   → confirmOrRejectReservation(), checkAndExpireReservations() - Gère expiration 24h
 *
 * R-R3: Annulation & Remboursement
 *   → cancelReservation() - Remboursement partiel selon proximité checkout
 *
 * R-R4: Commandes Services (12h)
 *   → createServiceOrder(), confirmServiceOrder() - Services avec délai 12h
 *
 * R-R5: Disponibilité Provider
 *   → validateProviderAvailability() - Pas de services chevauchants
 *
 * R-R6: Dépendance Logement-Service
 *   → confirmServiceOrder() - Service confirmé si logement confirmé
 *
 * R-P1: Intermédiaire
 *   → calculateNetPayment() - Plateforme retient commission
 *
 * R-P2: Commission Configurable
 *   → getCommissionConfig(), updateCommissionConfig() - Taux adaptables
 *
 * R-P3: Réduction Forfait (α)
 *   → getUserPlanAlpha() - Forfaitaires bénéficient de commission réduite
 *
 * R-P4: Conflit d'Intérêts
 *   → (Implémenté via mode d'intermédiaire requis)
 *
 * R-P5: Remboursement Tiéré
 *   → cancelReservation(), processRefund() - 100%/50%/0% selon délai
 *
 * R-P6: Webhook Stripe
 *   → createPendingPayment(), processPaymentWebhook() - Simulation du paiement
 *
 * R-M1: Candidats Géo
 *   → searchAndRankListings() + calculateDistanceScore()
 *
 * R-M2: Score de Pertinence
 *   → calculateRelevanceScore() - Combine distance/prix/note/social/historique
 *
 * R-M3: Poids Normalisés
 *   → updateScoringWeights() - Normalise automatiquement
 *
 * R-M4: Pénalité Désintermédiée
 *   → applyIntermediationPenalty() - Réduit score si non-intermédiée
 *
 * R-M5: Pagination
 *   → searchAndRankListings() - Trie par score, pagine les résultats
 *
 * R-A1: Maison = N Chambres
 *   → validateHouseBeforePublish() - Maison doit avoir >= 1 chambre
 *
 * R-A2: Chambre Atomique
 *   → validateRoomAtomicity() - Chambre est unité indivisible
 *
 * R-A3: Disponibilité Chambre
 *   → checkRoomAvailability() - Vérif pas de chevauchement dates
 *
 * R-A4: Disponibilité Maison
 *   → checkHouseAvailability() - Toutes chambres libres pour booking complet
 *
 * R-A5: Slots Temporels Services
 *   → validateServiceTimeSlot() - Pas de conflits d'horaires
 *
 * R-A6: Admin Modération
 *   → adminDisableListing(), adminDeleteListing() - Désactivation/suppression
 *
 * R-O1: Version Entité
 *   → addVersionToEntity(), updateEntityVersion() - Ajoute champ version
 *
 * R-O2: Commandes Locales
 *   → storeLocalCommand(), getPendingLocalCommands() - Cache offline
 *
 * R-O3: Synchronisation
 *   → synchronizeLocalCommands() - Envoie au serveur
 *
 * R-O4: Résolution Conflits
 *   → resolveVersionConflict() - Garde local ou accepte distant
 *
 * R-T4: Multi-Devise
 *   → convertCurrency(), formatCurrency() - EUR/XAF/NGN/KES/USD
 *
 * R-AD1: Admin Suspension
 *   → adminSuspendUser(), adminLiftSuspension() - Suspendre/lever
 *
 * R-AD2: Admin Modération
 *   → (Implémenté via adminDisableListing, adminDeleteListing)
 *
 * R-AD3: Config Admin
 *   → adminUpdateCommissionRates(), adminUpdateScoringWeights() - Modification config
 *
 * R-AD4: Audit & Transactions
 *   → adminViewAllTransactions(), adminViewActionLog() - Consultation historique
 *
 * Note: Les règles R-T2 (notifications) et R-T3 (formulaires dynamiques)
 * ne sont pas implémentées dans ces utilitaires (nécessitent des composants UI).
 */
