# 🚀 Guide de Déploiement et Test - Frontend Loomdaah

## Prérequis

- Node.js 18+
- npm ou yarn
- Git
- VS Code (recommandé)

## Installation

```bash
cd hrs-frontend
npm install
```

## Démarrage du Serveur de Développement

```bash
npm run dev
```

Accédez à `http://localhost:3000` pour voir l'application.

## Structure des Fichiers Clés

```
hrs-frontend/
├── app/
│   ├── page.js                    # Accueil
│   ├── client/
│   │   ├── page.js                # Dashboard client
│   │   └── search/
│   │       └── page.js            # Recherche avancée
│   ├── listings/
│   │   └── [id]/page.js           # Détail propriété
│   ├── services/
│   │   └── page.js                # Marketplace services
│   └── layout.js                  # Layout global
├── components/
│   ├── ui/
│   │   ├── Button.jsx             # Boutons (8 variantes)
│   │   ├── Input.jsx              # Inputs enrichis
│   │   ├── Card.jsx               # Cartes
│   │   ├── Modal.jsx              # Modales
│   │   ├── Tabs.jsx               # Onglets
│   │   └── Badge.jsx              # Badges
│   ├── features/
│   │   ├── SearchBar.jsx          # Barre de recherche
│   │   ├── ListingCard.jsx        # Cartes propriétés
│   │   ├── PaymentForm.jsx        # Paiement multi-étapes
│   │   ├── MessagingDrawer.jsx    # Chat
│   │   ├── CheckoutModal.jsx      # Checkout
│   │   ├── EditItemModal.jsx      # Édition
│   │   └── MapPreview.jsx         # Aperçu carte
│   └── layout/
│       ├── Navbar.jsx             # Navigation
│       └── Footer.jsx             # Pied de page
├── lib/
│   ├── auth.jsx                   # Auth hook
│   ├── mockData.js                # Données de test
│   └── utils.js                   # Utilitaires
├── public/                        # Assets statiques
└── IMPROVEMENTS.md                # Documentation améliorations
```

## Points de Test Critiques

### 1. Accueil (/)
- [ ] Hero section visible avec SearchBar
- [ ] Stats affichées correctement
- [ ] Features grid responsive
- [ ] Listings carousel scrollable
- [ ] Services avec prix visibles
- [ ] CTA boutons cliquables
- [ ] Responsive mobile/tablet/desktop

### 2. Recherche (/client/search)
- [ ] SearchBar fonctionne
- [ ] Filtres appliquent les résultats
- [ ] Grille ListingCards responsive
- [ ] Favoris toggleable
- [ ] Reset filtres fonctionne
- [ ] États vides affichés

### 3. Détail Propriété (/listings/1)
- [ ] Galerie images navigable
- [ ] Infos propriété complètes
- [ ] Calcul prix dynamique
- [ ] Dates sélectionnables
- [ ] Avis affichés
- [ ] Equipements visibles
- [ ] Boutons actions fonctionnels

### 4. Dashboard Client (/client)
- [ ] Header bienvenue affiché
- [ ] Stats cards visibles
- [ ] Tabs switchables
- [ ] Réservations listées
- [ ] Favoris affichés
- [ ] Messages accessibles
- [ ] Actions rapides fonctionnelles

### 5. Services (/services)
- [ ] Services affichés en grille
- [ ] Filtres par catégorie
- [ ] Filtres par prix
- [ ] Filtres par note
- [ ] Reset filtres
- [ ] État vide approprié
- [ ] Responsive layout

### 6. Navigation
- [ ] Navbar sticky
- [ ] Logo cliquable
- [ ] Liens navigation actifs
- [ ] Dropdown user fonctionne
- [ ] Mobile menu hamburger
- [ ] Transitions fluides
- [ ] Footer liens actifs

## Commandes Développement

```bash
# Démarrage dev avec logs détaillés
npm run dev -- --debug

# Build production
npm run build

# Lancer build production localement
npm start

# Linting ESLint
npm run lint

# Vérifier erreurs TypeScript
npm run type-check
```

## Variables d'Environnement

Créer un fichier `.env.local` :

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Auth
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain.com

# Maps (optionnel)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here

# Analytics (optionnel)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_id_here
```

## Dépannage

### Erreur : "Module not found"
```bash
# Nettoyer cache et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Port 3000 already in use"
```bash
# Démarrer sur autre port
npm run dev -- -p 3001
```

### Styles Tailwind pas appliqués
```bash
# Reconstruire CSS
npm run build
```

### Composants ne s'affichent pas
- Vérifier les imports
- Vérifier que Providers.jsx enveloppe l'app
- Consulter la console browser

## Performance

### Metrics Cibles (Lighthouse)
- Performance : > 85
- Accessibility : > 95
- Best Practices : > 90
- SEO : > 90

### Optimisations Déjà Appliquées
✅ Image optimization (Next Image)
✅ Code splitting automatique
✅ CSS-in-JS minification
✅ Bundle size optimized
✅ Lazy loading components

## Déploiement

### Vercel (Recommandé pour Next.js)
```bash
# Installation CLI Vercel
npm i -g vercel

# Déploiement
vercel

# Avec variables env
vercel env add NEXT_PUBLIC_API_URL
```

### Autres Plateforme
- **Netlify** : Supporté via adapter Node.js
- **AWS Amplify** : Intégration native
- **Docker** : Créer Dockerfile custom

## Monitoring & Logs

```bash
# Logs build
npm run build 2>&1 | tee build.log

# Logs dev
npm run dev > app.log 2>&1 &

# Afficher processes
ps aux | grep node
```

## Commit & Versioning

```bash
# Commit avec message clair
git add .
git commit -m "feat: improve homepage hero section"

# Tags version
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

## Ressources Utiles

- **Next.js Docs** : https://nextjs.org/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Framer Motion** : https://www.framer.com/motion/
- **Lucide Icons** : https://lucide.dev/
- **React Best Practices** : https://react.dev/reference

## Support & Contribution

Pour les bugs ou améliorations :
1. Créer une issue descriptive
2. Fork et créer une branche feature
3. Commit avec messages clairs
4. Push et ouvrir PR avec description
5. Review et merge

## Checklist Pre-Production

- [ ] Tous les tests passent
- [ ] Lighthouse score > 85
- [ ] Pas de console errors
- [ ] Responsive testé sur vrais appareils
- [ ] SEO meta tags en place
- [ ] Analytics intégré
- [ ] Sécurité headers configurés
- [ ] CORS correctement configuré
- [ ] Secrets en variables d'environnement
- [ ] Backup & monitoring en place

## Notes Importantes

- 🔒 **Never commit** .env.local ou secrets
- 📱 **Always test** sur appareils réels
- 🔄 **Rebuild** après changes CSS critical
- 📊 **Monitor** performance en production
- 🐛 **Report** bugs avec reproduction steps
- 🎯 **Follow** Conventional Commits format

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2026  
**Maintainer** : Loomdaah Frontend Team
