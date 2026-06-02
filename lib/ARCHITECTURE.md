/**
 * @file ARCHITECTURE.md
 * @description Décisions architecturales et patterns d'implémentation
 */

# 🏗️ Architecture & Design Decisions

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    COMPOSANTS UI (React)                 │
│  SearchComponent │ ReservationFlow │ PaymentForm │ etc  │
└────────────────────┬────────────────────────────────────┘
                     │ Import
┌────────────────────▼────────────────────────────────────┐
│              UTILITAIRES MÉTIER (Pure Functions)         │
│  searchUtils │ reservationUtils │ paymentUtils │ etc    │
│  - Aucun effet secondaire                               │
│  - Testable                                             │
│  - Réutilisable                                         │
└────────────────────┬────────────────────────────────────┘
                     │ Read/Write
┌────────────────────▼────────────────────────────────────┐
│             localStorage (Namespaced Storage)            │
│  hrs_reservations_${userId} │ hrs_blocked_${roomId}     │
│  hrs_payments_${userId} │ hrs_admin_actions             │
└─────────────────────────────────────────────────────────┘
                     │ (Production: Backend/Database)
┌────────────────────▼────────────────────────────────────┐
│                    BACKEND API (Future)                 │
│  /api/reservations │ /api/payments │ /api/admin         │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Pourquoi Utilitaires Purs?

### ❌ Approche Monolithique (Mauvais)

```javascript
// Couplage fort UI ↔ Logique
function ReservationComponent() {
  const [reservation, setReservation] = useState(null)
  
  const handleReserve = () => {
    // Logique mélangée avec UI
    const id = `res_${Date.now()}`
    const res = {
      id,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
    
    const allRes = JSON.parse(localStorage.getItem(`hrs_${userId}`) || '[]')
    allRes.push(res)
    localStorage.setItem(`hrs_${userId}`, JSON.stringify(allRes))
    
    setReservation(res)
  }
}
```

**Problèmes**:
- ❌ Logique dupliquée si besoin ailleurs
- ❌ Difficile à tester
- ❌ Modification = 10 composants à changer
- ❌ Pas de réutilisabilité

### ✅ Approche Modulaire (Bon)

```javascript
// lib/reservationUtils.js
export const createPendingReservation = (data) => {
  const reservation = {
    id: `res_${Date.now()}`,
    status: 'pending',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ...data
  }
  
  const key = `hrs_reservations_${data.userId}`
  const reservations = JSON.parse(localStorage.getItem(key) || '[]')
  localStorage.setItem(key, JSON.stringify([reservation, ...reservations]))
  
  return reservation
}

// components/ReservationComponent.jsx
import { createPendingReservation } from '@/lib'

function ReservationComponent() {
  const [reservation, setReservation] = useState(null)
  
  const handleReserve = () => {
    const res = createPendingReservation({
      userId: 'u1',
      listingId: 'r1',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      guests: 2,
      totalPrice: 50000
    })
    
    setReservation(res)
  }
}
```

**Avantages**:
- ✅ Logique centralisée
- ✅ Testable en isolation
- ✅ Réutilisable partout
- ✅ Maintenable
- ✅ Scalable

---

## 2️⃣ Stratégie Persistance

### localStorage Namespacing

```javascript
// Pattern: hrs_<entity>_<context>
hrs_users                          // Liste globale
hrs_reservations_${userId}         // Réservations client
hrs_pending_reservations_${hostId} // En attente hôte
hrs_blocked_${roomId}              // Dates occupées
hrs_payments_${userId}             // Paiements client
hrs_commission_config              // Config globale
hrs_admin_actions                  // Audit log
```

**Avantages**:
- ✅ Pas de collisions
- ✅ Scope claire
- ✅ Facile chercher related data
- ✅ Partitionnement logique

### Structure Données Exemple

```javascript
// hrs_reservations_u1
[
  {
    id: 'res_1704067200000',
    userId: 'u1',
    listingId: 'r1',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    guests: 2,
    totalPrice: 50000,
    status: 'pending',
    createdAt: '2024-01-01T10:00:00Z',
    expiresAt: '2024-01-02T10:00:00Z',
    confirmedAt: null,
    confirmedBy: null
  }
]
```

---

## 3️⃣ Gestion d'Erreurs

### Pattern Cohérent

```javascript
// Réussite
export const cancelReservation = (userId, reservationId) => {
  // ...
  return {
    success: true,
    message: 'Réservation annulée.',
    refundAmount: 25000
  }
}

// Erreur
return {
  success: false,
  message: 'Réservation non trouvée.',
  refundAmount: null
}
```

**Avantages**:
- ✅ Consistent response format
- ✅ Toujours un message utilisateur
- ✅ Contexte d'erreur
- ✅ Pas de try/catch nécessaire

