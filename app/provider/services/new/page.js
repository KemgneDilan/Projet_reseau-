"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/app/contexts/AuthContext'
import { useLanguage } from '@/app/contexts/LanguageContext'

export default function NewServicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      router.push('/login')
    }
  }, [user, router])

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
    const providerId = provider.id || user?.id || 'u3'

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

  const handleBack = () => router.back()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleBack} className="inline-flex items-center text-charcoal-600 hover:text-terracotta-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('btn_back') || 'Retour'}
        </button>
        <Link href="/provider"><Button variant="outline">{t('action_cancel') || 'Annuler'}</Button></Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{t('provider_add_service') || 'Ajouter un nouveau service'}</h1>
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
