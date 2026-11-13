/**
 * Controller Dasbor Dapur MBG & Kalkulator Belanja Bahan Lokal Jawa Timur (SKPL-F06, F08, F09)
 * Fitur 3: Dapur SPPG, Alokasi Porsi Harian, dan Rantai Pasok Petani/Peternak Lokal Jatim
 */

const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { calculateProcurement } = require("../services/procurementCalculator");
const { generateQrToken } = require("../services/qrService");

exports.getKitchenSummary = (req, res) => {
  try {
    const { kabupaten = "Kab. Bangkalan", kecamatan = "Socah" } = req.query;

    const childrenInArea = db.children.find((c) => {
      if (kabupaten && !c.kabupaten.toLowerCase().includes(kabupaten.toLowerCase())) return false;
      if (kecamatan && !c.kecamatan.toLowerCase().includes(kecamatan.toLowerCase())) return false;
      return true;
    });

    // Hitung porsi riil dari balita terdaftar
    let realPortionB = 0;
    let realPortionA = 0;

    childrenInArea.forEach((c) => {
      if (c.paketMBG && c.paketMBG.includes("Paket B")) {
        realPortionB++;
      } else {
        realPortionA++;
      }
    });

    // Skala representasi simulasi untuk dapur SPPG kecamatan
    const baseMultiplier = 25; // Memperbesar simulasi untuk skala riil dapur kecamatan (misal: 120 porsi)
    const displayPortionB = realPortionB > 0 ? realPortionB * baseMultiplier : 35;
    const displayPortionA = realPortionA > 0 ? realPortionA * baseMultiplier : 85;
    const totalDisplayPortion = displayPortionA + displayPortionB;

    const recipes = db.recipes.find();
    const recipeB = recipes.find((r) => r.kategori.includes("Paket B")) || recipes[0];
    const recipeA = recipes.find((r) => r.kategori.includes("Paket A")) || recipes[recipes.length - 1];

    // Kalkulasi belanja harian
    const procurement = calculateProcurement({
      portionA: displayPortionA,
      portionB: displayPortionB
    });

    return res.json({
      success: true,
      data: {
        dapurInfo: {
          namaDapur: `Dapur Pelayanan MBG (SPPG) Mandiri Kec. ${kecamatan}`,
          kabupaten,
          kecamatan,
          statusDapur: "Aktif & Siap Distribusi",
          jamKirimUtama: "07:30 - 08:30 WIB"
        },
        kuotaHariIni: {
          totalPorsi: totalDisplayPortion,
          paketAReguler: displayPortionA,
          paketBIntervensi: displayPortionB,
          persentaseIntervensi: `${Math.round((displayPortionB / totalDisplayPortion) * 100)}%`
        },
        menuHariIni: {
          paketA: {
            id: recipeA.id,
            nama: recipeA.nama,
            komoditas: recipeA.komoditasUtama,
            energiKkal: recipeA.energiKkal,
            proteinGram: recipeA.proteinGram
          },
          paketB: {
            id: recipeB.id,
            nama: recipeB.nama,
            komoditas: recipeB.komoditasUtama,
            energiKkal: recipeB.energiKkal,
            proteinGram: recipeB.proteinGram
          }
        },
        kalkulatorBahanLokal: procurement
      }
    });
  } catch (error) {
    console.error("Kitchen Summary Error:", error);
    return res.status(500).json({ success: false, message: "Gagal memuat ringkasan dapur MBG.", error: error.message });
  }
};

exports.calculateCustomProcurement = (req, res) => {
  try {
    const { portionA, portionB, targetDate } = req.body;
    const result = calculateProcurement({
      portionA: parseInt(portionA) || 0,
      portionB: parseInt(portionB) || 0,
      targetDate
    });

    return res.json({
      success: true,
      message: "Kalkulasi kebutuhan belanja bahan pangan lokal Jawa Timur berhasil dihitung.",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal menghitung kebutuhan belanja.", error: error.message });
  }
};

exports.getSupplyLogs = (req, res) => {
  try {
    const logs = db.supply_logs.find().sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    const totalVolume = logs.reduce((acc, l) => acc + (l.volumeKg || 0), 0);
    const totalBiaya = logs.reduce((acc, l) => acc + (l.hargaTotalRp || 0), 0);

    return res.json({
      success: true,
      count: logs.length,
      totalVolumeKg: totalVolume,
      totalBiayaRp: totalBiaya,
      data: logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memuat log pasokan bahan.", error: error.message });
  }
};

exports.createSupplyLog = (req, res) => {
  try {
    const { pemasok, lokasi, komoditas, volumeKg, hargaTotalRp, statusMutu, catatan } = req.body;
    if (!pemasok || !komoditas || !volumeKg || !hargaTotalRp) {
      return res.status(400).json({ success: false, message: "Field wajib: pemasok, komoditas, volumeKg, hargaTotalRp." });
    }

    const newLog = db.supply_logs.create({
      id: `SP-${uuidv4().slice(0, 6).toUpperCase()}`,
      tanggal: new Date().toISOString().split("T")[0],
      pemasok,
      lokasi: lokasi || "Jawa Timur",
      komoditas,
      volumeKg: parseFloat(volumeKg),
      hargaTotalRp: parseInt(hargaTotalRp),
      statusMutu: statusMutu || "Tersertifikasi Segar",
      catatan: catatan || "Penyerapan pangan lokal Jatim."
    });

    return res.status(201).json({ success: true, message: "Log pembelian bahan lokal berhasil disimpan.", data: newLog });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat log pasokan.", error: error.message });
  }
};
