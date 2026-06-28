export const users = [
  { id: 'u1', username: 'Client1', phone: '670000001', role: 'client', password: 'password', city: 'Douala' },
  { id: 'u2', username: 'Hote1', phone: '670000002', role: 'host', password: 'password', city: 'Kribi' },
  { id: 'u3', username: 'Presta1', phone: '670000003', role: 'provider', password: 'password', city: 'Yaoundé' },
  { id: 'admin1', username: 'admin', phone: '0000', role: 'admin', password: 'admin', city: 'Yaoundé' }
];

export const listings = [
  {
    id: 'l1',
    hostId: 'u2',
    title: 'Villa de Charme au bord de l\'Océan',
    description: 'Profitez d\'un séjour inoubliable à Kribi dans cette villa spacieuse avec vue imprenable sur l\'Océan Atlantique. Accès direct à la plage, piscine privée et jardin tropical. Idéal pour les familles ou les groupes d\'amis cherchant la tranquillité au bord de l\'eau.',
    rating: 4.8,
    reviewsCount: 24,
    location: 'Kribi, Sud',
    city: 'Kribi',
    lat: 2.9436,
    lng: 9.9077,
    type: 'Villa',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Piscine', 'Wifi', 'Climatisation', 'Cuisine équipée', 'Vue sur mer', 'Parking privé'],
    communityServices: [
      { id: 'cs1', title: 'Visite guidée de la plage de Kribi', description: 'Votre hôte vous propose une visite guidée des plages sauvages et des chutes de la Lobé.', category: 'Expérience' },
      { id: 'cs2', title: 'Cours de cuisine locale', description: 'Apprenez à préparer le Ndolé et le Poisson braisé avec votre hôte.', category: 'Partage' }
    ]
  },
  {
    id: 'l2',
    hostId: 'u2',
    title: 'Appartement Haut-Standing Bastos',
    description: 'Superbe appartement situé dans le quartier résidentiel et sécurisé de Bastos à Yaoundé. Entouré par les ambassades, profitez du calme, de la verdure environnante et de la vue sur les collines. Proche des meilleurs restaurants de la capitale.',
    rating: 4.5,
    reviewsCount: 32,
    location: 'Bastos, Yaoundé',
    city: 'Yaoundé',
    lat: 3.8824,
    lng: 11.5118,
    type: 'Appartement',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wifi Fibre', 'Climatisation', 'Ascenseur', 'Gardien 24/7', 'Vue Colline'],
    communityServices: [
      { id: 'cs3', title: 'Découverte des musées de Yaoundé', description: "Votre hôte, passionné d'histoire, vous propose un circuit culturel dans les musées de la capitale.", category: 'Culture' }
    ]
  },
  {
    id: 'l3',
    hostId: 'u2',
    title: 'Maison Lodge à Buea',
    description: 'Respirez l\'air pur de la montagne dans cette maison chaleureuse située à Buea, proche des sentiers de randonnée et d\'une vue magnifique sur le Mont Cameroun.',
    rating: 4.9,
    reviewsCount: 56,
    location: 'Buea, Sud-Ouest',
    city: 'Buea',
    lat: 4.1550,
    lng: 9.2415,
    type: 'Maison',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Eau Chaude', 'Cuisine équipée', 'Jardin', 'Guide de randonnée disponible'],
    communityServices: [
      { id: 'cs4', title: 'Randonnée guidée sur le Mont Cameroun', description: 'Votre hôte, guide certifié, vous accompagne sur les sentiers du Mont Cameroun.', category: 'Nature' },
      { id: 'cs5', title: 'Petit-déjeuner typique de l\'Ouest', description: 'Chaque matin, votre hôte prépare un petit-déjeuner traditionnel avec produits frais du marché local.', category: 'Partage' }
    ]
  }
];

// Nouvelle séparation House / Room
// Une `house` contient une collection de `room` (roomsIds)
export const houses = [
  {
    id: 'h1',
    hostId: 'u2',
    title: 'Villa de Charme au bord de l\'Océan (maison complète)',
    description: 'Maison spacieuse avec plusieurs chambres, piscine privée et accès plage. Peut être louée entière ou chambre par chambre.',
    city: 'Kribi',
    location: 'Kribi, Sud',
    lat: 2.9436,
    lng: 9.9077,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Piscine', 'Wifi', 'Climatisation', 'Cuisine équipée', 'Vue sur mer'],
    roomsIds: ['r1','r2']
  }
];

export const rooms = [
  {
    id: 'r1',
    houseId: 'h1',
    hostId: 'u2',
    title: 'Chambre Master - Vue sur mer',
    description: 'Grande chambre master avec lit double, salle de bains privative et vue sur le jardin tropical.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Climatisation', 'Salle de bains privée', 'Balcon']
  },
  {
    id: 'r2',
    houseId: 'h1',
    hostId: 'u2',
    title: 'Chambre Standard - Jardin',
    description: 'Chambre confortable avec lit double et accès au jardin.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Eau chaude', 'Accès jardin']
  }
];


export const reviews = [
  { id: 'rv1', targetId: 'l1', authorId: 'u1', authorName: 'Alice', rating: 5, comment: 'La villa à Kribi est exactement comme sur les photos, la vue mer est incroyable.', date: '2026-03-15' },
  { id: 'rv2', targetId: 'l2', authorId: 'u1', authorName: 'Marc', rating: 4, comment: 'Très bien situé à Yaoundé, parfait pour un voyage d\'affaires. Très calme.', date: '2026-03-20' }
];

export const messages = [];

export const contracts = [
  { id: 'c1', clientId: 'u2', providerId: 'u1', entityId: 'l1', entityType: 'listing', date: '2025-04-10', status: 'Completed' },
  { id: 'c2', clientId: 'u3', providerId: 'u1', entityId: 'l2', entityType: 'listing', date: '2025-05-01', status: 'Active' },
];
