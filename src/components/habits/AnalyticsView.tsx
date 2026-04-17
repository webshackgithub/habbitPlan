"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementLineChart } from "./AchievementLineChart";
import { HabitRankingBarChart } from "./HabitRankingBarChart";
import { LongTermTrendChart } from "./LongTermTrendChart";
import { getDaysInMonth, format, addDays, isSameDay } from "date-fns";

interface AnalyticsViewProps {
  habits: any[];
  trendData: any[];
  targetMonth: string;
}

export function AnalyticsView({ habits, trendData, targetMonth }: AnalyticsViewProps) {
  if (habits.length === 0 && trendData.every(d => d.rate === 0)) return null;

  const monthDate = new Date(`${targetMonth}-01`);
  const daysInMonth = getDaysInMonth(monthDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(monthDate, i));

  // Calculate daily achievement rates for Line Chart
  const lineData = days.map((day) => {
    const completionsCount = habits.filter((habit) =>
      habit.completions.some((c: any) => isSameDay(new Date(c.checkDate), day))
    ).length;
    return {
      day: format(day, "d"),
      rate: habits.length > 0 ? (completionsCount / habits.length) * 100 : 0,
    };
  });

  // Calculate habit-specific achievement rates for Bar Chart
  const barData = habits.map((habit) => {
    const count = habit.completions.length;
    return {
      name: habit.name,
      rate: (count / daysInMonth) * 100,
      count,
    };
  }).sort((a, b) => b.rate - a.rate);

  const totalPossible = habits.length * daysInMonth;
  const totalCompleted = habits.reduce((acc, h) => acc + h.completions.length, 0);
  const overallRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

  return (
    <div className="mt-12 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">전체 달성률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">가장 꾸준한 습관</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 truncate">
              {barData[0]?.name || "-"}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">총 실천 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800">{totalCompleted}회</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">심층 분석</h2>
          <TabsList className="bg-slate-100/50 p-1">
            <TabsTrigger value="monthly" className="text-xs sm:text-sm">이달의 분석</TabsTrigger>
            <TabsTrigger value="trend" className="text-xs sm:text-sm">장기 추이</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">일별 실천 추이</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <AchievementLineChart data={lineData} />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">습관별 랭킹</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <HabitRankingBarChart data={barData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="mt-0 focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">최근 6개월 성장 곡선</CardTitle>
                <div className="text-xs text-slate-400">월별 평균 달성률 (%)</div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <LongTermTrendChart data={trendData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
