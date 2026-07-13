const pool = require("../db");

// All endpoints accept optional query params: startDate, endDate, category, region
// They build a shared WHERE clause so filters stay in sync across every chart.

function buildOrderFilters(query, startIndex = 1) {
  const clauses = [];
  const values = [];
  let i = startIndex;

  if (query.startDate) {
    clauses.push(`o.order_date >= $${i++}`);
    values.push(query.startDate);
  }
  if (query.endDate) {
    clauses.push(`o.order_date <= $${i++}`);
    values.push(query.endDate);
  }
  if (query.region) {
    clauses.push(`o.region = $${i++}`);
    values.push(query.region);
  }

  return { clauses, values, nextIndex: i };
}

async function getKpis(req, res) {
  try {
    const { clauses, values, nextIndex } = buildOrderFilters(req.query);
    let categoryJoin = "";
    let categoryClause = "";
    const params = [...values];

    if (req.query.category) {
      categoryJoin = "JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id";
      categoryClause = `p.category = $${nextIndex}`;
      params.push(req.query.category);
    }

    const allClauses = [...clauses, ...(categoryClause ? [categoryClause] : [])];
    const where = allClauses.length ? `WHERE ${allClauses.join(" AND ")}` : "";

    // Aggregate distinct orders to avoid double-counting when the category
    // filter joins in order_items (an order can have multiple line items).
    const revenueQuery = `
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue_raw
      FROM (SELECT DISTINCT o.id, o.total_amount FROM orders o ${categoryJoin} ${where}) AS distinct_orders
    `;

    const result = await pool.query(revenueQuery, params);
    const totalOrders = Number(result.rows[0].total_orders);
    const totalRevenue = Number(result.rows[0].total_revenue_raw);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top category by revenue (order_items joined with products)
    const itemWhere = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const topCategoryQuery = `
      SELECT p.category, SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${itemWhere}
      GROUP BY p.category
      ORDER BY revenue DESC
      LIMIT 1
    `;
    const topCategoryResult = await pool.query(topCategoryQuery, values);
    const topCategory = topCategoryResult.rows[0]?.category || "N/A";

    // Growth %: compare revenue of the selected period vs the immediately
    // preceding period of equal length. Falls back to last 30 vs prior 30 days
    // when no explicit date range is given.
    let growthPct = 0;
    try {
      const growthResult = await pool.query(
        `
        WITH bounds AS (
          SELECT
            COALESCE($1::date, CURRENT_DATE - INTERVAL '30 days')::date AS start_d,
            COALESCE($2::date, CURRENT_DATE)::date AS end_d
        ),
        current_period AS (
          SELECT COALESCE(SUM(total_amount), 0) AS revenue
          FROM orders, bounds
          WHERE order_date >= bounds.start_d AND order_date <= bounds.end_d
        ),
        previous_period AS (
          SELECT COALESCE(SUM(total_amount), 0) AS revenue
          FROM orders, bounds
          WHERE order_date < bounds.start_d
            AND order_date >= bounds.start_d - (bounds.end_d - bounds.start_d)
        )
        SELECT current_period.revenue AS current_revenue, previous_period.revenue AS previous_revenue
        FROM current_period, previous_period
        `,
        [req.query.startDate || null, req.query.endDate || null]
      );

      const cur = Number(growthResult.rows[0].current_revenue);
      const prev = Number(growthResult.rows[0].previous_revenue);
      growthPct = prev > 0 ? ((cur - prev) / prev) * 100 : 0;
    } catch (e) {
      growthPct = 0;
    }

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      topCategory,
      growthPct: Number(growthPct.toFixed(1)),
    });
  } catch (err) {
    console.error("getKpis error:", err);
    res.status(500).json({ error: "Failed to compute KPIs" });
  }
}

async function getRevenueTrend(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const granularity = req.query.granularity === "month" ? "month" : "day";

    const query = `
      SELECT
        DATE_TRUNC('${granularity}', o.order_date) AS period,
        SUM(o.total_amount) AS revenue,
        COUNT(*) AS orders
      FROM orders o
      ${where}
      GROUP BY period
      ORDER BY period ASC
    `;
    const result = await pool.query(query, values);
    res.json(
      result.rows.map((r) => ({
        date: r.period.toISOString().slice(0, 10),
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      }))
    );
  } catch (err) {
    console.error("getRevenueTrend error:", err);
    res.status(500).json({ error: "Failed to load revenue trend" });
  }
}

async function getSalesByCategory(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const query = `
      SELECT p.category, SUM(oi.quantity * oi.price) AS revenue, SUM(oi.quantity) AS units
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${where}
      GROUP BY p.category
      ORDER BY revenue DESC
    `;
    const result = await pool.query(query, values);
    res.json(
      result.rows.map((r) => ({
        category: r.category,
        revenue: Number(r.revenue),
        units: Number(r.units),
      }))
    );
  } catch (err) {
    console.error("getSalesByCategory error:", err);
    res.status(500).json({ error: "Failed to load sales by category" });
  }
}

async function getSalesByRegion(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const query = `
      SELECT o.region, SUM(o.total_amount) AS revenue, COUNT(*) AS orders
      FROM orders o
      ${where}
      GROUP BY o.region
      ORDER BY revenue DESC
    `;
    const result = await pool.query(query, values);
    res.json(
      result.rows.map((r) => ({
        region: r.region,
        revenue: Number(r.revenue),
        orders: Number(r.orders),
      }))
    );
  } catch (err) {
    console.error("getSalesByRegion error:", err);
    res.status(500).json({ error: "Failed to load sales by region" });
  }
}

async function getTopProducts(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const query = `
      SELECT p.id, p.name, p.category, SUM(oi.quantity * oi.price) AS revenue, SUM(oi.quantity) AS units_sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${where}
      GROUP BY p.id, p.name, p.category
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;
    const result = await pool.query(query, values);
    res.json(
      result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        revenue: Number(r.revenue),
        unitsSold: Number(r.units_sold),
      }))
    );
  } catch (err) {
    console.error("getTopProducts error:", err);
    res.status(500).json({ error: "Failed to load top products" });
  }
}

async function getFilterOptions(req, res) {
  try {
    const categories = await pool.query("SELECT DISTINCT category FROM products ORDER BY category");
    const regions = await pool.query("SELECT DISTINCT region FROM orders ORDER BY region");
    res.json({
      categories: categories.rows.map((r) => r.category),
      regions: regions.rows.map((r) => r.region),
    });
  } catch (err) {
    console.error("getFilterOptions error:", err);
    res.status(500).json({ error: "Failed to load filter options" });
  }
}

module.exports = {
  buildOrderFilters,
  getKpis,
  getRevenueTrend,
  getSalesByCategory,
  getSalesByRegion,
  getTopProducts,
  getFilterOptions,
};
