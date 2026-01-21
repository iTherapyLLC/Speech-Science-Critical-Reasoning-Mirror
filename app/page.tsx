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
  Lock,
  Unlock,
  ClipboardCheck,
  Award,
  Shield,
  AlertTriangle,
  Mic,
  HelpCircle,
  Flag,
  Activity,
  Target,
  BarChart3,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SubmissionModal } from "@/components/submission-modal"
import { ConversationGuide } from "@/components/conversation-guide"
import { weeksData, acts, type WeekData } from "@/lib/weeks-data"
import {
  type ConversationFlowState,
  createInitialFlowState,
  detectAreas,
  mergeAreasAddressed,
  MIN_EXCHANGES,
} from "@/lib/conversation-flow"
import { cn } from "@/lib/utils"
import { getSupabase } from "@/lib/supabase"
import {
  type StudentProgress,
  createEmptyProgress,
  loadProgress,
  saveProgress,
  isMidtermUnlocked,
  isFinalUnlocked,
  getLockedMessage,
  getSubmissionWindowMessage,
  isWithinSubmissionWindow,
  updateWeekProgress,
  MIN_EXCHANGES_FOR_COMPLETION,
  getCompletionStats,
} from "@/lib/progress-tracking"
import type { Message as DBMessage, Json } from "@/lib/database.types"
import { WEEK_1_TOPICS, CONVERSATION_STARTERS } from "@/lib/knowledge/syllabus"

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

