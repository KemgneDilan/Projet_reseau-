"use client"
import * as React from "react"
import { MapPin } from "lucide-react"

export function MapPreview({ locations }) {
  // Ceci est un composant mock visuel pour la carte.
  // Dans une vraie application, on utiliserait google-map-react ou mapbox-gl.
  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-[#e5e3df] border border-charcoal-200">
      {/* Simulation d'une image de carte en fond */}
      <div 
        className="absolute inset-0 opacity-50 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80")' }}
      />
      
      {/* Simulation des marqueurs */}
      <div className="absolute inset-0 p-8">
        {locations?.map((loc, index) => (
          <div 
            key={index}
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full hover:z-10 cursor-pointer group"
            style={{
              // Position aléatoire pour le mock (normalement basé sur lat/lng)
              left: `${20 + (index * 30) % 60}%`,
              top: `${30 + (index * 25) % 50}%`
            }}
          >
            <div className="bg-white px-3 py-1 rounded-full shadow-md text-sm font-bold text-charcoal-900 border border-charcoal-100 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {loc.price} {loc.currency}
            </div>
            <MapPin className="h-8 w-8 text-terracotta-500 fill-white" />
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-md shadow-sm text-xs text-charcoal-500 font-semibold border border-charcoal-100">
        Google Maps API (Mock)
      </div>
    </div>
  )
}
