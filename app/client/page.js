"use client"
import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, MapPin, Star, Filter } from "lucide-react"
import { listings, services } from "@/lib/mockData"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"

export default function ClientDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with search */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-charcoal-900 mb-6">Où souhaitez-vous aller ?</h1>
        
        <div className="bg-white p-4 rounded-2xl shadow-md border border-charcoal-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
            <Input className="pl-10 h-12" placeholder="Destination (ex: Kribi, Douala)" />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
            <Input className="pl-10 h-12" placeholder="Que recherchez-vous ?" />
          </div>
          <Button size="lg" className="h-12 w-full md:w-auto px-8 rounded-xl">
            Rechercher
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logements">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="logements">Logements</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Filter className="h-4 w-4" /> Filtres
          </Button>
        </div>

        <TabsContent value="logements">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/listings/${listing.id}`}>
                  <Card className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative h-60 overflow-hidden rounded-t-xl">
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{listing.rating}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-charcoal-900 truncate pr-4">{listing.title}</h3>
                      </div>
                      <p className="text-charcoal-500 text-sm mb-2">{listing.location}</p>
                      <p className="text-terracotta-600 font-bold">
                        {listing.price.toLocaleString()} {listing.currency} <span className="text-charcoal-400 text-sm font-normal">/ nuit</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/services/${service.id}`}>
                  <Card className="flex flex-col h-full border-charcoal-100 hover:border-terracotta-200 transition-colors cursor-pointer group">
                    <div className="h-48 overflow-hidden rounded-t-xl">
                      <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-1 rounded-full uppercase tracking-wider">
                            {service.category}
                          </span>
                          <div className="flex items-center text-sm font-semibold">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
                            {service.rating}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg text-charcoal-900 mb-2">{service.title}</h3>
                        <p className="text-sm text-charcoal-600 line-clamp-2 mb-4">{service.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-charcoal-50 pt-4 mt-auto">
                        <p className="font-bold text-charcoal-900">
                          {service.price.toLocaleString()} {service.currency} <span className="text-charcoal-400 text-sm font-normal">/ {service.unit}</span>
                        </p>
                        <Button size="sm" variant="outline" className="rounded-full">Réserver</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
