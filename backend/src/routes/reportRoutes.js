const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/export", reportController.exportAuditReport);

module.exports = router;
