require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyticsRoutes = require("./routes/analytics.routes");
const importRoutes = require("./routes/import.routes");
const exportRoutes = require("./routes/export.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "BI Dashboard API" });
});
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", analyticsRoutes);
app.use("/api", importRoutes);
app.use("/api", exportRoutes);

// Multer / generic error handler
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || "Something went wrong" });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BI Dashboard API running on port ${PORT}`);
});
