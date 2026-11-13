const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/regions", analyticsController.getRegionalHeatmapData);
router.get("/ron-cohort", analyticsController.getReturnOnNutrition);
router.get("/kpis", analyticsController.getExecutiveKpis);

module.exports = router;
