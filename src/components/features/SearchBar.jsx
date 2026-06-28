"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function SearchBar({ onSearch, isLoading = false, className = "" }) {
  const [location, setLocation] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [guests, setGuests] = React.useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (location && startDate && endDate && guests) {
      onSearch({ location, startDate, endDate, guests: parseInt(guests) })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSearch}
      className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            icon={MapPin}
            placeholder="Où allez-vous ?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="date"
            icon={Calendar}
            placeholder="Arrivée"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="date"
            icon={Calendar}
            placeholder="Départ"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="number"
            icon={Users}
            min="1"
            max="8"
            placeholder="Nombre de personnes"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="flex-1 md:flex-none"
        >
          <Search className="mr-2 h-5 w-5" />
          Rechercher
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="hidden md:flex"
        >
          Filtres avancés
        </Button>
      </div>
    </motion.form>
  )
}
