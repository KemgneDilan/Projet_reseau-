"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api"
import { MapPin, Save, ArrowLeft, Upload, Trash, Check, Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem'
}

const defaultCenter = {
  lat: 3.8480, // Yaoundé
  lng: 11.5021
}

const defaultAdvantages = [
  "Climatisation",
  "Wifi Fibre",
  "Piscine privée",
  "Parking sécurisé",
  "Groupe électrogène",
  "Forage d'eau automatique",
  "Gardiennage 24h/24",
  "Cuisine entièrement équipée",
  "Eau chaude sanitaire"
]

export default function NewListingPage() {
  const router = useRouter()
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places']
  })

  const [activeFormTab, setActiveFormTab] = useState("details") // details, images, location

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    surfaceArea: "",
    location: "",
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    images: [],
    video: null,
    numberOfRooms: "",
    amenities: ["Climatisation", "Wifi Fibre", "Gardiennage 24h/24"] // Checked by default
  })

  // Nouvelle logique: type de création - 'house' (maison composée de chambres) ou 'room' (chambre seule)
  const [listingKind, setListingKind] = useState('house')
  const [roomsList, setRoomsList] = useState([]) // { title, surfaceArea }
  const [newRoomTitle, setNewRoomTitle] = useState('')
  const [newRoomSurface, setNewRoomSurface] = useState('')

  const [autocomplete, setAutocomplete] = useState(null)
  const [map, setMap] = useState(null)
  const [imageError, setImageError] = useState("")

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setFormData(prev => ({
          ...prev,
          location: place.formatted_address || place.name,
          lat,
          lng
        }))
        map?.panTo({ lat, lng })
        map?.setZoom(14)
      }
    }
  }

  const handleMapClick = (e) => {
    setFormData(prev => ({
      ...prev,
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }))
  }

  const handleAmenityChange = (amenity) => {
    setFormData(prev => {
      const current = prev.amenities
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) }
      } else {
        return { ...prev, amenities: [...current, amenity] }
      }
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageError("")
    const currentCount = formData.images.length
    if (currentCount + files.length > 5) {
      setImageError("Vous ne pouvez pas ajouter plus de 5 images au total.")
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => {
          if (prev.images.length >= 5) return prev
          return { ...prev, images: [...prev.images, reader.result] }
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }))
    setImageError("")
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, video: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate images count
    if (formData.images.length !== 5) {
      setImageError("Veuillez ajouter exactement 5 images de votre logement.")
      setActiveFormTab("images")
      return
    }

    // Save to local storage for demo purposes
    const hostUser = JSON.parse(localStorage.getItem('hrs_user') || '{}')
    const hostId = hostUser.id || 'u2'

    // If creating a house, ensure at least one room and house configuration is complete
    if (listingKind === 'house') {
      if (roomsList.length === 0) {
        alert('Une maison doit contenir au moins une chambre. Ajoutez une chambre avant de publier.')
        setActiveFormTab('details')
        return
      }
      if (!formData.surfaceArea || Number(formData.surfaceArea) < 1) {
        alert('Veuillez indiquer la surface totale de la maison en mètres carrés.')
        setActiveFormTab('details')
        return
      }
      const totalRoomsSurface = roomsList.reduce((sum, room) => sum + Number(room.surfaceArea || 0), 0)
      if (Number(formData.surfaceArea) < totalRoomsSurface) {
        alert('La surface totale de la maison doit couvrir la somme des surfaces des chambres.')
        setActiveFormTab('details')
        return
      }
      if (Number(formData.price) > 15000) {
        alert('Le prix par nuit pour une maison complète ne peut pas dépasser 15000 FCFA.')
        setActiveFormTab('details')
        return
      }
    }

    if (listingKind === 'room') {
      if (!formData.surfaceArea || Number(formData.surfaceArea) < 1) {
        alert('Veuillez indiquer la surface de la chambre en mètres carrés.')
        setActiveFormTab('details')
        return
      }
      if (Number(formData.price) > 3000) {
        alert('Le prix par nuit pour une chambre ne peut pas dépasser 3000 FCFA.')
        setActiveFormTab('details')
        return
      }
    }

    const timestamp = Date.now()

    // If house => create house and rooms entries in localStorage
    if (listingKind === 'house') {
      const houseId = `h_${timestamp}`
      const createdRooms = roomsList.map((r, idx) => ({
        id: `r_${timestamp}_${idx}`,
        houseId,
        hostId,
        title: r.title,
        description: r.description || formData.description,
        price: 0, // La chambre n'est plus facturée individuellement
        surfaceArea: Number(r.surfaceArea),
        currency: 'XAF',
        status: 'active',
        images: r.images && r.images.length > 0 ? r.images : (formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80']),
        amenities: formData.amenities
      }))

      const newHouse = {
        id: houseId,
        hostId,
        title: formData.title || `Maison ${timestamp}`,
        description: formData.description,
        city: formData.city || 'Yaoundé',
        location: formData.location || 'Inconnue',
        lat: formData.lat,
        lng: formData.lng,
        currency: 'XAF',
        images: formData.images,
        video: formData.video,
        amenities: formData.amenities,
        roomsIds: createdRooms.map(r => r.id),
        numberOfRooms: Number(formData.numberOfRooms) || createdRooms.length,
        surfaceArea: Number(formData.surfaceArea) || 0,
        price: parseFloat(formData.price || 0),
        status: 'active'
      }

      // Persist houses for this host and globally
      const housesKey = `hrs_houses_${hostId}`
      const prevHouses = JSON.parse(localStorage.getItem(housesKey) || '[]')
      localStorage.setItem(housesKey, JSON.stringify([newHouse, ...prevHouses]))
      const globalHouses = JSON.parse(localStorage.getItem('hrs_houses') || '[]')
      localStorage.setItem('hrs_houses', JSON.stringify([newHouse, ...globalHouses]))

      // Persist rooms for this host and globally
      const roomsKey = `hrs_rooms_${hostId}`
      const prevRooms = JSON.parse(localStorage.getItem(roomsKey) || '[]')
      localStorage.setItem(roomsKey, JSON.stringify([...createdRooms, ...prevRooms]))
      const globalRooms = JSON.parse(localStorage.getItem('hrs_rooms') || '[]')
      localStorage.setItem('hrs_rooms', JSON.stringify([...createdRooms, ...globalRooms]))

      // Also create a legacy listing entry for the house overview
      const newListing = {
        id: `l_house_${houseId}`,
        hostId,
        title: newHouse.title,
        description: newHouse.description,
        price: parseFloat(formData.price || 0),
        currency: 'XAF',
        rating: 5.0,
        reviewsCount: 0,
        location: newHouse.location,
        city: newHouse.city,
        lat: newHouse.lat,
        lng: newHouse.lng,
        type: 'House',
        status: 'active',
        images: newHouse.images,
        video: newHouse.video,
        amenities: newHouse.amenities,
        roomsCount: createdRooms.length,
        numberOfRooms: newHouse.numberOfRooms,
        surfaceArea: newHouse.surfaceArea
      }

      const localKey = `hrs_listings_${hostId}`
      const previousListings = JSON.parse(localStorage.getItem(localKey) || '[]')
      const updatedListings = [newListing, ...previousListings]
      localStorage.setItem(localKey, JSON.stringify(updatedListings))
      const globalListings = JSON.parse(localStorage.getItem('hrs_listings') || '[]')
      localStorage.setItem('hrs_listings', JSON.stringify([newListing, ...globalListings]))

      alert('Maison et chambres enregistrées avec succès !')
      router.push('/host')
      return
    }

    // Else creating a single room listing
    const newListing = {
      id: `l_${timestamp}`,
      hostId,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      surfaceArea: Number(formData.surfaceArea) || 0,
      currency: "XAF",
      rating: 5.0,
      reviewsCount: 0,
      location: formData.location || "Melen, Yaoundé",
      city: "Yaoundé",
      lat: formData.lat,
      lng: formData.lng,
      type: "Room",
      status: "active",
      images: formData.images,
      video: formData.video,
      amenities: formData.amenities
    }

    // Persist listing for this host and globally
    const localKey = `hrs_listings_${hostId}`
    const previousListings = JSON.parse(localStorage.getItem(localKey) || '[]')
    const updatedListings = [newListing, ...previousListings]
    localStorage.setItem(localKey, JSON.stringify(updatedListings))
    const globalListings = JSON.parse(localStorage.getItem('hrs_listings') || '[]')
    localStorage.setItem('hrs_listings', JSON.stringify([newListing, ...globalListings]))

    alert("Chambre enregistrée avec succès !")
    router.push('/host')
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Link href="/host" className="inline-flex items-center text-charcoal-500 hover:text-terracotta-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour au tableau de bord
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-charcoal-900 rounded-2xl shadow-xl border border-charcoal-200 dark:border-charcoal-800 overflow-hidden"
      >
        {/* Banner Header */}
        <div className="p-6 border-b border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50/50 dark:bg-charcoal-950/20">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-terracotta-500" />
            Ajouter une nouvelle annonce
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400 mt-1">
            Remplissez les informations et publiez votre annonce en quelques étapes simples.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-charcoal-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
          {[
            { id: "details", label: "1. Caractéristiques & Avantages" },
            { id: "images", label: "2. Galerie Photos" },
            { id: "location", label: "3. Localisation Géographique" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFormTab(tab.id)}
              className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all ${
                activeFormTab === tab.id
                  ? "border-terracotta-500 text-terracotta-600 dark:text-terracotta-400 bg-terracotta-50/10"
                  : "border-transparent text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-50/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* TAB 1: DETAILS & AMENITIES */}
          {activeFormTab === "details" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-charcoal-900 dark:text-white border-b border-charcoal-100 dark:border-charcoal-800 pb-2">
                  Informations générales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Choix: Maison ou Chambre au tout début */}
                  <div className="md:col-span-2 bg-charcoal-50 dark:bg-charcoal-800/50 p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-700">
                    <label className="text-sm font-semibold text-charcoal-900 dark:text-white">Quel type d&apos;annonce souhaitez-vous créer ?</label>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setListingKind('house')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${listingKind === 'house' ? 'bg-terracotta-50/20 border-terracotta-500 text-terracotta-700 dark:text-terracotta-400' : 'bg-white dark:bg-charcoal-900 border-charcoal-200 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-300 hover:border-terracotta-300'}`}
                      >
                        Maison (plusieurs pièces/chambres)
                      </button>
                      <button
                        type="button"
                        onClick={() => setListingKind('room')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${listingKind === 'room' ? 'bg-terracotta-50/20 border-terracotta-500 text-terracotta-700 dark:text-terracotta-400' : 'bg-white dark:bg-charcoal-900 border-charcoal-200 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-300 hover:border-terracotta-300'}`}
                      >
                        Chambre individuelle
                      </button>
                    </div>
                    {listingKind === 'house' && (
                      <p className="text-xs text-charcoal-500 mt-2">
                        Le tarif global s&apos;applique à l&apos;ensemble de la maison. Vous décrirez ensuite les pièces qui la composent.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Titre de l&apos;annonce</label>
                    <Input 
                      required
                      placeholder="Ex: Superbe appartement haut standing au quartier Bastos" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="bg-white dark:bg-charcoal-800"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Description détaillée</label>
                    <textarea 
                      required
                      placeholder="Décrivez précisément votre logement, le nombre de chambres, la proximité avec les axes principaux..." 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                      {listingKind === 'house' ? 'Prix global par nuit (max 15000 FCFA)' : 'Prix par nuit (chambre, max 3000 FCFA)'}
                    </label>
                    <Input 
                      type="number"
                      required
                      placeholder={listingKind === 'house' ? 'Ex: 15000' : 'Ex: 3000'}
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="bg-white dark:bg-charcoal-800 font-semibold text-terracotta-600"
                    />
                  </div>
                  {listingKind === 'room' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Surface de la chambre (m²)</label>
                      <Input
                        type="number"
                        required
                        min={1}
                        placeholder="Ex: 16"
                        value={formData.surfaceArea}
                        onChange={e => setFormData({...formData, surfaceArea: e.target.value})}
                        className="bg-white dark:bg-charcoal-800"
                      />
                    </div>
                  )}
                  {listingKind === 'house' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Surface totale (m²)</label>
                        <Input
                          type="number"
                          required
                          min={1}
                          placeholder="Ex: 120"
                          value={formData.surfaceArea}
                          onChange={e => setFormData({...formData, surfaceArea: e.target.value})}
                          className="bg-white dark:bg-charcoal-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Nombre de pièces/chambres</label>
                        <Input
                          type="number"
                          required
                          min={1}
                          placeholder="Ex: 5"
                          value={formData.numberOfRooms}
                          onChange={e => setFormData({...formData, numberOfRooms: e.target.value})}
                          className="bg-white dark:bg-charcoal-800"
                        />
                      </div>
                    </>
                  )}

                  {/* Editor des chambres si maison */}
                  {listingKind === 'house' && (
                    <div className="md:col-span-2 pt-6 border-t border-charcoal-100 dark:border-charcoal-800">
                      <div className="mb-4">
                        <h3 className="text-md font-bold text-charcoal-900 dark:text-white">Chambres constituant la maison</h3>
                        <p className="text-sm text-charcoal-500">Ajoutez les chambres (titre et surface). Le prix est déjà couvert par le tarif global.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-3 items-end bg-charcoal-50 dark:bg-charcoal-800/30 p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-800">
                        <div>
                          <label className="text-xs font-medium text-charcoal-700 dark:text-charcoal-300">Titre de la chambre</label>
                          <Input value={newRoomTitle} onChange={e => setNewRoomTitle(e.target.value)} placeholder="Ex: Chambre Master" className="mt-1 bg-white dark:bg-charcoal-900" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-charcoal-700 dark:text-charcoal-300">Surface (m²)</label>
                          <Input type="number" value={newRoomSurface} onChange={e => setNewRoomSurface(e.target.value)} placeholder="Ex: 16" className="mt-1 bg-white dark:bg-charcoal-900" />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            onClick={() => {
                              if (!newRoomTitle || !newRoomSurface) {
                                alert('Veuillez renseigner le titre et la surface de la chambre.')
                                return
                              }
                              if (Number(newRoomSurface) <= 0) {
                                alert('La surface de la chambre doit être supérieure à 0 m².')
                                return
                              }
                              setRoomsList(prev => [...prev, { title: newRoomTitle, surfaceArea: newRoomSurface }])
                              setNewRoomTitle('')
                              setNewRoomSurface('')
                            }} 
                            className="bg-terracotta-500 text-white hover:bg-terracotta-600"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Ajouter
                          </Button>
                        </div>
                      </div>

                      {roomsList.length > 0 && (
                        <div className="mt-4 grid gap-2">
                          {roomsList.map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-charcoal-900 dark:text-white">{r.title}</div>
                                  <div className="text-sm text-charcoal-500">
                                    Surface: {r.surfaceArea} m²
                                  </div>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost"
                                size="icon"
                                onClick={() => setRoomsList(prev => prev.filter((_, i) => i !== idx))} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes for Default Advantages */}
              <div className="space-y-4 pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
                <div>
                  <h2 className="text-lg font-bold text-charcoal-900 dark:text-white mb-1">
                    Équipements & Avantages inclus
                  </h2>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                    Cochez tous les avantages et équipements associés par défaut à votre logement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {defaultAdvantages.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity)
                    return (
                      <label
                        key={amenity}
                        onClick={() => handleAmenityChange(amenity)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-terracotta-50/20 border-terracotta-500 text-terracotta-700 dark:text-terracotta-400"
                            : "bg-white dark:bg-charcoal-800 border-charcoal-200 dark:border-charcoal-700 text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-terracotta-500 border-terracotta-500 text-white"
                            : "border-charcoal-300 dark:border-charcoal-600 bg-transparent"
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-3" />}
                        </div>
                        <span className="text-sm font-medium">{amenity}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: IMAGE UPLOAD */}
          {activeFormTab === "images" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">
                  Galerie Photos
                </h2>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Importez des photos réalistes de votre logement. Chargez entre <strong className="text-terracotta-500">1 et 5 photos</strong> au maximum.
                </p>
              </div>

              {imageError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>{imageError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              {formData.images.length < 5 && (
                <div className="border-2 border-dashed border-charcoal-300 dark:border-charcoal-700 rounded-xl p-8 text-center bg-charcoal-50/50 dark:bg-charcoal-800/10 hover:border-terracotta-500 dark:hover:border-terracotta-500 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="h-10 w-10 text-charcoal-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">
                    Cliquez pour ajouter ou glissez-déposez des photos
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    PNG, JPG ou WEBP (Max. 5 images, {formData.images.length}/5 chargées)
                  </p>
                </div>
              )}

              {/* Previews Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-4">
                  {formData.images.map((imgSrc, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-charcoal-200 dark:border-charcoal-800 shadow-sm"
                    >
                      <Image
                        src={imgSrc}
                        alt={`Aperçu ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform hover:scale-110 shadow-lg"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-white rounded font-medium">
                        Photo {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-charcoal-200 dark:border-charcoal-800">
                <h3 className="text-md font-bold text-charcoal-900 dark:text-white mb-2">
                  Vidéo de présentation (Optionnel)
                </h3>
                {!formData.video ? (
                  <div className="border-2 border-dashed border-charcoal-300 dark:border-charcoal-700 rounded-xl p-6 text-center bg-charcoal-50/50 dark:bg-charcoal-800/10 hover:border-terracotta-500 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">
                      Ajouter une vidéo
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-charcoal-200 dark:border-charcoal-800 bg-black h-48 w-full max-w-sm">
                    <video src={formData.video} controls className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: LOCATION */}
          {activeFormTab === "location" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">
                  Localisation Géologique
                </h2>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Entrez l&apos;adresse de votre logement puis déplacez le marqueur sur la carte pour plus de précision.
                </p>
              </div>

              {isLoaded ? (
                <div className="space-y-4">
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <Input 
                      type="text"
                      placeholder="Ex: Melen, Yaoundé, Cameroun"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="bg-white dark:bg-charcoal-800"
                    />
                  </Autocomplete>

                  <div className="border border-charcoal-200 dark:border-charcoal-700 rounded-xl overflow-hidden relative shadow-sm">
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={{ lat: formData.lat, lng: formData.lng }}
                      zoom={13}
                      onClick={handleMapClick}
                      onLoad={map => setMap(map)}
                    >
                      <Marker position={{ lat: formData.lat, lng: formData.lng }} />
                    </GoogleMap>
                    
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-sm p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-700 text-xs text-charcoal-600 dark:text-charcoal-300 flex justify-between">
                      <span>Latitude: {formData.lat.toFixed(6)}</span>
                      <span>Longitude: {formData.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] bg-charcoal-100 dark:bg-charcoal-800 animate-pulse rounded-xl flex items-center justify-center text-charcoal-500">
                  Chargement de la carte et des services de localisation...
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-charcoal-200 dark:border-charcoal-800 flex justify-between items-center">
            <div>
              {activeFormTab !== "details" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (activeFormTab === "location") setActiveFormTab("images")
                    else if (activeFormTab === "images") setActiveFormTab("details")
                  }}
                >
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {activeFormTab !== "location" ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === "details") setActiveFormTab("images")
                    else if (activeFormTab === "images") {
                      if (formData.images.length !== 5) {
                        setImageError("Veuillez charger exactement 5 images avant de continuer.")
                      } else {
                        setActiveFormTab("location")
                      }
                    }
                  }}
                >
                  Suivant
                </Button>
              ) : (
                <Button type="submit">
                  <Save className="h-5 w-5 mr-2" /> Enregistrer l&apos;annonce
                </Button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
