const { Pool } = require("pg");
require("dotenv").config();

// Supabase/Postgres connection pool.
// DATABASE_URL comes from .env (see .env.example)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
  keepAlive: true,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

module.exports = pool;
