"use client"

import { weeksData, acts } from "@/lib/weeks-data"
import { cn } from "@/lib/utils"

interface WeekSidebarProps {
  selectedWeek: number
  onWeekSelect: (week: number) => void
}

export function WeekSidebar({ selectedWeek, onWeekSelect }: WeekSidebarProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 hidden lg:block">
        <h2 className="font-semibold text-gray-900">Course Weeks</h2>
        <p className="text-sm text-gray-500 mt-1">Critical Reasoning Mirror</p>
      </div>
      <nav className="p-2">
        {acts.map((act) => {
          const actWeeks = weeksData.filter((w) => w.act === act.number)
          return (
            <div key={act.number} className="mb-4">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Act {act.number}: {act.title}
                </h3>
              </div>
              <div className="space-y-1">
                {actWeeks.map((week) => (
                  <button
                    key={week.week}
                    onClick={() => onWeekSelect(week.week)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedWeek === week.week ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <span className="font-medium">Week {week.week}:</span> {week.topic}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
