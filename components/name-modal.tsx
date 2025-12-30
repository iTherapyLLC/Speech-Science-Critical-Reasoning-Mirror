"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface NameModalProps {
  isOpen: boolean
  onSubmit: (name: string) => void
}

export function NameModal({ isOpen, onSubmit }: NameModalProps) {
  const [name, setName] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to SLHS 303</h2>
        <p className="text-gray-600 mb-6">
          Your name will be included in exported conversations for Canvas submission.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              What's your name?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => onSubmit("")}>
              Skip
            </Button>
            <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
