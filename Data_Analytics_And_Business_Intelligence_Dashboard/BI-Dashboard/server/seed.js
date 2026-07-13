// Seeds the database with synthetic sample data so the dashboard has
// something to show on first run, before you import your own CSV/Excel.
// Run with: npm run seed
//
// Uses batched multi-row INSERTs (instead of one query per row) to keep
// round-trips low — important for Supabase's pooled connection, which can
// drop a connection that's kept busy with thousands of sequential queries.

const fs = require("fs");
const path = require("path");
const pool = require("./db");

const REGIONS = ["North", "South", "East", "West", "Central"];
const ORDER_COUNT = 800;
const ORDER_CHUNK_SIZE = 100;
const ITEM_CHUNK_SIZE = 250;

const PRODUCTS = [
  { name: "Wireless Mouse", category: "Electronics", price: 24.99 },
  { name: "USB-C Hub", category: "Electronics", price: 39.99 },
  { name: "Bluetooth Earbuds", category: "Electronics", price: 59.99 },
  { name: "27-inch Monitor", category: "Electronics", price: 189.99 },
  { name: "Mechanical Keyboard", category: "Electronics", price: 79.99 },
  { name: "Cotton T-Shirt", category: "Apparel", price: 14.99 },
  { name: "Denim Jacket", category: "Apparel", price: 64.99 },
  { name: "Running Shoes", category: "Apparel", price: 89.99 },
  { name: "Wool Sweater", category: "Apparel", price: 49.99 },
  { name: "Non-stick Pan Set", category: "Home & Kitchen", price: 54.99 },
  { name: "Air Fryer", category: "Home & Kitchen", price: 99.99 },
  { name: "Ceramic Mug Set", category: "Home & Kitchen", price: 22.99 },
  { name: "Yoga Mat", category: "Sports", price: 29.99 },
  { name: "Dumbbell Set", category: "Sports", price: 74.99 },
  { name: "Cycling Helmet", category: "Sports", price: 44.99 },
  { name: "Face Serum", category: "Beauty", price: 19.99 },
  { name: "Hair Dryer", category: "Beauty", price: 34.99 },
  { name: "Lipstick Set", category: "Beauty", price: 27.99 },
];

const FIRST_NAMES = ["Aarav", "Vivaan", "Ananya", "Diya", "Kabir", "Ishaan", "Myra", "Sara", "Reyansh", "Anika", "Vihaan", "Pari", "Aditya", "Saanvi", "Arjun"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Iyer", "Khan", "Patel", "Nair", "Singh", "Reddy", "Das"];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInLast(months) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - months);
  const t = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(t);
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// Builds a multi-row INSERT for `rows`, where each row is an array of
// column values in order. Returns { text, values }.
function buildBatchInsert(table, columns, rows, { returning } = {}) {
  const values = [];
  const placeholders = rows
    .map((row, rowIdx) => {
      const base = rowIdx * columns.length;
      const rowPlaceholders = row.map((_, colIdx) => `$${base + colIdx + 1}`).join(", ");
      values.push(...row);
      return `(${rowPlaceholders})`;
    })
    .join(", ");

  const text = `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}${
    returning ? ` RETURNING ${returning}` : ""
  }`;

  return { text, values };
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Reading schema.sql and ensuring tables exist...");
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);

    console.log("Clearing existing data...");
    await client.query("TRUNCATE order_items, orders, products, imports RESTART IDENTITY CASCADE");

    console.log("Inserting products...");
    const productIds = [];
    for (const p of PRODUCTS) {
      const res = await client.query(
        "INSERT INTO products (name, category, price) VALUES ($1, $2, $3) RETURNING id",
        [p.name, p.category, p.price]
      );
      productIds.push({ id: res.rows[0].id, ...p });
    }

    console.log(`Generating ${ORDER_COUNT} synthetic orders in memory...`);
    const ordersData = [];
    for (let i = 0; i < ORDER_COUNT; i++) {
      const customer = `${FIRST_NAMES[randomBetween(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randomBetween(0, LAST_NAMES.length - 1)]}`;
      const region = REGIONS[randomBetween(0, REGIONS.length - 1)];
      const orderDate = randomDateInLast(12).toISOString().slice(0, 10);

      const itemCount = randomBetween(1, 4);
      const items = [];
      let total = 0;
      for (let j = 0; j < itemCount; j++) {
        const product = productIds[randomBetween(0, productIds.length - 1)];
        const quantity = randomBetween(1, 3);
        total += Number(product.price) * quantity;
        items.push({ productId: product.id, quantity, price: product.price });
      }

      ordersData.push({ customer, orderDate, total: total.toFixed(2), region, items });
    }

    console.log("Inserting orders in batches...");
    let insertedOrders = 0;
    for (const chunk of chunkArray(ordersData, ORDER_CHUNK_SIZE)) {
      const rows = chunk.map((o) => [o.customer, o.orderDate, o.total, o.region]);
      const { text, values } = buildBatchInsert(
        "orders",
        ["customer_name", "order_date", "total_amount", "region"],
        rows,
        { returning: "id" }
      );
      const res = await client.query(text, values);
      res.rows.forEach((row, idx) => {
        chunk[idx].id = row.id;
      });
      insertedOrders += chunk.length;
      console.log(`  ${insertedOrders}/${ORDER_COUNT} orders inserted...`);
    }

    console.log("Inserting order line items in batches...");
    const allItems = [];
    for (const o of ordersData) {
      for (const item of o.items) {
        allItems.push([o.id, item.productId, item.quantity, item.price]);
      }
    }
    let insertedItems = 0;
    for (const chunk of chunkArray(allItems, ITEM_CHUNK_SIZE)) {
      const { text, values } = buildBatchInsert(
        "order_items",
        ["order_id", "product_id", "quantity", "price"],
        chunk
      );
      await client.query(text, values);
      insertedItems += chunk.length;
      console.log(`  ${insertedItems}/${allItems.length} line items inserted...`);
    }

    await client.query(
      "INSERT INTO imports (filename, source_type, row_count, rows_skipped, status) VALUES ($1, $2, $3, $4, $5)",
      ["seed-script", "seed", ORDER_COUNT, 0, "success"]
    );

    console.log(`Done. Seeded ${productIds.length} products, ${ORDER_COUNT} orders, ${allItems.length} line items.`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
