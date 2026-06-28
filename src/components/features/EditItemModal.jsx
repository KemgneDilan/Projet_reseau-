"use client"
import * as React from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export function EditItemModal({ isOpen, onClose, item, type, onSave }) {
  const [formData, setFormData] = React.useState(item || {})

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (item) setFormData(item)
  }, [item])

  if (!item) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier ${type === 'listing' ? 'le logement' : 'le service'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Titre</label>
          <Input name="title" value={formData.title} onChange={handleChange} />
        </div>
        
        {type === 'listing' && (
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Localisation (Ville)</label>
            <Input name="location" value={formData.location} onChange={handleChange} />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            className="w-full h-24 rounded-md border border-charcoal-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-terracotta-500 outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Prix ({formData.currency})</label>
            <Input name="price" type="number" value={formData.price} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Disponibilité</label>
            <select 
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-charcoal-200 bg-white px-3 text-sm focus:ring-2 focus:ring-terracotta-500 outline-none"
            >
              <option value="active">Disponible</option>
              <option value="inactive">Indisponible</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">URL de l&apos;image (Simulation upload)</label>
          <Input 
            name="imageUrl" 
            value={formData.images?.[0] || ''} 
            onChange={(e) => setFormData({...formData, images: [e.target.value, ...(formData.images?.slice(1) || [])]})} 
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
