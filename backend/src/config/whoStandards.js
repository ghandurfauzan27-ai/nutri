/**
 * Standar Antropometri Anak Kemenkes RI (Permenkes No. 2/2020) & WHO Child Growth Standards
 * Dilengkapi Pemetaan Warna Kurva Buku KIA Resmi Dinas Kesehatan Provinsi Jawa Timur
 */

// Referensi Median & SD Aproksimasi Berdasarkan Usia (Bulan) dan Jenis Kelamin (L/P)
// L = Laki-laki, P = Perempuan
const WHO_MEDIAN_DATA = {
  // Berat Badan menurut Umur (BB/U) - kg
  weightForAge: {
    L: [
      { age: 0, median: 3.3, sd: 0.4 },
      { age: 3, median: 6.4, sd: 0.7 },
      { age: 6, median: 7.9, sd: 0.8 },
      { age: 9, median: 8.9, sd: 0.9 },
      { age: 12, median: 9.6, sd: 1.0 },
      { age: 15, median: 10.3, sd: 1.1 },
      { age: 18, median: 10.9, sd: 1.2 },
      { age: 21, median: 11.5, sd: 1.25 },
      { age: 24, median: 12.2, sd: 1.35 },
      { age: 30, median: 13.3, sd: 1.5 },
      { age: 36, median: 14.3, sd: 1.7 },
      { age: 48, median: 16.3, sd: 2.0 },
      { age: 60, median: 18.3, sd: 2.3 }
    ],
    P: [
      { age: 0, median: 3.2, sd: 0.4 },
      { age: 3, median: 5.8, sd: 0.7 },
      { age: 6, median: 7.3, sd: 0.8 },
      { age: 9, median: 8.2, sd: 0.9 },
      { age: 12, median: 8.9, sd: 1.0 },
      { age: 15, median: 9.6, sd: 1.1 },
      { age: 18, median: 10.2, sd: 1.2 },
      { age: 21, median: 10.9, sd: 1.25 },
      { age: 24, median: 11.5, sd: 1.35 },
      { age: 30, median: 12.7, sd: 1.5 },
      { age: 36, median: 13.9, sd: 1.7 },
      { age: 48, median: 16.1, sd: 2.0 },
      { age: 60, median: 18.2, sd: 2.3 }
    ]
  },
  // Panjang/Tinggi Badan menurut Umur (PB/U atau TB/U) - cm
  heightForAge: {
    L: [
      { age: 0, median: 49.9, sd: 1.9 },
      { age: 3, median: 61.4, sd: 2.2 },
      { age: 6, median: 67.6, sd: 2.4 },
      { age: 9, median: 72.0, sd: 2.5 },
      { age: 12, median: 75.7, sd: 2.6 },
      { age: 15, median: 79.1, sd: 2.8 },
      { age: 18, median: 82.3, sd: 2.9 },
      { age: 21, median: 85.1, sd: 3.1 },
      { age: 24, median: 87.8, sd: 3.3 },
      { age: 30, median: 92.4, sd: 3.6 },
      { age: 36, median: 96.1, sd: 3.8 },
      { age: 48, median: 103.3, sd: 4.2 },
      { age: 60, median: 110.0, sd: 4.6 }
    ],
    P: [
      { age: 0, median: 49.1, sd: 1.9 },
      { age: 3, median: 59.8, sd: 2.2 },
      { age: 6, median: 65.7, sd: 2.4 },
      { age: 9, median: 70.1, sd: 2.5 },
      { age: 12, median: 74.0, sd: 2.6 },
      { age: 15, median: 77.5, sd: 2.8 },
      { age: 18, median: 80.7, sd: 2.9 },
      { age: 21, median: 83.7, sd: 3.1 },
      { age: 24, median: 86.4, sd: 3.3 },
      { age: 30, median: 91.2, sd: 3.6 },
      { age: 36, median: 95.1, sd: 3.8 },
      { age: 48, median: 102.7, sd: 4.2 },
      { age: 60, median: 109.4, sd: 4.6 }
    ]
  }
};

/**
 * Visual Kurva KMS Buku KIA Resmi Dinas Kesehatan Provinsi Jawa Timur
 */
const KIA_JATIM_CURVE_CONFIG = {
  provinsi: "Dinas Kesehatan Provinsi Jawa Timur",
  pedoman: "Buku Kesehatan Ibu dan Anak (KIA) & Permenkes No. 2 Tahun 2020",
  zonaWarna: {
    hijau: {
      kode: "#10B981", // Emerald Green KIA
      label: "Hijau: Tumbuh Normal & Baik",
      deskripsi: "Berat dan tinggi badan balita berada di pita hijau (garis normal). Pertahankan pola asuh dan asupan bergizi.",
      intervensiMBG: "Paket A (Gizi Seimbang Reguler Berbasis Komoditas Lokal Jatim)",
      tindakanKader: "Beri pujian kepada ibu balita, anjurkan ASI eksklusif/MPASI berkualitas dan pemantauan rutin bulan depan."
    },
    kuning: {
      kode: "#F59E0B", // Amber Yellow KIA
      label: "Kuning: Waspada / Growth Faltering",
      deskripsi: "Grafik pertumbuhan mendatar (T) atau berat badan di pita kuning. Sinyal awal defisit gizi sebelum stunting menetap.",
      intervensiMBG: "Paket B (Intervensi Protein Hewani Ganda: Telur Blitar & Lele/Kembung Lamongan)",
      tindakanKader: "Konseling gizi intensif, pastikan porsi protein hewani dobel, dan pantau kenaikan BB minggu ke-2."
    },
    merah: {
      kode: "#EF4444", // Crimson Red KIA (BGM)
      label: "Merah: Bawah Garis Merah (BGM) / Risiko Stunting Berat",
      deskripsi: "Z-score < -2 SD atau kurva berada di bawah garis merah KIA. Berisiko tinggi mengalami stunting atau gizi buruk kronis.",
      intervensiMBG: "Paket B (Intervensi Ekstra Protein Hewani + Hati Ayam + Kelor Jatim) + Rujukan Medis Puskesmas",
      tindakanKader: "SEGERA buat Surat Rujukan Elektronik ke Puskesmas dan dampingi pemberian paket MBG harian."
    }
  }
};

module.exports = {
  WHO_MEDIAN_DATA,
  KIA_JATIM_CURVE_CONFIG
};
