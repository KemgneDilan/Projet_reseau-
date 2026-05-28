'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { addReview } from '@/lib/ratingUtils'
import { useAuth } from '@/app/contexts/AuthContext'

/**
 * RatingModal Component
 * Allows clients to rate and review accommodations or services
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback to close modal
 * @param {function} onSubmit - Callback when rating is submitted (receives {rating, comment})
 * @param {string} title - Title of item being rated
 * @param {string} type - Type: 'accommodation' or 'service'
 * @param {object} item - The item being rated (for context)
 */
export default function RatingModal({ isOpen, onClose, onSubmit, title, type = 'accommodation', item }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Veuillez sélectionner une note')
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare review data
      const targetType = type === 'accommodation' ? 'listing' : 'service'
      const payload = {
        targetType,
        targetId: item?.id,
        rating,
        comment: comment.trim(),
        authorId: user?.id || null,
        authorName: user?.username || null,
        date: new Date().toISOString(),
      }

      const saved = addReview(payload)

      if (onSubmit) {
        await onSubmit(saved)
      }

      setSubmitted(true)
      
      // Close after delay
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      alert('Erreur lors de l\'envoi de votre évaluation')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setComment('')
    setSubmitted(false)
    onClose()
  }

  const typeLabel = type === 'accommodation' ? 'logement' : 'service'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-terracotta-500 to-orange-500 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Évaluez ce {typeLabel}</h2>
            <p className="text-sm text-white/80 mt-1">{title}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">Merci !</h3>
                <p className="text-charcoal-600">
                  Votre évaluation nous aide à améliorer nos services
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-charcoal-900 mb-3">
                    Votre évaluation
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all duration-200 focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 transition-all ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-500 text-yellow-500 scale-110'
                              : 'text-charcoal-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-charcoal-600 mt-2">
                      Note: {rating}/5 étoiles
                    </p>
                  )}
                </div>

                {/* Rating Labels */}
                <div className="mb-6 text-center">
                  <div className="text-sm space-y-1 text-charcoal-500">
                    {rating === 5 && <p>Excellent ! 🎉</p>}
                    {rating === 4 && <p>Très bien ! 😊</p>}
                    {rating === 3 && <p>Satisfait 👍</p>}
                    {rating === 2 && <p>À améliorer 😐</p>}
                    {rating === 1 && <p>Décevant 😞</p>}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience avec les autres voyageurs..."
                    className="w-full px-3 py-2 border border-charcoal-200 rounded-lg text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-charcoal-500 mt-1">
                    {comment.length}/500 caractères
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 bg-terracotta-500 hover:bg-terracotta-600"
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  )
}
