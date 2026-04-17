"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HabitRankingBarChartProps {
  data: any[];
}

export function HabitRankingBarChart({ data }: HabitRankingBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          width={80}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "달성률"]}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? "#10B981" : "#6366F1"}
              fillOpacity={1 - index * 0.1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
