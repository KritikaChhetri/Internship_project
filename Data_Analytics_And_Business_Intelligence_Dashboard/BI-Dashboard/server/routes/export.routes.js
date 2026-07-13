const express = require("express");
const router = express.Router();
const { exportCsv, exportPdf } = require("../controllers/export.controller");

router.get("/export", exportCsv);
router.get("/export/pdf", exportPdf);

module.exports = router;
