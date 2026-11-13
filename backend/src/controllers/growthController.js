/**
 * Controller Pencatatan Antropometri & Kalkulator Z-Score Posyandu (SKPL-F01, F02, F03, F04, F05)
 */

const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { assessChildGrowth } = require("../services/zscoreEngine");

// Live Simulation / Calculator Endpoint (tanpa menyimpan, untuk form real-time)
exports.calculateZScorePreview = (req, res) => {
  try {
    const { ageMonths, gender, weightKg, heightCm, headCircumferenceCm, previousWeightKg } = req.body;

    if (ageMonths === undefined || !gender || weightKg === undefined || heightCm === undefined) {
      return res.status(400).json({
        success: false,
        message: "Data wajib: ageMonths, gender ('L'/'P'), weightKg, heightCm."
      });
    }

    const prevRecords = previousWeightKg
      ? [{ recordDate: "sebelumnya", weightKg: parseFloat(previousWeightKg) }]
      : [];

    const result = assessChildGrowth({
      ageMonths: parseInt(ageMonths),
      gender,
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : null,
      previousRecords: prevRecords
    });

    return res.json({
      success: true,
      message: "Kalkulasi Z-Score WHO & Permenkes berhasil.",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menghitung Z-score.", error: error.message });
  }
};

// Menambah Catatan Antropometri Bulanan (SKPL-F01)
exports.addGrowthRecord = (req, res) => {
  try {
    const { childId, recordDate, ageMonths, weightKg, heightCm, headCircumferenceCm, catatan } = req.body;

    if (!childId || weightKg === undefined || heightCm === undefined) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: childId, weightKg, heightCm."
      });
    }

    const child = db.children.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: "Data anak tidak ditemukan." });
    }

    // Ambil riwayat penimbangan sebelumnya untuk deteksi Growth Faltering
    const prevRecords = db.growth_records.find((r) => r.childId === childId);

    const actualAge = ageMonths !== undefined ? parseInt(ageMonths) : child.usiaBulan + 1;

    const assessment = assessChildGrowth({
      ageMonths: actualAge,
      gender: child.jenisKelamin,
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : child.lingkarKepalaCm,
      previousRecords: prevRecords
    });

    const newRecord = db.growth_records.create({
      id: `REC-${uuidv4().slice(0, 8).toUpperCase()}`,
      childId,
      recordDate: recordDate || new Date().toISOString().split("T")[0],
      ageMonths: actualAge,
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : child.lingkarKepalaCm,
      zBBU: assessment.zScores.zBBU,
      zTBU: assessment.zScores.zTBU,
      zBBTB: assessment.zScores.zBBTB,
      kurvaKIA: assessment.kurvaKIA.warna,
      statusNutrisi: assessment.status.statusNutrisi,
      isFaltering: assessment.status.isFaltering,
      paketMBG: assessment.preskripsiMBG.paketMBG,
      catatan: catatan || assessment.status.falteringReason || ""
    });

    // Update data profil terbaru anak
    db.children.update(childId, {
      usiaBulan: actualAge,
      bbKg: parseFloat(weightKg),
      tbCm: parseFloat(heightCm),
      lingkarKepalaCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : child.lingkarKepalaCm,
      zBBU: assessment.zScores.zBBU,
      zTBU: assessment.zScores.zTBU,
      zBBTB: assessment.zScores.zBBTB,
      kurvaKIA: assessment.kurvaKIA.warna,
      statusNutrisi: assessment.status.statusNutrisi,
      paketMBG: assessment.preskripsiMBG.paketMBG,
      isFaltering: assessment.status.isFaltering
    });

    return res.status(201).json({
      success: true,
      message: "Catatan antropometri posyandu berhasil disimpan.",
      data: newRecord,
      assessment
    });
  } catch (error) {
    console.error("Add Growth Record Error:", error);
    return res.status(500).json({ success: false, message: "Gagal menyimpan penimbangan.", error: error.message });
  }
};

// Batch Sync dari Posyandu Mode Offline PWA (SKPL-F05)
exports.syncOfflineQueue = (req, res) => {
  try {
    const { items } = req.body; // Array of pending records
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Antrean sync kosong atau bukan array." });
    }

    const processed = [];
    for (const item of items) {
      const child = db.children.findById(item.childId);
      if (!child) continue;

      const prevRecords = db.growth_records.find((r) => r.childId === item.childId);
      const assessment = assessChildGrowth({
        ageMonths: item.ageMonths || child.usiaBulan,
        gender: child.jenisKelamin,
        weightKg: parseFloat(item.weightKg),
        heightCm: parseFloat(item.heightCm),
        headCircumferenceCm: item.headCircumferenceCm || child.lingkarKepalaCm,
        previousRecords: prevRecords
      });

      const rec = db.growth_records.create({
        id: `REC-SYNC-${uuidv4().slice(0, 6).toUpperCase()}`,
        childId: item.childId,
        recordDate: item.recordDate || new Date().toISOString().split("T")[0],
        ageMonths: item.ageMonths || child.usiaBulan,
        weightKg: parseFloat(item.weightKg),
        heightCm: parseFloat(item.heightCm),
        headCircumferenceCm: item.headCircumferenceCm || child.lingkarKepalaCm,
        zBBU: assessment.zScores.zBBU,
        zTBU: assessment.zScores.zTBU,
        zBBTB: assessment.zScores.zBBTB,
        kurvaKIA: assessment.kurvaKIA.warna,
        statusNutrisi: assessment.status.statusNutrisi,
        isFaltering: assessment.status.isFaltering,
        paketMBG: assessment.preskripsiMBG.paketMBG,
        isOfflineSync: true
      });

      db.children.update(item.childId, {
        bbKg: parseFloat(item.weightKg),
        tbCm: parseFloat(item.heightCm),
        zBBU: assessment.zScores.zBBU,
        zTBU: assessment.zScores.zTBU,
        zBBTB: assessment.zScores.zBBTB,
        kurvaKIA: assessment.kurvaKIA.warna,
        statusNutrisi: assessment.status.statusNutrisi,
        paketMBG: assessment.preskripsiMBG.paketMBG,
        isFaltering: assessment.status.isFaltering
      });

      processed.push(rec);
    }

    return res.json({
      success: true,
      message: `Sinkronisasi offline berhasil: ${processed.length} data penimbangan posyandu diproses.`,
      syncedCount: processed.length,
      data: processed
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal sinkronisasi offline.", error: error.message });
  }
};
