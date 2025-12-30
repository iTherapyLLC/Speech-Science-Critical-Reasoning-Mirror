"use client"

import type React from "react"

import { useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Send, BookOpen, Brain, Stethoscope, Loader2 } from "lucide-react"
import type { Message } from "@/app/page"
import { cn } from "@/lib/utils"

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
    variant: "default" as const,
  },
  {
    label: "Check My Understanding",
    icon: Brain,
    message: "I want to test my understanding of this week's concepts. Can you ask me some questions?",
    variant: "outline" as const,
  },
  {
    label: "Connect to Clinical Practice",
    icon: Stethoscope,
    message: "I'm trying to connect this research to clinical practice. Here's what I'm thinking...",
    variant: "outline" as const,
  },
]

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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="max-w-md space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Critical Reasoning Mirror</h2>
                <p className="text-gray-600">
                  This tool reflects your thinking back to you so you can examine it. It's not a source of truth or a
                  tutor—it's a mirror for your reasoning about{" "}
                  <span className="font-medium text-teal-700">{weekTopic}</span>.
                </p>
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant={action.variant}
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-3 px-4",
                      action.variant === "default" && "bg-teal-600 hover:bg-teal-700",
                    )}
                    onClick={() => handleQuickAction(action.message)}
                  >
                    <action.icon className="h-5 w-5 shrink-0" />
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3",
                    message.role === "user" ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-900",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thinking..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="bg-teal-600 hover:bg-teal-700">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
