"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Target,
  Brain,
  Stethoscope,
  MessageSquare,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type AreasAddressed,
  RUBRIC_AREAS,
  MIN_EXCHANGES,
  countAddressedAreas,
} from "@/lib/conversation-flow"
import type { WeekData } from "@/lib/weeks-data"

interface ConversationGuideProps {
  weekNumber: number
  weekInfo: WeekData | undefined
  areasAddressed: AreasAddressed
  exchangeCount: number
  isExpanded: boolean
  onToggle: () => void
}

// Map icon names to components
const iconMap = {
  BookOpen,
  Target,
  Brain,
  Stethoscope,
  MessageSquare,
}

export function ConversationGuide({
  weekNumber,
  weekInfo,
  areasAddressed,
  exchangeCount,
  isExpanded,
  onToggle,
}: ConversationGuideProps) {
  const addressedCount = countAddressedAreas(areasAddressed)
  const totalAreas = RUBRIC_AREAS.length
  const meetsMinExchanges = exchangeCount >= MIN_EXCHANGES

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4"
    >
      <div className="rounded-2xl bg-white border border-amber-200/50 shadow-sm overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 hover:bg-amber-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Week {weekNumber}: {weekInfo?.topic}
              </h3>
              {weekInfo?.article && (
                <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">
                  {weekInfo.article.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className={cn(
                "px-2 py-1 rounded-full font-medium",
                addressedCount >= 4 ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
              )}>
                {addressedCount}/{totalAreas} areas
              </span>
              <span className={cn(
                "px-2 py-1 rounded-full font-medium",
                meetsMinExchanges ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
              )}>
                {exchangeCount}/{MIN_EXCHANGES} exchanges
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Collapsible content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Divider */}
                <div className="border-t border-amber-100" />

                {/* Scoring Criteria Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-700">Scoring Criteria</span>
                  </div>
                  <div className="space-y-2">
                    {RUBRIC_AREAS.map((area) => {
                      const IconComponent = iconMap[area.icon]
                      const isAddressed = areasAddressed[area.id]

                      return (
                        <div
                          key={area.id}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-xl transition-colors",
                            isAddressed ? "bg-teal-50" : "bg-gray-50"
                          )}
                        >
                          {isAddressed ? (
                            <CheckCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <IconComponent className={cn(
                                "w-4 h-4 shrink-0",
                                isAddressed ? "text-teal-600" : "text-gray-400"
                              )} />
                              <span className={cn(
                                "text-sm font-medium",
                                isAddressed ? "text-teal-700" : "text-gray-700"
                              )}>
                                {area.name}
                              </span>
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                isAddressed ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-500"
                              )}>
                                {area.points}
                              </span>
                            </div>
                            <p className={cn(
                              "text-xs mt-0.5",
                              isAddressed ? "text-teal-600" : "text-gray-500"
                            )}>
                              {area.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Requirements Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-700">Requirements</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    meetsMinExchanges ? "bg-teal-50" : "bg-amber-50"
                  )}>
                    {meetsMinExchanges ? (
                      <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        meetsMinExchanges ? "text-teal-700" : "text-amber-700"
                      )}>
                        {exchangeCount} of {MIN_EXCHANGES} substantive exchanges
                      </p>
                      <p className={cn(
                        "text-xs",
                        meetsMinExchanges ? "text-teal-600" : "text-amber-600"
                      )}>
                        {meetsMinExchanges
                          ? "Minimum requirement met"
                          : `${MIN_EXCHANGES - exchangeCount} more exchange${MIN_EXCHANGES - exchangeCount !== 1 ? 's' : ''} needed`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips when not all areas addressed */}
                {addressedCount < totalAreas && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-700">
                          Keep engaging to address all areas
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          The Mirror will naturally guide you through each rubric area as you discuss the article.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
