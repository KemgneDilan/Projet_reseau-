"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { Plus, Briefcase, CalendarCheck, MessageSquare, Star } from "lucide-react"
import { services as defaultServices } from "@/lib/mockData"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useAuth } from "@/lib/auth"
import { EditItemModal } from "@/components/features/EditItemModal"

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [myServices, setMyServices] = React.useState([])
  const [editingItem, setEditingItem] = React.useState(null)

  React.useEffect(() => {
    if (user) {
      const local = localStorage.getItem(`hrs_services_${user.id}`)
      if (local) {
        setMyServices(JSON.parse(local))
      } else {
        const initial = defaultServices.filter(s => s.providerId === user.id || s.providerId === 'u3')
        setMyServices(initial)
      }
    }
  }, [user, user?.id])

  const handleSave = (updatedItem) => {
    const updatedList = myServices.map(item => item.id === updatedItem.id ? updatedItem : item)
    setMyServices(updatedList)
    if (user) {
      localStorage.setItem(`hrs_services_${user.id}`, JSON.stringify(updatedList))
    }
  }

  const stats = [
    { title: "Commandes du mois", value: "28", icon: CalendarCheck },
    { title: "Note moyenne", value: "4.8", icon: Star },
    { title: "Nouveaux Messages", value: "5", icon: MessageSquare },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Espace Prestataire</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nouveau Service
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

      {/* Mes Services */}
      <h2 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-terracotta-500" /> Mes Services
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myServices.map((service) => (
          <Card key={service.id} className="overflow-hidden flex flex-col">
            <div className="h-40 overflow-hidden relative">
              <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
              <Badge className={`absolute top-2 right-2 border-none shadow-sm ${service.status === 'inactive' ? 'bg-charcoal-500 text-white' : 'bg-white text-charcoal-900'}`}>
                {service.status === 'inactive' ? 'Indisponible' : service.category}
              </Badge>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-charcoal-900 mb-1">{service.title}</h3>
                <p className="text-charcoal-500 text-sm mb-4 line-clamp-2">{service.description}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-charcoal-50">
                <span className="font-bold text-charcoal-900">{service.price} {service.currency} <span className="text-sm font-normal text-charcoal-500">/ {service.unit}</span></span>
                <Button variant="outline" size="sm" onClick={() => setEditingItem(service)}>Gérer</Button>
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
          type="service"
          onSave={handleSave}
        />
      )}
    </div>
  )
}

