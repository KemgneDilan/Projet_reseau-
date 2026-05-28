"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function NewServicePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', price: '', unit: 'service', category: 'Autre', images: [] })
  const [imageErr, setImageErr] = useState('')

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const readers = files.slice(0, 5).map(file => new Promise((res) => {
      const r = new FileReader()
      r.onload = () => res(r.result)
      r.readAsDataURL(file)
    }))
    Promise.all(readers).then(results => {
      setForm(prev => ({ ...prev, images: [...prev.images, ...results].slice(0,5) }))
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.price) {
      setImageErr('Veuillez remplir le titre, la description et le prix.')
      return
    }

    const provider = JSON.parse(localStorage.getItem('hrs_current_user') || '{}')
    const providerId = provider.id || 'u3'

    const newService = {
      id: `s_${Date.now()}`,
      providerId,
      title: form.title,
      description: form.description,
      price: Number(form.price),
      unit: form.unit,
      currency: 'XAF',
      rating: 5.0,
      reviewsCount: 0,
      category: form.category,
      images: form.images.length ? form.images : []
    }

    const key = `hrs_services_${providerId}`
    const prev = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = [newService, ...prev]
    localStorage.setItem(key, JSON.stringify(updated))

    router.push('/provider')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/provider" className="inline-flex items-center text-charcoal-600 hover:text-terracotta-600 mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Link>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Ajouter un nouveau service</h1>
        <p className="text-sm text-charcoal-600 mb-6">Remplissez les informations et publiez votre service.</p>

        {imageErr && <div className="mb-4 text-sm text-red-600">{imageErr}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Titre</label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="w-full p-3 rounded-lg border" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Prix</label>
              <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium">Unité</label>
              <Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Catégorie</label>
            <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-medium">Images (max 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="block mt-2" />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Publier le service</Button>
            <Link href="/provider"><Button variant="outline">Annuler</Button></Link>
          </div>
        </form>
      </div>
    </div>
  )
}
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { ArrowLeft } from 'lucide-react'

export default function NewServicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()

  React.useEffect(() => {
    if (!user || user.role !== 'provider') {
      router.push('/login')
    }
  }, [user, router])

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-charcoal-200 dark:border-charcoal-800">
        <Button variant="outline" onClick={handleBack} className="gap-2 border-charcoal-300 dark:border-charcoal-700">
          <ArrowLeft className="h-4 w-4" /> {t('btn_back')}
        </Button>
      </div>

      <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-charcoal-200 dark:border-charcoal-800 shadow-sm p-8">
        <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white mb-2">
          {t('provider_add_service')}
        </h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 mb-8">
          Remplissez le formulaire ci-dessous pour créer un nouveau service.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
              Nom du service *
            </label>
            <input
              type="text"
              placeholder="Ex: Chauffeur VIP, Chef privé, Guide touristique..."
              className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
              Description *
            </label>
            <textarea
              placeholder="Décrivez les détails de votre service..."
              rows="5"
              className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
                Catégorie *
              </label>
              <select className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta-500">
                <option>Chauffeur</option>
                <option>Chef</option>
                <option>Guide</option>
                <option>Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                placeholder="50000"
                className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
                Unité (heure, journée, etc) *
              </label>
              <input
                type="text"
                placeholder="heure"
                className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal-900 dark:text-white mb-2">
                {t('img_upload')} *
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-4 py-3 border border-charcoal-300 dark:border-charcoal-700 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6">
            <Button variant="outline" onClick={handleBack} className="border-charcoal-300 dark:border-charcoal-700">
              {t('action_cancel')}
            </Button>
            <Button className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium">
              {t('action_add')} Service
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
