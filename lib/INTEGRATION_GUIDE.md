/**
 * @file INTEGRATION_GUIDE.md
 * @description Guide d'intégration des utilitaires métier dans les composants
 * Exemples pratiques et patterns d'utilisation
 */

# 🔧 Guide d'Intégration des Utilitaires Métier

## 📦 Imports

Tous les utilitaires peuvent être importés depuis `/lib/index.js`:

```javascript
import {
  // Utilisateurs
  isValidSingleRole,
  subscribeToPlan,
  toggleUserSuspension,
  deleteUserPermanently,

  // Réservations
  checkRoomAvailability,
  createPendingReservation,
  confirmOrRejectReservation,
  cancelReservation,

  // Paiements
  calculateNetPayment,
  formatCurrency,
  convertCurrency,

  // Scoring
  searchAndRankListings,

  // Admin
  adminSuspendUser,
  adminViewAllTransactions
} from '@/lib'
```

Ou importer directement depuis le module spécifique:

```javascript
import { createPendingReservation } from '@/lib/reservationUtils'
import { formatCurrency } from '@/lib/currencyUtils'
```

---

## 🎯 Patterns Communs

### Pattern 1: Validation Avant Action

```javascript
'use client'

import { useState } from 'react'
import { isValidSingleRole, subscribeToPlan } from '@/lib'
import { Button } from '@/components/ui/Button'

export default function UserRegistration() {
  const [role, setRole] = useState('client')
  const [plan, setPlan] = useState('monthly')
  const [error, setError] = useState('')

  const handleRegister = async () => {
    // Valider le rôle
    if (!isValidSingleRole(role)) {
      setError('Rôle invalide. Choisissez: client, host, provider, ou admin.')
      return
    }

    // Créer l'utilisateur
    const userId = `u_${Date.now()}`

    // S'abonner au forfait
    const result = subscribeToPlan(userId, plan)
    if (result.success) {
      setError('')
      // Rediriger vers dashboard
    } else {
      setError(result.message)
    }
  }

  return (
    <div>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="client">Client</option>
        <option value="host">Hôte</option>
        <option value="provider">Prestataire</option>
      </select>

      <select value={plan} onChange={(e) => setPlan(e.target.value)}>
        <option value="monthly">Mensuel (5% réduc)</option>
        <option value="annual">Annuel (20% réduc)</option>
      </select>

      <Button onClick={handleRegister}>S'inscrire</Button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
```

### Pattern 2: Vérification Disponibilité + Réservation

```javascript
'use client'

import { useState } from 'react'
import {
  checkRoomAvailability,
  createPendingReservation,
  formatCurrency
} from '@/lib'
import { Button, Modal } from '@/components/ui'

export default function ReservationFlow() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [available, setAvailable] = useState(null)
  const [reservation, setReservation] = useState(null)

  const handleCheckAvailability = () => {
    const result = checkRoomAvailability('r1', checkIn, checkOut)

    if (result.available) {
      setAvailable({ available: true, price: 50000 })
    } else {
      setAvailable({
        available: false,
        reason: result.reason
      })
    }
  }

  const handleConfirmReservation = () => {
    if (!available?.available) return

    const res = createPendingReservation({
      userId: 'u1',
      listingId: 'r1',
      checkIn,
      checkOut,
      guests: 2,
      totalPrice: 50000
    })

    setReservation(res)
  }

  return (
    <div>
      <h2>Réserver une Chambre</h2>

      <div className="form">
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="Arrivée"
        />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          placeholder="Départ"
        />
        <Button onClick={handleCheckAvailability}>Vérifier Disponibilité</Button>
      </div>

      {available && (
        <div className="availability">
          {available.available ? (
            <div className="success">
              <p>✅ Disponible!</p>
              <p>Prix: {formatCurrency(50000, 'XAF')}</p>
              <Button onClick={handleConfirmReservation}>Confirmer</Button>
            </div>
          ) : (
            <div className="error">
              <p>❌ {available.reason}</p>
            </div>
          )}
        </div>
      )}

      {reservation && (
        <Modal title="Réservation Créée">
          <p>ID: {reservation.id}</p>
          <p>Statut: {reservation.status}</p>
          <p>Expire à: {new Date(reservation.expiresAt).toLocaleString('fr-FR')}</p>
          <p>L'hôte doit confirmer dans 24h</p>
        </Modal>
      )}
    </div>
  )
}
```

### Pattern 3: Affichage Multi-Devise

