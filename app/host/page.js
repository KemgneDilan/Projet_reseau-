"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Home, Calendar, MessageSquare, TrendingUp } from "lucide-react"
import { listings as defaultListings } from "@/lib/mockData"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useAuth } from "@/lib/auth"
import { EditItemModal } from "@/components/features/EditItemModal"

export default function HostDashboard() {
  const { user } = useAuth()
  const [myListings, setMyListings] = React.useState([])
  const [editingItem, setEditingItem] = React.useState(null)

  React.useEffect(() => {
    if (user) {
      // Pour la simulation, on charge depuis localStorage ou mockData
      const local = localStorage.getItem(`hrs_listings_${user.id}`)
      if (local) {
        setMyListings(JSON.parse(local))
      } else {
        const initial = defaultListings.filter(l => l.hostId === user.id || l.hostId === 'u2') // fallback u2
        setMyListings(initial)
      }
    }
  }, [user, user?.id])

  const handleSave = (updatedItem) => {
    const updatedList = myListings.map(item => item.id === updatedItem.id ? updatedItem : item)
    setMyListings(updatedList)
    if (user) {
      localStorage.setItem(`hrs_listings_${user.id}`, JSON.stringify(updatedList))
    }
  }

  const stats = [
    { title: "Revenus (30j)", value: "450 000 XAF", icon: TrendingUp },
    { title: "Réservations", value: "12", icon: Calendar },
    { title: "Nouveaux Messages", value: "3", icon: MessageSquare },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Espace Hôte</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle annonce
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-terracotta-50 text-terracotta-500 rounded-lg">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-charcoal-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mes Annonces */}
      <h2 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
        <Home className="h-5 w-5 text-terracotta-500" /> Mes Logements
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <div className="h-40 overflow-hidden relative">
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              <Badge className={`absolute top-2 right-2 border-none shadow-sm ${listing.status === 'inactive' ? 'bg-charcoal-500 text-white' : 'bg-white text-charcoal-900'}`}>
                {listing.status === 'inactive' ? 'Indisponible' : 'Actif'}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-charcoal-900 truncate mb-1">{listing.title}</h3>
              <p className="text-charcoal-500 text-sm mb-4">{listing.location}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-charcoal-900">{listing.price} {listing.currency} <span className="text-xs font-normal text-charcoal-500">/ nuit</span></span>
                <Button variant="outline" size="sm" onClick={() => setEditingItem(listing)}>Gérer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingItem && (
        <EditItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          type="listing"
          onSave={handleSave}
        />
      )}
    </div>
  )
}

