"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Circle, Lock, Loader2, Copy, ArrowRight } from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  role: "user" | "assistant"
  content: string
}

type Screen =
  | "landing"
  | "name"
  | "instructions"
  | "conversation"
  | "copy-conversation"
  | "reflection"
  | "final"

// ============================================================================
// WEEK DATA
// ============================================================================

const COURSE_START = new Date('2026-01-20')

const WEEKS = [
  { week: 1, title: "Foundations & Orientation", graded: false },
  { week: 2, title: "Evidence-Based Practice", graded: true },
  { week: 3, title: "Acoustic Perturbation Measures", graded: true },
  { week: 4, title: "Reverberation & Measurement", graded: true },
  { week: 5, title: "Software Comparability", graded: true },
  { week: 6, title: "Noise vs. Speech Masking", graded: true },
  { week: 7, title: "Context in Speech-in-Noise", graded: true },
  { week: 8, title: "Categorical Perception", graded: true },
  { week: 9, title: "Voice Quality Meta-analysis", graded: true },
  { week: 10, title: "AVQI Validity", graded: true },
  { week: 11, title: "Vowels in Speech", graded: true },
  { week: 12, title: "Production Benefits of Overhearing", graded: true },
  { week: 13, title: "Categorization & Speech-in-Noise", graded: true },
  { week: 14, title: "Nasalance Effects on CPP", graded: true },
  { week: 15, title: "High-Quality Acoustic Analysis", graded: true },
]

const WEEK_UNLOCK_DATES = [
  new Date('2026-01-20'), // Week 1
  new Date('2026-01-27'), // Week 2
  new Date('2026-02-03'), // Week 3
  new Date('2026-02-10'), // Week 4
  new Date('2026-02-17'), // Week 5
  new Date('2026-02-24'), // Week 6
  new Date('2026-03-03'), // Week 7
  new Date('2026-03-10'), // Week 8
  new Date('2026-03-17'), // Week 9
  new Date('2026-03-24'), // Week 10
  new Date('2026-04-06'), // Week 11 (after spring break)
  new Date('2026-04-13'), // Week 12
  new Date('2026-04-20'), // Week 13
  new Date('2026-04-27'), // Week 14
  new Date('2026-05-04'), // Week 15
]

function getCurrentWeek(): number {
  const today = new Date()
  // Find the highest week number that has unlocked
  for (let i = WEEK_UNLOCK_DATES.length - 1; i >= 0; i--) {
    if (today >= WEEK_UNLOCK_DATES[i]) {
      return i + 1
    }
  }
  return 1
}

function isWeekUnlocked(weekNumber: number): boolean {
  const today = new Date()
  const unlockDate = WEEK_UNLOCK_DATES[weekNumber - 1]
  return today >= unlockDate
}

