"use client"
import * as React from "react"
import { motion } from "framer-motion"
import { CreditCard, Lock, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export function PaymentForm({ totalAmount, onPaymentSuccess, isLoading = false }) {
  const [step, setStep] = React.useState("method") // method, details, confirmation
  const [selectedMethod, setSelectedMethod] = React.useState(null)
  const [cardData, setCardData] = React.useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    fullName: "",
  })
  const [error, setError] = React.useState(null)

  const paymentMethods = [
    { id: "card", label: "Carte bancaire", icon: "💳" },
    { id: "orange", label: "Orange Money", icon: "🟠" },
    { id: "mtn", label: "MTN Mobile Money", icon: "🔴" },
  ]

  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId)
    setStep("details")
    setError(null)
  }

  const handleCardChange = (field, value) => {
    // Formatage simplifié
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateCardData = () => {
    if (!cardData.cardNumber || cardData.cardNumber.length < 13) {
      setError("Numéro de carte invalide")
      return false
    }
    if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
      setError("Date d'expiration invalide")
      return false
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      setError("CVV invalide")
      return false
    }
    if (!cardData.fullName) {
      setError("Nom requis")
      return false
    }
    return true
  }

  const handlePayment = async () => {
    if (!validateCardData()) return

    // Simuler le paiement
    try {
      setError(null)
      // Appel API à faire
      setTimeout(() => {
        onPaymentSuccess?.({
          method: selectedMethod,
          amount: totalAmount,
        })
        setStep("confirmation")
      }, 1500)
    } catch (err) {
      setError("Erreur de paiement. Veuillez réessayer.")
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-charcoal-200"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: "method", label: "Méthode" },
            { step: "details", label: "Détails" },
            { step: "confirmation", label: "Confirmation" },
          ].map((s, idx, arr) => (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step === s.step
                      ? "bg-terracotta-500 text-white"
                      : arr.indexOf(arr.find((x) => x.step === step)) >
                        arr.indexOf(s)
                      ? "bg-green-500 text-white"
                      : "bg-charcoal-200 text-charcoal-600"
                  }`}
                >
                  {arr.indexOf(arr.find((x) => x.step === step)) >
                  arr.indexOf(s) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:block ${
                    step === s.step ? "text-terracotta-600" : "text-charcoal-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    arr.indexOf(arr.find((x) => x.step === step)) >
                    arr.indexOf(s)
                      ? "bg-green-500"
                      : "bg-charcoal-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step: Select Payment Method */}
        {step === "method" && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-4">
                Choisissez votre méthode de paiement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedMethod === method.id
                        ? "border-terracotta-500 bg-terracotta-50"
                        : "border-charcoal-200 bg-white hover:border-terracotta-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <p className="font-semibold text-charcoal-900 text-sm">
                      {method.label}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step: Payment Details */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-charcoal-900">
              {selectedMethod === "card"
                ? "Détails de la carte bancaire"
                : "Détails du portefeuille mobile"}
            </h3>

            {selectedMethod === "card" && (
              <div className="space-y-4">
                <Input
                  label="Titulaire de la carte"
                  placeholder="Jean Dupont"
                  value={cardData.fullName}
                  onChange={(e) =>
                    handleCardChange("fullName", e.target.value)
                  }
                />

                <Input
                  label="Numéro de carte"
                  placeholder="4111 1111 1111 1111"
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    handleCardChange(
                      "cardNumber",
                      e.target.value.replace(/\s/g, "")
                    )
                  }
                  maxLength="19"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date d'expiration"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) =>
                      handleCardChange("expiryDate", e.target.value)
                    }
                    maxLength="5"
                  />

                  <Input
                    label="CVV"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) =>
                      handleCardChange("cvv", e.target.value)
                    }
                    maxLength="4"
                    type="password"
                  />
                </div>
              </div>
            )}

            {selectedMethod === "orange" && (
              <Input
                label="Numéro de téléphone"
                placeholder="+237 6XX XXX XXX"
                type="tel"
              />
            )}

            {selectedMethod === "mtn" && (
              <Input
                label="Numéro de téléphone"
                placeholder="+237 6XX XXX XXX"
                type="tel"
              />
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-charcoal-50 rounded-lg p-4 flex items-start gap-2">
              <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-charcoal-700">
                Votre paiement est sécurisé et chiffré avec SSL.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step: Confirmation */}
        {step === "confirmation" && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-charcoal-900 mb-2">
                Paiement confirmé !
              </h3>
              <p className="text-charcoal-600">
                Votre réservation a été validée avec succès.
              </p>
            </div>

            <div className="bg-charcoal-50 rounded-lg p-4">
              <p className="text-sm text-charcoal-600 mb-1">Montant payé</p>
              <p className="text-3xl font-bold text-charcoal-900">
                {totalAmount}€
              </p>
            </div>

            <p className="text-sm text-charcoal-600">
              Un email de confirmation a été envoyé à votre adresse.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      {step !== "confirmation" && (
        <div className="flex gap-4">
          {step === "details" && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("method")}
            >
              Retour
            </Button>
          )}
          <Button
            onClick={
              step === "method"
                ? () => setStep("details")
                : handlePayment
            }
            className="flex-1"
            isLoading={isLoading}
            disabled={
              step === "method"
                ? !selectedMethod
                : false
            }
          >
            {step === "method" ? "Continuer" : `Payer ${totalAmount}€`}
          </Button>
        </div>
      )}
    </div>
  )
}
