import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL });

export const getKpis = (params) => api.get("/kpis", { params }).then((r) => r.data);
export const getRevenueTrend = (params) => api.get("/revenue-trend", { params }).then((r) => r.data);
export const getSalesByCategory = (params) => api.get("/sales-by-category", { params }).then((r) => r.data);
export const getSalesByRegion = (params) => api.get("/sales-by-region", { params }).then((r) => r.data);
export const getTopProducts = (params) => api.get("/top-products", { params }).then((r) => r.data);
export const getFilterOptions = () => api.get("/filter-options").then((r) => r.data);
export const getImportHistory = () => api.get("/imports").then((r) => r.data);

export const uploadImportFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const importFromUrl = (url) => api.post("/import-url", { url }).then((r) => r.data);

export const exportCsvUrl = (params) => `${baseURL}/export?${new URLSearchParams(params).toString()}`;
export const exportPdfUrl = (params) => `${baseURL}/export/pdf?${new URLSearchParams(params).toString()}`;

export default api;