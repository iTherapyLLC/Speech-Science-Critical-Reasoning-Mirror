"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  Upload,
  Download,
  Grid3X3,
  FileText,
  X,
  Check,
  FileUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SubmissionDetail, Student } from "@/lib/database.types"
import { WEEKLY_ARTICLES } from "@/lib/knowledge/syllabus"

// PDF Upload Detection Types
interface PDFDetectionResult {
  student: {
    studentId?: string
    studentName?: string
    studentEmail?: string
    confidence: 'high' | 'medium' | 'low' | 'none'
    matchType?: string
  }
  week: {
    weekNumber?: number
    articleTitle?: string
    confidence: 'high' | 'medium' | 'low' | 'none'
    matchType?: string
  }
  submissionType: {
    type: 'weekly' | 'midterm' | 'final'
    confidence: 'high' | 'medium' | 'low'
  }
  extractedText: string
  warnings: string[]
}

interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'parsing' | 'detected' | 'confirming' | 'confirmed' | 'error'
  detection?: PDFDetectionResult
  error?: string
  // Editable fields
  selectedStudentId?: string
  selectedWeek?: number
}

// Types
interface Stats {
  total: number
  flagged: number
  unreviewed: number
  thisWeek: number
  byWeek: Record<number, number>
}

interface StudentWithStats extends Student {
  submission_count: number
  graded_count: number
  avg_score: number | null
}

interface Grade {
  article_engagement: number
  evidence_reasoning: number
  critical_thinking: number
  clinical_connection: number
  reflection_pass: boolean
  grader_notes: string | null
}

interface ProgressRow {
  student_id: string
  student_name: string
  student_email: string
  section: string
  weeks: Record<number, {
    status: 'not_submitted' | 'ungraded' | 'graded'
    submission_id?: string
    total_score?: number
  }>
}

type TabType = 'overview' | 'roster' | 'submissions' | 'export'

// Rubric descriptions
const RUBRIC = {
  article_engagement: {
    name: 'Article Engagement',
    description: 'Accurate understanding of research question, methods, findings',
  },
  evidence_reasoning: {
    name: 'Evidence-Based Reasoning',
    description: 'Uses data to support claims, not vibes',
  },
  critical_thinking: {
    name: 'Critical Thinking',
    description: 'Identifies limitations, alternatives, confounds',
  },
  clinical_connection: {
    name: 'Clinical Connection',
    description: 'Links to real practice, asks "so what?"',
  },
}

const SCORE_LABELS = ['Does not meet', 'Approaching', 'Meets']