---

## 4️⃣ Business Logic Composition

### Réservation = Composition de Règles

```javascript
// R-R1: Crée en pending
createPendingReservation(data)      // ← R-R1

// R-R2: Vérifie expiration 24h
checkAndExpireReservations(hostId)  // ← R-R2

// R-R3: Annule avec remboursement tiéré
cancelReservation(userId, id)       // ← R-R3

// R-A3: Vérifie dispo chambre
checkRoomAvailability(roomIds, start, end)  // ← R-A3
```

**Chaque fonction = Une règle métier**

Composable:
```javascript
// Workflow: Créer réservation
const { available } = checkRoomAvailability(roomId, checkIn, checkOut)
if (!available) throw new Error(...)

const reservation = createPendingReservation({
  userId, listingId, checkIn, checkOut, guests, totalPrice
})

// Hôte confirme après 10h
confirmOrRejectReservation(hostId, reservation.id, true)
```

---

## 5️⃣ Multi-Devise Strategy

### EUR comme Référence

```
USD  ← 1.1 ×
EUR  ← 1.0 (base)
XAF  ← 655.96 ×
NGN  ← 767.5 ×
KES  ← 147.5 ×
```

### Conversion

```javascript
convertCurrency(100, 'EUR', 'XAF')
// 1. EUR → EUR: 100 / 1.0 = 100
// 2. EUR → XAF: 100 × 655.96 = 65596
```

**Avantages**:
- ✅ Référence unique
- ✅ Conversion correcte
- ✅ Maintenant facile (1 place)
- ✅ Extensible

---

## 6️⃣ Scoring Algorithm

### Composition de Scores

```
ScoreFinal = (
  DistanceScore      × 0.25 +  // R-M1
  PriceScore         × 0.20 +  // R-M2
  RatingScore        × 0.30 +  // R-M2
  SocialScore        × 0.15 +  // R-M2
  HistoryScore       × 0.10    // R-M2
) × (IsPenalized ? 0.9 : 1.0)  // R-M4 (β = 0.9)
```

**Chaque composant indépendant**:
- Distance: calcul haversine
- Prix: alignement budget
- Rating: note moyenne
- Social: amis + recommandations
- Historique: fréquence + satisfaction

---

## 7️⃣ Offline-First Architecture

### Command Pattern

```javascript
// Utilisateur offline → créer commande locale
command = {
  id: 'cmd_1704067200000_abc123',
  type: 'create',              // create|update|delete
  entityType: 'reservation',   // reservation|listing|etc
  entityId: 'res_123',
  payload: {...},              // données à synchroniser
  localVersion: 1704067200,    // timestamp version
  createdAt: '2024-01-01T10:00:00Z',
  syncStatus: 'pending',       // pending|synced|conflict|error
  syncedAt: null,              // rempli après sync
  lastError: null              // si erreur
}

// Stockage: localStorage
// Lecture: getPendingLocalCommands()
// Sync: synchronizeLocalCommands(commands)
```

### Résolution Conflits (R-O4)

```
Scénario 1: Version locale < distante
→ keepLocal = false: accepter version serveur
→ keepLocal = true: rétenter après modification

Scénario 2: Suppression locale mais existe distante
→ Accepter distant (le serveur est source de vérité)
```

---

## 8️⃣ Admin Functions Architecture

### Logging Pattern

```javascript
adminSuspendUser(userId, reason, adminId)
  ↓
logAdminAction(adminId, 'suspend_user', userId, reason)
  ↓
Stocké: hrs_admin_actions = [
  {
    id: 'action_1704067200000',
    type: 'suspend_user',
    targetId: 'u5',
    description: 'Raison',
    performedBy: 'admin-1',
    performedAt: '2024-01-01T10:00:00Z'
  }
]
```

### Vue Audit Complète

```javascript
adminViewActionLog({
  performedBy: 'admin-1',
  actionType: 'suspend_user',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
})
```

---

## 9️⃣ Normalization & Denormalization

### Principes

**Normalisé** (choisi):
- `houses` table : { id, hostId, title, roomsIds: [...] }
- `rooms` table : { id, houseId, hostId, title, ... }
- Référence croisée : house.roomsIds ↔ room.houseId

**Avantages**:
- ✅ Pas duplication
- ✅ Update facile
- ✅ Intégrité référentielle

**Dénormalisé** (optionnel pour perf):
- `houses_denormalized` : { id, rooms: [{...}, {...}] }
- Pour affichage (recherche rapide)
- Recalculé au besoin

---

## 🔟 Testing Strategy

### Unit Tests (À Implémenter)

