"use client"
import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X } from "lucide-react"

export function MiniChat({ isOpen, onClose }) {
  const conversations = [
    { id: 1, name: "Jean Dupont (Hôte)", lastMessage: "Bonjour, votre réservation est confirmée !", time: "10:30", unread: true },
    { id: 2, name: "Marie Curie (Guide)", lastMessage: "On se retrouve à 9h demain.", time: "Hier", unread: false },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-800 rounded-xl shadow-2xl border border-charcoal-200 dark:border-charcoal-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-700 flex justify-between items-center bg-charcoal-50 dark:bg-charcoal-900">
              <h3 className="font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-terracotta-500" />
                Messages Récents
              </h3>
              <button onClick={onClose} className="text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {conversations.length > 0 ? (
                <div className="divide-y divide-charcoal-100 dark:divide-charcoal-700">
                  {conversations.map((conv) => (
                    <Link key={conv.id} href={`/messages?contact=${conv.id}`} onClick={onClose}>
                      <div className="p-4 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors flex gap-4 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">
                          {conv.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-semibold text-charcoal-900 dark:text-white truncate pr-2">
                              {conv.name}
                            </h4>
                            <span className="text-xs text-charcoal-500 flex-shrink-0">{conv.time}</span>
                          </div>
                          <p className={`text-sm truncate ${conv.unread ? 'font-semibold text-charcoal-900 dark:text-white' : 'text-charcoal-600 dark:text-charcoal-400'}`}>
                            {conv.lastMessage}
                          </p>
                        </div>
                        {conv.unread && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 self-center"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-charcoal-500">
                  Aucun message pour le moment.
                </div>
              )}
            </div>

            <div className="p-3 border-t border-charcoal-200 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900 text-center">
              <Link href="/messages" onClick={onClose} className="text-sm font-semibold text-terracotta-600 hover:text-terracotta-700">
                Voir tous les messages
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
