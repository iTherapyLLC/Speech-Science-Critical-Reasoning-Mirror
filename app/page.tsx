"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { jsPDF } from "jspdf"
import {
  Download,
  FileText,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Brain,
  Stethoscope,
  Send,
  Loader2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubmissionModal } from "@/components/submission-modal"
import { weeksData, acts, type WeekData } from "@/lib/weeks-data"
import { cn } from "@/lib/utils"
import { getSupabase } from "@/lib/supabase"
import type { Message as DBMessage, Json } from "@/lib/database.types"

export interface Message {
  role: "user" | "assistant"
  content: string
}

// Confetti celebration function
const triggerConfetti = () => {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now()
    if (timeLeft <= 0) return clearInterval(interval)

    const particleCount = 50 * (timeLeft / duration)

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#0d9488", "#14b8a6", "#5eead4", "#fbbf24", "#f59e0b"],
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#0d9488", "#14b8a6", "#5eead4", "#fbbf24", "#f59e0b"],
    })
  }, 250)
}

// Quick action definitions
const quickActions = [
  {
    label: "Work Through This Article",
    icon: BookOpen,
    message: "I'd like to work through this week's article. Let me start by sharing what I understood from it...",
    gradient: "from-teal-500 to-emerald-500",
  },
  {
    label: "Check My Understanding",
    icon: Brain,
    message: "I want to test my understanding of this week's concepts. Can you ask me some questions?",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    label: "Connect to Clinical Practice",
    icon: Stethoscope,
    message: "I'm trying to connect this research to clinical practice. Here's what I'm thinking...",
    gradient: "from-purple-500 to-pink-500",
  },
]

// Animation variants
const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 200 } },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", damping: 20, stiffness: 100 },
  }),
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 200 } },
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
}

