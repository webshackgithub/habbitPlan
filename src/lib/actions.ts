"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { startOfMonth, subMonths, format, getDaysInMonth } from "date-fns";

export async function getHabits(targetMonth: string) {
  return await prisma.habit.findMany({
    where: { targetMonth },
    include: {
      completions: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function addHabit(name: string, targetMonth: string) {
  const habit = await prisma.habit.create({
    data: {
      name,
      targetMonth,
    },
  });
  revalidatePath("/");
  return habit;
}

export async function updateHabit(id: number, name: string) {
  const habit = await prisma.habit.update({
    where: { id },
    data: { name },
  });
  revalidatePath("/");
  return habit;
}

export async function deleteHabit(id: number) {
  await prisma.habit.delete({
    where: { id },
  });
  revalidatePath("/");
}

export async function toggleCompletion(
  habitId: number,
  checkDate: Date,
  isCompleted: boolean
) {
  if (isCompleted) {
    await prisma.completion.upsert({
      where: {
        habitId_checkDate: {
          habitId,
          checkDate,
        },
      },
      update: { isCompleted: true },
      create: {
        habitId,
        checkDate,
        isCompleted: true,
      },
    });
  } else {
    await prisma.completion.deleteMany({
      where: {
        habitId,
        checkDate,
      },
    });
  }
  revalidatePath("/");
}

export async function copyHabitsFromPreviousMonth(targetMonth: string) {
  const currentMonthDate = new Date(`${targetMonth}-01`);
  const prevMonthDate = subMonths(currentMonthDate, 1);
  const prevMonthStr = format(prevMonthDate, "yyyy-MM");

  const prevHabits = await prisma.habit.findMany({
    where: { targetMonth: prevMonthStr },
  });

  if (prevHabits.length === 0) return { count: 0 };

  const newHabitsData = prevHabits.map((h) => ({
    name: h.name,
    targetMonth,
  }));

  const result = await prisma.habit.createMany({
    data: newHabitsData,
  });

  revalidatePath("/");
  return result;
}

export async function getSixMonthsTrend(targetMonth: string) {
  const months = [];
  const currentDate = new Date(`${targetMonth}-01`);

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    months.push(format(date, "yyyy-MM"));
  }

  const trendData = await Promise.all(
    months.map(async (month) => {
      const monthDate = new Date(`${month}-01`);
      const daysInMonth = getDaysInMonth(monthDate);
      
      const habits = await prisma.habit.findMany({
        where: { targetMonth: month },
        include: { completions: true },
      });

      const totalPossible = habits.length * daysInMonth;
      const totalCompleted = habits.reduce((acc, h) => acc + h.completions.length, 0);
      const rate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

      return {
        month: format(monthDate, "M월"),
        rate: Number(rate.toFixed(1)),
      };
    })
  );

  return trendData;
}
