import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3454D1", "#1A8754", "#D9A441", "#D33C3C", "#7E57C2"];

export default function RegionDonutChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-xs text-ink-500 dark:text-white/40 py-10 text-center">No data for this range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="region"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4E7EC" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