// Helper function to get icon component for Week 1 topics
const getTopicIcon = (iconName: string) => {
  switch (iconName) {
    case "waveform": return Activity
    case "target": return Target
    case "chart": return BarChart3
    case "message": return MessageCircle
    default: return Sparkles
  }
}

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
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteAttempts, setPasteAttempts] = useState(0)
  const [submissionFlagged, setSubmissionFlagged] = useState(false)
  const [showDictationHelp, setShowDictationHelp] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [breakReminderShown, setBreakReminderShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null)
  const [isMidtermMode, setIsMidtermMode] = useState(false)
  const [midtermPhase, setMidtermPhase] = useState(1)
  const [midtermPaperSections, setMidtermPaperSections] = useState<{
    startingPoint?: string;
    actI?: string;
    actII?: string;
    whyItMatters?: string;
  }>({})
  const [isFinalMode, setIsFinalMode] = useState(false)
  const [finalPhase, setFinalPhase] = useState(1)
  const [finalPaperSections, setFinalPaperSections] = useState<{
    openingReflection?: string;
    actI?: string;
    actII?: string;
    actIII?: string;
    actIV?: string;
    centralQuestion?: string;
  }>({})
  const [conversationFlow, setConversationFlow] = useState<ConversationFlowState>(() => createInitialFlowState())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Calculate progress from studentProgress
  const completedWeeks = new Set<number>(
    studentProgress?.weeks.filter(w => w.completed).map(w => w.week) || []
  )
  const progress = studentProgress
    ? Math.round((completedWeeks.size / (weeksData.length - 1)) * 100) // -1 because Week 1 is foundations
    : 0

  // Check if midterm/final are unlocked
  const midtermUnlocked = studentProgress ? isMidtermUnlocked(studentProgress) : false
  const finalUnlocked = studentProgress ? isFinalUnlocked(studentProgress) : false
  const completionStats = studentProgress ? getCompletionStats(studentProgress) : null

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

  // Load student progress from localStorage
  useEffect(() => {
    const saved = loadProgress()
    if (saved) {
      setStudentProgress(saved)
    } else if (studentName) {
      const newProgress = createEmptyProgress(studentName)
      setStudentProgress(newProgress)
      saveProgress(newProgress)
    }
  }, [studentName])

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
    setConversationFlow(createInitialFlowState())
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
        // Determine which API to use based on mode
        if (isFinalMode) {
          // Final exam mode - use final API
          const response = await fetch("/api/final", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              conversationHistory: messages,
              currentPhase: finalPhase,
              paperSections: finalPaperSections,
              studentName: studentName,
            }),
          })

          const data = await response.json()

          if (!response.ok || data.error) {
            console.error("Final API error:", data.error, data.errorCode)
            const errorMessage: Message = {
              role: "assistant",
              content: data.error || "Something went wrong. Please try again.",
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }

          if (!data.response) {
            console.error("Missing response in final API data:", data)
            const errorMessage: Message = {
              role: "assistant",
              content: "I didn't receive a proper response. Please try again.",
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }

          const assistantMessage: Message = { role: "assistant", content: data.response }
          setMessages((prev) => [...prev, assistantMessage])

          // Update final progress in studentProgress
          if (studentProgress) {
            const updatedProgress = {
              ...studentProgress,
              final: {
                ...studentProgress.final,
                started: true,
                lastSavedAt: new Date().toISOString(),
              }
            }
            setStudentProgress(updatedProgress)
            saveProgress(updatedProgress)
          }
        } else if (isMidtermMode) {
          // Midterm mode - use midterm API
          const response = await fetch("/api/midterm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              conversationHistory: messages,
              currentPhase: midtermPhase,
              paperSections: midtermPaperSections,
              studentName: studentName,
            }),
          })

          const data = await response.json()

          if (!response.ok || data.error) {
            console.error("Midterm API error:", data.error, data.errorCode)
            const errorMessage: Message = {
              role: "assistant",
              content: data.error || "Something went wrong. Please try again.",
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }

          if (!data.response) {
            console.error("Missing response in midterm API data:", data)
            const errorMessage: Message = {
              role: "assistant",
              content: "I didn't receive a proper response. Please try again.",
            }
            setMessages((prev) => [...prev, errorMessage])
            return
          }

          const assistantMessage: Message = { role: "assistant", content: data.response }
          setMessages((prev) => [...prev, assistantMessage])

          // Update midterm progress in studentProgress
          if (studentProgress) {
            const updatedProgress = {
              ...studentProgress,
              midterm: {
                ...studentProgress.midterm,
                started: true,
                lastSavedAt: new Date().toISOString(),
              }
            }
            setStudentProgress(updatedProgress)
            saveProgress(updatedProgress)
          }
        } else {
          // Weekly conversation mode - use chat API
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

          // Track exchange count for progress (only for Weeks 2+)
          if (studentProgress && selectedWeek >= 2) {
            const currentExchangeCount = Math.floor((messages.length + 2) / 2) // +2 for user + assistant
            const updatedProgress = updateWeekProgress(
              studentProgress,
              selectedWeek,
              currentExchangeCount,
              false // Don't auto-complete - will be done on submission
            )
            setStudentProgress(updatedProgress)
            saveProgress(updatedProgress)
          }

          // Update conversation flow state for rubric tracking (only for Weeks 2+)
          if (selectedWeek >= 2) {
            const allMessages = [...messages, userMessage, assistantMessage]
            const detectedAreas = detectAreas(allMessages)
            const newExchangeCount = Math.floor(allMessages.length / 2)

            setConversationFlow(prev => ({
              ...prev,
              areasAddressed: mergeAreasAddressed(prev.areasAddressed, detectedAreas),
              exchangeCount: newExchangeCount,
            }))
          }
        }
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
    [messages, selectedWeek, sessionStartTime, isMidtermMode, midtermPhase, midtermPaperSections, isFinalMode, finalPhase, finalPaperSections, studentName, studentProgress, conversationFlow]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim())
      setInput("")
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.length > 50) {
      e.preventDefault()
      const newAttemptCount = pasteAttempts + 1
      setPasteAttempts(newAttemptCount)
      // Flag submission on 3rd attempt
      if (newAttemptCount >= 3) {
        setSubmissionFlagged(true)
      }
      setShowPasteModal(true)
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

  // Midterm-specific PDF generation
  const downloadMidtermPDF = (pdfStudentName: string, dateStr: string, fileDate: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 25
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Helper function to add page number footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      )
    }

    // Helper function to check if we need a new page
    const checkNewPage = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text("SLHS 303 MIDTERM PROJECT", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Speech and Hearing Science — CSU East Bay", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Student info
    doc.setFontSize(11)
    doc.text(`${pdfStudentName}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    doc.text(dateStr, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Divider
    doc.setDrawColor(100, 100, 100)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Extract paper sections from the conversation
    // This is a simplified approach - the actual sections are built in the conversation
    // For now, we'll format the conversation as a paper
    const sections = [
      { title: "Starting Point", content: midtermPaperSections.startingPoint },
      { title: "Act I: Measurement Confounds", content: midtermPaperSections.actI },
      { title: "Act II: Perception Under Noise", content: midtermPaperSections.actII },
      { title: "Why It Matters", content: midtermPaperSections.whyItMatters },
    ]

    // If we have structured sections, use them
    const hasSections = Object.values(midtermPaperSections).some(s => s && s.length > 0)

    if (hasSections) {
      sections.forEach((section, index) => {
        if (section.content) {
          checkNewPage(20)

          // Section header
          doc.setFontSize(12)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(88, 28, 135) // Purple color
          doc.text(section.title, margin, yPosition)
          yPosition += 8

          // Section content
          doc.setFontSize(11)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(40, 40, 40)

          const lines = doc.splitTextToSize(section.content, contentWidth)
          lines.forEach((line: string) => {
            checkNewPage(6)
            doc.text(line, margin, yPosition)
            yPosition += 5.5
          })

          yPosition += 10 // Space between sections
        }
      })
    } else {
      // Fall back to conversation format if no structured sections
      doc.setFontSize(11)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Paper sections extracted from conversation:", margin, yPosition)
      yPosition += 10

      doc.setFont("helvetica", "normal")
      doc.setTextColor(40, 40, 40)

      // Filter to only assistant messages (the drafted sections)
      const paperContent = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join("\n\n")

      const lines = doc.splitTextToSize(paperContent, contentWidth)
      lines.forEach((line: string) => {
        checkNewPage(6)
        doc.text(line, margin, yPosition)
        yPosition += 5.5
      })
    }

    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(i, totalPages)
    }

    // Generate filename
    const sanitizedName = pdfStudentName.replace(/[^a-zA-Z0-9]/g, "")
    const filename = `SLHS303_Midterm_${sanitizedName}_${fileDate}.pdf`

    // Download
    doc.save(filename)

    // Trigger confetti
    triggerConfetti()
  }

  // Final Exam-specific PDF generation
  const downloadFinalPDF = (pdfStudentName: string, dateStr: string, fileDate: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 25
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Helper function to add page number footer
    const addFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      )
    }

    // Helper function to check if we need a new page
    const checkNewPage = (neededHeight: number) => {
      if (yPosition + neededHeight > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text("SLHS 303 FINAL EXAM", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Speech and Hearing Science — CSU East Bay", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Student info
    doc.setFontSize(11)
    doc.text(`${pdfStudentName}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    doc.text(dateStr, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12

    // Divider
    doc.setDrawColor(100, 100, 100)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Extract paper sections from the conversation
    const sections = [
      { title: "Opening Reflection", content: finalPaperSections.openingReflection },
      { title: "Act I: Measurement Confounds", content: finalPaperSections.actI },
      { title: "Act II: Perception Under Noise", content: finalPaperSections.actII },
      { title: "Act III: Voice & Phonation", content: finalPaperSections.actIII },
      { title: "Act IV: Articulation & Motor Control", content: finalPaperSections.actIV },
      { title: "Central Question: Why Speech is Worth the Energy", content: finalPaperSections.centralQuestion },
    ]

    // If we have structured sections, use them
    const hasSections = Object.values(finalPaperSections).some(s => s && s.length > 0)

    if (hasSections) {
      sections.forEach((section) => {
        if (section.content) {
          checkNewPage(20)

          // Section header
          doc.setFontSize(12)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(217, 119, 6) // Amber color
          doc.text(section.title, margin, yPosition)
          yPosition += 8

          // Section content
          doc.setFontSize(11)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(40, 40, 40)

          const lines = doc.splitTextToSize(section.content, contentWidth)
          lines.forEach((line: string) => {
            checkNewPage(6)
            doc.text(line, margin, yPosition)
            yPosition += 5.5
          })

          yPosition += 10 // Space between sections
        }
      })
    } else {
      // Fall back to conversation format if no structured sections
      doc.setFontSize(11)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Paper sections extracted from conversation:", margin, yPosition)
      yPosition += 10

      doc.setFont("helvetica", "normal")
      doc.setTextColor(40, 40, 40)

      // Filter to only assistant messages (the drafted sections)
      const paperContent = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join("\n\n")

      const lines = doc.splitTextToSize(paperContent, contentWidth)
      lines.forEach((line: string) => {
        checkNewPage(6)
        doc.text(line, margin, yPosition)
        yPosition += 5.5
      })
    }

    // Add page numbers to all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(i, totalPages)
    }

    // Generate filename
    const sanitizedName = pdfStudentName.replace(/[^a-zA-Z0-9]/g, "")
    const filename = `SLHS303_Final_${sanitizedName}_${fileDate}.pdf`

    // Download
    doc.save(filename)

    // Trigger confetti
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

    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const fileDate = now.toISOString().split("T")[0].replace(/-/g, "")

    // Handle final exam PDF differently
    if (isFinalMode) {
      downloadFinalPDF(pdfStudentName, dateStr, fileDate)
      return
    }

    // Handle midterm PDF differently
    if (isMidtermMode) {
      downloadMidtermPDF(pdfStudentName, dateStr, fileDate)
      return
    }

    const weekInfo = weeksData.find((w) => w.week === selectedWeek)

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
                  {completedWeeks.size} of {weeksData.length - 1} weeks completed
                </p>
              </motion.div>

              {/* Midterm & Final Buttons */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={1.5}
                className="rounded-2xl bg-white border border-amber-200/50 p-4 shadow-sm space-y-3"
              >
                <span className="text-sm font-medium text-gray-700">Assessments</span>

                {/* Midterm Button */}
                <button
                  onClick={() => {
                    if (midtermUnlocked) {
                      setIsMidtermMode(true)
                      setMessages([])
                      setSidebarOpen(false)
                    }
                  }}
                  disabled={!midtermUnlocked}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    midtermUnlocked
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/25"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {midtermUnlocked ? (
                    <ClipboardCheck className="w-5 h-5 shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Midterm Project</p>
                    <p className={cn(
                      "text-xs truncate",
                      midtermUnlocked ? "opacity-80" : "opacity-60"
                    )}>
                      {midtermUnlocked
                        ? (studentProgress?.midterm.started
                            ? `Phase ${studentProgress.midterm.currentPhase}/6 — Continue`
                            : "Build your synthesis paper")
                        : getLockedMessage('midterm', studentProgress || createEmptyProgress())}
                    </p>
                  </div>
                  {completionStats && !midtermUnlocked && (
                    <span className="text-xs font-medium shrink-0">
                      {completionStats.midtermProgress}%
                    </span>
                  )}
                </button>

                {/* Final Button */}
                <button
                  onClick={() => {
                    if (finalUnlocked) {
                      setIsFinalMode(true)
                      setIsMidtermMode(false)
                      setMessages([])
                      setSidebarOpen(false)
                    }
                  }}
                  disabled={!finalUnlocked}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    finalUnlocked
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {finalUnlocked ? (
                    <Award className="w-5 h-5 shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Final Exam</p>
                    <p className={cn(
                      "text-xs truncate",
                      finalUnlocked ? "opacity-80" : "opacity-60"
                    )}>
                      {finalUnlocked
                        ? (studentProgress?.final.started
                            ? `Phase ${studentProgress.final.currentPhase}/8 — Continue`
                            : "Complete course synthesis")
                        : getLockedMessage('final', studentProgress || createEmptyProgress())}
                    </p>
                  </div>
                  {completionStats && !finalUnlocked && (
                    <span className="text-xs font-medium shrink-0">
                      {completionStats.finalProgress}%
                    </span>
                  )}
                </button>
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

            {/* Instructor Link */}
            <div className="shrink-0 p-4 border-t border-amber-200/50 bg-white/50">
              <Link
                href="/instructor-portal-m7k9"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-300 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm"
              >
                <Shield className="h-4 w-4" />
                Instructor Portal
              </Link>
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
              <h1 className="text-lg font-bold text-gray-900">
                {isFinalMode ? "Final Exam" : isMidtermMode ? "Midterm Project" : "Critical Reasoning Mirror"}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {isFinalMode
                  ? `Phase ${finalPhase}/8 — Course Synthesis`
                  : isMidtermMode
                    ? `Phase ${midtermPhase}/6 — Building Your Synthesis Paper`
                    : `Week ${selectedWeek}: ${currentWeek?.topic}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFinalMode ? (
              <>
                {/* Final exam mode buttons */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsFinalMode(false)
                      setMessages([])
                      setFinalPhase(1)
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Exit Final</span>
                  </Button>
                </motion.div>
                {finalPhase === 8 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      onClick={downloadPDF}
                      disabled={messages.length === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Paper</span>
                    </Button>
                  </motion.div>
                )}
              </>
            ) : isMidtermMode ? (
              <>
                {/* Midterm mode buttons */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMidtermMode(false)
                      setMessages([])
                      setMidtermPhase(1)
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Exit Midterm</span>
                  </Button>
                </motion.div>
                {midtermPhase === 6 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      onClick={downloadPDF}
                      disabled={messages.length === 0}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md shadow-purple-500/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Paper</span>
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                {/* Weekly mode buttons */}
                {selectedWeek >= 2 && (
                  <>
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
                  </>
                )}
              </>
            )}
          </div>
        </motion.header>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Conversation Guide Panel - only for weekly conversations (Week 2+) */}
          {!isMidtermMode && !isFinalMode && selectedWeek >= 2 && messages.length > 0 && (
            <ConversationGuide
              weekNumber={selectedWeek}
              weekInfo={currentWeek}
              areasAddressed={conversationFlow.areasAddressed}
              exchangeCount={conversationFlow.exchangeCount}
              isExpanded={conversationFlow.guideExpanded}
              onToggle={() => setConversationFlow(prev => ({ ...prev, guideExpanded: !prev.guideExpanded }))}
            />
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                {isFinalMode ? (
                  /* Final Exam Welcome Screen */
                  <div className="max-w-lg space-y-8">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Final Exam
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        Over the next 90-120 minutes, we'll build your complete course synthesis paper together.
                        This paper integrates everything from across all four acts.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                        <h3 className="font-semibold text-amber-900 mb-2">Your Paper Structure (4-5 pages):</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>1. <strong>Opening Reflection</strong> — Your assumptions before this course</li>
                          <li>2. <strong>Act I Insight</strong> — Measurement Confounds (Weeks 3-5)</li>
                          <li>3. <strong>Act II Insight</strong> — Perception Under Noise (Weeks 6-8)</li>
                          <li>4. <strong>Act III Insight</strong> — Voice & Phonation (Weeks 10-12)</li>
                          <li>5. <strong>Act IV Insight</strong> — Articulation & Motor Control (Weeks 13-15)</li>
                          <li>6. <strong>Central Question</strong> — Why speech is worth the energy</li>
                        </ul>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage("I'm ready to start the final exam.")}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      Begin Final Exam
                    </motion.button>
                  </div>
                ) : isMidtermMode ? (
                  /* Midterm Welcome Screen */
                  <div className="max-w-lg space-y-8">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                        <ClipboardCheck className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Midterm Project
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        Over the next 60-90 minutes, we'll build your synthesis paper together.
                        I'll ask questions to help you think through each section.
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
                        <h3 className="font-semibold text-purple-900 mb-2">Your Paper Structure:</h3>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>1. <strong>Starting Point</strong> — Your assumptions before this course</li>
                          <li>2. <strong>Act I Concept</strong> — One concept from Weeks 3-5</li>
                          <li>3. <strong>Act II Concept</strong> — One concept from Weeks 6-8</li>
                          <li>4. <strong>Why It Matters</strong> — Clinical relevance</li>
                        </ul>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage("I'm ready to start the midterm.")}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-indigo-600 transition-all"
                    >
                      <Sparkles className="w-5 h-5" />
                      Begin Midterm Project
                    </motion.button>
                  </div>
                ) : selectedWeek === 1 ? (
                  /* Week 1 Foundations - Onboarding with paste policy and guided exploration */
                  <div className="max-w-2xl space-y-6 text-left">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                        <BookOpen className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Welcome to Speech Science
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        This week we're building vocabulary and frameworks that will support everything that follows.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                    >
                      <p className="text-amber-800 text-sm">
                        <strong>No graded conversation this week.</strong> Use this time to explore the foundational concepts below. These practice conversations will help you get familiar with the Mirror.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">How to Enter Your Responses</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        The Critical Reasoning Mirror requires you to <strong>THINK as you type</strong>. You have three options:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-2 mb-4">
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">1.</span>
                          <span><strong>TYPE</strong> your responses directly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">2.</span>
                          <span><strong>DICTATE</strong> using your device's speech-to-text (Mac, iPhone, Android)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-teal-600 font-bold">3.</span>
                          <span>Use <strong>voice input</strong> on mobile</span>
                        </li>
                      </ul>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-red-800 text-sm font-medium mb-2">
                          What you CANNOT do: Copy and paste large blocks of text.
                        </p>
                        <p className="text-red-700 text-xs">
                          Pasting text from ChatGPT, Google, or your notes bypasses the thinking process. The whole point is for YOU to articulate YOUR understanding — even if it's messy or incomplete.
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-800 text-sm font-semibold mb-2">THE SYSTEM WILL DETECT PASTING:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• <strong>First paste:</strong> Warning — paste is blocked</li>
                          <li>• <strong>Second paste:</strong> Final warning</li>
                          <li>• <strong>Third paste:</strong> Submission flagged for instructor review</li>
                        </ul>
                        <p className="text-gray-500 text-xs mt-2 italic">
                          This isn't about catching you — it's about helping you actually learn. Rough, typed thoughts are worth more than polished, pasted paragraphs.
                        </p>
                      </div>
                    </motion.div>

                    {/* Get Familiar with the Mirror - Topic Cards */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Familiar with the Mirror</h3>
                        <p className="text-gray-600 text-sm">
                          Before Week 2, explore these foundational concepts. Click any topic to start a guided conversation:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.values(WEEK_1_TOPICS).map((topic, index) => {
                          const IconComponent = getTopicIcon(topic.icon)
                          const gradients = [
                            "from-blue-500 to-indigo-600",
                            "from-amber-500 to-orange-600",
                            "from-emerald-500 to-teal-600",
                            "from-purple-500 to-pink-600",
                          ]
                          return (
                            <motion.button
                              key={topic.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.0 + index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const openingMessage: Message = {
                                  role: "assistant",
                                  content: topic.starterMessage,
                                }
                                setMessages([openingMessage])
                              }}
                              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all bg-white border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 group"
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradients[index]} shadow-lg transition-transform group-hover:scale-110`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-0.5">{topic.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{topic.subtitle}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* Weekly Conversation Welcome Screen - Weeks 2-14 */
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

                    {CONVERSATION_STARTERS[selectedWeek] && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const starterMessage = CONVERSATION_STARTERS[selectedWeek]
                          const openingMessage: Message = {
                            role: "assistant",
                            content: starterMessage,
                          }
                          setMessages([openingMessage])
                        }}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all bg-white border-2 border-teal-200 shadow-md hover:shadow-lg hover:border-teal-300 group"
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg transition-transform group-hover:scale-110">
                          <Send className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">Start This Week's Conversation</p>
                          <p className="text-sm text-gray-600 leading-relaxed">The Mirror will guide you through this week's article with questions to develop your critical thinking.</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-teal-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    )}
                  </div>
                )}
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

          {/* Input area - show for Week 1 only when conversation is active */}
          {(selectedWeek >= 2 || isMidtermMode || isFinalMode || (selectedWeek === 1 && messages.length > 0)) && (
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
                  onPaste={handlePaste}
                  placeholder="Type your thinking here..."
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
              <div className="flex items-center justify-center gap-2 mt-2 max-w-4xl mx-auto">
                <p className="text-xs text-gray-400">Responses must be typed directly.</p>
                <button
                  type="button"
                  onClick={() => setShowDictationHelp(!showDictationHelp)}
                  className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  <Mic className="h-3 w-3" />
                  Use dictation
                  <HelpCircle className="h-3 w-3" />
                </button>
              </div>
              <AnimatePresence>
                {showDictationHelp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-md mx-auto mt-3 bg-teal-50 border border-teal-200 rounded-xl p-4 text-left"
                  >
                    <p className="text-sm text-teal-800 font-medium mb-2">You can speak your responses instead of typing:</p>
                    <ul className="text-xs text-teal-700 space-y-1">
                      <li><strong>Mac:</strong> Press Fn key twice, or Edit → Start Dictation</li>
                      <li><strong>iPhone/iPad:</strong> Tap the microphone icon on keyboard</li>
                      <li><strong>Android:</strong> Tap the microphone icon on keyboard</li>
                      <li><strong>Windows:</strong> Press Win + H</li>
                    </ul>
                    <p className="text-xs text-teal-600 mt-2 italic">Speaking your thoughts often helps you think more naturally than typing.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
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

      {/* Paste Detection Modal - Escalating Warnings */}
      <AnimatePresence>
        {showPasteModal && (
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
              {pasteAttempts === 1 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Pasting Detected — First Warning
                  </h2>
                  <p className="text-gray-600 text-center mb-4">
                    The Critical Reasoning Mirror requires typed or dictated responses. Pasting bypasses the thinking process this tool is designed to support.
                  </p>
                  <p className="text-amber-700 text-center text-sm font-medium mb-4">
                    This is your first warning. You have one more chance before your submission is flagged.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 font-medium mb-2">Options for entering responses:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Type directly</li>
                      <li>• Use speech-to-text (built into Mac, iOS, Android)</li>
                      <li>• Use voice input on mobile</li>
                    </ul>
                  </div>
                </>
              ) : pasteAttempts === 2 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Pasting Detected — Final Warning
                  </h2>
                  <p className="text-red-600 text-center text-sm font-semibold mb-4">
                    This is your second paste attempt. One more will flag your submission for instructor review and may result in point deduction.
                  </p>
                  <p className="text-gray-600 text-center mb-6">
                    If you're struggling to articulate your thoughts, that's okay — type what you're thinking, even if it's incomplete. The Mirror will help you develop your ideas.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-700 text-center mb-2">
                    Submission Flagged
                  </h2>
                  <p className="text-gray-600 text-center mb-4">
                    You have attempted to paste text three times. This conversation has been flagged for instructor review.
                  </p>
                  <p className="text-gray-600 text-center mb-6">
                    You may continue the conversation by typing your responses, but your instructor will be notified of the paste attempts when you submit.
                  </p>
                </>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => {
                    setShowPasteModal(false)
                    setInput("")
                  }}
                  className={cn(
                    "w-full rounded-xl shadow-lg",
                    pasteAttempts >= 3
                      ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 shadow-red-500/25"
                      : pasteAttempts === 2
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/25"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25"
                  )}
                >
                  {pasteAttempts >= 3 ? "Continue" : pasteAttempts === 2 ? "I Understand - I Will Type My Responses" : "I Understand"}
                </Button>
              </motion.div>
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
        areasAddressed={conversationFlow.areasAddressed}
        exchangeCount={conversationFlow.exchangeCount}
        pasteAttempts={pasteAttempts}
        submissionFlagged={submissionFlagged}
        onSuccess={() => {
          // Mark the week as complete if it has enough exchanges
          if (studentProgress && selectedWeek >= 2) {
            const exchangeCount = Math.floor(messages.length / 2)
            const meetsMinimum = exchangeCount >= MIN_EXCHANGES_FOR_COMPLETION
            const updatedProgress = updateWeekProgress(
              studentProgress,
              selectedWeek,
              exchangeCount,
              meetsMinimum // Only mark complete if minimum is met
            )
            setStudentProgress(updatedProgress)
            saveProgress(updatedProgress)
          }
        }}
      />
    </div>
  )
}
