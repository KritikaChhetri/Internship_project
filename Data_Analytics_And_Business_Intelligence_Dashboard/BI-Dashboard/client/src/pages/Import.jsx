import { useEffect, useState, useCallback } from "react";
import ImportUpload from "../components/ImportUpload";
import ImportFromUrl from "../components/ImportFromUrl";
import ImportHistory from "../components/ImportHistory";
import { getImportHistory } from "../api/client";

export default function Import() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("file"); // "file" | "url"

  const loadHistory = useCallback(() => {
    setLoading(true);
    getImportHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-600 text-ink-900 dark:text-white">Import data</h1>
        <p className="text-xs text-ink-500 dark:text-white/40 mt-0.5">
          Bring in your own sales data — from a file, or directly from a public link
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSource("file")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            source === "file" ? "bg-accent text-white" : "bg-ink-900/5 dark:bg-white/10 text-ink-700 dark:text-white/70"
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => setSource("url")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
            source === "url" ? "bg-accent text-white" : "bg-ink-900/5 dark:bg-white/10 text-ink-700 dark:text-white/70"
          }`}
        >
          Import from URL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        {source === "file" ? <ImportUpload onImported={loadHistory} /> : <ImportFromUrl onImported={loadHistory} />}

        <div className="card p-5">
          <p className="text-sm font-500 text-ink-700 dark:text-white/70 mb-3">Import history</p>
          {loading ? (
            <p className="text-xs text-ink-500 dark:text-white/40 py-10 text-center">Loading…</p>
          ) : (
            <ImportHistory data={history} />
          )}
        </div>
      </div>
    </div>
  );
}