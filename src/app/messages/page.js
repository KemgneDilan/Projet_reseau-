"use client"
import * as React from "react"
import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Send, Phone, Video, Info, ArrowLeft, Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { users as mockUsers } from "@/lib/mockData"

function MessagesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialContactId = searchParams.get("contact")

  const [currentUser, setCurrentUser] = useState(null)
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState([]) // Array of all messages globally
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)

  // Initialization: load user, contacts and messages
  useEffect(() => {
    const storedUser = localStorage.getItem('hrs_current_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(parsed)
        
        // Load all users except current as potential contacts
        const loadedUsers = JSON.parse(localStorage.getItem('hrs_users') || JSON.stringify(mockUsers))
        const otherUsers = loadedUsers.filter(u => u.id !== parsed.id)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContacts(otherUsers)

        // Select initial contact if provided
        if (initialContactId) {
          const found = otherUsers.find(u => u.id === initialContactId)
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (found) setActiveContact(found)
        }

        // Load messages
        const storedMsgs = localStorage.getItem('hrs_messages')
        if (storedMsgs) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMessages(JSON.parse(storedMsgs))
        } else {
          // Initialize some mock messages for demo
          const demoMsgs = [
            { id: 1, senderId: 'u2', receiverId: 'u1', text: "Bonjour, je suis votre hôte pour la Villa. Avez-vous des questions ?", timestamp: Date.now() - 3600000 },
            { id: 2, senderId: 'u1', receiverId: 'u2', text: "Bonjour Jean ! Oui, à quelle heure pouvons-nous arriver ?", timestamp: Date.now() - 3000000 },
            { id: 3, senderId: 'u2', receiverId: 'u1', text: "Vous pouvez arriver à partir de 14h. Les clés seront dans le boîtier.", timestamp: Date.now() - 2400000 }
          ]
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMessages(demoMsgs)
          localStorage.setItem('hrs_messages', JSON.stringify(demoMsgs))
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      router.push('/login')
    }
  }, [initialContactId, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeContact])

  if (!currentUser) return <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">Chargement...</div>

  // Filter messages for active conversation
  const conversationMessages = messages.filter(
    m => activeContact && ((m.senderId === currentUser.id && m.receiverId === activeContact.id) || 
         (m.senderId === activeContact.id && m.receiverId === currentUser.id))
  ).sort((a, b) => a.timestamp - b.timestamp)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !activeContact) return

    const newMsg = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: activeContact.id,
      text: messageText,
      timestamp: Date.now()
    }

    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    localStorage.setItem('hrs_messages', JSON.stringify(updatedMessages))
    setMessageText("")
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return formatTime(ts)
    return d.toLocaleDateString()
  }

  // Filter contacts by search
  const filteredContacts = contacts.filter(c => c.username.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort contacts by latest message
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const lastMsgA = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === a.id) || (m.senderId === a.id && m.receiverId === currentUser.id)).pop()
    const lastMsgB = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === b.id) || (m.senderId === b.id && m.receiverId === currentUser.id)).pop()
    const tsA = lastMsgA ? lastMsgA.timestamp : 0
    const tsB = lastMsgB ? lastMsgB.timestamp : 0
    return tsB - tsA
  })

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-950 pt-16 font-sans">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex shadow-xl border-x border-charcoal-200 dark:border-charcoal-800">
        
        {/* Contacts List Sidebar */}
        <div className={`w-full md:w-80 bg-white dark:bg-charcoal-900 border-r border-charcoal-200 dark:border-charcoal-800 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-800 bg-charcoal-50 dark:bg-charcoal-950/20">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white flex items-center justify-between">
              Discussions
              <span className="text-xs bg-terracotta-100 text-terracotta-700 px-2 py-1 rounded-full">{currentUser.role}</span>
            </h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <input 
                type="text" 
                placeholder="Rechercher un contact..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg outline-none focus:border-terracotta-500 text-charcoal-900 dark:text-white transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-charcoal-100 dark:divide-charcoal-800/50">
            {sortedContacts.map(contact => {
              const contactMessages = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === contact.id) || (m.senderId === contact.id && m.receiverId === currentUser.id))
              const lastMsg = contactMessages[contactMessages.length - 1]
              const unreadCount = 0 // Pourrait être implémenté avec un champ isRead
              
              return (
                <div 
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-charcoal-50 dark:hover:bg-charcoal-800 flex gap-3 transition-colors ${activeContact?.id === contact.id ? 'bg-terracotta-50 dark:bg-terracotta-900/20 border-l-4 border-l-terracotta-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-charcoal-200 to-charcoal-300 dark:from-charcoal-700 dark:to-charcoal-800 flex items-center justify-center font-bold text-charcoal-700 dark:text-white shadow-sm border border-white dark:border-charcoal-800">
                      {contact.username.charAt(0).toUpperCase()}
                    </div>
                    {/* Status dot (simulated) */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-charcoal-900"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-charcoal-900 dark:text-white truncate">{contact.username}</h4>
                      <span className="text-xs text-charcoal-400 font-medium">{lastMsg ? formatDate(lastMsg.timestamp) : ''}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-charcoal-900 dark:text-white font-semibold' : 'text-charcoal-500 dark:text-charcoal-400'}`}>
                        {lastMsg?.senderId === currentUser.id ? 'Vous: ' : ''}{lastMsg?.text || <span className="italic text-xs">Nouvelle discussion</span>}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-terracotta-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-charcoal-50/50 dark:bg-charcoal-950 flex flex-col ${!activeContact ? 'hidden md:flex' : 'flex'} relative`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-white dark:bg-charcoal-900 border-b border-charcoal-200 dark:border-charcoal-800 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setActiveContact(null)} className="md:hidden p-2 -ml-2 text-charcoal-600 hover:bg-charcoal-100 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-charcoal-200 to-charcoal-300 dark:from-charcoal-700 dark:to-charcoal-800 flex items-center justify-center font-bold text-charcoal-700 dark:text-white">
                    {activeContact.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 dark:text-white">{activeContact.username}</h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 capitalize flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> En ligne • {activeContact.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-charcoal-500">
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors" title="Appel audio"><Phone className="h-5 w-5" /></button>
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors" title="Appel vidéo"><Video className="h-5 w-5" /></button>
                  <div className="w-px h-6 bg-charcoal-200 dark:bg-charcoal-700 mx-1"></div>
                  <button className="p-2 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 rounded-full transition-colors" title="Infos"><Info className="h-5 w-5" /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Intro message */}
                <div className="text-center mb-6">
                  <span className="text-xs bg-white dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 text-charcoal-500 px-3 py-1 rounded-full shadow-sm">
                    Les messages sont chiffrés de bout en bout. Personne en dehors de cette discussion ne peut les lire.
                  </span>
                </div>

                {conversationMessages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id
                  const showDate = idx === 0 || new Date(msg.timestamp).toDateString() !== new Date(conversationMessages[idx-1].timestamp).toDateString()
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="text-xs bg-charcoal-200/50 dark:bg-charcoal-800/50 text-charcoal-600 dark:text-charcoal-300 px-3 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm relative group ${
                          isMe 
                            ? 'bg-terracotta-500 text-white rounded-br-sm' 
                            : 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white rounded-bl-sm border border-charcoal-100 dark:border-charcoal-700'
                        }`}>
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-terracotta-100' : 'text-charcoal-400'}`}>
                            {formatTime(msg.timestamp)}
                            {isMe && <span className="text-white opacity-80 text-[10px]">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 sm:p-4 bg-charcoal-100 dark:bg-charcoal-900 border-t border-charcoal-200 dark:border-charcoal-800 z-10">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 relative bg-white dark:bg-charcoal-800 rounded-2xl border border-charcoal-200 dark:border-charcoal-700 shadow-sm overflow-hidden">
                    <textarea 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Tapez un message" 
                      className="w-full max-h-32 min-h-[50px] p-3 pr-12 outline-none text-charcoal-900 dark:text-white bg-transparent resize-none leading-relaxed"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!messageText.trim()} 
                    className={`h-[50px] w-[50px] rounded-full shrink-0 flex items-center justify-center p-0 transition-all ${messageText.trim() ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-md' : 'bg-charcoal-200 dark:bg-charcoal-800 text-charcoal-400'}`}
                  >
                    <Send className="h-5 w-5 ml-1" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-charcoal-400 p-6 text-center">
              <div className="w-24 h-24 bg-white dark:bg-charcoal-900 rounded-full flex items-center justify-center shadow-sm mb-6 border border-charcoal-100 dark:border-charcoal-800">
                <MessageSquare className="h-10 w-10 text-charcoal-300" />
              </div>
              <h2 className="text-2xl font-light text-charcoal-600 dark:text-charcoal-300 mb-2">Loomdaah Messenger</h2>
              <p className="max-w-md">Sélectionnez une discussion dans le panneau de gauche pour commencer à envoyer des messages ou consulter l&apos;historique.</p>
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
