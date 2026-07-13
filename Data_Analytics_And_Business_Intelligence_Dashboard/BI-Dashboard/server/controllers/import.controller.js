const fs = require("fs");
const { Readable } = require("stream");
const csv = require("csv-parser");
const ExcelJS = require("exceljs");
const pool = require("../db");

// Expected flattened row shape (one row = one order line item):
// customer_name, order_date, region, category, product_name, price, quantity
const REQUIRED_COLUMNS = ["customer_name", "order_date", "region", "category", "product_name", "price", "quantity"];
const MAX_URL_BYTES = 5 * 1024 * 1024; // 5MB, same limit as file upload
const FETCH_TIMEOUT_MS = 15000;

function parseCsvFromStream(stream) {
  return new Promise((resolve, reject) => {
    const rows = [];
    stream
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function parseCsvFile(filePath) {
  return parseCsvFromStream(fs.createReadStream(filePath));
}

function parseCsvString(text) {
  return parseCsvFromStream(Readable.from([text]));
}

async function parseXlsxFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const rows = [];
  let headers = [];

  worksheet.eachRow((row, rowNumber) => {
    // row.values is 1-indexed; index 0 is always empty
    const values = row.values.slice(1);
    if (rowNumber === 1) {
      headers = values.map((h) => String(h ?? "").trim());
      return;
    }
    const obj = {};
    headers.forEach((header, i) => {
      const cell = values[i];
      obj[header] = cell === undefined || cell === null ? "" : String(cell);
    });
    rows.push(obj);
  });

  return rows;
}

function normalizeHeaders(row) {
  const normalized = {};
  for (const key of Object.keys(row)) {
    normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] = row[key];
  }
  return normalized;
}

function validateRow(row) {
  const missing = [];
  if (!row.customer_name) missing.push("customer_name");
  if (!row.order_date || isNaN(Date.parse(row.order_date))) missing.push("order_date");
  if (!row.price || isNaN(Number(row.price))) missing.push("price");
  if (!row.quantity || isNaN(Number(row.quantity))) missing.push("quantity");
  if (!row.product_name) missing.push("product_name");
  if (!row.category) missing.push("category");
  if (!row.region) missing.push("region");
  return missing;
}

// Shared pipeline: takes already-parsed rows (array of objects) and inserts
// them, used by file upload, URL import, and (in future) any other source.
async function insertParsedRows(client, rawRows, { filename, sourceType }) {
  if (!rawRows.length) {
    return { error: "File is empty" };
  }

  const rows = rawRows.map(normalizeHeaders);

  const firstRowKeys = Object.keys(rows[0]);
  const missingColumns = REQUIRED_COLUMNS.filter((c) => !firstRowKeys.includes(c));
  if (missingColumns.length) {
    return {
      error: "Missing required columns",
      expectedColumns: REQUIRED_COLUMNS,
      foundColumns: firstRowKeys,
      missingColumns,
    };
  }

  let inserted = 0;
  let skipped = 0;
  const skipReasons = [];

  await client.query("BEGIN");
  try {
    // Group rows by order: same customer_name + order_date + region treated
    // as one order with multiple line items.
    const orderKey = (r) => `${r.customer_name}|${r.order_date}|${r.region}`;
    const grouped = new Map();

    for (const row of rows) {
      const missing = validateRow(row);
      if (missing.length) {
        skipped++;
        skipReasons.push(`Row skipped, missing/invalid: ${missing.join(", ")}`);
        continue;
      }
      const key = orderKey(row);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    }

    for (const [, items] of grouped) {
      const first = items[0];
      let total = 0;
      for (const item of items) total += Number(item.price) * Number(item.quantity);

      const orderRes = await client.query(
        "INSERT INTO orders (customer_name, order_date, total_amount, region) VALUES ($1, $2, $3, $4) RETURNING id",
        [first.customer_name, first.order_date, total.toFixed(2), first.region]
      );
      const orderId = orderRes.rows[0].id;

      for (const item of items) {
        let productRes = await client.query(
          "SELECT id FROM products WHERE name = $1 AND category = $2 LIMIT 1",
          [item.product_name, item.category]
        );
        let productId;
        if (productRes.rows.length) {
          productId = productRes.rows[0].id;
        } else {
          const newProduct = await client.query(
            "INSERT INTO products (name, category, price) VALUES ($1, $2, $3) RETURNING id",
            [item.product_name, item.category, item.price]
          );
          productId = newProduct.rows[0].id;
        }

        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [orderId, productId, item.quantity, item.price]
        );
        inserted++;
      }
    }

    const status = skipped === 0 ? "success" : inserted === 0 ? "failed" : "partial";

    await client.query(
      "INSERT INTO imports (filename, source_type, row_count, rows_skipped, status) VALUES ($1, $2, $3, $4, $5)",
      [filename, sourceType, inserted, skipped, status]
    );

    await client.query("COMMIT");

    return {
      message: "Import complete",
      filename,
      rowsImported: inserted,
      rowsSkipped: skipped,
      ordersCreated: grouped.size,
      status,
      skipReasons: skipReasons.slice(0, 20),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

// Source 1 & 2: file upload (CSV or Excel)
async function handleImport(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const ext = originalName.split(".").pop().toLowerCase();
  const sourceType = ext === "xlsx" || ext === "xls" ? "xlsx" : "csv";

  const client = await pool.connect();
  try {
    const rawRows = sourceType === "csv" ? await parseCsvFile(filePath) : await parseXlsxFile(filePath);
    const result = await insertParsedRows(client, rawRows, { filename: originalName, sourceType });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error("handleImport error:", err);
    res.status(500).json({ error: "Import failed", details: err.message });
  } finally {
    client.release();
    fs.unlink(filePath, () => {});
  }
}

// Source 3: import from a public URL (e.g. a Google Sheet published as CSV,
// or any other publicly hosted .csv link). No file upload needed.
async function handleImportFromUrl(req, res) {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "A URL is required" });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "That doesn't look like a valid URL" });
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "Only http:// or https:// URLs are supported" });
  }

  const client = await pool.connect();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) {
      return res.status(400).json({ error: `Couldn't fetch that URL (status ${response.status})` });
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_URL_BYTES) {
      return res.status(400).json({ error: "File at that URL is larger than 5MB" });
    }

    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > MAX_URL_BYTES) {
      return res.status(400).json({ error: "File at that URL is larger than 5MB" });
    }

    const rawRows = await parseCsvString(text);
    const result = await insertParsedRows(client, rawRows, { filename: url, sourceType: "url" });
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error("handleImportFromUrl error:", err);
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return res.status(408).json({ error: "Fetching that URL took too long" });
    }
    res.status(500).json({ error: "Import from URL failed", details: err.message });
  } finally {
    client.release();
  }
}

async function getImportHistory(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, filename, source_type, row_count, rows_skipped, status, created_at FROM imports ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getImportHistory error:", err);
    res.status(500).json({ error: "Failed to load import history" });
  }
}

module.exports = { handleImport, handleImportFromUrl, getImportHistory, REQUIRED_COLUMNS };