export default function FilterBar({ filters, onChange, categories = [], regions = [], onExportCsv, onExportPdf }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <input
        type="date"
        value={filters.startDate || ""}
        onChange={(e) => update("startDate", e.target.value)}
        className="text-xs px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-surface-darksubtle text-ink-700 dark:text-white/80"
      />
      <span className="text-xs text-ink-500 dark:text-white/40">to</span>
      <input
        type="date"
        value={filters.endDate || ""}
        onChange={(e) => update("endDate", e.target.value)}
        className="text-xs px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-surface-darksubtle text-ink-700 dark:text-white/80"
      />

      <select
        value={filters.category || ""}
        onChange={(e) => update("category", e.target.value)}
        className="text-xs px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-surface-darksubtle text-ink-700 dark:text-white/80"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.region || ""}
        onChange={(e) => update("region", e.target.value)}
        className="text-xs px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-surface-darksubtle text-ink-700 dark:text-white/80"
      >
        <option value="">All regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {(filters.startDate || filters.endDate || filters.category || filters.region) && (
        <button
          onClick={() => onChange({})}
          className="text-xs px-3 py-2 text-ink-500 dark:text-white/40 hover:text-ink-900 dark:hover:text-white"
        >
          Clear filters
        </button>
      )}

      {(onExportCsv || onExportPdf) && (
        <div className="ml-auto flex items-center gap-2">
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="text-xs px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 text-ink-700 dark:text-white/80 hover:bg-ink-900/5 dark:hover:bg-white/5 transition-colors"
            >
              Export CSV
            </button>
          )}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="text-xs px-3 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors"
            >
              Export PDF report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
