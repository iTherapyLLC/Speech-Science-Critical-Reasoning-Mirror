"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reflection: string) => Promise<void>
  weekNumber: number
  messageCount: number
}

export function SubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  weekNumber,
  messageCount
}: SubmissionModalProps) {
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
      await onSubmit(reflection.trim())
      setIsSuccess(true)
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
                  <div className="flex items-center gap-2 text-sm text-teal-800">
                    <span className="font-medium">Week {weekNumber}</span>
                    <span className="text-teal-400">|</span>
                    <span>{messageCount} message{messageCount !== 1 ? 's' : ''} in conversation</span>
                  </div>
                </div>

                {messageCount < 8 && (
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
