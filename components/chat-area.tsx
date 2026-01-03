"use client"

import type React from "react"
import { useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Send, BookOpen, Brain, Stethoscope } from "lucide-react"
import type { Message } from "@/app/page"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ChatAreaProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  weekTopic: string
  messagesEndRef: RefObject<HTMLDivElement | null>
}

const quickActions = [
  {
    label: "Work Through This Article",
    icon: BookOpen,
    message: "I'd like to work through this week's article. Let me start by sharing what I understood from it...",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    label: "Check My Understanding",
    icon: Brain,
    message: "I want to test my understanding of this week's concepts. Can you ask me some questions?",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    label: "Connect to Clinical Practice",
    icon: Stethoscope,
    message: "I'm trying to connect this research to clinical practice. Here's what I'm thinking...",
    gradient: "from-amber-500 to-orange-500",
  },
]

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-teal-500"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export function ChatArea({ messages, onSendMessage, isLoading, weekTopic, messagesEndRef }: ChatAreaProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleQuickAction = (message: string) => {
    onSendMessage(message)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <div className="max-w-md space-y-6">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Critical Reasoning Mirror</h2>
                  <p className="text-gray-600">
                    This tool reflects your thinking back to you so you can examine it. It's not a source of truth or a
                    tutor—it's a mirror for your reasoning about{" "}
                    <span className="font-medium text-teal-700">{weekTopic}</span>.
                  </p>
                </motion.div>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <motion.button
                        onClick={() => handleQuickAction(action.message)}
                        whileHover={{ scale: 1.03, x: 8 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "w-full flex items-center gap-3 h-auto py-3 px-4 rounded-xl text-white font-medium shadow-lg transition-all duration-300",
                          `bg-gradient-to-r ${action.gradient}`,
                          action.gradient === "from-teal-500 to-cyan-500" && "shadow-teal-500/30",
                          action.gradient === "from-violet-500 to-purple-500" && "shadow-violet-500/30",
                          action.gradient === "from-amber-500 to-orange-500" && "shadow-amber-500/30",
                        )}
                      >
                        <action.icon className="h-5 w-5 shrink-0" />
                        <span className="text-left">{action.label}</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="messages" className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-teal-500/20"
                        : "bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-100",
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </motion.div>
                </motion.div>
              ))}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/80 backdrop-blur-sm text-gray-900 rounded-2xl border border-gray-100 shadow-sm">
                      <ThinkingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-gray-200/50 bg-white/70 backdrop-blur-xl p-4"
      >
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thinking..."
            className="flex-1 rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-300 transition-all duration-300 hover:border-gray-300"
            disabled={isLoading}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 transition-all duration-300",
                isLoading && "animate-pulse",
              )}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}
