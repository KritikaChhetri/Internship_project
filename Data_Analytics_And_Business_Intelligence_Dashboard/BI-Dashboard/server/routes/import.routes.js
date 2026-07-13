const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { handleImport, handleImportFromUrl, getImportHistory } = require("../controllers/import.controller");

router.post("/import", upload.single("file"), handleImport);
router.post("/import-url", handleImportFromUrl);
router.get("/imports", getImportHistory);

module.exports = router;