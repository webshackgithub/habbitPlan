import { getHabits, getSixMonthsTrend } from "@/lib/actions";
import { MonthlyBoard } from "@/components/habits/MonthlyBoard";
import { MonthSelector } from "@/components/habits/MonthSelector";
import { AnalyticsView } from "@/components/habits/AnalyticsView";
import { format } from "date-fns";
import { Suspense } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const currentMonth = params.month || format(new Date(), "yyyy-MM");
  
  const [habits, trendData] = await Promise.all([
    getHabits(currentMonth),
    getSixMonthsTrend(currentMonth),
  ]);

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Monthly Check
            </h1>
            <p className="text-slate-500 mt-2">
              작은 습관이 모여 큰 변화를 만듭니다.
            </p>
          </div>
          <MonthSelector currentMonth={currentMonth} />
        </header>

        <Suspense fallback={<div>Loading...</div>}>
          <MonthlyBoard habits={habits} targetMonth={currentMonth} />
        </Suspense>
        
        <AnalyticsView habits={habits} trendData={trendData} targetMonth={currentMonth} />
      </div>
    </main>
  );
}