function getUnlockDateString(weekNumber: number): string {
  const date = WEEK_UNLOCK_DATES[weekNumber - 1]
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Home() {
  // Screen state
  const [screen, setScreen] = useState<Screen>("landing")

  // Week state
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set([1])) // Week 1 always "done"

  // Name state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  // Conversation state
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reflection state
  const [reflection, setReflection] = useState("")

  // Copy state
  const [conversationCopied, setConversationCopied] = useState(false)
  const [finalCopied, setFinalCopied] = useState(false)

  // Paste detection (silent)
  const [pasteAttempts, setPasteAttempts] = useState(0)
  const [flagged, setFlagged] = useState(false)

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load completed weeks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('slhs303_completed_weeks')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompletedWeeks(new Set([1, ...parsed]))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save completed weeks
  const markWeekComplete = (week: number) => {
    const newCompleted = new Set([...completedWeeks, week])
    setCompletedWeeks(newCompleted)
    localStorage.setItem('slhs303_completed_weeks', JSON.stringify([...newCompleted].filter(w => w !== 1)))
  }

  // Get current week info
  const currentWeek = getCurrentWeek()
  const weekData = WEEKS.find(w => w.week === selectedWeek)

  // Handle paste (silent enforcement)
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.length > 50) {
      e.preventDefault()
      const newAttempts = pasteAttempts + 1
      setPasteAttempts(newAttempts)

      if (newAttempts >= 3) {
        setFlagged(true)
      }
    }
  }

  // Get paste message (only shown when blocked)
  const getPasteMessage = () => {
    if (pasteAttempts === 1) return "Please type your answer."
    if (pasteAttempts >= 2) return "This requires typed responses."
    return null
  }

  // Send message to API
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newMessages,
          weekNumber: selectedWeek,
          questionNumber: currentQuestion,
          studentName: `${firstName} ${lastName}`,
        }),
      })

      const data = await response.json()

      if (data.response) {
        setMessages([...newMessages, { role: "assistant", content: data.response }])

        // Check if we should move to next question or end
        if (data.questionComplete) {
          if (currentQuestion < 6) {
            setCurrentQuestion(currentQuestion + 1)
          }
        }

        if (data.conversationComplete) {
          // Stay on conversation screen, show completion message
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }

    setIsLoading(false)
    inputRef.current?.focus()
  }

  // Format transcript for display/copy
  const formatTranscript = () => {
    let transcript = ""
    for (let i = 0; i < messages.length; i += 2) {
      const assistant = messages[i]
      const user = messages[i + 1]
      if (assistant && user) {
        transcript += `MIRROR: ${assistant.content}\n\nYOU: ${user.content}\n\n`
      }
    }
    return transcript.trim()
  }

  // Format final output
  const formatFinalOutput = () => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let output = `SLHS 303 - Week ${selectedWeek}: ${weekData?.title}\n`
    output += `Student: ${firstName} ${lastName}\n`
    output += `Date: ${date}\n\n`
    output += `--- CONVERSATION (Your Work) ---\n\n`
    output += formatTranscript()
    output += `\n\n--- REFLECTION (Summary of Your Work) ---\n\n`
    output += reflection

    if (flagged) {
      output += `\n\n[FLAGGED: Multiple paste attempts]`
    }

    return output
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: 'conversation' | 'final') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'conversation') {
        setConversationCopied(true)
      } else {
        setFinalCopied(true)
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      if (type === 'conversation') {
        setConversationCopied(true)
      } else {
        setFinalCopied(true)
      }
    }
  }

  // Start a week
  const startWeek = (week: number) => {
    if (!isWeekUnlocked(week)) return
    setSelectedWeek(week)
    setMessages([])
    setCurrentQuestion(1)
    setInputValue("")
    setReflection("")
    setConversationCopied(false)
    setFinalCopied(false)
    setPasteAttempts(0)
    setFlagged(false)
    setScreen("name")
  }

  // Reset everything
  const startOver = () => {
    setScreen("landing")
    setMessages([])
    setCurrentQuestion(1)
    setInputValue("")
    setReflection("")
    setConversationCopied(false)
    setFinalCopied(false)
    setPasteAttempts(0)
    setFlagged(false)
    setFirstName("")
    setLastName("")
  }

  // Word count for reflection
  const wordCount = reflection.trim().split(/\s+/).filter(w => w.length > 0).length

  // Check if 6 questions are done
  const conversationComplete = messages.length >= 12 // 6 questions + 6 answers

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence mode="wait">

        {/* ================================================================ */}
        {/* SCREEN 1: LANDING */}
        {/* ================================================================ */}
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">SLHS 303</h1>
                <p className="text-slate-600 mt-1">Critical Reasoning Mirror</p>
              </div>

              {/* Current Week */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-2">
                  This Week
                </p>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Week {currentWeek}: {WEEKS[currentWeek - 1]?.title}
                </h2>
                <button
                  onClick={() => startWeek(currentWeek)}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-lg"
                >
                  Start
                </button>
              </div>

              {/* Previous Weeks */}
              {currentWeek > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide px-1">
                    Previous Weeks
                  </p>
                  {WEEKS.slice(0, currentWeek - 1).reverse().map((week) => (
                    <button
                      key={week.week}
                      onClick={() => startWeek(week.week)}
                      className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors text-left"
                    >
                      {completedWeeks.has(week.week) ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <span className="text-slate-700">
                        Week {week.week}: {week.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Upcoming Weeks */}
              {currentWeek < 15 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide px-1">
                    Coming Soon
                  </p>
                  {WEEKS.slice(currentWeek, Math.min(currentWeek + 3, 15)).map((week) => (
                    <div
                      key={week.week}
                      className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left opacity-60"
                    >
                      <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">
                        Week {week.week} — unlocks {getUnlockDateString(week.week)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 2: NAME ENTRY */}
        {/* ================================================================ */}
        {screen === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">
                  Before we start, type your name exactly as it appears in Canvas:
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder=""
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder=""
                  />
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center">
                This will appear on your submission.
              </p>

              <button
                onClick={() => setScreen("instructions")}
                disabled={!firstName.trim() || !lastName.trim()}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 3: INSTRUCTIONS */}
        {/* ================================================================ */}
        {screen === "instructions" && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-md space-y-6">
              <h2 className="text-xl font-bold text-slate-900">
                Here's what you're going to do:
              </h2>

              <div className="space-y-4 text-slate-700">
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                  <p>I'll ask you 6 questions about this week's article</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                  <p>You answer in your own words (a few sentences each)</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                  <p>Then you write a short reflection using a template</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                  <p>Then you copy everything and paste it into Canvas</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2">
                <p><strong>This should take about 15-20 minutes.</strong></p>
                <p>The conversation helps you THINK through the article.</p>
                <p>The reflection is what gets GRADED.</p>
                <p>If you do the conversation honestly, the reflection will be easy.</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                <p><strong>Tips:</strong></p>
                <p>• If you're not sure, say "I think..." and take a guess</p>
                <p>• There are no wrong answers — I want to see your thinking</p>
                <p>• Short answers are fine</p>
              </div>

              <button
                onClick={async () => {
                  setScreen("conversation")
                  setIsLoading(true)
                  // Get first question from API
                  try {
                    const response = await fetch("/api/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        message: "__START__",
                        conversationHistory: [],
                        weekNumber: selectedWeek,
                        questionNumber: 1,
                        studentName: `${firstName} ${lastName}`,
                      }),
                    })
                    const data = await response.json()
                    if (data.response) {
                      setMessages([{ role: "assistant", content: data.response }])
                    }
                  } catch (error) {
                    console.error("Error starting conversation:", error)
                  }
                  setIsLoading(false)
                }}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-lg"
              >
                I'm Ready
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 4: CONVERSATION */}
        {/* ================================================================ */}
        {screen === "conversation" && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3">
              <h1 className="text-lg font-bold text-slate-900">
                Week {selectedWeek}: {weekData?.title}
              </h1>
              <p className="text-sm text-teal-600 font-medium">
                Question {currentQuestion} of 6
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.role === "assistant"
                      ? "bg-white border border-slate-200 rounded-2xl p-4"
                      : "bg-teal-50 border border-teal-100 rounded-2xl p-4 ml-8"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    {msg.role === "assistant" ? "MIRROR" : "YOU"}
                  </p>
                  <p className="text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>

            {/* Conversation Complete */}
            {conversationComplete && (
              <div className="p-4 bg-green-50 border-t border-green-100">
                <div className="text-center space-y-3">
                  <p className="text-green-800 font-medium">You did it!</p>
                  <p className="text-green-700 text-sm">
                    You just thought through all the key parts of this article.
                    Now you're ready to write your reflection — the template will make it easy.
                  </p>
                  <button
                    onClick={() => setScreen("copy-conversation")}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            {!conversationComplete && (
              <div className="p-4 bg-white border-t border-slate-200">
                {getPasteMessage() && (
                  <p className="text-sm text-amber-600 mb-2">{getPasteMessage()}</p>
                )}
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type a few sentences..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  Send
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 5: COPY CONVERSATION */}
        {/* ================================================================ */}
        {screen === "copy-conversation" && (
          <motion.div
            key="copy-conversation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col p-4"
          >
            <div className="max-w-2xl mx-auto w-full space-y-4">
              <div>
                <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">
                  Step 1 of 3
                </p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Copy your conversation
                </h2>
                <p className="text-slate-600 mt-2">
                  This is your WORK. You'll need it for the reflection.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {formatTranscript()}
                </pre>
              </div>

              <button
                onClick={() => copyToClipboard(formatTranscript(), 'conversation')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {conversationCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Conversation
                  </>
                )}
              </button>

              {conversationCopied && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 text-center">
                    Save it somewhere safe (Notes, Google Doc) before continuing.
                  </p>
                  <button
                    onClick={() => setScreen("reflection")}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 6: REFLECTION */}
        {/* ================================================================ */}
        {screen === "reflection" && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col p-4"
          >
            <div className="max-w-2xl mx-auto w-full space-y-4 flex-1 flex flex-col">
              <div>
                <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">
                  Step 2 of 3
                </p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Write your reflection (100-200 words)
                </h2>
                <p className="text-slate-600 mt-2">
                  This is what gets graded. Use the template below.
                  Just fill in the blanks based on your conversation.
                </p>
              </div>

              {/* Template */}
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-900">
                <p className="font-bold mb-2">REFLECTION TEMPLATE (fill in the blanks):</p>
                <div className="space-y-2">
                  <p>The article I read was about _______.</p>
                  <p>The researchers found that _______.</p>
                  <p>One specific finding I remember is _______.</p>
                  <p>Something that confused me or seemed like a limitation was _______. This matters because _______.</p>
                  <p>This research might matter for clinicians because _______.</p>
                </div>
              </div>

              {/* Conversation Reference */}
              <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Your Conversation (use this to fill in the template)
                </p>
                <pre className="whitespace-pre-wrap text-xs text-slate-600 font-sans">
                  {formatTranscript()}
                </pre>
              </div>

              {/* Reflection Input */}
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-2">
                  Your Reflection:
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  onPaste={handlePaste}
                  className="flex-1 min-h-48 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="The article I read was about..."
                />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className={wordCount < 100 ? "text-amber-600" : wordCount > 250 ? "text-amber-600" : "text-green-600"}>
                    {wordCount} words {wordCount < 100 ? "(minimum 100)" : wordCount > 250 ? "(try to keep under 250)" : ""}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center">
                Your reflection should match your conversation.
                The conversation is your work. The reflection is your summary.
              </p>

              <button
                onClick={() => setScreen("final")}
                disabled={wordCount < 100}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* SCREEN 7: FINAL */}
        {/* ================================================================ */}
        {screen === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col p-4"
          >
            <div className="max-w-2xl mx-auto w-full space-y-4">
              <div>
                <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">
                  Step 3 of 3
                </p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Copy and paste into Canvas
                </h2>
                <p className="text-slate-600 mt-2">
                  Your complete submission is below.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                  {formatFinalOutput()}
                </pre>
              </div>

              <button
                onClick={() => {
                  copyToClipboard(formatFinalOutput(), 'final')
                  markWeekComplete(selectedWeek)
                }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {finalCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Everything
                  </>
                )}
              </button>

              {finalCopied && (
                <div className="bg-green-50 rounded-xl p-4 space-y-3">
                  <p className="font-bold text-green-900">NOW GO TO CANVAS:</p>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>Open Canvas</li>
                    <li>Click Modules</li>
                    <li>Click Week {selectedWeek}</li>
                    <li>Click "Conversation {selectedWeek - 1}"</li>
                    <li>Paste what you copied</li>
                    <li>Click Submit</li>
                  </ol>
                  <p className="font-bold text-green-900 pt-2">You're done.</p>
                </div>
              )}

              <button
                onClick={startOver}
                className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
