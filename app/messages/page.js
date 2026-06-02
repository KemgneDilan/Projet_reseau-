"use client"
import * as React from "react"
import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Phone, Video, Info, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"

const mockContacts = [
  { id: 1, name: "Jean Dupont (Hôte)", avatar: "JD", status: "En ligne", lastSeen: "À l'instant" },
  { id: 2, name: "Marie Curie (Guide)", avatar: "MC", status: "Hors ligne", lastSeen: "Il y a 2h" },
  { id: 3, name: "Support Loomdaah", avatar: "S", status: "En ligne", lastSeen: "À l'instant" }
]

const mockMessages = {
  1: [
    { id: 1, sender: "them", text: "Bonjour, je suis votre hôte pour la Villa. Avez-vous des questions ?", time: "10:00" },
    { id: 2, sender: "me", text: "Bonjour Jean ! Oui, à quelle heure pouvons-nous arriver ?", time: "10:05" },
    { id: 3, sender: "them", text: "Vous pouvez arriver à partir de 14h. Les clés seront dans le boîtier.", time: "10:15" },
    { id: 4, sender: "them", text: "Bonjour, votre réservation est confirmée !", time: "10:30" },
  ],
  2: [
    { id: 1, sender: "them", text: "On se retrouve à 9h demain pour la visite.", time: "Hier 18:00" }
  ]
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const initialContactId = searchParams.get("contact") ? parseInt(searchParams.get("contact")) : null

  const [activeContact, setActiveContact] = useState(
    initialContactId ? mockContacts.find(c => c.id === initialContactId) : null
  )
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState(mockMessages)

  const activeMessages = activeContact ? messages[activeContact.id] || [] : []

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !activeContact) return

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages({
      ...messages,
      [activeContact.id]: [...(messages[activeContact.id] || []), newMsg]
    })
    setMessageText("")
  }

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950 pt-16">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex">
        
        {/* Contacts List Sidebar */}
        <div className={`w-full md:w-80 bg-white dark:bg-charcoal-900 border-r border-charcoal-200 dark:border-charcoal-800 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-800">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white">Discussions</h2>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="mt-4 w-full p-2 bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg outline-none focus:border-terracotta-500 text-charcoal-900 dark:text-white"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {mockContacts.map(contact => {
              const lastMsg = messages[contact.id]?.slice(-1)[0]
              return (
                <div 
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-charcoal-50 dark:hover:bg-charcoal-800 flex gap-3 border-b border-charcoal-100 dark:border-charcoal-800/50 ${activeContact?.id === contact.id ? 'bg-terracotta-50 dark:bg-terracotta-900/20' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">
                      {contact.avatar}
                    </div>
                    {contact.status === "En ligne" && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-charcoal-900"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-charcoal-900 dark:text-white truncate">{contact.name}</h4>
                      <span className="text-xs text-charcoal-500">{lastMsg?.time || ''}</span>
                    </div>
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400 truncate">
                      {lastMsg?.sender === 'me' ? 'Vous: ' : ''}{lastMsg?.text || 'Commencer la discussion'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 bg-charcoal-50 dark:bg-charcoal-950 flex flex-col ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-800 flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-2 -ml-2 text-charcoal-600">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-orange-500 flex items-center justify-center font-bold text-white">
                    {activeContact.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{activeContact.name}</h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                      {activeContact.status === 'En ligne' ? 'En ligne' : `Dernière connexion: ${activeContact.lastSeen}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-charcoal-500">
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"><Phone className="h-5 w-5" /></button>
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"><Video className="h-5 w-5" /></button>
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"><Info className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.sender === 'me' 
                        ? 'bg-terracotta-500 text-white rounded-br-none' 
                        : 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white rounded-bl-none border border-charcoal-100 dark:border-charcoal-700'
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-terracotta-100' : 'text-charcoal-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-charcoal-900 border-t border-charcoal-200 dark:border-charcoal-800">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Écrivez votre message..." 
                    className="flex-1 max-h-32 min-h-[44px] p-3 bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-xl outline-none focus:border-terracotta-500 text-charcoal-900 dark:text-white resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                  <Button type="submit" disabled={!messageText.trim()} className="h-[44px] px-6 rounded-xl flex-shrink-0">
                    <Send className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-charcoal-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg">Sélectionnez une discussion pour commencer à envoyer des messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal-50 flex items-center justify-center">Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
