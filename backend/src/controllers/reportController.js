/**
 * Controller Ekspor Laporan Audit Pemda & Dinkes Jatim (SKPL-F14)
 */

const db = require("../database/db");

exports.exportAuditReport = (req, res) => {
  try {
    const { format = "json", kabupaten = "Semua Wilayah" } = req.query;

    const children = db.children.find((c) => {
      if (kabupaten !== "Semua Wilayah" && !c.kabupaten.toLowerCase().includes(kabupaten.toLowerCase())) {
        return false;
      }
      return true;
    });

    const distributions = db.distributions.find();
    const supplyLogs = db.supply_logs.find();

    const reportData = {
      judulLaporan: "Laporan Audit Pelaksanaan Program MBG & Penurunan Stunting Presisi",
      wilayah: kabupaten,
      provinsi: "Jawa Timur",
      tanggalGenerate: new Date().toISOString(),
      dasarHukum: "Permenkes No. 2/2020 & Perpres Penurunan Stunting Nasional",
      rekapitulasi: {
        totalBalitaDipantau: children.length,
        totalBalitaPaketBIntervensi: children.filter((c) => c.paketMBG && c.paketMBG.includes("Paket B")).length,
        totalBalitaPaketAReguler: children.filter((c) => !c.paketMBG || !c.paketMBG.includes("Paket B")).length,
        totalPaketDidistribusikan: distributions.length,
        totalBelanjaKomoditasLokalRp: supplyLogs.reduce((acc, s) => acc + (s.hargaTotalRp || 0), 0)
      },
      daftarBalitaSasaran: children.map((c) => ({
        id: c.id,
        nik: c.nik,
        nama: c.nama,
        usiaBulan: c.usiaBulan,
        jenisKelamin: c.jenisKelamin,
        kabupaten: c.kabupaten,
        kecamatan: c.kecamatan,
        desa: c.desa,
        posyandu: c.posyandu,
        bbKg: c.bbKg,
        tbCm: c.tbCm,
        zTBU: c.zTBU,
        zBBU: c.zBBU,
        kurvaKIA: c.kurvaKIA,
        statusNutrisi: c.statusNutrisi,
        paketMBG: c.paketMBG
      }))
    };

    if (format === "csv") {
      // Format CSV sederhana
      let csv = "ID,NIK,Nama,Usia(Bln),JK,Kabupaten,Kecamatan,Desa,Posyandu,BB(kg),TB(cm),Z-TBU,Z-BBU,KurvaKIA,StatusNutrisi,PaketMBG\n";
      reportData.daftarBalitaSasaran.forEach((b) => {
        csv += `"${b.id}","${b.nik}","${b.nama}",${b.usiaBulan},"${b.jenisKelamin}","${b.kabupaten}","${b.kecamatan}","${b.desa}","${b.posyandu}",${b.bbKg},${b.tbCm},${b.zTBU},${b.zBBU},"${b.kurvaKIA}","${b.statusNutrisi}","${b.paketMBG}"\n`;
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="Laporan_Audit_NutriTrack_Jatim.csv"');
      return res.send(csv);
    }

    return res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengekspor laporan.", error: error.message });
  }
};
