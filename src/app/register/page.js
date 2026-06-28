"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/app/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    role: "client"
  })
  const [errors, setErrors] = React.useState({})
  const [loading, setLoading] = React.useState(false)

  /**
   * Valide les données du formulaire
   * @returns {boolean} True si les données sont valides
   */
  const validateForm = () => {
    const newErrors = {}

    // Validation du nom d'utilisateur
    if (!formData.username?.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire"
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email?.trim()) {
      newErrors.email = "L'adresse email est obligatoire"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide"
    }

    // Validation du téléphone (chiffres uniquement)
    if (!formData.phone?.trim()) {
      newErrors.phone = "Le numéro de téléphone est obligatoire"
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = "Le numéro de téléphone ne doit contenir que des chiffres"
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = "Le numéro de téléphone doit contenir au moins 8 chiffres"
    }

    // Validation du mot de passe
    if (!formData.password?.trim()) {
      newErrors.password = "Le mot de passe est obligatoire"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    // Validation de la ville
    if (!formData.city?.trim()) {
      newErrors.city = "La ville est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const user = await register(formData)
      router.push(`/${user.role}`)
    } catch (err) {
      setErrors({ form: err.message || "Une erreur est survenue lors de l'inscription." })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Gère le changement d'un champ du formulaire
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-charcoal-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-xl border-charcoal-100">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-terracotta-500 mb-2">Créer un compte</CardTitle>
            <CardDescription>Rejoignez Loomdaah et découvrez des lieux uniques.</CardDescription>
          </CardHeader>
          <CardContent>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                {errors.form}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Nom d&apos;utilisateur *
                </label>
                <Input 
                  placeholder="Ex: Dilan" 
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
              </div>

              {/* Email - NOUVEAU CHAMP */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Adresse email *
                </label>
                <Input 
                  type="email"
                  placeholder="Ex: votre@email.com" 
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Téléphone avec validation */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Numéro de téléphone (chiffres uniquement) *
                </label>
                <Input 
                  type="tel" 
                  placeholder="Ex: 237699887766" 
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Ville *
                </label>
                <Input 
                  placeholder="Ex: Yaoundé" 
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Mot de passe (min. 6 caractères) *
                </label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg mt-2" 
                disabled={loading}
              >
                {loading ? "Inscription en cours..." : "S&apos;inscrire"}
              </Button>
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
