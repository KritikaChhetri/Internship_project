const statusStyles = {
  success: "bg-positive/10 text-positive",
  partial: "bg-amber-500/10 text-amber-600",
  failed: "bg-negative/10 text-negative",
};

export default function ImportHistory({ data = [] }) {
  if (!data.length) {
    return <p className="text-xs text-ink-500 dark:text-white/40 py-6 text-center">No imports yet.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 dark:text-white/40 border-b border-ink-900/10 dark:border-white/10">
          <th className="py-2 px-3">File</th>
          <th className="py-2 px-3">Type</th>
          <th className="py-2 px-3">Rows</th>
          <th className="py-2 px-3">Skipped</th>
          <th className="py-2 px-3">Status</th>
          <th className="py-2 px-3">When</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b border-ink-900/5 dark:border-white/5 last:border-0">
            <td className="py-2.5 px-3 font-500">{row.filename}</td>
            <td className="py-2.5 px-3 text-ink-500 dark:text-white/50 uppercase text-xs">{row.source_type}</td>
            <td className="py-2.5 px-3 font-mono">{row.row_count}</td>
            <td className="py-2.5 px-3 font-mono">{row.rows_skipped}</td>
            <td className="py-2.5 px-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusStyles[row.status] || ""}`}>
                {row.status}
              </span>
            </td>
            <td className="py-2.5 px-3 text-ink-500 dark:text-white/50 text-xs">
              {new Date(row.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
