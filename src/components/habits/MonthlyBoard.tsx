"use client";

import { useState, useEffect, useRef } from "react";
import { HabitRow } from "./HabitRow";
import { Button } from "@/components/ui/button";
import { AddHabitModal } from "./AddHabitModal";
import { ManageHabitsSheet } from "./ManageHabitsSheet";
import { Plus, Copy, Settings } from "lucide-react";
import { getDaysInMonth, addDays, format, isSameDay } from "date-fns";
import { copyHabitsFromPreviousMonth } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface MonthlyBoardProps {
  habits: any[];
  targetMonth: string;
}

export function MonthlyBoard({ habits, targetMonth }: MonthlyBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  
  const monthDate = new Date(`${targetMonth}-01`);
  const daysInMonth = getDaysInMonth(monthDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthDate, i));
  const today = new Date();

  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayElement = todayRef.current;
      const scrollPos = todayElement.offsetLeft - container.offsetWidth / 2 + todayElement.offsetWidth / 2;
      container.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  }, [targetMonth]);

  const handleCopy = async () => {
    if (confirm("지난달의 습관 목록을 가져오시겠습니까? (기존 목록이 유지된 상태로 추가됩니다)")) {
      await copyHabitsFromPreviousMonth(targetMonth);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">이달의 습관</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-slate-600"
            onClick={() => setIsManageOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            전월 복사
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            습관 추가
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
        <div className="min-w-max">
          {/* Header row with dates */}
          <div className="flex items-center border-b border-slate-100">
            <div className="w-40 flex-shrink-0 sticky left-0 bg-white z-20 py-4 pl-6 pr-4 border-r border-slate-100"></div>
            <div className="flex gap-2 px-4">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  ref={isSameDay(day, today) ? todayRef : null}
                  className={cn(
                    "w-8 flex flex-col items-center justify-center py-2",
                    isSameDay(day, today) && "text-primary font-bold"
                  )}
                >
                  <span className="text-[10px] uppercase text-slate-400 font-medium">
                    {format(day, "eee")}
                  </span>
                  <span className="text-sm">{format(day, "d")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Habit rows */}
          <div className="divide-y divide-slate-50">
            {habits.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                등록된 습관이 없습니다. 새로운 습관을 추가해 보세요!
              </div>
            ) : (
              habits.map((habit) => (
                <HabitRow key={habit.id} habit={habit} days={days} />
              ))
            )}
          </div>
        </div>
      </div>

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetMonth={targetMonth}
      />

      <ManageHabitsSheet
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        habits={habits}
      />
    </div>
  );
}
