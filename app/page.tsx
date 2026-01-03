"use client"

import { useState, useEffect, useRef } from "react"
import { WeekSidebar } from "@/components/week-sidebar"
import { ChatArea } from "@/components/chat-area"
import { NameModal } from "@/components/name-modal"
import { Button } from "@/components/ui/button"
import { Download, Menu, X, Sparkles } from "lucide-react"
import { weeksData } from "@/lib/weeks-data"
import { motion, AnimatePresence } from "framer-motion"

export interface Message {
  role: "user" | "assistant"
  content: string
  id: string
}

export default function Home() {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [showNameModal, setShowNameModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showExportSparkle, setShowExportSparkle] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showFirstMessageCelebration, setShowFirstMessageCelebration] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedName = localStorage.getItem("slhs303_student_name")
    if (savedName) {
      setStudentName(savedName)
    } else {
      setShowNameModal(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user").length
    setMessageCount(userMessages)
  }, [messages])

  const handleNameSubmit = (name: string) => {
    const finalName = name.trim() || "Student"
    setStudentName(finalName)
    localStorage.setItem("slhs303_student_name", finalName)
    setShowNameModal(false)
  }

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week)
    setMessages([])
    setSidebarOpen(false)
  }

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content, id: crypto.randomUUID() }
    const isFirstMessage = messages.length === 0
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    if (isFirstMessage) {
      setShowFirstMessageCelebration(true)
      setTimeout(() => setShowFirstMessageCelebration(false), 2000)
    }

    try {
      const weekInfo = weeksData.find((w) => w.week === selectedWeek)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          weekNumber: selectedWeek,
          weekTopic: weekInfo?.topic || "",
        }),
      })

      const data = await response.json()
      const assistantMessage: Message = { role: "assistant", content: data.response, id: crypto.randomUUID() }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        id: crypto.randomUUID(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const exportConversation = () => {
    setShowExportSparkle(true)
    setTimeout(() => setShowExportSparkle(false), 1500)

    const weekInfo = weeksData.find((w) => w.week === selectedWeek)
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const fileDate = now.toISOString().split("T")[0]

    let markdown = `# SLHS 303 - Critical Reasoning Mirror Conversation\n\n`
    markdown += `**Student:** ${studentName}\n\n`
    markdown += `**Week ${selectedWeek}:** ${weekInfo?.topic}\n\n`
    markdown += `**Date:** ${dateStr} at ${timeStr}\n\n`
    markdown += `---\n\n`

    messages.forEach((msg) => {
      if (msg.role === "user") {
        markdown += `**Student:** ${msg.content}\n\n`
      } else {
        markdown += `**Assistant:** ${msg.content}\n\n`
      }
    })

    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SLHS303_Week${selectedWeek}_Conversation_${fileDate}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentWeek = weeksData.find((w) => w.week === selectedWeek)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 animate-gradient-shift">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl lg:shadow-none lg:translate-x-0 lg:transform-none"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 lg:hidden">
            <span className="font-semibold text-gray-900">Select Week</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <WeekSidebar selectedWeek={selectedWeek} onWeekSelect={handleWeekChange} />
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">SLHS 303 - Speech Science</h1>
              <motion.span
                key={selectedWeek}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 animate-float"
              >
                Week {selectedWeek}
              </motion.span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {messageCount >= 3 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-medium shadow-lg shadow-amber-400/25"
              >
                <span className="animate-pulse">🔥</span>
                <span>{messageCount} turns</span>
              </motion.div>
            )}
            {studentName && (
              <span className="hidden sm:block text-sm text-gray-600">
                Hi, <span className="font-medium text-teal-700">{studentName}</span>
              </span>
            )}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={exportConversation}
                disabled={messages.length === 0}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <AnimatePresence>
                {showExportSparkle && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Sparkles className="h-6 w-6 text-amber-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* First message celebration */}
        <AnimatePresence>
          {showFirstMessageCelebration && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow-lg shadow-teal-500/30 text-sm font-medium"
            >
              Great start! Let's think together.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <ChatArea
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          weekTopic={currentWeek?.topic || ""}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Name modal */}
      <NameModal isOpen={showNameModal} onSubmit={handleNameSubmit} />
    </div>
  )
}
