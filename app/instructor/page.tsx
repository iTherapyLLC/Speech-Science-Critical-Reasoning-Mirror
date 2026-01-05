"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  LogOut,
  Flag,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Eye,
  ChevronLeft,
  Save,
  Loader2,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubmissionDetail } from "@/lib/database.types"

interface Stats {
  total: number
  flagged: number
  unreviewed: number
  thisWeek: number
  byWeek: Record<number, number>
}

export default function InstructorDashboard() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionDetail[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null)

  const [weekFilter, setWeekFilter] = useState<string>("all")
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [unreviewedOnly, setUnreviewedOnly] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [editedScore, setEditedScore] = useState<number | null>(null)
  const [editedNotes, setEditedNotes] = useState("")
  const [editedFlagged, setEditedFlagged] = useState(false)

  const storedPassword = typeof window !== "undefined" ? sessionStorage.getItem("instructor_password") : null

  useEffect(() => {
    if (storedPassword) {
      setPassword(storedPassword)
      setIsAuthenticated(true)
    }
  }, [storedPassword])

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/instructor/stats", {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      setStats(data.stats)
    }
  }, [password])

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (weekFilter !== "all") params.set("week", weekFilter)
    if (flaggedOnly) params.set("flagged", "true")
    if (unreviewedOnly) params.set("unreviewed", "true")

    const res = await fetch(`/api/instructor/submissions?${params}`, {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      setSubmissions(data.submissions || [])
    }
    setIsLoading(false)
  }, [password, weekFilter, flaggedOnly, unreviewedOnly])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      fetchSubmissions()
    }
  }, [isAuthenticated, fetchStats, fetchSubmissions])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsLoading(true)

    const res = await fetch("/api/instructor/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      sessionStorage.setItem("instructor_password", password)
      setIsAuthenticated(true)
    } else {
      setAuthError("Invalid password")
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("instructor_password")
    setIsAuthenticated(false)
    setPassword("")
    setSubmissions([])
    setStats(null)
  }

  const openSubmission = (submission: SubmissionDetail) => {
    setSelectedSubmission(submission)
    setEditedScore(submission.score)
    setEditedNotes(submission.reviewer_notes || "")
    setEditedFlagged(submission.flagged)
  }

  const closeSubmission = () => {
    setSelectedSubmission(null)
    setEditedScore(null)
    setEditedNotes("")
    setEditedFlagged(false)
  }

  const saveSubmission = async () => {
    if (!selectedSubmission) return

    setIsSaving(true)
    const res = await fetch(`/api/instructor/submissions/${selectedSubmission.submission_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-instructor-password": password,
      },
      body: JSON.stringify({
        score: editedScore,
        reviewer_notes: editedNotes,
        flagged: editedFlagged,
        reviewed: true,
      }),
    })

    if (res.ok) {
      await fetchSubmissions()
      await fetchStats()
      closeSubmission()
    }
    setIsSaving(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-1">SLHS 303 - Speech Science</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter instructor password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700"
              >
                {authError}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Submission detail view
  if (selectedSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 px-4 py-3 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={closeSubmission} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to List
            </Button>
            <Button
              onClick={saveSubmission}
              disabled={isSaving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save & Mark Reviewed
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Student info */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200/50 shadow-sm">
            <div className="flex flex-wrap gap-4 justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.student_name}</h2>
                <p className="text-gray-600">{selectedSubmission.student_email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                  Week {selectedSubmission.week_number}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedSubmission.message_count} messages
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {Math.round(selectedSubmission.duration_minutes)} min
                </span>
                {selectedSubmission.flagged && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Flagged
                  </span>
                )}
              </div>
            </div>
            {selectedSubmission.flag_reason && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                {selectedSubmission.flag_reason}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-3">
              Submitted {formatDate(selectedSubmission.submitted_at)}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transcript */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Transcript</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {selectedSubmission.transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      msg.role === "user"
                        ? "bg-teal-50 border border-teal-100 ml-8"
                        : "bg-gray-50 border border-gray-100 mr-8"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {msg.role === "user" ? "Student" : "Assistant"}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>

              {selectedSubmission.reflection && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Student Reflection</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 p-4 rounded-xl whitespace-pre-wrap">
                    {selectedSubmission.reflection}
                  </p>
                </div>
              )}
            </div>

            {/* Grading panel */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200/50 shadow-sm h-fit sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grading</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-8)
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((score) => (
                      <button
                        key={score}
                        onClick={() => setEditedScore(score)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          editedScore === score
                            ? "bg-teal-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedFlagged}
                      onChange={(e) => setEditedFlagged(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Flag for follow-up</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reviewer Notes
                  </label>
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes about this submission..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-sm text-gray-600">SLHS 303 - Speech Science</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total Submissions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                  <p className="text-xs text-gray-600">This Week</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
                  <p className="text-xs text-gray-600">Flagged</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreviewed}</p>
                  <p className="text-xs text-gray-600">Unreviewed</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/50 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Weeks</option>
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700">Flagged only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unreviewedOnly}
                onChange={(e) => setUnreviewedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Unreviewed only</span>
            </label>
          </div>
        </div>

        {/* Submissions list */}
        <div className="bg-white rounded-2xl border border-amber-200/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-500" />
              <p className="text-sm text-gray-600 mt-2">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.map((submission) => (
                <motion.div
                  key={submission.submission_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-amber-50/50 cursor-pointer transition-colors"
                  onClick={() => openSubmission(submission)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900 truncate">
                          {submission.student_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          Week {submission.week_number}
                        </span>
                        {submission.flagged && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Flagged
                          </span>
                        )}
                        {submission.reviewed && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Reviewed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{submission.student_email}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {submission.score !== null && (
                        <span className="text-lg font-bold text-teal-600">{submission.score}/8</span>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(submission.submitted_at)}</p>
                        <p className="text-xs text-gray-400">
                          {submission.message_count} msgs | {Math.round(submission.duration_minutes)} min
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