export default function InstructorPortal() {
  // Auth state
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Data state
  const [stats, setStats] = useState<Stats | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionDetail[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null)
  const [students, setStudents] = useState<StudentWithStats[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [progressStats, setProgressStats] = useState({ total: 0, at_risk: 0, ungraded: 0 })

  // Filters
  const [weekFilter, setWeekFilter] = useState<string>("all")
  const [sectionFilter, setSectionFilter] = useState<string>("all")
  const [unreviewedOnly, setUnreviewedOnly] = useState(false)

  // Grading state
  const [isSaving, setIsSaving] = useState(false)
  const [grade, setGrade] = useState<Grade>({
    article_engagement: 0,
    evidence_reasoning: 0,
    critical_thinking: 0,
    clinical_connection: 0,
    reflection_pass: false,
    grader_notes: null,
  })

  // CSV upload state
  const [csvPreview, setCsvPreview] = useState<Array<{ name: string; email: string; section: string }> | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PDF upload state
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // Check for stored auth
  const storedPassword = typeof window !== "undefined" ? sessionStorage.getItem("instructor_password_v2") : null

  useEffect(() => {
    if (storedPassword) {
      setPassword(storedPassword)
      setIsAuthenticated(true)
    }
  }, [storedPassword])

  // API calls
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
    if (unreviewedOnly) params.set("unreviewed", "true")

    const res = await fetch(`/api/instructor/submissions?${params}`, {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      let filtered = data.submissions || []
      if (sectionFilter !== "all") {
        // Filter by section if we have student data
        const studentEmails = students
          .filter(s => s.section === sectionFilter)
          .map(s => s.email)
        filtered = filtered.filter((s: SubmissionDetail) => studentEmails.includes(s.student_email))
      }
      setSubmissions(filtered)
    }
    setIsLoading(false)
  }, [password, weekFilter, sectionFilter, unreviewedOnly, students])

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams()
    if (sectionFilter !== "all") params.set("section", sectionFilter)

    const res = await fetch(`/api/instructor/roster?${params}`, {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      setStudents(data.students || [])
    }
  }, [password, sectionFilter])

  const fetchProgress = useCallback(async () => {
    const params = new URLSearchParams()
    if (sectionFilter !== "all") params.set("section", sectionFilter)

    const res = await fetch(`/api/instructor/progress?${params}`, {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      setProgress(data.progress || [])
      setProgressStats(data.stats || { total: 0, at_risk: 0, ungraded: 0 })
    }
  }, [password, sectionFilter])

  const fetchGrade = useCallback(async (submissionId: string) => {
    const res = await fetch(`/api/instructor/grades?submission_id=${submissionId}`, {
      headers: { "x-instructor-password": password },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.grade) {
        setGrade({
          article_engagement: data.grade.article_engagement,
          evidence_reasoning: data.grade.evidence_reasoning,
          critical_thinking: data.grade.critical_thinking,
          clinical_connection: data.grade.clinical_connection,
          reflection_pass: data.grade.reflection_pass,
          grader_notes: data.grade.grader_notes,
        })
      } else {
        setGrade({
          article_engagement: 0,
          evidence_reasoning: 0,
          critical_thinking: 0,
          clinical_connection: 0,
          reflection_pass: false,
          grader_notes: null,
        })
      }
    }
  }, [password])

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      fetchStudents()
      fetchProgress()
    }
  }, [isAuthenticated, fetchStats, fetchStudents, fetchProgress])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'submissions') {
      fetchSubmissions()
    }
  }, [isAuthenticated, activeTab, fetchSubmissions])

  // Auth handlers
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
      sessionStorage.setItem("instructor_password_v2", password)
      setIsAuthenticated(true)
    } else {
      setAuthError("Invalid credentials")
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("instructor_password_v2")
    setIsAuthenticated(false)
    setPassword("")
    setSubmissions([])
    setStats(null)
    setStudents([])
    setProgress([])
  }

  // Submission handlers
  const openSubmission = async (submission: SubmissionDetail) => {
    setSelectedSubmission(submission)
    await fetchGrade(submission.submission_id)
  }

  const closeSubmission = () => {
    setSelectedSubmission(null)
    setGrade({
      article_engagement: 0,
      evidence_reasoning: 0,
      critical_thinking: 0,
      clinical_connection: 0,
      reflection_pass: false,
      grader_notes: null,
    })
  }

  const saveGrade = async (andNext = false) => {
    if (!selectedSubmission) return

    setIsSaving(true)
    const res = await fetch("/api/instructor/grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-instructor-password": password,
      },
      body: JSON.stringify({
        submission_id: selectedSubmission.submission_id,
        ...grade,
        graded_by: "Instructor",
      }),
    })

    if (res.ok) {
      await fetchSubmissions()
      await fetchStats()
      await fetchProgress()

      if (andNext) {
        // Find next ungraded submission
        const currentIndex = submissions.findIndex(s => s.submission_id === selectedSubmission.submission_id)
        const nextUngraded = submissions.slice(currentIndex + 1).find(s => !s.reviewed)
        if (nextUngraded) {
          openSubmission(nextUngraded)
        } else {
          closeSubmission()
        }
      } else {
        closeSubmission()
      }
    }
    setIsSaving(false)
  }

  // CSV handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        alert('CSV must have a header row and at least one data row')
        return
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
      const nameIndex = header.findIndex(h => h === 'name')
      const emailIndex = header.findIndex(h => h === 'email')
      const sectionIndex = header.findIndex(h => h === 'section')

      if (nameIndex === -1 || emailIndex === -1 || sectionIndex === -1) {
        alert('CSV must have columns: name, email, section')
        return
      }

      const preview = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        return {
          name: values[nameIndex] || '',
          email: values[emailIndex] || '',
          section: values[sectionIndex] || '',
        }
      }).filter(row => row.name && row.email)

      setCsvPreview(preview)
    }
    reader.readAsText(file)
  }

  const importStudents = async () => {
    if (!csvPreview) return

    setIsImporting(true)
    const res = await fetch("/api/instructor/roster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-instructor-password": password,
      },
      body: JSON.stringify({ students: csvPreview }),
    })

    if (res.ok) {
      const data = await res.json()
      alert(`Successfully imported ${data.imported} students`)
      setCsvPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchStudents()
      fetchProgress()
    } else {
      const data = await res.json()
      alert(`Import failed: ${data.error}`)
    }
    setIsImporting(false)
  }

  // Preview management helpers
  const removeFromPreview = (index: number) => {
    setCsvPreview(prev => prev?.filter((_, i) => i !== index) ?? null)
    setSelectedStudents(prev => {
      const newSet = new Set<number>()
      prev.forEach(i => {
        if (i < index) newSet.add(i)
        else if (i > index) newSet.add(i - 1)
      })
      return newSet
    })
  }

  const removeSelected = () => {
    setCsvPreview(prev => prev?.filter((_, i) => !selectedStudents.has(i)) ?? null)
    setSelectedStudents(new Set())
  }

  const toggleStudent = (index: number) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }

  const toggleAll = () => {
    if (!csvPreview) return
    if (selectedStudents.size === csvPreview.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(csvPreview.map((_, i) => i)))
    }
  }

  // PDF upload handlers
  const handlePDFDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )

    if (files.length === 0) {
      alert('Please drop PDF files only')
      return
    }

    const newItems: UploadItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending' as const,
    }))

    setUploadItems(prev => [...prev, ...newItems])

    // Start parsing each file
    newItems.forEach(item => parsePDFFile(item.id, item.file))
  }, [])

  const handlePDFSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )

    if (files.length === 0) return

    const newItems: UploadItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending' as const,
    }))

    setUploadItems(prev => [...prev, ...newItems])

    // Start parsing each file
    newItems.forEach(item => parsePDFFile(item.id, item.file))

    // Reset input
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }

  const parsePDFFile = async (itemId: string, file: File) => {
    setUploadItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status: 'parsing' as const } : item
      )
    )

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/instructor/upload', {
        method: 'POST',
        headers: { 'x-instructor-password': password },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()

      setUploadItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                status: 'detected' as const,
                detection: data.detection,
                selectedStudentId: data.detection.student.studentId,
                selectedWeek: data.detection.week.weekNumber,
              }
            : item
        )
      )
    } catch (error) {
      setUploadItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : item
        )
      )
    }
  }

  const confirmUpload = async (itemId: string) => {
    const item = uploadItems.find(i => i.id === itemId)
    if (!item) return

    const student = students.find(s => s.id === item.selectedStudentId)
    if (!student || !item.selectedWeek) {
      alert('Please select a student and week')
      return
    }

    setUploadItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, status: 'confirming' as const } : i))
    )

    try {
      // Read file as base64 for storage
      const arrayBuffer = await item.file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      const res = await fetch('/api/instructor/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-instructor-password': password,
        },
        body: JSON.stringify({
          studentId: student.id,
          studentEmail: student.email,
          studentName: student.name,
          weekNumber: item.selectedWeek,
          submissionType: item.detection?.submissionType.type || 'weekly',
          pdfData: base64,
          filename: item.file.name,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setUploadItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, status: 'confirmed' as const } : i))
      )

      // Refresh submissions list
      fetchSubmissions()
      fetchStats()
      fetchProgress()
    } catch (error) {
      setUploadItems(prev =>
        prev.map(i =>
          i.id === itemId
            ? { ...i, status: 'error' as const, error: error instanceof Error ? error.message : 'Unknown error' }
            : i
        )
      )
    }
  }

  const removeUploadItem = (itemId: string) => {
    setUploadItems(prev => prev.filter(i => i.id !== itemId))
  }

  const confirmAllUploads = async () => {
    const readyItems = uploadItems.filter(
      i => i.status === 'detected' && i.selectedStudentId && i.selectedWeek
    )

    for (const item of readyItems) {
      await confirmUpload(item.id)
    }
  }

  const clearCompletedUploads = () => {
    setUploadItems(prev => prev.filter(i => i.status !== 'confirmed'))
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'medium':
        return <HelpCircle className="h-4 w-4 text-amber-500" />
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  // Export handler
  const handleExport = async (format: 'canvas' | 'detailed') => {
    const params = new URLSearchParams()
    params.set('format', format)
    if (sectionFilter !== 'all') params.set('section', sectionFilter)

    const res = await fetch(`/api/instructor/export?${params}`, {
      headers: { "x-instructor-password": password },
    })

    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = format === 'canvas'
        ? `slhs303-grades-${new Date().toISOString().split('T')[0]}.csv`
        : `slhs303-detailed-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalScore = grade.article_engagement + grade.evidence_reasoning +
    grade.critical_thinking + grade.clinical_connection + (grade.reflection_pass ? 1 : 0)

  // Login screen (minimal, no hints)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              autoFocus
            />

            {authError && (
              <p className="text-sm text-red-600 text-center">{authError}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
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
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={closeSubmission} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => saveGrade(false)}
                disabled={isSaving}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button
                onClick={() => saveGrade(true)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              >
                Save & Next
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Student info */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/50 shadow-sm">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedSubmission.student_name}</h2>
                <p className="text-gray-600 text-sm">{selectedSubmission.student_email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                  Week {selectedSubmission.week_number}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {selectedSubmission.message_count} messages
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {Math.round(selectedSubmission.duration_minutes)} min
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Transcript */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-amber-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {selectedSubmission.transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-teal-50 border border-teal-100 ml-6"
                        : "bg-gray-50 border border-gray-100 mr-6"
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {msg.role === "user" ? "Student" : "Mirror"}
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>

              {selectedSubmission.reflection && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Reflection</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 p-3 rounded-xl whitespace-pre-wrap">
                    {selectedSubmission.reflection}
                  </p>
                </div>
              )}
            </div>

            {/* Grading panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-amber-200/50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rubric</h3>
                  <div className="text-2xl font-bold text-teal-600">{totalScore}/9</div>
                </div>

                <div className="space-y-4">
                  {(Object.keys(RUBRIC) as Array<keyof typeof RUBRIC>).map((key) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{RUBRIC[key].name}</span>
                        <span className="text-xs text-gray-500">{SCORE_LABELS[grade[key]]}</span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((score) => (
                          <button
                            key={score}
                            onClick={() => setGrade(g => ({ ...g, [key]: score }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              grade[key] === score
                                ? "bg-teal-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => setGrade(g => ({ ...g, reflection_pass: !g.reflection_pass }))}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        grade.reflection_pass
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {grade.reflection_pass ? <Check className="h-4 w-4" /> : null}
                      Reflection {grade.reflection_pass ? "Pass (+1)" : "Fail"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-amber-200/50 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={grade.grader_notes || ''}
                  onChange={(e) => setGrade(g => ({ ...g, grader_notes: e.target.value || null }))}
                  placeholder="Private notes..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">SLHS 303 Dashboard</h1>
            <p className="text-xs text-gray-500">Speech Science</p>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-amber-200/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Grid3X3 },
              { id: 'roster', label: 'Roster', icon: Users },
              { id: 'submissions', label: 'Submissions', icon: FileText },
              { id: 'export', label: 'Export', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4">
        {/* Section filter (shared) */}
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Section:</label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Sections</option>
            <option value="01">Section 01</option>
            <option value="02">Section 02</option>
          </select>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-amber-200/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{progressStats.total}</p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{progressStats.at_risk}</p>
                    <p className="text-xs text-gray-600">At Risk (2+ missing)</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{progressStats.ungraded}</p>
                    <p className="text-xs text-gray-600">Ungraded</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Grid */}
            <div className="bg-white rounded-xl border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100">
                <h2 className="text-lg font-semibold text-gray-900">Progress Grid</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700 sticky left-0 bg-gray-50">Student</th>
                      {Array.from({ length: 14 }, (_, i) => i + 2).map(week => (
                        <th key={week} className="px-2 py-2 text-center font-medium text-gray-600 min-w-[40px]">
                          W{week}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {progress.map((row) => (
                      <tr key={row.student_id} className="border-t border-gray-100 hover:bg-amber-50/50">
                        <td className="px-3 py-2 sticky left-0 bg-white">
                          <div className="font-medium text-gray-900">{row.student_name}</div>
                          <div className="text-xs text-gray-500">Sec {row.section}</div>
                        </td>
                        {Array.from({ length: 14 }, (_, i) => i + 2).map(week => {
                          const weekData = row.weeks[week]
                          return (
                            <td key={week} className="px-2 py-2 text-center">
                              {weekData.status === 'not_submitted' && (
                                <span className="inline-block w-6 h-6 rounded bg-gray-100" title="Not submitted" />
                              )}
                              {weekData.status === 'ungraded' && (
                                <span className="inline-block w-6 h-6 rounded bg-yellow-300" title="Ungraded" />
                              )}
                              {weekData.status === 'graded' && (
                                <span
                                  className="inline-block w-6 h-6 rounded bg-green-500 text-white text-xs font-medium flex items-center justify-center"
                                  title={`Score: ${weekData.total_score}/9`}
                                >
                                  {weekData.total_score}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {progress.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No students in roster. Import a roster first.
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-100" />
                <span className="text-gray-600">Not submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-yellow-300" />
                <span className="text-gray-600">Ungraded</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500" />
                <span className="text-gray-600">Graded</span>
              </div>
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            {/* CSV Upload */}
            <div className="bg-white rounded-xl p-5 border border-amber-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Roster</h3>

              {!csvPreview ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">Upload CSV with columns: name, email, section</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Select File
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">Preview ({csvPreview.length} students)</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCsvPreview(null)
                        setSelectedStudents(new Set())
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedStudents.size > 0 && (
                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeSelected}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Selected ({selectedStudents.size})
                      </Button>
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 w-8">
                            <input
                              type="checkbox"
                              checked={csvPreview.length > 0 && selectedStudents.size === csvPreview.length}
                              onChange={toggleAll}
                              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                          </th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Section</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 20).map((row, idx) => (
                          <tr key={idx} className="border-t hover:bg-amber-50/50 transition-colors">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(idx)}
                                onChange={() => toggleStudent(idx)}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </td>
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2">{row.email}</td>
                            <td className="px-3 py-2">{row.section}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeFromPreview(idx)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {csvPreview.length > 20 && (
                          <tr className="border-t">
                            <td colSpan={5} className="px-3 py-2 text-gray-500 text-center">
                              ...and {csvPreview.length - 20} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length === 0 ? (
                    <p className="text-amber-600 text-sm mt-4">No students to import</p>
                  ) : (
                    <Button
                      onClick={importStudents}
                      disabled={isImporting}
                      className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Import {csvPreview.length} Students
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100">
                <h2 className="text-lg font-semibold text-gray-900">Student Roster ({students.length})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {students.map((student) => (
                  <div key={student.id} className="px-4 py-3 flex items-center justify-between hover:bg-amber-50/50">
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        Sec {student.section}
                      </span>
                      <span className="text-sm text-gray-600">
                        {student.submission_count} submissions
                      </span>
                      {student.avg_score !== null && (
                        <span className="text-sm font-medium text-teal-600">
                          Avg: {student.avg_score}/9
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No students imported yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {/* Smart Upload Zone */}
            <div className="bg-white rounded-xl border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-teal-600" />
                  Smart Upload
                </h2>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handlePDFDrop}
                className={`m-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-teal-500' : 'text-gray-400'}`} />
                <p className="text-gray-600 mb-2">
                  Drop PDF(s) here or{' '}
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    click to upload
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  PDFs are auto-analyzed to detect student and week
                </p>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handlePDFSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Items */}
              {uploadItems.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadItems.length} file(s) queued
                    </span>
                    <div className="flex gap-2">
                      {uploadItems.some(i => i.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearCompletedUploads}
                          className="text-gray-500"
                        >
                          Clear completed
                        </Button>
                      )}
                      {uploadItems.filter(i => i.status === 'detected' && i.selectedStudentId && i.selectedWeek).length > 1 && (
                        <Button
                          size="sm"
                          onClick={confirmAllUploads}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Confirm All
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {uploadItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          item.status === 'confirmed'
                            ? 'bg-green-50 border-green-200'
                            : item.status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* File info */}
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-500 shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {item.file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(item.file.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>

                            {/* Status display */}
                            {item.status === 'pending' || item.status === 'parsing' ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                Analyzing PDF...
                              </div>
                            ) : item.status === 'error' ? (
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <XCircle className="h-4 w-4" />
                                {item.error}
                              </div>
                            ) : item.status === 'confirmed' ? (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Filed successfully
                              </div>
                            ) : item.status === 'confirming' ? (
                              <div className="flex items-center gap-2 text-sm text-teal-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </div>
                            ) : item.detection ? (
                              <div className="space-y-2">
                                {/* Detection results */}
                                <div className="flex flex-wrap gap-4">
                                  {/* Student */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Student:</span>
                                    {item.detection.student.confidence !== 'none' ? (
                                      <div className="flex items-center gap-1">
                                        {getConfidenceIcon(item.detection.student.confidence)}
                                        <select
                                          value={item.selectedStudentId || ''}
                                          onChange={(e) =>
                                            setUploadItems(prev =>
                                              prev.map(i =>
                                                i.id === item.id
                                                  ? { ...i, selectedStudentId: e.target.value }
                                                  : i
                                              )
                                            )
                                          }
                                          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                          <option value="">Select student...</option>
                                          {students.map(s => (
                                            <option key={s.id} value={s.id}>
                                              {s.name} ({s.email})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    ) : (
                                      <select
                                        value={item.selectedStudentId || ''}
                                        onChange={(e) =>
                                          setUploadItems(prev =>
                                            prev.map(i =>
                                              i.id === item.id
                                                ? { ...i, selectedStudentId: e.target.value }
                                                : i
                                            )
                                          )
                                        }
                                        className="text-sm border border-red-200 rounded px-2 py-1 bg-red-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                      >
                                        <option value="">Select student...</option>
                                        {students.map(s => (
                                          <option key={s.id} value={s.id}>
                                            {s.name} ({s.email})
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>

                                  {/* Week */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Week:</span>
                                    {item.detection.week.confidence !== 'none' ? (
                                      <div className="flex items-center gap-1">
                                        {getConfidenceIcon(item.detection.week.confidence)}
                                        <select
                                          value={item.selectedWeek || ''}
                                          onChange={(e) =>
                                            setUploadItems(prev =>
                                              prev.map(i =>
                                                i.id === item.id
                                                  ? { ...i, selectedWeek: parseInt(e.target.value) || undefined }
                                                  : i
                                              )
                                            )
                                          }
                                          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                          <option value="">Select week...</option>
                                          {Array.from({ length: 14 }, (_, i) => i + 2).map(w => (
                                            <option key={w} value={w}>
                                              Week {w}: {WEEKLY_ARTICLES[w as keyof typeof WEEKLY_ARTICLES]?.author || ''}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    ) : (
                                      <select
                                        value={item.selectedWeek || ''}
                                        onChange={(e) =>
                                          setUploadItems(prev =>
                                            prev.map(i =>
                                              i.id === item.id
                                                ? { ...i, selectedWeek: parseInt(e.target.value) || undefined }
                                                : i
                                            )
                                          )
                                        }
                                        className="text-sm border border-red-200 rounded px-2 py-1 bg-red-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                      >
                                        <option value="">Select week...</option>
                                        {Array.from({ length: 14 }, (_, i) => i + 2).map(w => (
                                          <option key={w} value={w}>
                                            Week {w}: {WEEKLY_ARTICLES[w as keyof typeof WEEKLY_ARTICLES]?.author || ''}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </div>

                                {/* Warnings */}
                                {item.detection.warnings.length > 0 && (
                                  <div className="text-xs text-amber-600 flex items-start gap-1">
                                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{item.detection.warnings.join(' ')}</span>
                                  </div>
                                )}

                                {/* Auto-confirm message for high confidence */}
                                {item.detection.student.confidence === 'high' &&
                                  item.detection.week.confidence === 'high' &&
                                  item.detection.warnings.length === 0 && (
                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Auto-detected: {item.detection.student.studentName}, Week {item.detection.week.weekNumber}
                                    </div>
                                  )}
                              </div>
                            ) : null}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status === 'detected' && (
                              <Button
                                size="sm"
                                onClick={() => confirmUpload(item.id)}
                                disabled={!item.selectedStudentId || !item.selectedWeek}
                                className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                            )}
                            {item.status !== 'confirming' && item.status !== 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUploadItem(item.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 border border-amber-200/50 shadow-sm">
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
                  {Array.from({ length: 14 }, (_, i) => i + 2).map((week) => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unreviewedOnly}
                    onChange={(e) => setUnreviewedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Ungraded only</span>
                </label>
              </div>
            </div>

            {/* Submissions list */}
            <div className="bg-white rounded-xl border border-amber-200/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100">
                <h2 className="text-lg font-semibold text-gray-900">Submissions ({submissions.length})</h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-500" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No submissions found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {submissions.map((submission) => (
                    <div
                      key={submission.submission_id}
                      className="p-4 hover:bg-amber-50/50 cursor-pointer transition-colors"
                      onClick={() => openSubmission(submission)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{submission.student_name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Week {submission.week_number}
                            </span>
                            {submission.reviewed ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Graded
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Needs grading
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{submission.student_email}</p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          {submission.score !== null && (
                            <span className="text-lg font-bold text-teal-600">{submission.score}/9</span>
                          )}
                          <div className="text-right text-xs text-gray-500">
                            <p>{formatDate(submission.submitted_at)}</p>
                            <p>{submission.message_count} msgs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-amber-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Grades</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Canvas Format</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Student, Email, Week 2, Week 3, ... Week 15<br/>
                    Compatible with Canvas gradebook import.
                  </p>
                  <Button
                    onClick={() => handleExport('canvas')}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>

                <div className="border rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Detailed Format</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    All rubric components, reflection status, and grader notes for each submission.
                  </p>
                  <Button
                    onClick={() => handleExport('detailed')}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Detailed CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
