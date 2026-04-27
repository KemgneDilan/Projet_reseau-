"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [identifier, setIdentifier] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!identifier || !password) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    const res = login(identifier, password)
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
            <CardTitle className="text-2xl font-bold text-terracotta-500 mb-2">Bienvenue sur H&R&S</CardTitle>
            <CardDescription>Connectez-vous pour accéder à votre espace dédié.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Nom d'utilisateur ou Téléphone</label>
                <Input 
                  placeholder="Ex: Dilan ou 6XXXXXXXX" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Mot de passe</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-2">Se connecter</Button>
            </form>
            <div className="mt-6 text-center text-sm text-charcoal-500">
              Pas encore de compte ? <Link href="/register" className="text-terracotta-600 font-semibold hover:underline">S'inscrire</Link>
            </div>
            <div className="mt-4 text-center text-xs text-charcoal-400">
              Compte admin par défaut : admin / admin
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
