"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Smartphone } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export function CheckoutModal({ isOpen, onClose, amount, currency }) {
  const [method, setMethod] = React.useState('om') // 'om', 'momo', 'card'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paiement Sécurisé">
      <div className="space-y-6">
        <div className="bg-charcoal-50 p-4 rounded-lg text-center">
          <p className="text-sm text-charcoal-500 mb-1">Montant à régler</p>
          <p className="text-3xl font-bold text-charcoal-900">{amount?.toLocaleString()} {currency}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-charcoal-900 mb-3">Moyen de paiement</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMethod('om')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${method === 'om' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-charcoal-200 hover:bg-charcoal-50'}`}
            >
              <Smartphone className="h-6 w-6" />
              <span className="text-xs font-semibold">Orange M.</span>
            </button>
            <button
              onClick={() => setMethod('momo')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${method === 'momo' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-charcoal-200 hover:bg-charcoal-50'}`}
            >
              <Smartphone className="h-6 w-6" />
              <span className="text-xs font-semibold">MTN MoMo</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700' : 'border-charcoal-200 hover:bg-charcoal-50'}`}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs font-semibold">Carte</span>
            </button>
          </div>
        </div>

        {/* Formulaire dynamique selon la méthode — AnimatePresence requis pour les animations exit */}
        <AnimatePresence mode="wait">
          {method === 'card' ? (
            <AnimateHeight key="card">
              <div className="space-y-3">
                <Input placeholder="Numéro de carte" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/AA" />
                  <Input placeholder="CVC" type="password" />
                </div>
              </div>
            </AnimateHeight>
          ) : (
            <AnimateHeight key="mobile">
              <div className="space-y-3">
                <Input placeholder={`Numéro ${method === 'om' ? 'Orange' : 'MTN'}`} type="tel" />
                <p className="text-xs text-charcoal-500">Un code USSD vous sera envoyé pour confirmer la transaction.</p>
              </div>
            </AnimateHeight>
          )}
        </AnimatePresence>

        <Button className="w-full h-12 text-lg">Payer maintenant</Button>
      </div>
    </Modal>
  )
}

function AnimateHeight({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}
