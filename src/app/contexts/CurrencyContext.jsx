"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext(null)

// Taux de conversion statiques (base XAF)
const RATES = {
  XAF: 1,
  EUR: 0.00152,
  USD: 0.00165,
}

const SYMBOLS = {
  XAF: 'FCFA',
  EUR: '€',
  USD: '$',
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('XAF')

  useEffect(() => {
    const saved = localStorage.getItem('hrs_currency')
    if (saved && RATES[saved]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrency(saved)
    }
  }, [])

  const changeCurrency = (newCurrency) => {
    if (RATES[newCurrency]) {
      setCurrency(newCurrency)
      localStorage.setItem('hrs_currency', newCurrency)
    }
  }

  /**
   * Formate un montant en XAF vers la devise sélectionnée
   * @param {number} amountXAF - Montant en Francs CFA
   * @returns {string} - Montant formaté avec symbole
   */
  const formatPrice = (amountXAF) => {
    if (amountXAF == null || isNaN(amountXAF)) return '—'
    const converted = amountXAF * RATES[currency]
    const symbol = SYMBOLS[currency]

    if (currency === 'XAF') {
      return `${Math.round(converted).toLocaleString('fr-FR')} ${symbol}`
    }
    // Pour EUR et USD, on arrondit à 2 décimales
    return `${converted.toFixed(2).replace('.', ',')} ${symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, SYMBOLS, RATES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
