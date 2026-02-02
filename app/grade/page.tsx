"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Award,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// ============================================================================
// TYPES
// ============================================================================

type AssessmentMode = "weekly" | "midterm" | "final"

interface PartResult {
  name: string
  score: number
  maxPoints: number
  justification: string
  feedback: string
}

interface ExamGradingResult {
  mode: string
  parts: PartResult[]
  totalScore: number
  totalPossible: number
  overallFeedback: string
  flagged: boolean
  flagReason: string
}

// ============================================================================
// RUBRIC DISPLAY DATA
// ============================================================================

const MIDTERM_PARTS = [
  { name: "Part 1: Core Concepts", maxPoints: 8, focus: "Definitions, mechanisms, causal chains", keyConcepts: "Source-filter theory, jitter, shimmer, loudness confound, CPP" },
  { name: "Part 2: Interpreting Evidence", maxPoints: 8, focus: "Applying understanding to research", keyConcepts: "Article references, WHY not just WHAT, limitations acknowledged" },
  { name: "Part 3: Perception Under Noise", maxPoints: 4, focus: "Act II concepts", keyConcepts: "Energetic masking (peripheral), informational masking (central), context effects" },
  { name: "Part 4: Reflection", maxPoints: 4, focus: "Growth and remaining questions", keyConcepts: "Specific growth, genuine remaining question, connection to course" },
]

const FINAL_PARTS = [
  { name: "Part 1: Opening Reflection", maxPoints: 4, focus: "Growth since Week 1", keyConcepts: "Specific Week 1 beliefs, clear conceptual shift" },
  { name: "Part 2: Act Insights (4 Acts)", maxPoints: 8, focus: "2 pts per Act with specific reference", keyConcepts: "Act I: jitter/shimmer/CPP; Act II: masking; Act III: Bernoulli; Act IV: motor learning" },
  { name: "Part 3: Making Connections", maxPoints: 4, focus: "Cross-Act connections", keyConcepts: "Sophisticated, specific, bidirectional connections" },
  { name: "Part 4: Central Question", maxPoints: 4, focus: "What must be true for communication to be worth the energy?", keyConcepts: "Multi-Act synthesis, specific evidence, acknowledges uncertainty" },
  { name: "Part 5: Looking Forward", maxPoints: 4, focus: "Clinical application + remaining curiosity", keyConcepts: "Specific clinical scenario, genuine remaining question" },
]

