import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RevenueLineChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-xs text-ink-500 dark:text-white/40 py-10 text-center">No data for this range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-900/5 dark:text-white/5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9AA2B1" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9AA2B1" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E4E7EC" }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#3454D1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
