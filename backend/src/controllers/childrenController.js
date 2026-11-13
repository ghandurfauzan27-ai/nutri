/**
 * Controller Manajemen Data Anak Balita (SKPL-F01)
 * Dilengkapi Filter Wilayah Prioritas Jawa Timur (Bangkalan, Sampang, Jember, Bondowoso, Probolinggo)
 */

const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { assessChildGrowth } = require("../services/zscoreEngine");

exports.getAllChildren = (req, res) => {
  try {
    const { kabupaten, kecamatan, desa, posyandu, kurvaKIA, statusNutrisi, isFaltering, q } = req.query;

    const children = db.children.find((c) => {
      if (kabupaten && !c.kabupaten.toLowerCase().includes(kabupaten.toLowerCase())) return false;
      if (kecamatan && !c.kecamatan.toLowerCase().includes(kecamatan.toLowerCase())) return false;
      if (desa && !c.desa.toLowerCase().includes(desa.toLowerCase())) return false;
      if (posyandu && !c.posyandu.toLowerCase().includes(posyandu.toLowerCase())) return false;
      if (kurvaKIA && c.kurvaKIA !== kurvaKIA) return false;
      if (statusNutrisi && !c.statusNutrisi.toLowerCase().includes(statusNutrisi.toLowerCase())) return false;
      if (isFaltering !== undefined && String(c.isFaltering) !== String(isFaltering)) return false;
      if (q) {
        const query = q.toLowerCase();
        return (
          c.nama.toLowerCase().includes(query) ||
          c.nik.includes(query) ||
          c.namaIbu.toLowerCase().includes(query)
        );
      }
      return true;
    });

    return res.json({
      success: true,
      count: children.length,
      data: children
    });
  } catch (error) {
    console.error("Get Children Error:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil data balita.", error: error.message });
  }
};

exports.getChildById = (req, res) => {
  try {
    const { id } = req.params;
    const child = db.children.findById(id);
    if (!child) {
      return res.status(404).json({ success: false, message: "Data balita tidak ditemukan." });
    }

    // Ambil riwayat pertumbuhan antropometri
    const records = db.growth_records
      .find((r) => r.childId === child.id)
      .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

    // Ambil riwayat distribusi MBG
    const distributions = db.distributions
      .find((d) => d.childId === child.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: {
        ...child,
        history: records,
        mbgHistory: distributions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail balita.", error: error.message });
  }
};

exports.createChild = (req, res) => {
  try {
    const {
      nik,
      nama,
      tglLahir,
      jenisKelamin,
      namaIbu,
      kabupaten,
      kecamatan,
      desa,
      posyandu,
      alamat,
      noHpOrtu,
      bbKg,
      tbCm,
      lingkarKepalaCm,
      catatan
    } = req.body;

    if (!nama || !tglLahir || !jenisKelamin || !bbKg || !tbCm) {
      return res.status(400).json({
        success: false,
        message: "Data wajib: nama, tglLahir, jenisKelamin (L/P), bbKg, tbCm."
      });
    }

    // Hitung usia dalam bulan
    const birthDate = new Date(tglLahir);
    const today = new Date();
    const diffMonths = Math.max(
      0,
      (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())
    );

    // Hitung Z-Score dan status gizi langsung
    const assessment = assessChildGrowth({
      ageMonths: diffMonths,
      gender: jenisKelamin,
      weightKg: parseFloat(bbKg),
      heightCm: parseFloat(tbCm),
      headCircumferenceCm: lingkarKepalaCm ? parseFloat(lingkarKepalaCm) : null,
      previousRecords: []
    });

    const newId = `CHD-JTM-${uuidv4().slice(0, 6).toUpperCase()}`;

    const newChild = db.children.create({
      id: newId,
      nik: nik || `3505${Date.now().toString().slice(-12)}`,
      nama,
      tglLahir,
      usiaBulan: diffMonths,
      jenisKelamin,
      namaIbu: namaIbu || "Ibu Balita",
      kabupaten: kabupaten || "Kab. Bangkalan",
      kecamatan: kecamatan || "Socah",
      desa: desa || "Desa Bilaporah",
      posyandu: posyandu || "Posyandu Mawar 01",
      alamat: alamat || "",
      noHpOrtu: noHpOrtu || "",
      bbKg: parseFloat(bbKg),
      tbCm: parseFloat(tbCm),
      lingkarKepalaCm: lingkarKepalaCm ? parseFloat(lingkarKepalaCm) : 45.0,
      zBBU: assessment.zScores.zBBU,
      zTBU: assessment.zScores.zTBU,
      zBBTB: assessment.zScores.zBBTB,
      kurvaKIA: assessment.kurvaKIA.warna,
      statusNutrisi: assessment.status.statusNutrisi,
      paketMBG: assessment.preskripsiMBG.paketMBG,
      isFaltering: assessment.status.isFaltering,
      catatan: catatan || assessment.preskripsiMBG.rekomendasiMenu
    });

    // Simpan record pertama
    db.growth_records.create({
      childId: newId,
      recordDate: new Date().toISOString().split("T")[0],
      ageMonths: diffMonths,
      weightKg: parseFloat(bbKg),
      heightCm: parseFloat(tbCm),
      headCircumferenceCm: lingkarKepalaCm ? parseFloat(lingkarKepalaCm) : 45.0,
      zBBU: assessment.zScores.zBBU,
      zTBU: assessment.zScores.zTBU,
      zBBTB: assessment.zScores.zBBTB,
      kurvaKIA: assessment.kurvaKIA.warna,
      statusNutrisi: assessment.status.statusNutrisi,
      isFaltering: assessment.status.isFaltering,
      paketMBG: assessment.preskripsiMBG.paketMBG
    });

    return res.status(201).json({
      success: true,
      message: "Data balita baru berhasil didaftarkan dan dihitung Z-Score Kemenkes/WHO.",
      data: newChild,
      assessment
    });
  } catch (error) {
    console.error("Create Child Error:", error);
    return res.status(500).json({ success: false, message: "Gagal menambahkan data balita.", error: error.message });
  }
};

exports.updateChild = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.children.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data balita tidak ditemukan." });
    }

    const updated = db.children.update(id, req.body);
    return res.json({ success: true, message: "Data balita berhasil diperbarui.", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memperbarui data balita.", error: error.message });
  }
};

exports.deleteChild = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.children.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Data balita tidak ditemukan." });
    }
    return res.json({ success: true, message: "Data balita berhasil dihapus." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menghapus data balita.", error: error.message });
  }
};