export default function Home() {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [studentName, setStudentName] = useState<string>("")
  const [showNameModal, setShowNameModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedActs, setExpandedActs] = useState<string[]>(["I"])
  const [hasTriggeredFirstMessageConfetti, setHasTriggeredFirstMessageConfetti] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [input, setInput] = useState("")
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [breakReminderShown, setBreakReminderShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Calculate progress
  const completedWeeks = new Set<number>()
  const progress = Math.round((completedWeeks.size / weeksData.length) * 100)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Trigger confetti on first message
  useEffect(() => {
    if (messages.length === 2 && !hasTriggeredFirstMessageConfetti) {
      triggerConfetti()
      setHasTriggeredFirstMessageConfetti(true)
    }
  }, [messages.length, hasTriggeredFirstMessageConfetti])

  // SB 243 Compliance: Break reminder after 3 hours of continuous use
  useEffect(() => {
    if (!sessionStartTime || breakReminderShown) return

    const checkInterval = setInterval(() => {
      const hoursElapsed = (Date.now() - sessionStartTime.getTime()) / (1000 * 60 * 60)
      if (hoursElapsed >= 3 && !breakReminderShown) {
        setBreakReminderShown(true)
        // Add break reminder as system message
        const breakMessage: Message = {
          role: "assistant",
          content: "**Break Reminder:** You've been engaged for over 3 hours. Consider taking a break — rest supports learning and memory consolidation. The research shows that spaced practice is more effective than marathon sessions. I'll be here when you return!",
        }
        setMessages((prev) => [...prev, breakMessage])
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [sessionStartTime, breakReminderShown])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalName = nameInput.trim() || "Student"
    setStudentName(finalName)
    localStorage.setItem("slhs303_student_name", finalName)
    setShowNameModal(false)
  }

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week)
    setMessages([])
    setHasTriggeredFirstMessageConfetti(false)
    setSessionStartTime(null)
    setBreakReminderShown(false)
    setSidebarOpen(false)
  }

  const toggleAct = (actNumber: string) => {
    setExpandedActs((prev) =>
      prev.includes(actNumber) ? prev.filter((a) => a !== actNumber) : [...prev, actNumber]
    )
  }

  const sendMessage = useCallback(
    async (content: string) => {
      // Track session start time on first message
      if (!sessionStartTime) {
        setSessionStartTime(new Date())
      }
      const userMessage: Message = { role: "user", content }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

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

        // Check for error responses from the API
        if (!response.ok || data.error) {
          console.error("API error:", data.error, data.errorCode)
          const errorMessage: Message = {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
          return
        }

        // Validate that we have a response
        if (!data.response) {
          console.error("Missing response in API data:", data)
          const errorMessage: Message = {
            role: "assistant",
            content: "I didn't receive a proper response. Please try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
          return
        }

        const assistantMessage: Message = { role: "assistant", content: data.response }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("Error sending message:", error)
        // Provide more specific error messages
        let errorContent = "Something went wrong. Please try again."
        if (error instanceof TypeError && error.message.includes("fetch")) {
          errorContent = "Unable to connect to the server. Please check your internet connection and try again."
        }
        const errorMessage: Message = {
          role: "assistant",
          content: errorContent,
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [messages, selectedWeek, sessionStartTime]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
      setInput("")
    }
  }

  const exportConversation = () => {
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

    // Trigger confetti on export
    triggerConfetti()
  }

  const downloadPDF = () => {
    // Prompt for student name if not set or if they want to change it
    let pdfStudentName = studentName
    const enteredName = window.prompt(
      "Enter your name for the PDF (this will appear in the header):",
      studentName || ""
    )

    if (enteredName === null) {
      // User cancelled
      return
    }

    pdfStudentName = enteredName.trim() || "Student"

    // Update stored name if changed
    if (pdfStudentName !== studentName) {
      setStudentName(pdfStudentName)
      localStorage.setItem("slhs303_student_name", pdfStudentName)
    }

    const weekInfo = weeksData.find((w) => w.week === selectedWeek)
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const fileDate = now.toISOString().split("T")[0].replace(/-/g, "")

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Helper function to add page number footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      )
    }

    // Helper function to check if we need a new page
    const checkNewPage = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - 25) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Header
    doc.setFontSize(18)
    doc.setTextColor(13, 148, 136) // Teal color
    doc.setFont("helvetica", "bold")
    doc.text("SLHS 303: Speech and Hearing Science", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Critical Reasoning Mirror - Conversation Transcript", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Student info box
    doc.setFillColor(240, 253, 250) // Light teal background
    doc.setDrawColor(13, 148, 136)
    doc.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, "FD")

    yPosition += 7
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text(`Student: ${pdfStudentName}`, margin + 5, yPosition)

    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.text(`Week ${selectedWeek}: ${weekInfo?.topic || ""}`, margin + 5, yPosition)

    yPosition += 6
    doc.text(`Date: ${dateStr}`, margin + 5, yPosition)

    yPosition += 6
    doc.text(`Course: SLHS 303 - CSU East Bay`, margin + 5, yPosition)

    yPosition += 12

    // Divider line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Conversation content
    doc.setFontSize(10)

    messages.forEach((msg) => {
      const label = msg.role === "user" ? "Student:" : "Mirror:"
      const labelColor = msg.role === "user" ? [13, 148, 136] : [107, 114, 128] // Teal for student, gray for mirror

      // Calculate text height for this message
      const lines = doc.splitTextToSize(msg.content, contentWidth - 15)
      const textHeight = lines.length * 5 + 12

      checkNewPage(textHeight)

      // Label
      doc.setFont("helvetica", "bold")
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2])
      doc.text(label, margin, yPosition)
      yPosition += 5

      // Message content
      doc.setFont("helvetica", "normal")
      doc.setTextColor(60, 60, 60)

      lines.forEach((line: string) => {
        checkNewPage(6)
        doc.text(line, margin + 5, yPosition)
        yPosition += 5
      })

      yPosition += 7 // Space between messages
    })

    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(i, totalPages)
    }

    // Generate filename: SLHS303_Week[X]_[StudentName]_[Date].pdf
    const sanitizedName = pdfStudentName.replace(/[^a-zA-Z0-9]/g, "")
    const filename = `SLHS303_Week${selectedWeek}_${sanitizedName}_${fileDate}.pdf`

    // Download
    doc.save(filename)

    // Trigger confetti
    triggerConfetti()
  }

  const handleSubmitForGrading = () => {
    setShowSubmissionModal(true)
  }

  const currentWeek = weeksData.find((w) => w.week === selectedWeek)
  const currentAct = acts.find((a) => a.number === currentWeek?.act)

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop always visible, Mobile slide-out */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || mounted) && (
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-xl border-r border-amber-200/50 shadow-xl lg:shadow-none",
              "flex flex-col",
              !sidebarOpen && "hidden lg:flex"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-amber-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    variants={pulseVariants}
                    animate="pulse"
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25"
                  >
                    <GraduationCap className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="font-bold text-gray-900">SLHS 303</h1>
                    <p className="text-xs text-gray-500">Speech Science</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-amber-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* This Week's Focus Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-4 text-white shadow-lg shadow-teal-500/25"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium opacity-90">This Week's Focus</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Week {selectedWeek}: {currentWeek?.topic}</h3>
                <p className="text-sm opacity-80 mb-3">{(currentAct as any)?.displayLabel || `Act ${currentAct?.number}: ${currentAct?.title}`}</p>

                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  {currentWeek?.article ? (
                    <>
                      <p className="text-sm font-medium mb-1">{currentWeek.article.title}</p>
                      <p className="text-xs opacity-80 mb-2">by {currentWeek.article.author}</p>
                      {currentWeek.article.notebookLMLink && (
                        <a
                          href={currentWeek.article.notebookLMLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs bg-white/30 hover:bg-white/40 transition-colors rounded-lg px-3 py-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in NotebookLM
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-1">Foundations Week</p>
                      <p className="text-xs opacity-80">No article — building vocabulary and frameworks</p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Progress Card */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="rounded-2xl bg-white border border-amber-200/50 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  <span className="text-sm font-bold text-teal-600">{progress}%</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedWeeks.size} of {weeksData.length} weeks explored
                </p>
              </motion.div>

              {/* Week Navigator */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="rounded-2xl bg-white border border-amber-200/50 overflow-hidden shadow-sm"
              >
                <div className="p-3 border-b border-amber-100">
                  <span className="text-sm font-medium text-gray-700">Course Navigator</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {acts.map((act) => {
                    const actWeeks = weeksData.filter((w) => w.act === act.number)
                    const isExpanded = expandedActs.includes(act.number)

                    return (
                      <div key={act.number}>
                        <button
                          onClick={() => toggleAct(act.number)}
                          className="w-full flex items-center justify-between p-3 hover:bg-amber-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </motion.div>
                            <span className="text-sm font-medium text-gray-700">
                              {act.displayLabel}
                            </span>
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {actWeeks.map((week) => (
                                <button
                                  key={week.week}
                                  onClick={() => handleWeekChange(week.week)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all",
                                    selectedWeek === week.week
                                      ? "bg-teal-50 border-l-3 border-teal-500"
                                      : "hover:bg-amber-50 border-l-3 border-transparent"
                                  )}
                                >
                                  {completedWeeks.has(week.week) ? (
                                    <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                                  ) : selectedWeek === week.week ? (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                      <Circle className="w-4 h-4 text-teal-500 fill-teal-500 shrink-0" />
                                    </motion.div>
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <p
                                      className={cn(
                                        "text-sm truncate",
                                        selectedWeek === week.week
                                          ? "font-medium text-teal-700"
                                          : "text-gray-600"
                                      )}
                                    >
                                      Week {week.week}: {week.topic}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Student Name Footer */}
            {studentName && (
              <div className="p-4 border-t border-amber-200/50 bg-amber-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{studentName}</p>
                      <p className="text-xs text-gray-500">Student</p>
                    </div>
                  </div>
                  <a
                    href="/safety"
                    className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    Safety & Privacy
                  </a>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 px-4 py-3 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-amber-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Critical Reasoning Mirror</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Week {selectedWeek}: {currentWeek?.topic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                disabled={messages.length === 0}
                className="flex items-center gap-2 bg-white hover:bg-amber-50 border-amber-300 text-amber-700 hover:text-amber-800 hover:border-amber-400 transition-all"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={handleSubmitForGrading}
                disabled={messages.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md shadow-teal-500/25 transition-all"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            </motion.div>
          </div>
        </motion.header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <div className="max-w-lg space-y-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/30">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      Critical Reasoning Mirror
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      This tool reflects your thinking back to you so you can examine it.
                      It's not a source of truth—it's a mirror for your reasoning about{" "}
                      <span className="font-semibold text-teal-600">{currentWeek?.topic}</span>.
                    </p>
                  </motion.div>

                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(action.message)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all",
                          "bg-white border border-amber-200/50 shadow-sm hover:shadow-md",
                          "group"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            "bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                            action.gradient
                          )}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.label}</p>
                          <p className="text-sm text-gray-500">Start a guided conversation</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                          message.role === "user"
                            ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
                            : "bg-white border border-amber-200/50 text-gray-900"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-amber-200/50 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                        <span className="text-sm text-gray-500">Reflecting...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t border-amber-200/50 bg-white/80 backdrop-blur-xl p-4"
          >
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your thinking..."
                className="flex-1 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl px-5 py-3 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Name modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Welcome to SLHS 303
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Your name will be included in exported conversations for Canvas submission.
              </p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl border-amber-200 hover:bg-amber-50"
                    onClick={() => {
                      setStudentName("Student")
                      localStorage.setItem("slhs303_student_name", "Student")
                      setShowNameModal(false)
                    }}
                  >
                    Skip
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        messages={messages}
        weekNumber={selectedWeek}
        studentName={studentName}
        sessionStartTime={sessionStartTime}
      />
    </div>
  )
}
