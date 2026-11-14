/**
 * Data Struktur dan Mock Wilayah Mikro Tingkat Puskesmas (Kabupaten -> Kecamatan -> Desa -> Posyandu -> Balita)
 * Standar Permenkes No. 2/2020 & SKPL NutriTrack Jatim.
 */

export interface BalitaMikro {
  id: string;
  nama: string;
  nik: string;
  usiaBulan: number;
  jenisKelamin: "L" | "P";
  namaIbu: string;
  bbKg: number;
  tbCm: number;
  zTbu: number;
  zBbu: number;
  statusGizi: "Sehat / Normal" | "Waspada (Faltering)" | "Stunting Garis Merah" | "Gizi Buruk / Rujukan Faskes";
  alokasiPaket: "Paket A (Gizi Reguler)" | "Paket B (Protein Ganda Jatim)" | "Paket C (Terapi Medis F100)";
  catatanKlinis: string;
  statusRujukan: "Belum Perlu Rujukan" | "Dalam Pemantauan Kader" | "Rujukan Aktif ke Dokter Puskesmas";
}

export interface PosyanduMikro {
  id: string;
  posyandu: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  puskesmas: string;
  kaderPenanggungJawab: string;
  totalBalita: number;
  sehatCount: number;
  sehatPersen: number;
  stuntingCount: number;
  stuntingPersen: number;
  falteringCount: number;
  rujukanCount: number;
  paketA: number; // Balita Sehat
  paketB: number; // Stunting & Growth Faltering (Telur Blitar dobel + Lele Lamongan)
  paketC: number; // Rujukan Medis / Terapi F100
  balitaList: BalitaMikro[];
}

export const KECAMATAN_PER_KABUPATEN: Record<string, string[]> = {
  "Kab. Bangkalan": ["Socah", "Burneh", "Bangkalan", "Blega", "Kamal", "Arosbaya"],
  "Kab. Sampang": ["Kedungdung", "Torjun", "Sampang", "Camplong", "Ketapang"],
  "Kab. Jember": ["Sukowono", "Kalisat", "Ajung", "Sumbersari", "Patrang"],
  "Kab. Bondowoso": ["Bondowoso", "Maesan", "Prajekan", "Tamanan"],
  "Kab. Probolinggo": ["Krucil", "Tiris", "Dringu", "Kraksaan"],
  "Kab. Blitar": ["Sutojayan", "Kanigoro", "Talun", "Wlingi"],
  "Kab. Lamongan": ["Lamongan", "Babat", "Paciran", "Tikung"],
  "Kota Surabaya": ["Wonokromo", "Rungkut", "Tegalsari", "Tambaksari"],
};

