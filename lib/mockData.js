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
    price: 150000, // En FCFA
    currency: 'XAF',
    rating: 4.8,
    reviewsCount: 24,
    location: 'Kribi, Sud',
    city: 'Kribi',
    lat: 2.9436,
    lng: 9.9077,
    type: 'Villa',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Piscine', 'Wifi', 'Climatisation', 'Cuisine équipée', 'Vue sur mer', 'Parking privé']
  },
  {
    id: 'l2',
    hostId: 'u2',
    title: 'Appartement Haut-Standing Bastos',
    description: 'Superbe appartement situé dans le quartier résidentiel et sécurisé de Bastos à Yaoundé. Entouré par les ambassades, profitez du calme, de la verdure environnante et de la vue sur les collines aux sept collines. Proche des meilleurs restaurants de la capitale.',
    price: 60000,
    currency: 'XAF',
    rating: 4.5,
    reviewsCount: 32,
    location: 'Bastos, Yaoundé',
    city: 'Yaoundé',
    lat: 3.8824,
    lng: 11.5118,
    type: 'Appartement',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1e525044c7?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wifi Fibre', 'Climatisation', 'Ascenseur', 'Gardien 24/7', 'Vue Colline']
  },
  {
    id: 'l3',
    hostId: 'u2',
    title: 'Chalet Cosy au pied du Mont Cameroun',
    description: 'Respirez l\'air pur de la montagne dans ce magnifique chalet en bois situé à Buea. Vue dégagée sur le Mont Cameroun, cheminée pour les soirées fraîches et point de départ idéal pour les randonneurs.',
    price: 45000,
    currency: 'XAF',
    rating: 4.9,
    reviewsCount: 56,
    location: 'Buea, Sud-Ouest',
    city: 'Buea',
    lat: 4.1550,
    lng: 9.2415,
    type: 'Chalet',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Cheminée', 'Eau Chaude', 'Cuisine équipée', 'Guide de randonnée disponible']
  }
];

export const services = [
  {
    id: 's1',
    providerId: 'u3',
    title: 'Chauffeur VTC Aéroport - Douala',
    description: 'Transfert sécurisé et confortable depuis l\'Aéroport International de Douala vers votre résidence ou hôtel. Véhicule climatisé et chauffeur professionnel connaissant parfaitement la ville.',
    price: 15000,
    unit: 'trajet',
    currency: 'XAF',
    rating: 4.7,
    reviewsCount: 89,
    category: 'Transport',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 's2',
    providerId: 'u3',
    title: 'Chef Cuisinier Spécialités Camerounaises',
    description: 'Dégustez le meilleur de la cuisine locale directement chez vous. Je prépare pour vous le célèbre Ndolé, le Poulet DG, le Poisson braisé ou encore le Taro à la sauce jaune.',
    price: 25000,
    unit: 'repas (jusqu\'à 4 pers)',
    currency: 'XAF',
    rating: 4.9,
    reviewsCount: 112,
    category: 'Restauration',
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 's3',
    providerId: 'u3',
    title: 'Guide d\'Exploration Chutes de la Lobé',
    description: 'Une demi-journée d\'excursion pour découvrir les magnifiques chutes de la Lobé à Kribi (les seules au monde à se jeter directement dans l\'océan), avec dégustation de crevettes fraîches.',
    price: 20000,
    unit: 'demi-journée',
    currency: 'XAF',
    rating: 4.8,
    reviewsCount: 42,
    category: 'Tourisme',
    images: ['https://images.unsplash.com/photo-1504609774034-972178229f37?auto=format&fit=crop&w=800&q=80']
  }
];

export const reviews = [
  { id: 'r1', targetId: 'l1', authorId: 'u1', authorName: 'Alice', rating: 5, comment: 'La villa à Kribi est exactement comme sur les photos, la vue mer est incroyable.', date: '2026-03-15' },
  { id: 'r2', targetId: 'l2', authorId: 'u1', authorName: 'Marc', rating: 4, comment: 'Très bien situé à Yaoundé, parfait pour un voyage d\'affaires. Très calme.', date: '2026-03-20' },
  { id: 'r3', targetId: 's2', authorId: 'u1', authorName: 'Sophie', rating: 5, comment: 'Le Ndolé préparé par le chef était le meilleur que j\'ai jamais mangé !', date: '2026-03-25' }
];

export const messages = [];

// Nouvelles données pour le Dashboard Admin
export const contracts = [
  { id: 'c1', clientId: 'u1', providerId: 'u2', entityId: 'l1', entityType: 'Logement', date: '2026-04-12', amount: 300000, status: 'Completed' },
  { id: 'c2', clientId: 'u1', providerId: 'u3', entityId: 's2', entityType: 'Service', date: '2026-04-18', amount: 25000, status: 'Active' },
  { id: 'c3', clientId: 'u1', providerId: 'u2', entityId: 'l2', entityType: 'Logement', date: '2026-04-20', amount: 120000, status: 'Pending' }
];
