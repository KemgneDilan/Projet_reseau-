"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    username: "",
    phone: "",
    password: "",
    city: "",
    role: "client"
  })
  const [error, setError] = React.useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.username || !formData.phone || !formData.password || !formData.city) {
      setError("Tous les champs sont obligatoires.")
      return
    }
    const res = register(formData)
    if (res.success) {
      router.push(`/${res.user.role}`)
    } else {
      setError(res.message)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-charcoal-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-xl border-charcoal-100">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-terracotta-500 mb-2">Créer un compte</CardTitle>
            <CardDescription>Rejoignez H&R&S et découvrez des lieux uniques.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Je souhaite m'inscrire en tant que :</label>
                <select 
                  className="w-full h-10 rounded-md border border-charcoal-200 bg-white px-3 text-sm focus:ring-2 focus:ring-terracotta-500 outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client (Louer & Réserver)</option>
                  <option value="host">Hôte (Proposer un logement)</option>
                  <option value="provider">Prestataire (Proposer des services)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Nom d'utilisateur</label>
                <Input 
                  placeholder="Ex: Dilan" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Téléphone</label>
                <Input 
                  type="tel" 
                  placeholder="Ex: 6XXXXXXXX" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Ville</label>
                <Input 
                  placeholder="Ex: Yaoundé" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Mot de passe</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-2">S'inscrire</Button>
            </form>
            <div className="mt-6 text-center text-sm text-charcoal-500">
              Déjà un compte ? <Link href="/login" className="text-terracotta-600 font-semibold hover:underline">Se connecter</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
