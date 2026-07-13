export default function KpiCard({ label, value, sublabel, trend }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] uppercase tracking-wide text-ink-500 dark:text-white/40 mb-2">{label}</p>
      <p className="stat-figure text-2xl font-600 text-ink-900 dark:text-white">{value}</p>
      {sublabel && (
        <p
          className={`text-xs mt-1.5 font-500 ${
            trend === "up" ? "text-positive" : trend === "down" ? "text-negative" : "text-ink-500 dark:text-white/40"
          }`}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
}
