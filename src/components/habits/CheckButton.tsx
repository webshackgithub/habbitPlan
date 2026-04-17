"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTransition } from "react";

interface CheckButtonProps {
  isCompleted: boolean;
  onToggle: () => void;
  isToday?: boolean;
}

export function CheckButton({ isCompleted, onToggle, isToday }: CheckButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(onToggle)}
      disabled={isPending}
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border-2",
        isCompleted
          ? "bg-primary border-primary text-white"
          : "bg-white border-slate-200 hover:border-primary/50",
        isToday && !isCompleted && "ring-2 ring-primary ring-offset-2",
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      {isCompleted && <Check className="w-4 h-4" />}
    </button>
  );
}
