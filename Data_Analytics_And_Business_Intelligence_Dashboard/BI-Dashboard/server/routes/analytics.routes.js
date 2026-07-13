const express = require("express");
const router = express.Router();
const {
  getKpis,
  getRevenueTrend,
  getSalesByCategory,
  getSalesByRegion,
  getTopProducts,
  getFilterOptions,
} = require("../controllers/analytics.controller");

router.get("/kpis", getKpis);
router.get("/revenue-trend", getRevenueTrend);
router.get("/sales-by-category", getSalesByCategory);
router.get("/sales-by-region", getSalesByRegion);
router.get("/top-products", getTopProducts);
router.get("/filter-options", getFilterOptions);

module.exports = router;