```javascript
// __tests__/reservationUtils.test.js
describe('createPendingReservation', () => {
  test('should create pending reservation', () => {
    const res = createPendingReservation({
      userId: 'u1',
      listingId: 'r1',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      guests: 2,
      totalPrice: 50000
    })
    
    expect(res.status).toBe('pending')
    expect(res.id).toMatch(/^res_\d+$/)
    expect(res.expiresAt).toBeDefined()
  })
  
  test('should persist to localStorage', () => {
    const res = createPendingReservation({...})
    const stored = JSON.parse(localStorage.getItem(`hrs_reservations_u1`))
    expect(stored).toContainEqual(res)
  })
})
```

### Integration Tests

```javascript
// __tests__/workflows.test.js
describe('Booking Workflow', () => {
  test('should complete full booking flow', () => {
    // 1. Check availability
    const avail = checkRoomAvailability('r1', '2024-01-15', '2024-01-20')
    expect(avail.available).toBe(true)
    
    // 2. Create reservation
    const res = createPendingReservation({...})
    expect(res.status).toBe('pending')
    
    // 3. Host confirms
    const confirm = confirmOrRejectReservation(hostId, res.id, true)
    expect(confirm.success).toBe(true)
    
    // 4. Process payment
    const payment = createPendingPayment({...})
    expect(payment.status).toBe('pending')
    
    // 5. Webhook received
    const webhook = processPaymentWebhook(payment.id, 'succeeded')
    expect(webhook.success).toBe(true)
  })
})
```

---

## 1️⃣1️⃣ Performance Considerations

### localStorage Bottlenecks

```javascript
// ❌ Lent: Parse gros tableau
const allReservations = JSON.parse(localStorage.getItem('hrs_all_reservations'))
const filtered = allReservations.filter(r => r.userId === 'u1')

// ✅ Rapide: Stockage par userId
const userReservations = JSON.parse(localStorage.getItem('hrs_reservations_u1'))
```

### Optimization Patterns

1. **Partitioning**: Séparer par userId/roomId
2. **Pagination**: Charger 50 items à la fois
3. **Caching**: Memoize résultats recherche
4. **Lazy Loading**: Charger données au besoin

---

## 1️⃣2️⃣ Migration Path

### Phase 1: localStorage → IndexedDB
```javascript
// Même API, storage différent
const data = getIndexedDB('hrs_reservations_u1')
```

### Phase 2: IndexedDB → Backend API
```javascript
// Même API, backend différent
const data = await fetch('/api/reservations').then(r => r.json())
```

### Phase 3: Real-time Sync
```javascript
// WebSocket pour sync temps-réel
socket.on('reservation:confirmed', (data) => {
  updateLocalStore('hrs_reservations_u1', data)
})
```

---

## 1️⃣3️⃣ Security Considerations

### ❌ Jamais en localStorage
- Tokens d'authentification
- Mots de passe
- Données PII sensibles

### ✅ OK en localStorage
- Préférences utilisateur
- Cache de recherche
- Commandes offline
- Données non-sensibles

### ⚠️ Validation Côté Serveur
```javascript
// Frontend: createPendingReservation()
// ↓
// Backend: POST /api/reservations
//   - Vérifier userId dans JWT
//   - Vérifier disponibilité
//   - Vérifier permission
//   - Persister en DB
```

---

## 1️⃣4️⃣ Naming Conventions

### Fichiers
- `*Utils.js` : Utilitaires purs
- `*Context.jsx` : React Context
- `*.jsx` : Composants React
- `.md` : Documentation

### Fonctions
- `get*()` : Récupère données
- `create*()` : Crée nouveau
- `update*()` : Modifie existant
- `delete*()` : Supprime
- `validate*()` : Valide
- `check*()` : Vérifie condition
- `calculate*()` : Calcule valeur
- `admin*()` : Fonction admin

### Variables
- `is*` : Boolean
- `has*` : Boolean (possession)
- `*Count` : Nombre
- `*Id` : Identifiant
- `*At` : Date/timestamp
- `*By` : Actor
- `*Config` : Configuration

---

## Conclusion

### Principes Appliqués

✅ **SOLID**: Single responsibility, Open/closed, etc.
✅ **Clean Code**: Noms clairs, fonctions courtes
✅ **DRY**: Don't repeat yourself
✅ **Composition**: Petites fonctions combinables
✅ **Testing**: Code testable
✅ **Documentation**: Auto-documenting

### Résultat

- 100+ fonctions réutilisables
- 27/34 règles métier implémentées
- Code maintenable et scalable
- Prêt pour production après tests + backend

---

**Architecture Version**: 1.0
**Framework**: Next.js 16.2.4 + React 19
**Storage**: localStorage (→ Backend)
**Testing**: Jest (à venir)
