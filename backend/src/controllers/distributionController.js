/**
 * Controller Distribusi MBG & Pemantauan Daya Terima Konsumsi (SKPL-F08, F10, F11)
 */

const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { generateQrToken } = require("../services/qrService");

exports.getAllDistributions = (req, res) => {
  try {
    const { tanggal, status, posyandu, tipePaket } = req.query;

    const distributions = db.distributions.find((d) => {
      if (tanggal && d.tanggal !== tanggal) return false;
      if (status && d.status.toLowerCase() !== status.toLowerCase()) return false;
      if (posyandu && !d.posyandu.toLowerCase().includes(posyandu.toLowerCase())) return false;
      if (tipePaket && !d.tipePaket.toLowerCase().includes(tipePaket.toLowerCase())) return false;
      return true;
    });

    return res.json({
      success: true,
      count: distributions.length,
      data: distributions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memuat data distribusi.", error: error.message });
  }
};

exports.getDistributionByToken = (req, res) => {
  try {
    const { token } = req.params;
    const item = db.distributions.findOne(
      (d) => d.qrToken.toLowerCase() === token.toLowerCase() || d.id === token
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Paket MBG dengan kode QR tersebut tidak ditemukan." });
    }

    const child = db.children.findById(item.childId);
    return res.json({
      success: true,
      data: {
        ...item,
        childDetail: child
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memverifikasi token.", error: error.message });
  }
};

// Generate Batch Paket MBG Harian untuk Dapur
exports.generateDailyDistributionBatch = (req, res) => {
  try {
    const { kitchenCode = "SPPG-SOCAH-01", targetDate = new Date().toISOString().split("T")[0] } = req.body;

    const children = db.children.find();
    const recipes = db.recipes.find();
    const recipeB = recipes.find((r) => r.kategori.includes("Paket B")) || recipes[0];
    const recipeA = recipes.find((r) => r.kategori.includes("Paket A")) || recipes[recipes.length - 1];

    const generated = [];

    for (const child of children) {
      const isPaketB = child.paketMBG && child.paketMBG.includes("Paket B");
      const chosenRecipe = isPaketB ? recipeB : recipeA;

      const qrToken = generateQrToken({
        childId: child.id,
        packageType: isPaketB ? "B" : "A",
        kitchenCode,
        date: targetDate
      });

      const dist = db.distributions.create({
        id: `DIST-${uuidv4().slice(0, 8).toUpperCase()}`,
        tanggal: targetDate,
        childId: child.id,
        namaAnak: child.nama,
        tipePaket: isPaketB ? "Paket B (Intervensi Protein Hewani Ganda)" : "Paket A (Gizi Seimbang Reguler)",
        posyandu: child.posyandu,
        kabupaten: child.kabupaten,
        kecamatan: child.kecamatan,
        waktuKirim: "07:30 WIB",
        status: "Dikirim",
        qrToken,
        dayaTerima: null,
        menuId: chosenRecipe.id,
        menuNama: chosenRecipe.nama
      });

      generated.push(dist);
    }

    return res.status(201).json({
      success: true,
      message: `Berhasil mencetak ${generated.length} label QR Code wadah makanan MBG hari ini.`,
      count: generated.length,
      data: generated
    });
  } catch (error) {
    console.error("Batch QR Error:", error);
    return res.status(500).json({ success: false, message: "Gagal membuat batch distribusi.", error: error.message });
  }
};

// Verifikasi Penerimaan & Catat Daya Terima Konsumsi Makanan (SKPL-F10 & SKPL-F11)
exports.verifyAndLogConsumption = (req, res) => {
  try {
    const { token } = req.params;
    const { dayaTerima, verifiedBy, catatan } = req.body;

    if (!dayaTerima) {
      return res.status(400).json({
        success: false,
        message: "Status daya terima wajib dipilih: 'Habis (100%)', 'Tersisa Sebagian (50%)', atau 'Tidak Termakan (0%)'."
      });
    }

    const item = db.distributions.findOne(
      (d) => d.qrToken.toLowerCase() === token.toLowerCase() || d.id === token
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Paket makanan tidak ditemukan." });
    }

    const updatedDist = db.distributions.update(item.id, {
      status: "Diterima",
      dayaTerima,
      verifiedAt: new Date().toISOString(),
      verifiedBy: verifiedBy || "Kader Posyandu Desa"
    });

    const consumptionLog = db.consumption_logs.create({
      id: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
      distributionId: item.id,
      qrToken: item.qrToken,
      childId: item.childId,
      namaAnak: item.namaAnak,
      dayaTerima,
      verifiedAt: new Date().toISOString(),
      verifiedBy: verifiedBy || "Kader Posyandu Desa",
      catatan: catatan || "Daya terima diverifikasi via scan QR."
    });

    return res.json({
      success: true,
      message: `Penerimaan paket MBG ${item.namaAnak} berhasil diverifikasi. Daya terima: ${dayaTerima}`,
      data: {
        distribution: updatedDist,
        log: consumptionLog
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memverifikasi konsumsi.", error: error.message });
  }
};
