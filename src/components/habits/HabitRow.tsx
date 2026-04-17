"use client";

import { CheckButton } from "./CheckButton";
import { toggleCompletion } from "@/lib/actions";
import { getDaysInMonth, format, isSameDay, startOfMonth, addDays } from "date-fns";

interface HabitRowProps {
  habit: {
    id: number;
    name: string;
    targetMonth: string;
    completions: { checkDate: Date }[];
  };
  days: Date[];
}

export function HabitRow({ habit, days }: HabitRowProps) {
  const today = new Date();

  const handleToggle = async (date: Date) => {
    const completion = habit.completions.find((c) => 
      isSameDay(new Date(c.checkDate), date)
    );
    await toggleCompletion(habit.id, date, !completion);
  };

  return (
    <div className="flex items-center group">
      <div className="w-40 flex-shrink-0 font-medium text-sm text-slate-700 sticky left-0 bg-white z-20 py-2 pl-6 pr-4 border-r border-slate-100">
        <span className="truncate block" title={habit.name}>
          {habit.name}
        </span>
      </div>
      <div className="flex gap-2 px-4">
        {days.map((day) => {
          const isCompleted = habit.completions.some((c) =>
            isSameDay(new Date(c.checkDate), day)
          );
          return (
            <div key={day.toISOString()} className="w-8 h-8 flex items-center justify-center">
              <CheckButton
                isCompleted={isCompleted}
                isToday={isSameDay(day, today)}
                onToggle={() => handleToggle(day)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
