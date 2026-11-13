/**
 * Engine Kalkulasi Z-Score WHO & Permenkes No. 2/2020
 * Fitur 1: Smart KMS Digital & Deteksi Dini Kantong Stunting Jatim
 * - Warna Kurva Resmi Buku KIA Dinkes Jatim (Hijau, Kuning, Merah)
 * - Deteksi Growth Faltering (BB stagnan/turun 2 bulan berturut-turut)
 */

const { WHO_MEDIAN_DATA, KIA_JATIM_CURVE_CONFIG } = require("../config/whoStandards");

function interpolateMedianAndSD(table, ageMonths) {
  if (ageMonths <= table[0].age) {
    return { median: table[0].median, sd: table[0].sd };
  }
  const last = table[table.length - 1];
  if (ageMonths >= last.age) {
    return { median: last.median, sd: last.sd };
  }

  for (let i = 1; i < table.length; i++) {
    if (ageMonths <= table[i].age) {
      const prev = table[i - 1];
      const curr = table[i];
      const ratio = (ageMonths - prev.age) / (curr.age - prev.age);
      const median = prev.median + ratio * (curr.median - prev.median);
      const sd = prev.sd + ratio * (curr.sd - prev.sd);
      return { median, sd };
    }
  }
  return { median: last.median, sd: last.sd };
}

/**
 * Menghitung Z-Score antropometri dan mendeteksi Growth Faltering
 */
function assessChildGrowth({
  ageMonths,
  gender, // "L" atau "P"
  weightKg,
  heightCm,
  headCircumferenceCm = null,
  previousRecords = []
}) {
  const sexKey = gender === "P" ? "P" : "L";

  // 1. Z-Score Berat Badan menurut Umur (BB/U)
  const wRef = interpolateMedianAndSD(WHO_MEDIAN_DATA.weightForAge[sexKey], ageMonths);
  const zBBU = Math.round(((weightKg - wRef.median) / wRef.sd) * 100) / 100;

  // 2. Z-Score Tinggi/Panjang Badan menurut Umur (TB/U) - Indikator Stunting
  const hRef = interpolateMedianAndSD(WHO_MEDIAN_DATA.heightForAge[sexKey], ageMonths);
  const zTBU = Math.round(((heightCm - hRef.median) / hRef.sd) * 100) / 100;

  // 3. Estimasi Z-Score Berat terhadap Tinggi (BB/TB) - Indikator Wasting/Kurus
  const expectedWeightForHeight = (wRef.median / hRef.median) * heightCm;
  const zBBTB = Math.round(((weightKg - expectedWeightForHeight) / (wRef.sd * 1.1)) * 100) / 100;

  // 4. Deteksi Growth Faltering (SKPL-F04)
  // Berat badan mendatar (T) atau turun pada 2 pemeriksaan berurutan
  let isFaltering = false;
  let falteringReason = "";

  if (previousRecords && previousRecords.length >= 1) {
    const sorted = [...previousRecords].sort(
      (a, b) => new Date(b.recordDate || b.tgl).getTime() - new Date(a.recordDate || a.tgl).getTime()
    );
    const lastRecord = sorted[0];
    const prevWeight = lastRecord.weightKg || lastRecord.bb;

    if (weightKg <= prevWeight) {
      isFaltering = true;
      falteringReason = `Berat badan tidak naik / turun (${weightKg} kg vs ${prevWeight} kg bulan sebelumnya).`;
    }

    if (sorted.length >= 2) {
      const prev2Record = sorted[1];
      const prev2Weight = prev2Record.weightKg || prev2Record.bb;
      if (prevWeight <= prev2Weight && weightKg <= prevWeight) {
        isFaltering = true;
        falteringReason = `Peringatan Kritis: Berat badan stagnan/turun 2 bulan berturut-turut (${prev2Weight} kg -> ${prevWeight} kg -> ${weightKg} kg).`;
      }
    }
  }

  // 5. Klasifikasi Berdasarkan Warna Kurva Buku KIA Resmi Dinkes Jatim
  let kurvaKIA = "hijau";
  let statusNutrisi = "Normal";
  let statusStunting = "Normal (Perawakan Normal)";
  let statusGizi = "Gizi Baik";

  // Evaluasi Stunting berdasarkan zTBU (TB/U)
  if (zTBU < -3.0) {
    statusStunting = "Severely Stunted (Sangat Pendek)";
  } else if (zTBU < -2.0) {
    statusStunting = "Stunted (Pendek / Stunting)";
  } else if (zTBU > 3.0) {
    statusStunting = "Tinggi";
  }

  // Evaluasi Gizi berdasarkan zBBU & zBBTB
  if (zBBU < -3.0 || zBBTB < -3.0) {
    statusGizi = "Gizi Buruk / Severely Wasted";
  } else if (zBBU < -2.0 || zBBTB < -2.0) {
    statusGizi = "Gizi Kurang / Wasted";
  }

  // Tentukan Kurva KIA Jatim
  if (zTBU < -2.0 || zBBU < -3.0 || zBBTB < -3.0) {
    kurvaKIA = "merah";
    statusNutrisi = "Stunting / Gizi Buruk (Zona Merah KIA)";
  } else if (isFaltering || zBBU < -1.5 || zTBU < -1.5 || zBBTB < -1.5) {
    kurvaKIA = "kuning";
    statusNutrisi = "Waspada / Growth Faltering (Zona Kuning KIA)";
  } else {
    kurvaKIA = "hijau";
    statusNutrisi = "Normal (Zona Hijau KIA)";
  }

  const kiaConfig = KIA_JATIM_CURVE_CONFIG.zonaWarna[kurvaKIA];

  // 6. Alokasi Paket MBG Berbasis Komoditas Jawa Timur
  let paketMBG = "Paket A (Gizi Seimbang Reguler)";
  let rekomendasiMenu = "";

  if (kurvaKIA === "merah" || kurvaKIA === "kuning") {
    paketMBG = "Paket B (Intervensi Protein Hewani Ganda Jatim)";
    rekomendasiMenu =
      "Intervensi Sentra Pangan Jatim: Porsi Dobel Telur Ayam Ras Blitar kukus lembut + Fillet Ikan Lele/Kembung Lamongan/Tulungagung + Hati Ayam Heme & Daun Kelor Organik.";
  } else {
    paketMBG = "Paket A (Gizi Seimbang Reguler Jatim)";
    rekomendasiMenu =
      "Menu Reguler Jatim: Nasi tim beras lokal Jatim + kuah sayur bayam/daun kelor + tempe mendoan Kediri + suwir ayam ras.";
  }

  return {
    zScores: {
      zBBU, // Berat Badan menurut Umur
      zTBU, // Tinggi Badan menurut Umur (Stunting)
      zBBTB // Berat Badan menurut Tinggi Badan
    },
    status: {
      statusNutrisi,
      statusStunting,
      statusGizi,
      isFaltering,
      falteringReason
    },
    kurvaKIA: {
      warna: kurvaKIA,
      hex: kiaConfig.kode,
      label: kiaConfig.label,
      deskripsi: kiaConfig.deskripsi,
      tindakanKader: kiaConfig.tindakanKader
    },
    preskripsiMBG: {
      paketMBG,
      rekomendasiMenu,
      alokasiKategori: kurvaKIA === "hijau" ? "Reguler" : "Intervensi Protein Hewani Ganda"
    }
  };
}

module.exports = {
  assessChildGrowth
};
