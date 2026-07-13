import { useEffect, useState, useCallback } from "react";
import KpiCard from "../components/KpiCard";
import FilterBar from "../components/FilterBar";
import RevenueLineChart from "../components/charts/RevenueLineChart";
import RegionDonutChart from "../components/charts/RegionDonutChart";
import CategoryBarChart from "../components/charts/CategoryBarChart";
import ProductTable from "../components/ProductTable";
import {
  getKpis,
  getRevenueTrend,
  getSalesByCategory,
  getSalesByRegion,
  getTopProducts,
  getFilterOptions,
  exportCsvUrl,
  exportPdfUrl,
} from "../api/client";

// Customizable dashboard: each widget can be shown/hidden, saved per-browser.
const WIDGETS = [
  { id: "kpi_revenue", label: "Total revenue" },
  { id: "kpi_orders", label: "Total orders" },
  { id: "kpi_aov", label: "Avg order value" },
  { id: "kpi_topCategory", label: "Top category" },
  { id: "kpi_growth", label: "Growth %" },
  { id: "chart_trend", label: "Revenue trend chart" },
  { id: "chart_region", label: "Revenue by region chart" },
  { id: "chart_category", label: "Sales by category chart" },
  { id: "chart_topProducts", label: "Top 10 products table" },
];

const STORAGE_KEY = "bi-dashboard-widgets";

function loadVisibility() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...Object.fromEntries(WIDGETS.map((w) => [w.id, true])), ...parsed };
    }
  } catch {
    // ignore corrupt storage, fall through to defaults
  }
  return Object.fromEntries(WIDGETS.map((w) => [w.id, true]));
}

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({ categories: [], regions: [] });
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byRegion, setByRegion] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visibility, setVisibility] = useState(loadVisibility);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  }, [visibility]);

  const isVisible = (id) => visibility[id] !== false;
  const toggleWidget = (id) => setVisibility((v) => ({ ...v, [id]: !isVisible(id) }));
  const resetWidgets = () => setVisibility(Object.fromEntries(WIDGETS.map((w) => [w.id, true])));
  const anyVisible = WIDGETS.some((w) => isVisible(w.id));

  const cleanParams = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = cleanParams(filters);
    try {
      const [kpisRes, trendRes, catRes, regionRes, productsRes] = await Promise.all([
        getKpis(params),
        getRevenueTrend(params),
        getSalesByCategory(params),
        getSalesByRegion(params),
        getTopProducts({ ...params, limit: 10 }),
      ]);
      setKpis(kpisRes);
      setTrend(trendRes);
      setByCategory(catRes);
      setByRegion(regionRes);
      setTopProducts(productsRes);
    } catch (err) {
      console.error(err);
      setError("Couldn't reach the API. Check that the backend is running and VITE_API_URL is correct.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-negative">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-600 text-ink-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-ink-500 dark:text-white/40 mt-0.5">Sales performance at a glance</p>
        </div>
        <button
          onClick={() => setCustomizing((c) => !c)}
          className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
            customizing
              ? "bg-accent text-white border-accent"
              : "border-ink-900/10 dark:border-white/10 text-ink-700 dark:text-white/80 hover:bg-ink-900/5 dark:hover:bg-white/5"
          }`}
        >
          {customizing ? "Done customizing" : "Customize dashboard"}
        </button>
      </div>

      {customizing && (
        <div className="card p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-500 text-ink-700 dark:text-white/70">Choose what to show on your dashboard</p>
            <button onClick={resetWidgets} className="text-[11px] text-accent hover:underline">
              Reset to default
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {WIDGETS.map((w) => (
              <label key={w.id} className="flex items-center gap-2 text-xs text-ink-700 dark:text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible(w.id)}
                  onChange={() => toggleWidget(w.id)}
                  className="accent-accent"
                />
                {w.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={filterOptions.categories}
        regions={filterOptions.regions}
        onExportCsv={() => window.open(exportCsvUrl(cleanParams(filters)), "_blank")}
        onExportPdf={() => window.open(exportPdfUrl(cleanParams(filters)), "_blank")}
      />

      {!anyVisible && (
        <div className="card p-8 text-center mb-5">
          <p className="text-sm text-ink-500 dark:text-white/40">
            Everything is hidden. Open "Customize dashboard" to bring widgets back.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {isVisible("kpi_revenue") && (
          <KpiCard label="Total revenue" value={kpis ? `$${kpis.totalRevenue.toLocaleString()}` : "—"} />
        )}
        {isVisible("kpi_orders") && <KpiCard label="Total orders" value={kpis ? kpis.totalOrders.toLocaleString() : "—"} />}
        {isVisible("kpi_aov") && (
          <KpiCard label="Avg order value" value={kpis ? `$${kpis.avgOrderValue.toFixed(2)}` : "—"} />
        )}
        {isVisible("kpi_topCategory") && <KpiCard label="Top category" value={kpis ? kpis.topCategory : "—"} />}
        {isVisible("kpi_growth") && (
          <KpiCard
            label="Growth"
            value={kpis ? `${kpis.growthPct > 0 ? "+" : ""}${kpis.growthPct}%` : "—"}
            sublabel="vs previous period"
            trend={kpis ? (kpis.growthPct > 0 ? "up" : kpis.growthPct < 0 ? "down" : "flat") : null}
          />
        )}
      </div>

      {(isVisible("chart_trend") || isVisible("chart_region")) && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
          {isVisible("chart_trend") && (
            <div className="card p-5">
              <p className="text-sm font-500 text-ink-700 dark:text-white/70 mb-2">Revenue trend</p>
              <RevenueLineChart data={trend} />
            </div>
          )}
          {isVisible("chart_region") && (
            <div className="card p-5">
              <p className="text-sm font-500 text-ink-700 dark:text-white/70 mb-2">Revenue by region</p>
              <RegionDonutChart data={byRegion} />
            </div>
          )}
        </div>
      )}

      {(isVisible("chart_category") || isVisible("chart_topProducts")) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isVisible("chart_category") && (
            <div className="card p-5">
              <p className="text-sm font-500 text-ink-700 dark:text-white/70 mb-2">Sales by category</p>
              <CategoryBarChart data={byCategory} />
            </div>
          )}
          {isVisible("chart_topProducts") && (
            <div className="card p-5">
              <p className="text-sm font-500 text-ink-700 dark:text-white/70 mb-2">Top 10 products</p>
              <ProductTable data={topProducts} />
            </div>
          )}
        </div>
      )}

      {loading && <p className="text-xs text-ink-500 dark:text-white/40 mt-4">Refreshing…</p>}
    </div>
  );
}