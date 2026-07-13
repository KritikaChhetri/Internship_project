import { useState, useRef } from "react";
import { uploadImportFile } from "../api/client";

const EXPECTED_COLUMNS = ["customer_name", "order_date", "region", "category", "product_name", "price", "quantity"];

export default function ImportUpload({ onImported }) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setStatus("error");
      setResult({ error: "Only .csv and .xlsx files are supported." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setResult({ error: "File is larger than 5MB." });
      return;
    }

    setStatus("uploading");
    try {
      const res = await uploadImportFile(file);
      setStatus("success");
      setResult(res.data);
      onImported?.();
    } catch (err) {
      setStatus("error");
      setResult(err.response?.data || { error: "Import failed" });
    }
  };

  return (
    <div className="card p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl py-10 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-accent bg-accent-light dark:bg-accent/10"
            : "border-ink-900/15 dark:border-white/15 hover:border-ink-900/30 dark:hover:border-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <p className="text-sm font-500 text-ink-900 dark:text-white">Drop a CSV or Excel file, or click to browse</p>
        <p className="text-xs text-ink-500 dark:text-white/40 mt-1">Max 5MB · .csv or .xlsx</p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-wide text-ink-500 dark:text-white/40 mb-1.5">Expected columns</p>
        <div className="flex flex-wrap gap-1.5">
          {EXPECTED_COLUMNS.map((c) => (
            <code
              key={c}
              className="text-[11px] bg-ink-900/5 dark:bg-white/10 text-ink-700 dark:text-white/70 px-2 py-1 rounded-md"
            >
              {c}
            </code>
          ))}
        </div>
        <p className="text-xs text-ink-500 dark:text-white/40 mt-2">
          One row = one product line in an order. Rows for the same customer, date, and region are grouped into a
          single order automatically.
        </p>
      </div>

      {status === "uploading" && <p className="text-xs text-accent mt-4">Uploading and processing…</p>}

      {status === "success" && result && (
        <div className="mt-4 text-xs bg-positive/10 text-positive rounded-lg px-3 py-2.5">
          Imported {result.rowsImported} rows into {result.ordersCreated} orders.
          {result.rowsSkipped > 0 && ` ${result.rowsSkipped} rows skipped (missing/invalid fields).`}
        </div>
      )}

      {status === "error" && result && (
        <div className="mt-4 text-xs bg-negative/10 text-negative rounded-lg px-3 py-2.5">
          {result.error}
          {result.missingColumns && (
            <span> Missing: {result.missingColumns.join(", ")}</span>
          )}
        </div>
      )}
    </div>
  );
}
