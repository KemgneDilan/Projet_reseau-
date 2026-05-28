'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Users, Building, Wrench, AlertTriangle, ShieldCheck, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { contracts, users, listings, services } from '@/lib/mockData'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const kpis = [
    { title: 'Utilisateurs Actifs', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Logements Publiés', value: listings.length.toString(), icon: Building, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Services Proposés', value: services.length.toString(), icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Contrats', value: contracts.length.toString(), icon: FileText, color: 'text-terracotta-500', bg: 'bg-terracotta-50' },
  ]

  // Fonction pour résoudre les noms (simulation de relations BDD)
  const getClientName = (id) => users.find((u) => u.id === id)?.username || id
  const getProviderName = (id) => users.find((u) => u.id === id)?.username || id
  const getEntityName = (id, type) => {
    if (type === 'Logement') return listings.find((l) => l.id === id)?.title || id
    return services.find((s) => s.id === id)?.title || id
  }

  if (loading) {
    return <div className="p-8">Chargement…</div>
  }

  if (!user || user.role !== 'admin') {
    return <div className="p-8">Accès non autorisé</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-terracotta-500" /> Administration H&R&S
        </h1>
        <Button variant="secondary" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-charcoal-500 mb-1">{kpi.title}</p>
                    <h3 className="text-2xl font-bold text-charcoal-900">{kpi.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Dernières Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(-3).reverse().map((u) => (
                <div key={u.id} className="flex items-center justify-between border-b border-charcoal-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-terracotta-100 text-terracotta-700 flex justify-center items-center font-bold">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">{u.username}</p>
                      <p className="text-xs text-charcoal-500 capitalize">Rôle : {u.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Profil</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contrats et Réservations Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((c) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-charcoal-100 pb-4 last:border-0 last:pb-0 gap-2">
                  <div>
                    <p className="font-medium text-charcoal-900 line-clamp-1">{getEntityName(c.entityId, c.entityType)}</p>
                    <p className="text-xs text-charcoal-500">
                      Client : <strong>{getClientName(c.clientId)}</strong> — Hôte/Presta : <strong>{getProviderName(c.providerId)}</strong>
                    </p>
                    <p className="text-xs text-terracotta-600 font-semibold mt-1">{c.amount.toLocaleString()} XAF ({c.date})</p>
                  </div>
                  <div>
                    <Badge className={c.status === 'Completed' ? 'bg-green-100 text-green-800' : c.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

