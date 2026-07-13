import { useState } from "react";
import { importFromUrl } from "../api/client";

export default function ImportFromUrl({ onImported }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus("uploading");
    setResult(null);
    try {
      const res = await importFromUrl(url.trim());
      setStatus("success");
      setResult(res);
      onImported?.();
    } catch (err) {
      setStatus("error");
      setResult(err.response?.data || { error: "Import failed" });
    }
  };

  return (
    <div className="card p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-sm font-500 text-ink-700 dark:text-white/70 block">Public CSV URL</label>
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
          className="w-full text-sm px-3 py-2 rounded-lg border border-ink-900/10 dark:border-white/10 bg-surface dark:bg-surface-darksubtle text-ink-700 dark:text-white/80"
        />
        <p className="text-xs text-ink-500 dark:text-white/40">
          Works with any public .csv link — including a Google Sheet published as CSV (File → Share → Publish to
          web → choose CSV).
        </p>
        <button
          type="submit"
          disabled={status === "uploading"}
          className="text-xs px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {status === "uploading" ? "Importing…" : "Import from URL"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="mt-4 text-xs bg-positive/10 text-positive rounded-lg px-3 py-2.5">
          Imported {result.rowsImported} rows into {result.ordersCreated} orders.
          {result.rowsSkipped > 0 && ` ${result.rowsSkipped} rows skipped (missing/invalid fields).`}
        </div>
      )}

      {status === "error" && result && (
        <div className="mt-4 text-xs bg-negative/10 text-negative rounded-lg px-3 py-2.5">
          {result.error}
          {result.missingColumns && <span> Missing: {result.missingColumns.join(", ")}</span>}
        </div>
      )}
    </div>
  );
}