```javascript
'use client'

import { useState, useEffect } from 'react'
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from '@/lib'

export default function CurrencyConverter() {
  const [basePrice] = useState(100) // EUR
  const [selectedCurrency, setSelectedCurrency] = useState('EUR')
  const [converted, setConverted] = useState(100)

  useEffect(() => {
    const amount = convertCurrency(basePrice, 'EUR', selectedCurrency)
    setConverted(amount)
  }, [selectedCurrency])

  return (
    <div>
      <h3>Convertisseur de Devises</h3>

      <p>Prix de base: {formatCurrency(basePrice, 'EUR')}</p>

      <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
        {Object.entries(SUPPORTED_CURRENCIES).map(([code, config]) => (
          <option key={code} value={code}>
            {config.name} ({code})
          </option>
        ))}
      </select>

      <p>Converti: {formatCurrency(converted, selectedCurrency)}</p>
    </div>
  )
}
```

### Pattern 4: Recherche avec Scoring

```javascript
'use client'

import { useState, useEffect } from 'react'
import { searchAndRankListings, formatCurrency } from '@/lib'
import { Input, Button } from '@/components/ui'

export default function SearchResults() {
  const [results, setResults] = useState({ results: [], page: 0, totalPages: 0 })
  const [currentPage, setCurrentPage] = useState(0)

  const handleSearch = (budget) => {
    const listings = [
      {
        id: 'h1',
        title: 'Maison moderne',
        price: 30000,
        rating: 4.5,
        lat: 3.8667,
        lng: 11.5167,
        status: 'active'
      },
      // ... plus d'annonces
    ]

    const searchResults = searchAndRankListings(
      listings,
      {
        userId: 'u1',
        lat: 3.8667,
        lng: 11.5167,
        budget: budget,
        maxDistance: 10
      },
      currentPage,
      20
    )

    setResults(searchResults)
  }

  return (
    <div>
      <h2>Recherche d'Annonces</h2>

      <Input
        type="number"
        placeholder="Budget max (XAF)"
        onBlur={(e) => handleSearch(parseInt(e.target.value))}
      />

      <div className="results">
        {results.results.map((listing) => (
          <div key={listing.id} className="listing-card">
            <h4>{listing.title}</h4>
            <p>Prix: {formatCurrency(listing.price, 'XAF')}</p>
            <p>Score: {listing.relevanceScore}/100 ⭐</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <Button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ← Précédent
        </Button>
        <span>
          Page {results.page + 1}/{results.totalPages}
        </span>
        <Button
          disabled={currentPage >= results.totalPages - 1}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Suivant →
        </Button>
      </div>
    </div>
  )
}
```

### Pattern 5: Tableau Admin Transactions

```javascript
'use client'

import { useState, useEffect } from 'react'
import { adminViewAllTransactions, formatCurrency } from '@/lib'

export default function AdminTransactionsList() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState({ type: '', status: '' })

  useEffect(() => {
    const result = adminViewAllTransactions(filter)
    setTransactions(result)
  }, [filter])

  return (
    <div>
      <h2>Transactions</h2>

      <div className="filters">
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
        >
          <option value="">Tous les types</option>
          <option value="payment">Paiements</option>
          <option value="refund">Remboursements</option>
          <option value="reservation">Réservations</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">Tous les statuts</option>
          <option value="completed">Complétées</option>
          <option value="pending">En attente</option>
          <option value="failed">Échouées</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.type}</td>
              <td>{formatCurrency(tx.amount, 'XAF')}</td>
              <td className={`status-${tx.status}`}>{tx.status}</td>
              <td>{new Date(tx.createdAt || tx.processedAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Pattern 6: Opération Admin - Suspension

```javascript
'use client'

import { useState } from 'react'
import { adminSuspendUser, adminLiftSuspension, checkUserSuspension } from '@/lib'
import { Button, Input, Modal } from '@/components/ui'