const WEEKLY_CRITERIA = [
  { name: "Article Engagement", maxPoints: 2, focus: "THE CLAIM — Specific, accurate claim" },
  { name: "Using Evidence", maxPoints: 2, focus: "THE EVIDENCE — Specific findings/data" },
  { name: "Critical Questioning", maxPoints: 2, focus: "ASSUMPTION + PROBLEM — Limitation + why it matters" },
  { name: "Clinical Connection", maxPoints: 2, focus: "WHY IT MATTERS + TAKEAWAY — Connection to practice" },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GradingAssistant() {
  const [mode, setMode] = useState<AssessmentMode>("weekly")
  const [weekNumber, setWeekNumber] = useState<number>(2)
  const [studentSubmission, setStudentSubmission] = useState("")
  const [conversationTranscript, setConversationTranscript] = useState("")
  const [isGrading, setIsGrading] = useState(false)
  const [showRubric, setShowRubric] = useState(false)

  // Results
  const [examResult, setExamResult] = useState<ExamGradingResult | null>(null)
  const [weeklyResult, setWeeklyResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearResults = () => {
    setExamResult(null)
    setWeeklyResult(null)
    setError(null)
  }

  const handleModeChange = (newMode: AssessmentMode) => {
    setMode(newMode)
    clearResults()
  }

  const handleGrade = async () => {
    if (!studentSubmission.trim()) return

    setIsGrading(true)
    clearResults()

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          weekNumber: mode === "weekly" ? weekNumber : undefined,
          studentSubmission: studentSubmission.trim(),
          conversationTranscript: conversationTranscript.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Grading failed. Please try again.")
        return
      }

      if (data.result) {
        setExamResult(data.result)
      } else if (data.rawResponse) {
        setWeeklyResult(data.rawResponse)
      }
    } catch (err) {
      console.error("Grading error:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsGrading(false)
    }
  }

  const totalPossible = mode === "weekly" ? 8 : 24

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SLHS 303 Grading Assistant</h1>
              <p className="text-sm text-slate-500">Powered by Claude Opus 4.5</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">

        {/* ================================================================ */}
        {/* ASSESSMENT MODE SELECTOR */}
        {/* ================================================================ */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Assessment Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleModeChange("weekly")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                mode === "weekly"
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <BookOpen className={`h-6 w-6 ${mode === "weekly" ? "text-teal-600" : "text-slate-400"}`} />
              <span className="text-sm font-semibold">Weekly</span>
              <span className="text-xs opacity-75">8 pts</span>
            </button>

            <button
              onClick={() => handleModeChange("midterm")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                mode === "midterm"
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <GraduationCap className={`h-6 w-6 ${mode === "midterm" ? "text-amber-600" : "text-slate-400"}`} />
              <span className="text-sm font-semibold">Midterm</span>
              <span className="text-xs opacity-75">24 pts</span>
            </button>

            <button
              onClick={() => handleModeChange("final")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                mode === "final"
                  ? "border-purple-500 bg-purple-50 text-purple-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <Award className={`h-6 w-6 ${mode === "final" ? "text-purple-600" : "text-slate-400"}`} />
              <span className="text-sm font-semibold">Final</span>
              <span className="text-xs opacity-75">24 pts</span>
            </button>
          </div>

          {/* Week selector (weekly mode only) */}
          {mode === "weekly" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Week Number
              </label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {[...Array(14)].map((_, i) => (
                  <option key={i + 2} value={i + 2}>
                    Week {i + 2}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* RUBRIC REFERENCE (collapsible) */}
        {/* ================================================================ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowRubric(!showRubric)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700">
              {mode === "weekly" ? "Weekly Rubric (8 pts)" :
               mode === "midterm" ? "Midterm Rubric (24 pts)" :
               "Final Rubric (24 pts)"}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showRubric ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showRubric && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {mode === "weekly" && WEEKLY_CRITERIA.map((c, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-800">{c.name}</span>
                        <span className="text-xs font-bold text-teal-600">{c.maxPoints} pts</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{c.focus}</p>
                    </div>
                  ))}

                  {mode === "midterm" && MIDTERM_PARTS.map((p, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-amber-900">{p.name}</span>
                        <span className="text-xs font-bold text-amber-600">{p.maxPoints} pts</span>
                      </div>
                      <p className="text-xs text-amber-800 mt-1">{p.focus}</p>
                      <p className="text-xs text-amber-700 mt-1 italic">Key: {p.keyConcepts}</p>
                    </div>
                  ))}

                  {mode === "final" && FINAL_PARTS.map((p, i) => (
                    <div key={i} className="bg-purple-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-purple-900">{p.name}</span>
                        <span className="text-xs font-bold text-purple-600">{p.maxPoints} pts</span>
                      </div>
                      <p className="text-xs text-purple-800 mt-1">{p.focus}</p>
                      <p className="text-xs text-purple-700 mt-1 italic">Key: {p.keyConcepts}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================================================================ */}
        {/* INPUT AREA */}
        {/* ================================================================ */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          {/* Conversation transcript (optional for weekly, hidden for exams) */}
          {mode === "weekly" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Conversation Transcript <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                value={conversationTranscript}
                onChange={(e) => setConversationTranscript(e.target.value)}
                placeholder="Paste the student's conversation transcript here (MIRROR: ... YOU: ...)"
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
              />
            </div>
          )}

          {/* Student submission */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {mode === "weekly" ? "Student Reflection" : mode === "midterm" ? "Midterm Response" : "Final Exam Response"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={studentSubmission}
              onChange={(e) => setStudentSubmission(e.target.value)}
              placeholder={
                mode === "weekly"
                  ? "Paste the student's reflection here..."
                  : mode === "midterm"
                  ? "Paste the student's midterm response here (all parts)..."
                  : "Paste the student's final exam response here (all parts)..."
              }
              rows={mode === "weekly" ? 10 : 16}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{studentSubmission.trim().split(/\s+/).filter(w => w.length > 0).length} words</span>
              <span>{studentSubmission.length.toLocaleString()} characters</span>
            </div>
          </div>

          {/* Grade button */}
          <button
            onClick={handleGrade}
            disabled={isGrading || !studentSubmission.trim()}
            className={`w-full py-4 font-semibold rounded-xl transition-all text-lg flex items-center justify-center gap-2 ${
              mode === "weekly"
                ? "bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-300"
                : mode === "midterm"
                ? "bg-amber-600 hover:bg-amber-700 text-white disabled:bg-slate-300"
                : "bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-300"
            } disabled:cursor-not-allowed`}
          >
            {isGrading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Grading with Opus 4.5...
              </>
            ) : (
              <>
                <ClipboardCheck className="h-5 w-5" />
                Grade {mode === "weekly" ? `Week ${weekNumber}` : mode === "midterm" ? "Midterm" : "Final"}
              </>
            )}
          </button>
        </div>

        {/* ================================================================ */}
        {/* ERROR */}
        {/* ================================================================ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* EXAM RESULTS (Midterm / Final) */}
        {/* ================================================================ */}
        {examResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Total score */}
            <div className={`rounded-2xl p-6 border shadow-sm ${
              mode === "midterm"
                ? "bg-amber-50 border-amber-200"
                : "bg-purple-50 border-purple-200"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wide ${
                    mode === "midterm" ? "text-amber-600" : "text-purple-600"
                  }`}>
                    {mode === "midterm" ? "Midterm" : "Final"} Score
                  </p>
                  <p className={`text-4xl font-bold mt-1 ${
                    mode === "midterm" ? "text-amber-900" : "text-purple-900"
                  }`}>
                    {examResult.totalScore}/{examResult.totalPossible}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {Math.round((examResult.totalScore / examResult.totalPossible) * 100)}%
                  </p>
                </div>
                {examResult.flagged && (
                  <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Flagged</span>
                  </div>
                )}
              </div>
              {examResult.flagged && examResult.flagReason && (
                <p className="text-sm text-red-700 mt-3 bg-red-50 p-2 rounded-lg">
                  {examResult.flagReason}
                </p>
              )}
            </div>

            {/* Part-by-part results */}
            <div className="space-y-3">
              {examResult.parts.map((part, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">{part.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-lg font-bold ${
                        part.score === part.maxPoints
                          ? "text-green-600"
                          : part.score >= part.maxPoints * 0.5
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}>
                        {part.score}
                      </span>
                      <span className="text-sm text-slate-400">/ {part.maxPoints}</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        part.score === part.maxPoints
                          ? "bg-green-500"
                          : part.score >= part.maxPoints * 0.5
                          ? "bg-amber-500"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${(part.score / part.maxPoints) * 100}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Justification</p>
                      <p className="text-sm text-slate-700 mt-1">{part.justification}</p>
                    </div>
                    {part.feedback && (
                      <div className="bg-teal-50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Coaching Feedback</p>
                        <p className="text-sm text-teal-800 mt-1">{part.feedback}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Overall feedback */}
            {examResult.overallFeedback && (
              <div className="bg-teal-50 rounded-2xl p-6 border border-teal-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-teal-800">Overall Feedback</h3>
                </div>
                <p className="text-sm text-teal-900 whitespace-pre-wrap">{examResult.overallFeedback}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* WEEKLY RESULTS */}
        {/* ================================================================ */}
        {weeklyResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-900">Week {weekNumber} Grading Result</h3>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 rounded-xl p-4">
              {weeklyResult}
            </pre>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            The goal is growth, not perfection. Coaching tone. Generous partial credit.
          </p>
        </div>
      </main>
    </div>
  )
}
