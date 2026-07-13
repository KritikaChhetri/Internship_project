import { useState, useMemo } from "react";

export default function ProductTable({ data = [] }) {
  const [sortKey, setSortKey] = useState("revenue");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const columns = [
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "unitsSold", label: "Units sold" },
    { key: "revenue", label: "Revenue" },
  ];

  if (!data.length) {
    return <p className="text-xs text-ink-500 dark:text-white/40 py-10 text-center">No products for this range.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 dark:text-white/40 border-b border-ink-900/10 dark:border-white/10">
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => toggleSort(col.key)}
              className="py-2 px-3 cursor-pointer select-none hover:text-ink-900 dark:hover:text-white"
            >
              {col.label} {sortKey === col.key && (sortDir === "asc" ? "↑" : "↓")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.id} className="border-b border-ink-900/5 dark:border-white/5 last:border-0">
            <td className="py-2.5 px-3 font-500">{row.name}</td>
            <td className="py-2.5 px-3 text-ink-500 dark:text-white/50">{row.category}</td>
            <td className="py-2.5 px-3 font-mono">{row.unitsSold}</td>
            <td className="py-2.5 px-3 font-mono">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
