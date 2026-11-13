const express = require("express");
const router = express.Router();
const distributionController = require("../controllers/distributionController");

router.get("/", distributionController.getAllDistributions);
router.get("/token/:token", distributionController.getDistributionByToken);
router.post("/batch-daily", distributionController.generateDailyDistributionBatch);
router.post("/token/:token/verify-consumption", distributionController.verifyAndLogConsumption);

module.exports = router;