export default function AdminUserManagement() {
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [suspensionStatus, setSuspensionStatus] = useState(null)
  const [message, setMessage] = useState('')

  const handleCheckSuspension = () => {
    const status = checkUserSuspension(userId)
    setSuspensionStatus(status)
  }

  const handleSuspend = () => {
    const result = adminSuspendUser(userId, reason, 'admin-1')
    setMessage(result.message)

    if (result.success) {
      setSuspensionStatus({ suspended: true, reason })
    }
  }

  const handleLift = () => {
    const result = adminLiftSuspension(userId, 'admin-1')
    setMessage(result.message)

    if (result.success) {
      setSuspensionStatus({ suspended: false })
    }
  }

  return (
    <div className="admin-panel">
      <h2>Gestion des Utilisateurs</h2>

      <div className="form">
        <Input
          placeholder="ID Utilisateur"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <Button onClick={handleCheckSuspension}>Vérifier Statut</Button>
      </div>

      {suspensionStatus && (
        <div className="status">
          {suspensionStatus.suspended ? (
            <div className="warning">
              <p>⚠️ Utilisateur SUSPENDU</p>
              <p>Raison: {suspensionStatus.reason}</p>
              <p>Depuis: {new Date(suspensionStatus.suspendedAt).toLocaleDateString('fr-FR')}</p>
              <Button onClick={handleLift}>Lever Suspension</Button>
            </div>
          ) : (
            <div className="form">
              <p>✅ Utilisateur actif</p>
              <Input
                placeholder="Raison suspension"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button onClick={handleSuspend}>Suspendre</Button>
            </div>
          )}
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  )
}
```

---

## 📋 Checklist d'Intégration par Feature

### ✅ Feature: Authentification & Rôles

- [ ] Importer: `isValidSingleRole`, `subscribeToPlan`
- [ ] Composant: `app/register/page.js`
- [ ] Validation: Vérifier rôle valide au submit
- [ ] Souscription: Créer forfait après inscription

### ✅ Feature: Recherche & Annonces

- [ ] Importer: `searchAndRankListings`, `calculateDistanceScore`, `formatCurrency`
- [ ] Composant: `app/client/search/page.js`
- [ ] Scoring: Afficher score pertinence
- [ ] Pagination: Implémenter navigation pages
- [ ] Multi-devise: Convertir prix selon user currency

### ✅ Feature: Réservations

- [ ] Importer: `checkRoomAvailability`, `createPendingReservation`, `confirmOrRejectReservation`
- [ ] Composant: `app/listings/[id]/page.js` + `app/host/listings/page.js`
- [ ] Vérification: Vérifier dispo avant créer
- [ ] Expiration: Afficher compte-à-rebours 24h
- [ ] Confirmation: Interface hôte pour accept/reject

### ✅ Feature: Paiements

- [ ] Importer: `calculateNetPayment`, `createPendingPayment`, `formatCurrency`
- [ ] Composant: `components/features/PaymentForm.jsx`
- [ ] Webhook: Simuler `processPaymentWebhook()`
- [ ] Remboursement: Implémenter annulation avec calcul

### ✅ Feature: Admin Dashboard

- [ ] Importer: `adminSuspendUser`, `adminViewAllTransactions`, `adminGetPlatformStats`
- [ ] Composant: `app/admin/page.js`
- [ ] Transactions: Afficher tableau avec filtres
- [ ] Utilisateurs: Interface suspension/lever
- [ ] Statistiques: Afficher KPIs plateforme

### ✅ Feature: Offline-First

- [ ] Importer: `storeLocalCommand`, `synchronizeLocalCommands`, `resolveVersionConflict`
- [ ] Middleware: Intercepter actions, créer commandes locales
- [ ] Service Worker: Déterminer online/offline
- [ ] UI: Afficher status sync + conflits

---

## 🐛 Troubleshooting

### Erreur: "Fonction non trouvée"

```javascript
// ❌ Mauvais
import { calculateNetPayment } from '@/lib/scoringUtils'

// ✅ Correct
import { calculateNetPayment } from '@/lib/paymentUtils'
// Ou
import { calculateNetPayment } from '@/lib'
```

### Erreur: "localStorage is not defined"

Solution: Vérifier qu'on est en `'use client'` (composant client):

```javascript
'use client'

import { createPendingReservation } from '@/lib'

export default function MyComponent() {
  // ...
}
```

### Dates mal formatées

Utiliser format ISO (YYYY-MM-DD):

```javascript
// ❌ Mauvais
checkRoomAvailability('r1', '15/01/2024', '20/01/2024')

// ✅ Correct
checkRoomAvailability('r1', '2024-01-15', '2024-01-20')
```

---

## 🚀 Performance Tips

1. **Memoize** résultats recherche:
   ```javascript
   const results = useMemo(
     () => searchAndRankListings(listings, params, page),
     [listings, params, page]
   )
   ```

2. **Lazy load** tableaux admin:
   ```javascript
   const [transactions, setTransactions] = useState([])
   const [page, setPage] = useState(0)
   const pageSize = 50

   useEffect(() => {
     const all = adminViewAllTransactions()
     setTransactions(all.slice(page * pageSize, (page + 1) * pageSize))
   }, [page])
   ```

3. **Debounce** recherche:
   ```javascript
   const [searchTerm, setSearchTerm] = useState('')
   const debouncedSearch = useDebouncedCallback((term) => {
     handleSearch(term)
   }, 300)
   ```

---

**Version**: 1.0
**Last Updated**: 2024
**Framework**: Next.js 16.2.4 + React 19
