const PDFDocument = require("pdfkit");
const pool = require("../db");
const { buildOrderFilters } = require("./analytics.controller");

function toCsv(rows, columns) {
  const header = columns.join(",");
  const lines = rows.map((r) =>
    columns
      .map((c) => {
        let raw = r[c];
        let val;
        if (raw === null || raw === undefined) {
          val = "";
        } else if (raw instanceof Date) {
          // Format as YYYY-MM-DD instead of the full JS Date string
          val = raw.toISOString().slice(0, 10);
        } else {
          val = String(raw);
        }
        // escape commas/quotes
        return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

async function exportCsv(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const query = `
      SELECT o.id AS order_id, o.customer_name, o.order_date, o.region,
             p.name AS product_name, p.category, oi.quantity, oi.price,
             (oi.quantity * oi.price) AS line_total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${where}
      ORDER BY o.order_date DESC
    `;
    const result = await pool.query(query, values);

    const csv = toCsv(result.rows, [
      "order_id",
      "customer_name",
      "order_date",
      "region",
      "product_name",
      "category",
      "quantity",
      "price",
      "line_total",
    ]);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="sales-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("exportCsv error:", err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
}

async function exportPdf(req, res) {
  try {
    const { clauses, values } = buildOrderFilters(req.query);
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const kpiQuery = `
      SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders o ${where}
    `;
    const kpiResult = await pool.query(kpiQuery, values);
    const totalOrders = Number(kpiResult.rows[0].total_orders);
    const totalRevenue = Number(kpiResult.rows[0].total_revenue);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const categoryQuery = `
      SELECT p.category, SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${where}
      GROUP BY p.category
      ORDER BY revenue DESC
    `;
    const categoryResult = await pool.query(categoryQuery, values);

    const topProductsQuery = `
      SELECT p.name, SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      ${where}
      GROUP BY p.name
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const topProductsResult = await pool.query(topProductsQuery, values);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="dashboard-report-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text("BI Dashboard — Summary Report", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#666").text(`Generated on ${new Date().toLocaleString()}`);
    doc.moveDown(1.2);

    doc.fillColor("#000").fontSize(14).text("Key Metrics");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    doc.text(`Total Orders: ${totalOrders.toLocaleString()}`);
    doc.text(`Average Order Value: $${avgOrderValue.toFixed(2)}`);
    doc.moveDown(1);

    doc.fontSize(14).text("Revenue by Category");
    doc.moveDown(0.5);
    doc.fontSize(11);
    categoryResult.rows.forEach((row) => {
      doc.text(`${row.category}: $${Number(row.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    });
    doc.moveDown(1);

    doc.fontSize(14).text("Top 10 Products by Revenue");
    doc.moveDown(0.5);
    doc.fontSize(11);
    topProductsResult.rows.forEach((row, idx) => {
      doc.text(`${idx + 1}. ${row.name} — $${Number(row.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    });

    doc.end();
  } catch (err) {
    console.error("exportPdf error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export PDF" });
    }
  }
}

module.exports = { exportCsv, exportPdf };
