'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Globe, Save, Coins, Info, Mail, MapPin } from 'lucide-react'
import { useTheme } from '@/app/contexts/ThemeContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t, lang, changeLanguage } = useLanguage()
  const { currency, changeCurrency } = useCurrency()
  const { user, updateUser, loading } = useAuth()
  const router = useRouter()
  const [connectionData, setConnectionData] = React.useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [accountData, setAccountData] = React.useState({
    username: '',
    city: ''
  })
  const [saveStatus, setSaveStatus] = React.useState('')
  const [isMounted, setIsMounted] = React.useState(false)

  // Prevent SSR/CSR hydration mismatch: all auth-dependent rendering
  // is deferred to after first client mount.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  React.useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnectionData({
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: ''
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccountData({
        username: user.username || '',
        city: user.city || ''
      })
    }
  }, [user])

  const handleSaveProfile = () => {
    setSaveStatus('')
    if (connectionData.password && connectionData.password !== connectionData.confirmPassword) {
      setSaveStatus('Les mots de passe ne correspondent pas.')
      return
    }

    const updates = {
      email: connectionData.email,
      phone: connectionData.phone,
      username: accountData.username,
      city: accountData.city
    }

    if (connectionData.password) {
      updates.password = connectionData.password
    }

    updateUser(updates)

    if (typeof window !== 'undefined') {
      const savedUsers = JSON.parse(localStorage.getItem('hrs_users') || '[]')
      const updatedUsers = savedUsers.map((u) => (u.id === user.id ? { ...u, ...updates } : u))
      localStorage.setItem('hrs_users', JSON.stringify(updatedUsers))
    }

    setSaveStatus('Vos informations ont bien été mises à jour.')
    setConnectionData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
  }

  // Before client mount, return null to match server-rendered output exactly.
  if (!isMounted) return null

  if (loading) {
    return <div className="p-8 text-center text-charcoal-500">Chargement…</div>
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white">
          {t('nav_settings')}
        </h1>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
          Gérez vos préférences de langue, d&apos;affichage, et consultez les informations légales de la plateforme.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Preference Settings Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
              Préférences utilisateur
            </h2>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-6 w-6 text-terracotta-500" />
                  ) : (
                    <Sun className="h-6 w-6 text-orange-500" />
                  )}
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_appearance')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_theme_desc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    isDarkMode ? 'bg-terracotta-500' : 'bg-charcoal-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Language Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-terracotta-500" />
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_language')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_lang_desc')}
                    </p>
                  </div>
                </div>
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="p-2 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white outline-none shrink-0 text-sm font-medium"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Display Currency Settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-950/20 rounded-xl border border-charcoal-200 dark:border-charcoal-800 gap-4">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-terracotta-500" />
                  <div>
                    <p className="font-semibold text-charcoal-900 dark:text-white">
                      {t('settings_currency')}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {t('settings_currency_desc')}
                    </p>
                  </div>
                </div>
                <select
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                  className="p-2 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white outline-none shrink-0 text-sm font-medium"
                >
                  <option value="XAF">FCFA (XAF)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Connection and Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
              Paramètres de connexion et compte
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">Paramètres de connexion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Adresse email</label>
                    <input
                      type="email"
                      value={connectionData.email}
                      onChange={(e) => setConnectionData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Téléphone</label>
                    <input
                      type="tel"
                      value={connectionData.phone}
                      onChange={(e) => setConnectionData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={connectionData.password}
                      onChange={(e) => setConnectionData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={connectionData.confirmPassword}
                      onChange={(e) => setConnectionData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">Informations du compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Nom d&apos;utilisateur</label>
                    <input
                      type="text"
                      value={accountData.username}
                      onChange={(e) => setAccountData((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Ville</label>
                    <input
                      type="text"
                      value={accountData.city}
                      onChange={(e) => setAccountData((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {saveStatus && (
                <div className="rounded-xl border border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50 dark:bg-charcoal-950/40 px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-200">
                  {saveStatus}
                </div>
              )}
              <div className="flex justify-end">
                <Button type="button" onClick={handleSaveProfile} className="w-full sm:w-auto">
                  Enregistrer les modifications
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Centres d'intérêt */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
              Centres d&apos;intérêt (Affinité Sociale)
            </h2>
            <p className="text-sm text-charcoal-500">
              Sélectionnez vos centres d&apos;intérêt pour améliorer la recommandation sociale et trouver des hôtes partageant les mêmes passions que vous via l&apos;indice de Jaccard.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Cuisine local', 'Randonnée', 'Lecture', 'Musique', 'Art', 'Cinéma', 'Voyages', 'Langues', 'Sport', 'Photographie', 'Nature'].map((interest) => {
                const isSelected = (user.interests || []).includes(interest.toLowerCase())
                return (
                  <button
                    key={interest}
                    onClick={() => {
                      const lowerInterest = interest.toLowerCase()
                      const currentInterests = user.interests || []
                      let updated
                      if (isSelected) {
                        updated = currentInterests.filter(i => i !== lowerInterest)
                      } else {
                        updated = [...currentInterests, lowerInterest]
                      }
                      updateUser({ interests: updated })
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300 hover:bg-charcoal-200'
                    }`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Vérification KYC */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
              Vérification d&apos;identité (KYC)
            </h2>
            
            {user.kycStatus === 'none' && (
              <div className="space-y-4">
                <p className="text-sm text-charcoal-500">
                  Pour activer le mode Hôte et proposer des hébergements, vous devez faire vérifier votre identité. Cette procédure est gratuite et unique.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const fullName = formData.get('fullName')
                    const docType = formData.get('docType')
                    const docNumber = formData.get('docNumber')
                    
                    if (!fullName || !docNumber) {
                      alert('Veuillez remplir tous les champs obligatoires.')
                      return
                    }
                    
                    // Enregistrer la demande
                    const request = {
                      id: `req_${Date.now()}`,
                      userId: user.id,
                      username: user.username,
                      fullName,
                      docType,
                      docNumber,
                      submittedAt: new Date().toISOString(),
                      status: 'pending'
                    }
                    
                    const requests = JSON.parse(localStorage.getItem('hrs_kyc_requests') || '[]')
                    requests.push(request)
                    localStorage.setItem('hrs_kyc_requests', JSON.stringify(requests))
                    
                    updateUser({ kycStatus: 'pending' })
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Nom Complet *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                        placeholder="Ex: Dilan Kamga"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Type de document</label>
                      <select
                        name="docType"
                        className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                      >
                        <option value="CNI">Carte Nationale d&apos;Identité (CNI)</option>
                        <option value="Passeport">Passeport</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Numéro de CNI / Passeport *</label>
                      <input
                        type="text"
                        name="docNumber"
                        required
                        className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-900 dark:text-white outline-none"
                        placeholder="Ex: 100239485"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Fichier CNI / Passeport (Photo recto/verso ou Scan)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full text-sm text-charcoal-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-terracotta-50 file:text-terracotta-700 hover:file:bg-terracotta-100 cursor-pointer"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold py-3 rounded-xl transition-colors">
                    Soumettre ma demande de vérification
                  </Button>
                </form>
              </div>
            )}

            {user.kycStatus === 'pending' && (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-charcoal-50 dark:bg-charcoal-950/40 rounded-2xl border border-charcoal-200 dark:border-charcoal-800">
                <div className="text-4xl mb-3 animate-pulse">⏳</div>
                <h3 className="font-semibold text-charcoal-900 dark:text-white mb-2">Vérification en cours</h3>
                <p className="text-sm text-charcoal-500 max-w-md">
                  Votre demande de vérification d&apos;identité est en cours de traitement par nos administrateurs. Cela prend généralement moins de 24 heures.
                </p>
              </div>
            )}

            {user.kycStatus === 'validated' && (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-2">Identité vérifiée</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-500 max-w-md">
                  Félicitations, votre identité a été validée avec succès ! Vous pouvez maintenant basculer en mode Hôte depuis le bouton de bascule de la barre de navigation.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-terracotta-500" />
              {t('settings_about_platform')}
            </h2>
            <div className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <div className="bg-charcoal-50 dark:bg-charcoal-950/20 p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-800 mt-2">
                <h3 className="font-semibold text-charcoal-900 dark:text-white mb-1">{t('about_vision_title')}</h3>
                <p className="text-xs text-charcoal-500">{t('about_vision_p')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Headquarters Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-terracotta-500" />
              {t('settings_contact_us')}
            </h2>
            <div className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <p>{t('contact_subtitle')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex gap-3 items-start p-4 bg-charcoal-50 dark:bg-charcoal-950/20 border border-charcoal-200 dark:border-charcoal-800 rounded-xl">
                  <MapPin className="h-5 w-5 text-terracotta-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{t('settings_contact_hq')}</h3>
                    <p className="text-xs text-charcoal-500 mt-1">{t('settings_hq_address')}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-charcoal-50 dark:bg-charcoal-950/20 border border-charcoal-200 dark:border-charcoal-800 rounded-xl">
                  <Mail className="h-5 w-5 text-terracotta-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">Email support</h3>
                    <p className="text-xs text-charcoal-500 mt-1">support@hrs.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => router.push(`/${user.role}`)} className="w-full sm:w-auto font-medium">
            {t('settings_back_dashboard')}
          </Button>
        </div>

      </div>
    </div>
  )
}
