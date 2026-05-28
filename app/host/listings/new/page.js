"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api"
import { MapPin, Save, ArrowLeft, Upload, Trash, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
    location: "",
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    images: [],
    amenities: ["Climatisation", "Wifi Fibre", "Gardiennage 24h/24"] // Checked by default
  })

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

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate images count
    if (formData.images.length < 1) {
      setImageError("Veuillez ajouter au moins 1 image de votre logement.")
      setActiveFormTab("images")
      return
    }
    if (formData.images.length > 5) {
      setImageError("Vous ne pouvez pas ajouter plus de 5 images.")
      setActiveFormTab("images")
      return
    }

    // Save to local storage for demo purposes
    const hostUser = JSON.parse(localStorage.getItem('hrs_user') || '{}')
    const hostId = hostUser.id || 'u2'

    const newListing = {
      id: `l_${Date.now()}`,
      hostId,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      currency: "XAF", // Default is XAF
      rating: 5.0,
      reviewsCount: 0,
      location: formData.location || "Melen, Yaoundé",
      city: "Yaoundé",
      lat: formData.lat,
      lng: formData.lng,
      type: "Logement",
      status: "active",
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80'],
      amenities: formData.amenities
    }

    // Retrieve previous listings
    const localKey = `hrs_listings_${hostId}`
    const previousListings = JSON.parse(localStorage.getItem(localKey) || '[]')
    const updatedListings = [newListing, ...previousListings]
    localStorage.setItem(localKey, JSON.stringify(updatedListings))

    alert("Annonce enregistrée avec succès en FCFA !")
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Titre de l'annonce</label>
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
                    <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Prix par nuit (FCFA)</label>
                    <Input 
                      type="number"
                      required
                      placeholder="Ex: 50000" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="bg-white dark:bg-charcoal-800 font-semibold"
                    />
                  </div>
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
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
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
                      <img
                        src={imgSrc}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                  Entrez l'adresse de votre logement puis déplacez le marqueur sur la carte pour plus de précision.
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
                      if (formData.images.length < 1) {
                        setImageError("Veuillez charger au moins une image avant de continuer.")
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
                  <Save className="h-5 w-5 mr-2" /> Enregistrer l'annonce
                </Button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
