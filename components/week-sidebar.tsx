"use client"

import { weeksData, acts } from "@/lib/weeks-data"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface WeekSidebarProps {
  selectedWeek: number
  onWeekSelect: (week: number) => void
}

export function WeekSidebar({ selectedWeek, onWeekSelect }: WeekSidebarProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200/50 hidden lg:block">
        <h2 className="font-semibold text-gray-900">Course Weeks</h2>
        <p className="text-sm text-gray-500 mt-1">Critical Reasoning Mirror</p>
      </div>
      <nav className="p-2">
        {acts.map((act, actIndex) => {
          const actWeeks = weeksData.filter((w) => w.act === act.number)
          return (
            <motion.div
              key={act.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: actIndex * 0.1 }}
              className="mb-4"
            >
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Act {act.number}: {act.title}
                </h3>
              </div>
              <div className="space-y-1">
                {actWeeks.map((week, weekIndex) => (
                  <motion.button
                    key={week.week}
                    onClick={() => onWeekSelect(week.week)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: actIndex * 0.1 + weekIndex * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden",
                      selectedWeek === week.week
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                        : "text-gray-700 hover:bg-gray-100/80 hover:shadow-sm",
                    )}
                  >
                    {selectedWeek === week.week && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}
                    <span className="relative z-10">
                      <span className="font-medium">Week {week.week}:</span> {week.topic}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )
        })}
      </nav>
    </div>
  )
}
