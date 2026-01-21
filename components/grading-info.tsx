"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, GraduationCap, BookOpen, FileText, Award, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GradingInfoProps {
  isOpen: boolean
  onClose: () => void
}

export function GradingInfoModal({ isOpen, onClose }: GradingInfoProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-emerald-500">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Assessment & Grading</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <GradingInfoContent />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Exportable content component for embedding in Week 1
export function GradingInfoContent() {
  return (
    <div className="space-y-6 text-sm">
      {/* Philosophy */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-teal-900 font-semibold text-base mb-2">THE GOAL IS FOR EVERYONE TO SUCCEED.</p>
        <p className="text-teal-800 text-sm leading-relaxed">
          Success means you demonstrated understanding of each week's content, engaged critically with the evidence, and connected the science to clinical reality.
        </p>
        <p className="text-teal-700 text-sm mt-2 leading-relaxed">
          If you haven't demonstrated that yet, you're not done yet. You revise, you get support, and you finish. <strong>The timeline is flexible. The standard is not.</strong>
        </p>
      </div>

      {/* Grade Components */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Grade Components
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-200 font-semibold">Component</th>
                <th className="text-center p-2 border border-gray-200 font-semibold">Weight</th>
                <th className="text-center p-2 border border-gray-200 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-gray-200">Weekly Conversations (14 weeks × 8 pts)</td>
                <td className="text-center p-2 border border-gray-200">70%</td>
                <td className="text-center p-2 border border-gray-200">112 pts</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">Midterm Exam</td>
                <td className="text-center p-2 border border-gray-200">15%</td>
                <td className="text-center p-2 border border-gray-200">24 pts</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200">Final Exam</td>
                <td className="text-center p-2 border border-gray-200">15%</td>
                <td className="text-center p-2 border border-gray-200">24 pts</td>
              </tr>
              <tr className="bg-teal-50 font-semibold">
                <td className="p-2 border border-gray-200">Total</td>
                <td className="text-center p-2 border border-gray-200">100%</td>
                <td className="text-center p-2 border border-gray-200">160 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Scale */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Grade Scale</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="bg-green-100 border border-green-200 rounded-lg p-2 text-center">
            <p className="font-bold text-green-800">A</p>
            <p className="text-green-700">144-160 pts</p>
            <p className="text-green-600">(90-100%)</p>
          </div>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-2 text-center">
            <p className="font-bold text-blue-800">B</p>
            <p className="text-blue-700">128-143 pts</p>
            <p className="text-blue-600">(80-89%)</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-2 text-center">
            <p className="font-bold text-yellow-800">C</p>
            <p className="text-yellow-700">112-127 pts</p>
            <p className="text-yellow-600">(70-79%)</p>
          </div>
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-2 text-center">
            <p className="font-bold text-orange-800">D</p>
            <p className="text-orange-700">96-111 pts</p>
            <p className="text-orange-600">(60-69%)</p>
          </div>
          <div className="bg-red-100 border border-red-200 rounded-lg p-2 text-center">
            <p className="font-bold text-red-800">F</p>
            <p className="text-red-700">&lt;96 pts</p>
            <p className="text-red-600">(&lt;60%)</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          Note: If you're tracking toward a grade lower than you want, come see me. We'll make a plan.
        </p>
      </div>

      {/* Weekly Conversations */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Weekly Conversations (70% of grade)
        </h3>
        <p className="text-gray-600 mb-3">Each week you will:</p>
        <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-4 text-xs">
          <li>Read the assigned research article</li>
          <li>Engage with scaffolding materials (Gamma module, NotebookLM briefing)</li>
          <li>Have a conversation with the Critical Reasoning Mirror</li>
          <li>Submit your transcript</li>
        </ol>

        <p className="font-medium text-gray-800 mb-2">Weekly Rubric (8 points per week)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-200 font-semibold">Criteria</th>
                <th className="text-center p-2 border border-gray-200 font-semibold text-red-600">0 pts</th>
                <th className="text-center p-2 border border-gray-200 font-semibold text-amber-600">1 pt</th>
                <th className="text-center p-2 border border-gray-200 font-semibold text-green-600">2 pts</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-gray-200 font-medium">Article Engagement</td>
                <td className="p-2 border border-gray-200 text-xs">Did not read or major misunderstanding</td>
                <td className="p-2 border border-gray-200 text-xs">Surface-level understanding</td>
                <td className="p-2 border border-gray-200 text-xs">Honest effort to understand research question, methods, findings</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 border border-gray-200 font-medium">Using Evidence</td>
                <td className="p-2 border border-gray-200 text-xs">No reference or made-up claims</td>
                <td className="p-2 border border-gray-200 text-xs">Vague references without specifics</td>
                <td className="p-2 border border-gray-200 text-xs">Points to specific findings, numbers, details</td>
              </tr>
              <tr>
                <td className="p-2 border border-gray-200 font-medium">Critical Questioning</td>
                <td className="p-2 border border-gray-200 text-xs">No questions, accepts at face value</td>
                <td className="p-2 border border-gray-200 text-xs">Notes limitations but doesn't explain why</td>
                <td className="p-2 border border-gray-200 text-xs">Identifies confusion/limitations and explains why they matter</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 border border-gray-200 font-medium">Clinical Connection</td>
                <td className="p-2 border border-gray-200 text-xs">No real-world connection</td>
                <td className="p-2 border border-gray-200 text-xs">Generic connection without specifics</td>
                <td className="p-2 border border-gray-200 text-xs">Specific, thoughtful connection to clinical practice</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Midterm */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          Midterm Exam (15% of grade)
        </h3>
        <p className="text-gray-600 mb-2">The Midterm assesses Acts I and II (Weeks 2–8).</p>
        <p className="text-gray-700 mb-3">
          <strong>FORMAT:</strong> A structured conversation with the Mirror that builds toward a 2–3 page synthesis paper.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="font-medium text-amber-800 mb-1">What You'll Demonstrate:</p>
          <ul className="text-xs text-amber-700 space-y-1">
            <li><strong>Act I (Measurement Confounds):</strong> What did you learn about why acoustic measurements can mislead us?</li>
            <li><strong>Act II (Perception Under Noise):</strong> What did you learn about how listeners handle degraded signals?</li>
          </ul>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          <strong>HOW IT WORKS:</strong> The Mirror asks what you found important, pushes you to be specific about which articles support your claims, and helps you articulate connections. By the end, you have a coherent written synthesis reflecting your actual understanding.
        </p>
        <p className="text-xs text-gray-500 mb-3">
          <strong>TIMING:</strong> Unlocks after completing Weeks 2–8 conversations. Submission available during Week 9 (March 17–23, 2026).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-amber-100">
                <th className="text-left p-2 border border-amber-200 font-semibold">Criterion</th>
                <th className="text-center p-2 border border-amber-200 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border border-gray-200">Act I Understanding: Accurate concepts, specific article references</td><td className="text-center p-2 border border-gray-200">8 pts</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border border-gray-200">Act II Understanding: Accurate concepts, specific article references</td><td className="text-center p-2 border border-gray-200">8 pts</td></tr>
              <tr><td className="p-2 border border-gray-200">Synthesis: Connections across weeks, coherent argument</td><td className="text-center p-2 border border-gray-200">4 pts</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border border-gray-200">Clarity: Writing is clear and sounds like the student</td><td className="text-center p-2 border border-gray-200">4 pts</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Final */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          Final Exam (15% of grade)
        </h3>
        <p className="text-gray-600 mb-2">The Final is cumulative, covering all four Acts.</p>
        <p className="text-gray-700 mb-3">
          <strong>FORMAT:</strong> A structured conversation building toward a 4–5 page synthesis paper answering the Central Question: <em>What has to be true for linguistic communication to be worth the energy?</em>
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
          <p className="font-medium text-purple-800 mb-1">What You'll Demonstrate:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            <li><strong>Opening Reflection:</strong> How has your understanding changed since Week 1?</li>
            <li><strong>Act-by-Act Insights:</strong> One key concept from each Act with specific article references</li>
            <li><strong>Central Question Synthesis:</strong> Your answer drawing on all four Acts</li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          <strong>TIMING:</strong> Unlocks after completing all weekly conversations and Midterm. Submission available during Finals Week (May 11–16, 2026).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-purple-100">
                <th className="text-left p-2 border border-purple-200 font-semibold">Criterion</th>
                <th className="text-center p-2 border border-purple-200 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border border-gray-200">Opening Reflection: Genuine reflection on growth</td><td className="text-center p-2 border border-gray-200">2 pts</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border border-gray-200">Act I Insight: Accurate concept, specific reference</td><td className="text-center p-2 border border-gray-200">3 pts</td></tr>
              <tr><td className="p-2 border border-gray-200">Act II Insight: Accurate concept, specific reference</td><td className="text-center p-2 border border-gray-200">3 pts</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border border-gray-200">Act III Insight: Accurate concept, specific reference</td><td className="text-center p-2 border border-gray-200">3 pts</td></tr>
              <tr><td className="p-2 border border-gray-200">Act IV Insight: Accurate concept, specific reference</td><td className="text-center p-2 border border-gray-200">3 pts</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border border-gray-200">Central Question Synthesis: Coherent answer drawing on all Acts</td><td className="text-center p-2 border border-gray-200">6 pts</td></tr>
              <tr><td className="p-2 border border-gray-200">Clarity: Writing is clear and unified</td><td className="text-center p-2 border border-gray-200">4 pts</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Why This Format */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">Why This Format?</h3>
        <p className="text-gray-600 mb-2">
          Traditional exams test memorization. You cram, you regurgitate, you forget. That does not prepare you for clinical work.
        </p>
        <p className="text-gray-700 mb-2">
          <strong>This format tests understanding.</strong> The conversation reveals whether you genuinely comprehend the material. You cannot fake your way through a 45-minute dialogue where the Mirror keeps asking "why?" and "how do you know?" and "what does that connect to?"
        </p>
        <p className="text-gray-600">
          The Mirror scaffolds your thinking without replacing it. It helps you organize and articulate what you already understand. If you don't understand the material, the conversation will make that obvious—to you and to me.
        </p>
      </div>

      {/* If You're Struggling */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          If You're Struggling
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-blue-800 text-sm">
            <strong>USE THE SCAFFOLDING:</strong> NotebookLM podcasts, briefing docs, flashcards, quizzes, and chat are all available for every article.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>REVISE AND RESUBMIT:</strong> "Not Yet" is not a failing grade. It means you're not done yet.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>COME TO OFFICE HOURS:</strong> Available by appointment. The ISA and SI Leader are also available.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>TALK TO ME EARLY:</strong> If life circumstances are making it impossible to keep up, tell me before you're buried.
          </p>
        </div>
        <p className="text-sm text-gray-700 mt-3 font-medium">
          The only way to fail this course is to disengage entirely. If you show up, do the work, and use the resources available, you will succeed.
        </p>
      </div>
    </div>
  )
}
