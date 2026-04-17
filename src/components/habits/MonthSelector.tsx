"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";

interface MonthSelectorProps {
  currentMonth: string;
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = parse(currentMonth, "yyyy-MM", new Date());

  const navigate = (newDate: Date) => {
    const formatted = format(newDate, "yyyy-MM");
    const params = new URLSearchParams(searchParams);
    params.set("month", formatted);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => navigate(subMonths(date, 1))}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-semibold text-slate-700 min-w-[100px] text-center">
        {format(date, "yyyy년 M월", { locale: ko })}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8"
        onClick={() => navigate(addMonths(date, 1))}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
