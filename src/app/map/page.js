"use client"
import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api"
import { listings } from "@/lib/mockData"
import Link from "next/link"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const containerStyle = {
  width: '100%',
  height: '70vh'
}

// Center around Douala/Kribi by default since the mock data is there
const center = {
  lat: 4.0511,
  lng: 9.7679
}

export default function MapPage() {
  // Use environment variable for the Google Maps API Key
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places']
  })

  const [map, setMap] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [searchCity, setSearchCity] = useState("")

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance)
  }

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setSearchCity(place.formatted_address || place.name)
        map?.panTo({ lat, lng })
        map?.setZoom(12)
      }
    }
  }

  const onLoad = useCallback(function callback(map) {
    // If we want to fit bounds to all markers:
    // const bounds = new window.google.maps.LatLngBounds();
    // listings.forEach(listing => {
    //   if(listing.lat && listing.lng) bounds.extend({ lat: listing.lat, lng: listing.lng });
    // });
    // map.fitBounds(bounds);
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-charcoal-900 dark:text-white mb-2">Carte Interactive</h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Découvrez les logements et services à proximité
            </p>
          </div>
          <Link href="/client/search">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </motion.div>

        <div className="bg-white dark:bg-charcoal-900 p-2 rounded-2xl shadow-xl overflow-hidden border border-charcoal-200 dark:border-charcoal-800">
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div className="bg-yellow-100 text-yellow-800 p-4 mb-2 rounded-lg text-sm flex items-center justify-center">
              Attention: La clé d'API Google Maps n'est pas définie dans .env.local. La carte affichera une erreur "For development purposes only".
            </div>
          )}

          {loadError ? (
            <div className="h-[70vh] flex items-center justify-center bg-charcoal-100 dark:bg-charcoal-800 rounded-xl">
              <p className="text-red-500 font-semibold">Erreur de chargement de la carte</p>
            </div>
          ) : isLoaded ? (
            <div className="relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-charcoal-400" />
                    </div>
                    <Input 
                      type="text"
                      placeholder="Chercher une ville (ex: Yaoundé, Douala)..."
                      className="pl-10 w-full bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-sm border-charcoal-200 dark:border-charcoal-700 shadow-lg rounded-full h-12 text-base"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                    />
                  </div>
                </Autocomplete>
              </div>

              <GoogleMap
                mapContainerStyle={containerStyle}
              center={center}
              zoom={7}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                styles: [
                  // Subtle styling for modern look
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
              }}
            >
              {listings.map((listing) => {
                // Generate a random lat/lng around center if none provided in mock data for demo purposes
                const lat = listing.lat || center.lat + (Math.random() - 0.5) * 2;
                const lng = listing.lng || center.lng + (Math.random() - 0.5) * 2;

                return (
                  <Marker
                    key={listing.id}
                    position={{ lat, lng }}
                    onClick={() => setSelectedListing({ ...listing, lat, lng })}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="32" height="32" viewBox="0 0 24 24" fill="#d65846" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
                      scaledSize: new window.google.maps.Size(40, 40)
                    }}
                  />
                )
              })}

              {selectedListing && (
                <InfoWindow
                  position={{ lat: selectedListing.lat, lng: selectedListing.lng }}
                  onCloseClick={() => setSelectedListing(null)}
                >
                  <div className="p-2 max-w-[200px] text-charcoal-900">
                    <img 
                      src={selectedListing.image} 
                      alt={selectedListing.title} 
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-bold text-sm truncate">{selectedListing.title}</h3>
                    <p className="text-xs text-charcoal-600 truncate flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {selectedListing.location}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm font-bold text-terracotta-600">{selectedListing.price}€/nuit</p>
                      <Link href={`/listings/${selectedListing.id}`}>
                        <Button size="sm" className="h-7 text-xs px-2">Voir</Button>
                      </Link>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
            </div>
          ) : (
            <div className="h-[70vh] flex items-center justify-center bg-charcoal-100 dark:bg-charcoal-800 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
