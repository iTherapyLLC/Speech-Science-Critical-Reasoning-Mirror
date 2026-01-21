"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  type AreasAddressed,
  MIN_EXCHANGES,
  countAddressedAreas,
  getMissingAreas,
  RUBRIC_AREAS,
} from "@/lib/conversation-flow"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface SubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  weekNumber: number
  messages: Message[]
  studentName: string
  sessionStartTime: Date | null
  onSuccess?: () => void
  areasAddressed?: AreasAddressed
  exchangeCount?: number
  pasteAttempts?: number
  submissionFlagged?: boolean
  suspectedAIResponses?: number
  flagReasons?: string[]
}

export function SubmissionModal({
  isOpen,
  onClose,
  weekNumber,
  messages,
  studentName,
  sessionStartTime,
  onSuccess,
  areasAddressed,
  exchangeCount,
  pasteAttempts = 0,
  submissionFlagged = false,
  suspectedAIResponses = 0,
  flagReasons = [],
}: SubmissionModalProps) {
  const messageCount = messages.filter(m => m.role === "user").length

  // Calculate validation warnings
  const actualExchangeCount = exchangeCount ?? Math.floor(messages.length / 2)
  const meetsMinExchanges = actualExchangeCount >= MIN_EXCHANGES
  const addressedCount = areasAddressed ? countAddressedAreas(areasAddressed) : 0
  const missingAreas = areasAddressed ? getMissingAreas(areasAddressed) : []
  const hasEnoughAreas = addressedCount >= 3
  const [reflection, setReflection] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reflection.trim()) {
      setError("Please write a brief reflection before submitting")
      return
    }

    if (reflection.trim().length < 50) {
      setError("Your reflection should be at least 50 characters")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Build flag reason from all sources
      const allFlagReasons: string[] = [...flagReasons]
      if (pasteAttempts >= 3 && !allFlagReasons.includes("Multiple paste attempts")) {
        allFlagReasons.push("Multiple paste attempts")
      }
      if (suspectedAIResponses >= 2 && !allFlagReasons.includes("Multiple suspected AI responses")) {
        allFlagReasons.push("Multiple suspected AI responses")
      }

      // Submit to the API
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber,
          messages,
          studentName,
          reflection: reflection.trim(),
          sessionStartTime: sessionStartTime?.toISOString(),
          pasteAttempts: pasteAttempts ?? 0,
          suspectedAIResponses: suspectedAIResponses ?? 0,
          submissionFlagged: submissionFlagged ?? false,
          flagReasons: allFlagReasons,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit")
      }

      setIsSuccess(true)

      // Call onSuccess callback to update progress
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setReflection("")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setReflection("")
      setError(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          >
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                >
                  <CheckCircle className="h-16 w-16 text-teal-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submitted Successfully!</h3>
                <p className="text-gray-600 text-center">
                  Your Week {weekNumber} conversation has been submitted for grading.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Submit for Grading</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="flex items-center justify-between text-sm text-teal-800">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Week {weekNumber}</span>
                      <span className="text-teal-400">|</span>
                      <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={meetsMinExchanges ? "text-teal-600" : "text-amber-600"}>
                        {actualExchangeCount}/{MIN_EXCHANGES} exchanges
                      </span>
                      {areasAddressed && (
                        <>
                          <span className="text-teal-400">|</span>
                          <span className={hasEnoughAreas ? "text-teal-600" : "text-amber-600"}>
                            {addressedCount}/5 areas
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exchange count warning */}
                {!meetsMinExchanges && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Minimum exchanges not met
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Your conversation has {actualExchangeCount} of {MIN_EXCHANGES} required exchanges.
                          Submitting now may result in a lower score or require revision.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Missing rubric areas warning */}
                {areasAddressed && !hasEnoughAreas && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Some rubric areas may not be addressed
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          The following areas haven't been detected in your conversation:
                        </p>
                        <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                          {missingAreas.slice(0, 3).map(area => (
                            <li key={area}>{area}</li>
                          ))}
                          {missingAreas.length > 3 && (
                            <li>...and {missingAreas.length - 3} more</li>
                          )}
                        </ul>
                        <p className="text-xs text-amber-600 mt-2 italic">
                          Consider continuing your conversation to address these areas for full points.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy warning for very short conversations */}
                {messageCount < 8 && meetsMinExchanges && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Note:</span> Conversations with fewer than 8 student turns may be flagged for review.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-2">
                      Reflection <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Write a brief reflection on what you learned from this conversation and how it challenged your thinking.
                    </p>
                    <textarea
                      id="reflection"
                      value={reflection}
                      onChange={(e) => {
                        setReflection(e.target.value)
                        setError(null)
                      }}
                      placeholder="What insights did you gain? How did this conversation challenge or refine your understanding?"
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${reflection.length < 50 ? 'text-gray-400' : 'text-teal-600'}`}>
                        {reflection.length} / 50 min characters
                      </span>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 rounded-xl border border-red-100"
                    >
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