export const POSYANDU_MIKRO_DATA: PosyanduMikro[] = [
  // --- KECAMATAN SOCAH (KAB. BANGKALAN) ---
  {
    id: "POS-SCH-01",
    posyandu: "Posyandu Mawar 01",
    desa: "Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    kaderPenanggungJawab: "Siti Rahmawati, S.Pd",
    totalBalita: 48,
    sehatCount: 35,
    sehatPersen: 72.9,
    stuntingCount: 10,
    stuntingPersen: 20.8,
    falteringCount: 3,
    rujukanCount: 3,
    paketA: 35,
    paketB: 10,
    paketC: 3,
    balitaList: [
      {
        id: "BAL-SCH-01",
        nama: "Ahmad Fauzi",
        nik: "3505126804240001",
        usiaBulan: 14,
        jenisKelamin: "L",
        namaIbu: "Siti Rahayu",
        bbKg: 8.4,
        tbCm: 72.8,
        zTbu: -2.42,
        zBbu: -2.15,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "BB stagnan 2 bulan berturut-turut. TB di bawah garis merah KIA Dinkes Jatim.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SCH-02",
        nama: "Siti Nur Aisyah",
        nik: "3505124502250002",
        usiaBulan: 18,
        jenisKelamin: "P",
        namaIbu: "Nurul Chotimah",
        bbKg: 10.2,
        tbCm: 81.5,
        zTbu: +0.22,
        zBbu: -0.15,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Tumbuh kembang optimal sesuai kurva hijau KIA Dinkes Jatim.",
        statusRujukan: "Belum Perlu Rujukan"
      },
      {
        id: "BAL-SCH-03",
        nama: "Dimas Aditya Pratama",
        nik: "3505121406240003",
        usiaBulan: 22,
        jenisKelamin: "L",
        namaIbu: "Sulastri",
        bbKg: 9.3,
        tbCm: 79.1,
        zTbu: -2.31,
        zBbu: -2.08,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Membutuhkan intervensi telur Blitar porsi ganda + lele Lamongan harian.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SCH-04",
        nama: "Nur Haliza",
        nik: "3505125508250004",
        usiaBulan: 9,
        jenisKelamin: "P",
        namaIbu: "Fatimah Azzahra",
        bbKg: 6.8,
        tbCm: 66.0,
        zTbu: -1.75,
        zBbu: -1.85,
        statusGizi: "Waspada (Faltering)",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Growth faltering terdeteksi. Kenaikan BB bulan ini hanya 100 gram (KBM tidak tercapai).",
        statusRujukan: "Dalam Pemantauan Kader"
      },
      {
        id: "BAL-SCH-05",
        nama: "Muhammad Rizky",
        nik: "3505121901240005",
        usiaBulan: 28,
        jenisKelamin: "L",
        namaIbu: "Khusnul Khotimah",
        bbKg: 12.6,
        tbCm: 90.2,
        zTbu: +0.45,
        zBbu: +0.10,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Gizi baik, nafsu makan tinggi, aktif bermain.",
        statusRujukan: "Belum Perlu Rujukan"
      },
      {
        id: "BAL-SCH-06",
        nama: "Bilqis Humaira",
        nik: "3505126107250006",
        usiaBulan: 16,
        jenisKelamin: "P",
        namaIbu: "Indah Permatasari",
        bbKg: 7.9,
        tbCm: 73.5,
        zTbu: -2.65,
        zBbu: -2.40,
        statusGizi: "Gizi Buruk / Rujukan Faskes",
        alokasiPaket: "Paket C (Terapi Medis F100)",
        catatanKlinis: "Terindikasi gizi kurang berat + riwayat batuk kronis. Wajib pemeriksaan spesialis anak di Puskesmas.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      }
    ]
  },
  {
    id: "POS-SCH-02",
    posyandu: "Posyandu Mawar 02",
    desa: "Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    kaderPenanggungJawab: "Dewi Lestari, S.Pd",
    totalBalita: 52,
    sehatCount: 40,
    sehatPersen: 76.9,
    stuntingCount: 9,
    stuntingPersen: 17.3,
    falteringCount: 3,
    rujukanCount: 2,
    paketA: 40,
    paketB: 9,
    paketC: 2,
    balitaList: [
      {
        id: "BAL-SCH-07",
        nama: "Farhan Maulana",
        nik: "3505121203240007",
        usiaBulan: 20,
        jenisKelamin: "L",
        namaIbu: "Lilik Suhartini",
        bbKg: 8.9,
        tbCm: 77.2,
        zTbu: -2.55,
        zBbu: -2.20,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Pendek kronis. Orang tua petani, edukasi PMT berbasis pangan hewani lokal.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SCH-08",
        nama: "Alika Putri",
        nik: "3505125005250008",
        usiaBulan: 12,
        jenisKelamin: "P",
        namaIbu: "Rina Marlina",
        bbKg: 9.1,
        tbCm: 75.0,
        zTbu: +0.10,
        zBbu: +0.05,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Pertumbuhan normal, imunisasi dasar lengkap.",
        statusRujukan: "Belum Perlu Rujukan"
      },
      {
        id: "BAL-SCH-09",
        nama: "Rasyid Ridho",
        nik: "3505121809240009",
        usiaBulan: 25,
        jenisKelamin: "L",
        namaIbu: "Sri Wahyuni",
        bbKg: 9.5,
        tbCm: 80.5,
        zTbu: -2.70,
        zBbu: -2.35,
        statusGizi: "Gizi Buruk / Rujukan Faskes",
        alokasiPaket: "Paket C (Terapi Medis F100)",
        catatanKlinis: "Garis merah KMS KIA. Mendapat paket formula F100 dan pemantauan dokter gizi puskesmas.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      }
    ]
  },
  {
    id: "POS-SCH-03",
    posyandu: "Posyandu Melati 01",
    desa: "Desa Dakiring",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    kaderPenanggungJawab: "Nur Aini",
    totalBalita: 42,
    sehatCount: 31,
    sehatPersen: 73.8,
    stuntingCount: 9,
    stuntingPersen: 21.4,
    falteringCount: 2,
    rujukanCount: 2,
    paketA: 31,
    paketB: 9,
    paketC: 2,
    balitaList: [
      {
        id: "BAL-SCH-10",
        nama: "Ilyas Ramadhan",
        nik: "3505122503250010",
        usiaBulan: 15,
        jenisKelamin: "L",
        namaIbu: "Maryam",
        bbKg: 8.6,
        tbCm: 73.8,
        zTbu: -2.30,
        zBbu: -1.95,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Stunting derajat sedang. Perlu pendampingan pola asuh makan.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SCH-11",
        nama: "Zahira Anindita",
        nik: "3505124808240011",
        usiaBulan: 21,
        jenisKelamin: "P",
        namaIbu: "Fitriyah",
        bbKg: 11.2,
        tbCm: 84.1,
        zTbu: +0.35,
        zBbu: +0.20,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Tumbuh kembang sangat baik di zona hijau KIA.",
        statusRujukan: "Belum Perlu Rujukan"
      }
    ]
  },
  {
    id: "POS-SCH-04",
    posyandu: "Posyandu Kamboja 02",
    desa: "Desa Jaddih",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    kaderPenanggungJawab: "Musdalifah",
    totalBalita: 60,
    sehatCount: 44,
    sehatPersen: 73.3,
    stuntingCount: 13,
    stuntingPersen: 21.7,
    falteringCount: 3,
    rujukanCount: 3,
    paketA: 44,
    paketB: 13,
    paketC: 3,
    balitaList: [
      {
        id: "BAL-SCH-12",
        nama: "Hafizh Al-Fatih",
        nik: "3505120401240012",
        usiaBulan: 23,
        jenisKelamin: "L",
        namaIbu: "Nur Jannah",
        bbKg: 9.6,
        tbCm: 80.0,
        zTbu: -2.48,
        zBbu: -2.10,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Prioritas intervensi telur & lele dari Dapur MBG Socah.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SCH-13",
        nama: "Nabila Syakira",
        nik: "3505125211240013",
        usiaBulan: 17,
        jenisKelamin: "P",
        namaIbu: "Aminah",
        bbKg: 9.8,
        tbCm: 80.2,
        zTbu: +0.05,
        zBbu: -0.10,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Balita sehat, berat badan naik rutin setiap bulan.",
        statusRujukan: "Belum Perlu Rujukan"
      }
    ]
  },

  // --- KECAMATAN BURNEH (KAB. BANGKALAN) ---
  {
    id: "POS-BNH-01",
    posyandu: "Posyandu Kenanga 01",
    desa: "Desa Burneh",
    kecamatan: "Burneh",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Burneh",
    kaderPenanggungJawab: "Halimah",
    totalBalita: 55,
    sehatCount: 41,
    sehatPersen: 74.5,
    stuntingCount: 11,
    stuntingPersen: 20.0,
    falteringCount: 3,
    rujukanCount: 2,
    paketA: 41,
    paketB: 11,
    paketC: 2,
    balitaList: [
      {
        id: "BAL-BNH-01",
        nama: "Kafi Arsyad",
        nik: "3505021203240001",
        usiaBulan: 19,
        jenisKelamin: "L",
        namaIbu: "Ernawati",
        bbKg: 9.0,
        tbCm: 77.0,
        zTbu: -2.35,
        zBbu: -2.05,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Membutuhkan suplementasi gizi hewan dan edukasi sanitasi air bersih.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-BNH-02",
        nama: "Alya Safira",
        nik: "3505024409240002",
        usiaBulan: 13,
        jenisKelamin: "P",
        namaIbu: "Kurnia",
        bbKg: 9.2,
        tbCm: 76.5,
        zTbu: +0.15,
        zBbu: +0.05,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Sehat, kenaikan BB adekuat (hijau).",
        statusRujukan: "Belum Perlu Rujukan"
      }
    ]
  },

  // --- KECAMATAN KEDUNGDUNG (KAB. SAMPANG) ---
  {
    id: "POS-SMP-01",
    posyandu: "Posyandu Melati 03",
    desa: "Desa Banjarsari",
    kecamatan: "Kedungdung",
    kabupaten: "Kab. Sampang",
    puskesmas: "Puskesmas Kedungdung",
    kaderPenanggungJawab: "Sri Utami",
    totalBalita: 64,
    sehatCount: 46,
    sehatPersen: 71.9,
    stuntingCount: 15,
    stuntingPersen: 23.4,
    falteringCount: 3,
    rujukanCount: 3,
    paketA: 46,
    paketB: 15,
    paketC: 3,
    balitaList: [
      {
        id: "BAL-SMP-01",
        nama: "Budi Santoso",
        nik: "3505141209240003",
        usiaBulan: 24,
        jenisKelamin: "L",
        namaIbu: "Dewi Lestari",
        bbKg: 9.8,
        tbCm: 80.2,
        zTbu: -2.68,
        zBbu: -2.35,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "TB/U sangat rendah (-2.68 SD). Rujukan medis langsung ke dokter anak Puskesmas Kedungdung.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-SMP-02",
        nama: "Anisa Rahma",
        nik: "3505144802250004",
        usiaBulan: 14,
        jenisKelamin: "P",
        namaIbu: "Husnul Hotimah",
        bbKg: 9.4,
        tbCm: 77.0,
        zTbu: +0.25,
        zBbu: +0.10,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Balita sehat, tidak ada keluhan nafsu makan.",
        statusRujukan: "Belum Perlu Rujukan"
      }
    ]
  },

  // --- KECAMATAN SUKOWONO (KAB. JEMBER) ---
  {
    id: "POS-JMB-01",
    posyandu: "Posyandu Cempaka 01",
    desa: "Desa Sukowono",
    kecamatan: "Sukowono",
    kabupaten: "Kab. Jember",
    puskesmas: "Puskesmas Sukowono",
    kaderPenanggungJawab: "Yuliani",
    totalBalita: 58,
    sehatCount: 43,
    sehatPersen: 74.1,
    stuntingCount: 12,
    stuntingPersen: 20.7,
    falteringCount: 3,
    rujukanCount: 3,
    paketA: 43,
    paketB: 12,
    paketC: 3,
    balitaList: [
      {
        id: "BAL-JMB-01",
        nama: "Reza Maulana",
        nik: "3509121504240001",
        usiaBulan: 21,
        jenisKelamin: "L",
        namaIbu: "Wulandari",
        bbKg: 9.1,
        tbCm: 78.4,
        zTbu: -2.38,
        zBbu: -2.12,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Stunting terdeteksi pada penimbangan kader Sukowono. Diberikan dobel protein telur & ikan.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas"
      },
      {
        id: "BAL-JMB-02",
        nama: "Maya Puspita",
        nik: "3509124409240002",
        usiaBulan: 16,
        jenisKelamin: "P",
        namaIbu: "Hartatik",
        bbKg: 10.0,
        tbCm: 80.5,
        zTbu: +0.30,
        zBbu: +0.15,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Tumbuh kembang optimal, BB dan TB naik sesuai kurva hijau.",
        statusRujukan: "Belum Perlu Rujukan"
      }
    ]
  }
];
