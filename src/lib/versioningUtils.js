/**
 * @file versioningUtils.js
 * @description Utilitaires pour la synchronisation offline-first et le versioning
 * R-O1 à R-O4 : Gestion des versions, commandes locales, résolution de conflits
 */

/**
 * Génère un nouveau numéro de version pour une entité (R-O1)
 * @returns {number} Version incrémentée
 */
export const generateVersion = () => {
  return Math.floor(Date.now() / 1000)
}

/**
 * Ajoute un champ 'version' à une entité (R-O1)
 * @param {object} entity - Entité à versionner
 * @returns {object} Entité avec champ 'version'
 */
export const addVersionToEntity = (entity) => {
  return {
    ...entity,
    version: generateVersion()
  }
}

/**
 * Met à jour la version d'une entité
 * @param {object} entity - Entité à mettre à jour
 * @returns {object} Entité avec version mise à jour
 */
export const updateEntityVersion = (entity) => {
  return {
    ...entity,
    version: generateVersion()
  }
}

/**
 * Crée une commande locale en mode hors-ligne (R-O2)
 * @param {object} data - Données de la commande {
 *   type: 'create'|'update'|'delete',
 *   entityType: 'listing'|'reservation'|'service'|etc.,
 *   entityId: string,
 *   payload: object,
 *   localVersion: number,
 *   syncedAt: null (à remplir lors de la syncho)
 * }
 * @returns {object} Commande avec ID
 */
export const createLocalCommand = (data) => {
  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const command = {
    id: commandId,
    type: data.type,
    entityType: data.entityType,
    entityId: data.entityId,
    payload: data.payload,
    localVersion: data.localVersion || generateVersion(),
    createdAt: new Date().toISOString(),
    syncedAt: null, // À remplir après synchronisation
    syncStatus: 'pending', // 'pending'|'synced'|'conflict'|'error'
    lastError: null
  }

  return command
}

/**
 * Stocke une commande locale en cache (R-O2)
 * @param {object} command - Commande à stocker
 * @returns {object} Commande stockée
 */
export const storeLocalCommand = (command) => {
  const localCommandsKey = 'hrs_local_commands'
  const commands = JSON.parse(localStorage.getItem(localCommandsKey) || '[]')

  commands.push(command)
  localStorage.setItem(localCommandsKey, JSON.stringify(commands))

  return command
}

/**
 * Récupère toutes les commandes locales en attente de synchronisation (R-O2)
 * @returns {object[]} Tableau des commandes pendantes
 */
export const getPendingLocalCommands = () => {
  const localCommandsKey = 'hrs_local_commands'
  const commands = JSON.parse(localStorage.getItem(localCommandsKey) || '[]')

  return commands.filter((cmd) => cmd.syncStatus === 'pending')
}

/**
 * Simule la synchronisation avec le serveur (R-O3)
 * En production, envoie les commandes au backend et reçoit les confirmations
 * @param {object[]} commands - Commandes à synchroniser
 * @returns {object} {
 *   syncedCount: number,
 *   conflictCount: number,
 *   errorCount: number,
 *   conflicts: object[],
 *   errors: object[]
 * }
 */
export const synchronizeLocalCommands = (commands) => {
  const syncResults = {
    syncedCount: 0,
    conflictCount: 0,
    errorCount: 0,
    conflicts: [],
    errors: []
  }

  const localCommandsKey = 'hrs_local_commands'
  const allCommands = JSON.parse(localStorage.getItem(localCommandsKey) || '[]')

  commands.forEach((cmd) => {
    const index = allCommands.findIndex((c) => c.id === cmd.id)

    if (index === -1) {
      // Commande non trouvée localement
      syncResults.errorCount++
      syncResults.errors.push({ commandId: cmd.id, reason: 'Commande non trouvée localement' })
      return
    }

    // Simulation de réponse serveur: 80% succès, 10% conflits, 10% erreurs
    const random = Math.random()

    if (random < 0.8) {
      // Succès
      allCommands[index].syncStatus = 'synced'
      allCommands[index].syncedAt = new Date().toISOString()
      syncResults.syncedCount++
    } else if (random < 0.9) {
      // Conflit de version
      allCommands[index].syncStatus = 'conflict'
      allCommands[index].lastError = 'Version distante plus récente'
      syncResults.conflictCount++
      syncResults.conflicts.push({
        commandId: cmd.id,
        entityType: cmd.entityType,
        reason: 'Version distante plus récente',
        remoteVersion: generateVersion() + 1000 // Simulé
      })
    } else {
      // Erreur serveur
      allCommands[index].syncStatus = 'error'
      allCommands[index].lastError = 'Erreur serveur'
      syncResults.errorCount++
      syncResults.errors.push({ commandId: cmd.id, reason: 'Erreur serveur' })
    }
  })

  localStorage.setItem(localCommandsKey, JSON.stringify(allCommands))

  return syncResults
}

