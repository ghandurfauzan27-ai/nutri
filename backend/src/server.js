/**
 * NutriTrack Jatim - Server Backend Utama & Engine Intervensi Presisi
 * Sesuai Dokumen SKPL NutriTrack Jatim v1.0
 */

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { seedDatabase } = require("./database/seed");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const childrenRoutes = require("./routes/childrenRoutes");
const growthRoutes = require("./routes/growthRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const distributionRoutes = require("./routes/distributionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Static Folder untuk Web Dashboard & API Explorer Interaktif
app.use(express.static(path.join(__dirname, "public")));

// Endpoint Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "NutriTrack Jatim Backend Decision Engine",
    version: "1.0.0",
    fokusWilayah: "Jawa Timur (Bangkalan, Sampang, Jember, Bondowoso, Probolinggo, Blitar, Lamongan)"
  });
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/growth-records", growthRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/distributions", distributionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

// Penanganan 404 dan Error
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Jalankan Server & Auto-Seed jika database belum terisi
app.listen(PORT, async () => {
  console.log("================================================================================");
  console.log(`🌾 NUTRITRACK JATIM BACKEND ENGINE BERJALAN DI PORT ${PORT}`);
  console.log(`📡 URL API & Dasbor Interaktif : http://localhost:${PORT}`);
  console.log(`🩺 Health Check               : http://localhost:${PORT}/health`);
  console.log("================================================================================");

  try {
    await seedDatabase(false);
  } catch (err) {
    console.error("Gagal memeriksa / seeding database:", err);
  }
});
