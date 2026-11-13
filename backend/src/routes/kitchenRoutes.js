const express = require("express");
const router = express.Router();
const kitchenController = require("../controllers/kitchenController");

router.get("/summary", kitchenController.getKitchenSummary);
router.post("/procurement-calculator", kitchenController.calculateCustomProcurement);
router.get("/supply-logs", kitchenController.getSupplyLogs);
router.post("/supply-logs", kitchenController.createSupplyLog);

module.exports = router;