/**
 * Résout un conflit de version (R-O4)
 * Stratégie: accepter la version distante ou garder la locale
 * @param {string} commandId - ID de la commande en conflit
 * @param {boolean} keepLocal - true pour garder la version locale, false pour la distante
 * @returns {object} { success: boolean, message: string }
 */
export const resolveVersionConflict = (commandId, keepLocal) => {
  const localCommandsKey = 'hrs_local_commands'
  const commands = JSON.parse(localStorage.getItem(localCommandsKey) || '[]')

  const cmdIndex = commands.findIndex((c) => c.id === commandId)

  if (cmdIndex === -1) {
    return { success: false, message: 'Commande non trouvée.' }
  }

  const cmd = commands[cmdIndex]

  if (cmd.syncStatus !== 'conflict') {
    return { success: false, message: 'Cette commande n\'est pas en conflit.' }
  }

  if (keepLocal) {
    // Rétenter la synchronisation avec la version locale
    cmd.syncStatus = 'pending'
    cmd.lastError = null
  } else {
    // Accepter la version distante: marquer comme à ignorer
    cmd.syncStatus = 'ignored'
    cmd.ignoredAt = new Date().toISOString()
  }

  commands[cmdIndex] = cmd
  localStorage.setItem(localCommandsKey, JSON.stringify(commands))

  return {
    success: true,
    message: keepLocal ? 'Version locale conservée. Prêt à resynchroniser.' : 'Version distante acceptée.'
  }
}

/**
 * Nettoie les commandes synchronisées (pour économiser l'espace) (optional cleanup)
 * @param {number} daysOld - Supprimer les commandes synchro + de N jours
 * @returns {object} { deletedCount: number, remainingCount: number }
 */
export const cleanupSyncedCommands = (daysOld = 7) => {
  const localCommandsKey = 'hrs_local_commands'
  const commands = JSON.parse(localStorage.getItem(localCommandsKey) || '[]')

  const now = new Date()
  const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000)

  const filtered = commands.filter((cmd) => {
    if (cmd.syncStatus !== 'synced') return true // Garder les non-synchro

    const syncedDate = new Date(cmd.syncedAt || cmd.createdAt)
    return syncedDate > cutoffDate
  })

  const deletedCount = commands.length - filtered.length

  localStorage.setItem(localCommandsKey, JSON.stringify(filtered))

  return {
    deletedCount,
    remainingCount: filtered.length
  }
}

/**
 * Récupère le statut de synchronisation global
 * @returns {object} { syncEnabled: boolean, lastSyncAt: date|null, pendingCount: number, conflictCount: number }
 */
export const getSyncStatus = () => {
  const statusKey = 'hrs_sync_status'
  const status = JSON.parse(localStorage.getItem(statusKey) || 'null')

  const commands = JSON.parse(localStorage.getItem('hrs_local_commands') || '[]')
  const pending = commands.filter((c) => c.syncStatus === 'pending')
  const conflicts = commands.filter((c) => c.syncStatus === 'conflict')

  return {
    syncEnabled: true,
    lastSyncAt: status?.lastSyncAt || null,
    pendingCount: pending.length,
    conflictCount: conflicts.length,
    isOffline: !navigator.onLine // Détection du mode offline
  }
}
