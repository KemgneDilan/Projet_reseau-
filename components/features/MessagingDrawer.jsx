"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function MessagingDrawer({ isOpen, onClose, contactName, role }) {
  const [msgs, setMsgs] = React.useState([
    { id: 1, text: `Bonjour ! Comment puis-je vous aider ?`, isSender: false },
  ])
  const [input, setInput] = React.useState("")

  const handleSend = () => {
    if (!input.trim()) return
    setMsgs([...msgs, { id: Date.now(), text: input, isSender: true }])
    setInput("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl border-l border-charcoal-100 flex flex-col"
        >
          {/* Header */}
          <div className="h-16 border-b border-charcoal-100 flex items-center justify-between px-4 bg-charcoal-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-terracotta-100 rounded-full flex items-center justify-center text-terracotta-700 font-bold">
                {contactName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">{contactName}</h3>
                <p className="text-xs text-charcoal-500 capitalize">{role}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-charcoal-200 rounded-full">
              <X className="h-5 w-5 text-charcoal-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-charcoal-50/50">
            {msgs.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isSender ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.isSender ? "bg-terracotta-500 text-white rounded-br-sm" : "bg-white border border-charcoal-100 text-charcoal-900 rounded-bl-sm shadow-sm"}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-charcoal-100 flex items-center space-x-2">
            <Input 
              placeholder="Écrire un message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-full"
            />
            <Button size="icon" className="rounded-full flex-shrink-0" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
