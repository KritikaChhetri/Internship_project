import { useEffect, useState } from "react";
import FilterBar from "../components/FilterBar";
import ProductTable from "../components/ProductTable";
import { getTopProducts, getFilterOptions } from "../api/client";

export default function Products() {
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({ categories: [], regions: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cleanParams = (f) => Object.fromEntries(Object.entries(f).filter(([, v]) => v));

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getTopProducts({ ...cleanParams(filters), limit: 50 })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-600 text-ink-900 dark:text-white">Products</h1>
        <p className="text-xs text-ink-500 dark:text-white/40 mt-0.5">All products ranked by revenue</p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} categories={filterOptions.categories} regions={filterOptions.regions} />

      <div className="card p-5">
        {loading ? (
          <p className="text-xs text-ink-500 dark:text-white/40 py-10 text-center">Loading…</p>
        ) : (
          <ProductTable data={products} />
        )}
      </div>
    </div>
  );
}
