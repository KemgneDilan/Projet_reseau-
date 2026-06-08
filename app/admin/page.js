'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Building, Wrench, AlertTriangle, ShieldCheck, FileText, ChevronDown, ChevronUp, Clock, Settings, Home, BedDouble } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { contracts, users, listings, services, houses, rooms } from '@/lib/mockData'
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

  const [activeTab, setActiveTab] = React.useState('overview')
  const [expandedActor, setExpandedActor] = React.useState(null)
  const [expandedHouse, setExpandedHouse] = React.useState(null)

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
      <div className="flex justify-between items-center mb-8 border-b border-charcoal-200 dark:border-charcoal-800 pb-6">
        <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-terracotta-500" /> Administration Loomdaah
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-charcoal-100 dark:border-charcoal-800">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Home },
          { id: 'acteurs', label: 'Acteurs', icon: Users },
          { id: 'logements', label: 'Logements & Chambres', icon: Building },
          { id: 'services', label: 'Services', icon: Wrench },
          { id: 'historique', label: 'Historique', icon: Clock }
        ].map(tab => (
          <Button 
            key={tab.id} 
            variant={activeTab === tab.id ? 'default' : 'ghost'} 
            onClick={() => {
              setActiveTab(tab.id)
              setExpandedActor(null)
              setExpandedHouse(null)
            }}
            className={`capitalize rounded-none border-b-2 ${activeTab === tab.id ? 'border-terracotta-500 text-terracotta-600 bg-transparent hover:bg-transparent dark:text-terracotta-400 dark:border-terracotta-400' : 'border-transparent text-charcoal-600 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-white'}`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 mb-1">{kpi.title}</p>
                          <h3 className="text-2xl font-bold text-charcoal-900 dark:text-white">{kpi.value}</h3>
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
              <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
                <CardHeader>
                  <CardTitle className="dark:text-white">Dernières Inscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(-3).reverse().map((u) => (
                      <div key={u.id} className="flex items-center justify-between border-b border-charcoal-100 dark:border-charcoal-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 text-white flex justify-center items-center font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900 dark:text-white">{u.username}</p>
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-400 capitalize">Rôle : {u.role}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Profil</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
                <CardHeader>
                  <CardTitle className="dark:text-white">Contrats et Réservations Récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contracts.map((c) => (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-charcoal-100 dark:border-charcoal-800 pb-4 last:border-0 last:pb-0 gap-2">
                        <div>
                          <p className="font-medium text-charcoal-900 dark:text-white line-clamp-1">{getEntityName(c.entityId, c.entityType)}</p>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                            Client : <strong className="dark:text-charcoal-300">{getClientName(c.clientId)}</strong> — Hôte/Presta : <strong className="dark:text-charcoal-300">{getProviderName(c.providerId)}</strong>
                          </p>
                          <p className="text-xs text-terracotta-600 dark:text-terracotta-400 font-semibold mt-1">{c.amount.toLocaleString()} XAF ({c.date})</p>
                        </div>
                        <div>
                          <Badge className={c.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : c.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'acteurs' && (
          <motion.div key="acteurs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-charcoal-50 dark:bg-charcoal-950/20 text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Utilisateur</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4 text-right">Historique</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {users.map(u => {
                      const userContracts = contracts.filter(c => c.clientId === u.id || c.providerId === u.id)
                      const isExpanded = expandedActor === u.id
                      return (
                        <React.Fragment key={u.id}>
                          <tr className={`hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50 transition-colors ${isExpanded ? 'bg-charcoal-50/80 dark:bg-charcoal-900/80' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 text-white flex justify-center items-center font-bold text-xs">
                                  {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-charcoal-900 dark:text-white">{u.username}</p>
                                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{u.city}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><Badge variant="outline" className="capitalize">{u.role}</Badge></td>
                            <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400">{u.phone}</td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setExpandedActor(isExpanded ? null : u.id)}
                                className="text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-white"
                              >
                                {userContracts.length} transaction{userContracts.length !== 1 ? 's' : ''}
                                {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                              </Button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={4} className="p-0 border-b border-charcoal-100 dark:border-charcoal-800">
                                <div className="bg-charcoal-50/30 dark:bg-charcoal-900/30 p-6">
                                  <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white mb-4">Historique des transactions</h4>
                                  {userContracts.length > 0 ? (
                                    <div className="space-y-3">
                                      {userContracts.map(c => (
                                        <div key={c.id} className="flex justify-between items-center bg-white dark:bg-charcoal-950 p-3 rounded-lg border border-charcoal-100 dark:border-charcoal-800">
                                          <div>
                                            <p className="text-sm font-medium text-charcoal-900 dark:text-white">{getEntityName(c.entityId, c.entityType)}</p>
                                            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                                              {c.date} • {u.role === 'client' ? `Fournisseur: ${getProviderName(c.providerId)}` : `Client: ${getClientName(c.clientId)}`}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-bold text-terracotta-600 dark:text-terracotta-400">{c.amount.toLocaleString()} XAF</p>
                                            <Badge className={c.status === 'Completed' ? 'bg-green-100 text-green-800 border-none' : c.status === 'Active' ? 'bg-blue-100 text-blue-800 border-none' : 'bg-yellow-100 text-yellow-800 border-none'}>
                                              {c.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Aucune transaction enregistrée.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'logements' && (
          <motion.div key="logements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-charcoal-50 dark:bg-charcoal-950/20 text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Propriété</th>
                      <th className="px-6 py-4">Hôte</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {listings.map(l => (
                      <tr key={l.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-charcoal-900 dark:text-white">{l.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{l.type}</Badge>
                            <span className="text-xs text-charcoal-500">{l.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400">{getProviderName(l.hostId)}</td>
                        <td className="px-6 py-4 font-bold text-charcoal-900 dark:text-white">{l.price.toLocaleString()} XAF</td>
                        <td className="px-6 py-4 text-right">
                          <Badge className={l.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-800'}>{l.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {houses.map(h => {
                      const houseRooms = rooms.filter(r => r.houseId === h.id)
                      const isExpanded = expandedHouse === h.id
                      return (
                        <React.Fragment key={h.id}>
                          <tr className={`hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50 transition-colors ${isExpanded ? 'bg-charcoal-50/80 dark:bg-charcoal-900/80' : ''}`}>
                            <td className="px-6 py-4">
                              <p className="font-medium text-charcoal-900 dark:text-white">{h.title}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">Maison (Multi-chambres)</Badge>
                                <span className="text-xs text-charcoal-500">{h.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400">{getProviderName(h.hostId)}</td>
                            <td className="px-6 py-4 font-bold text-charcoal-900 dark:text-white">{h.price.toLocaleString()} XAF</td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setExpandedHouse(isExpanded ? null : h.id)}
                              >
                                {houseRooms.length} chambre{houseRooms.length !== 1 ? 's' : ''}
                                {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                              </Button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={4} className="p-0 border-b border-charcoal-100 dark:border-charcoal-800">
                                <div className="bg-charcoal-50/30 dark:bg-charcoal-900/30 p-6 pl-12 border-l-4 border-terracotta-500">
                                  <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white mb-4 flex items-center gap-2"><BedDouble className="h-4 w-4" /> Chambres rattachées</h4>
                                  <div className="space-y-3">
                                    {houseRooms.map(r => (
                                      <div key={r.id} className="flex justify-between items-center bg-white dark:bg-charcoal-950 p-3 rounded-lg border border-charcoal-100 dark:border-charcoal-800">
                                        <p className="text-sm font-medium text-charcoal-900 dark:text-white">{r.title}</p>
                                        <div className="flex items-center gap-4">
                                          <p className="text-sm font-bold text-terracotta-600 dark:text-terracotta-400">{r.price.toLocaleString()} XAF</p>
                                          <Badge className={r.status === 'active' ? 'bg-green-100 text-green-800 border-none' : 'bg-charcoal-100 text-charcoal-800 border-none'}>{r.status}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-charcoal-50 dark:bg-charcoal-950/20 text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Titre</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Prestataire</th>
                      <th className="px-6 py-4">Prix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50">
                        <td className="px-6 py-4 font-medium text-charcoal-900 dark:text-white">{s.title}</td>
                        <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400"><Badge variant="outline">{s.category}</Badge></td>
                        <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400">{getProviderName(s.providerId)}</td>
                        <td className="px-6 py-4 text-charcoal-900 dark:text-white font-bold">{s.price.toLocaleString()} XAF <span className="text-xs font-normal text-charcoal-500">/ {s.unit}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'historique' && (
          <motion.div key="historique" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border border-charcoal-200 dark:border-charcoal-800 dark:bg-charcoal-900">
              <CardHeader>
                <CardTitle className="dark:text-white">Journal global des réservations et contrats</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-charcoal-50 dark:bg-charcoal-950/20 text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Entité concernée</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Propriétaire/Presta</th>
                      <th className="px-6 py-4">Montant</th>
                      <th className="px-6 py-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800 text-sm">
                    {contracts.map(c => (
                      <tr key={c.id} className="hover:bg-charcoal-50/50 dark:hover:bg-charcoal-900/50">
                        <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-400 whitespace-nowrap">{c.date}</td>
                        <td className="px-6 py-4 font-medium text-charcoal-900 dark:text-white">{getEntityName(c.entityId, c.entityType)} <span className="text-xs text-charcoal-400 ml-1">({c.entityType})</span></td>
                        <td className="px-6 py-4 text-charcoal-600 dark:text-charcoal-300">{getClientName(c.clientId)}</td>
                        <td className="px-6 py-4 text-charcoal-600 dark:text-charcoal-300">{getProviderName(c.providerId)}</td>
                        <td className="px-6 py-4 font-bold text-terracotta-600 dark:text-terracotta-400 whitespace-nowrap">{c.amount.toLocaleString()} XAF</td>
                        <td className="px-6 py-4">
                          <Badge className={c.status === 'Completed' ? 'bg-green-100 text-green-800 border-none dark:bg-green-900/30 dark:text-green-400' : c.status === 'Active' ? 'bg-blue-100 text-blue-800 border-none dark:bg-blue-900/30 dark:text-blue-400' : 'bg-yellow-100 text-yellow-800 border-none dark:bg-yellow-900/30 dark:text-yellow-400'}>
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

