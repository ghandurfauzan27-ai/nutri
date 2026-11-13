const express = require("express");
const router = express.Router();
const growthController = require("../controllers/growthController");

// Kalkulasi instan simulasi Z-score tanpa menyimpan
router.post("/calculate", growthController.calculateZScorePreview);

// Simpan catatan pengukuran antropometri posyandu
router.post("/", growthController.addGrowthRecord);

// Sinkronisasi data offline PWA
router.post("/sync", growthController.syncOfflineQueue);

module.exports = router;
