/**
 * Data Struktur dan Pemetaan Hierarki Wilayah Jawa Timur:
 * Kabupaten -> Kecamatan (Puskesmas Pembina) -> Desa -> Posyandu Desa -> Balita
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
  posyandu: string; // e.g. "Posyandu Mawar 01"
  desa: string; // e.g. "Desa Bilaporah"
  alamatPosyandu: string; // e.g. "Balai RW 02, Dusun Krajan"
  kecamatan: string; // e.g. "Socah"
  kabupaten: string; // e.g. "Kab. Bangkalan"
  puskesmas: string; // e.g. "Puskesmas Socah"
  alamatPuskesmas: string; // e.g. "Jl. Raya Socah No. 45"
  kaderPenanggungJawab: string;
  noHpKader: string;
  emailAkun: string;
  statusAkun: "Disetujui" | "Menunggu Verifikasi" | "Ditolak";
  tglDaftar: string;
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

export interface PuskesmasInfo {
  namaPuskesmas: string;
  kecamatan: string;
  kabupaten: string;
  alamat: string;
  kepalaPuskesmas: string;
  nutrisionisPJ: string;
  telepon: string;
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

export const DESA_PER_KECAMATAN: Record<string, string[]> = {
  // Bangkalan
  Socah: ["Desa Bilaporah", "Desa Dakiring", "Desa Jaddih", "Desa Socah", "Desa Keleyan", "Desa Pernajuh", "Desa Petaonan", "Desa Junganyar"],
  Burneh: ["Desa Burneh", "Desa Langkap", "Desa Benangkah", "Desa Sobih", "Desa Pangolangan", "Desa Kapor"],
  Bangkalan: ["Kel. Demangan", "Kel. Kraton", "Kel. Kemayoran", "Kel. Mlajah", "Desa Gebang", "Desa Ujung Piring"],
  Blega: ["Desa Blega", "Desa Bates", "Desa Lomaer", "Desa Nyormanis", "Desa Karang Gayam"],
  Kamal: ["Desa Kamal", "Desa Banyuajuh", "Desa Tanjung Jati", "Desa Kebun", "Desa Gili Barat"],
  Arosbaya: ["Desa Arosbaya", "Desa Tengket", "Desa Plakaran", "Desa Pandan Lanjang", "Desa Makam Agung"],
  // Sampang
  Kedungdung: ["Desa Banjarsari", "Desa Moktesareh", "Desa Rabasan", "Desa Pajeruan", "Desa Rohayu"],
  Torjun: ["Desa Torjun", "Desa Pangongsean", "Desa Dulang", "Desa Jeruk Porot"],
  Sampang: ["Kel. Rongtengah", "Kel. Gunung Sekar", "Desa Tanggumong", "Desa Kamoning"],
  Camplong: ["Desa Dharma Camplong", "Desa Tambaan", "Desa Sejati", "Desa Madupat"],
  Ketapang: ["Desa Ketapang Barat", "Desa Ketapang Timur", "Desa Paopale Laok", "Desa Bira Tengah"],
  // Jember
  Sukowono: ["Desa Sukowono", "Desa Arjasa", "Desa Sumberwringin", "Desa Balet Baru", "Desa Mojogemi"],
  Kalisat: ["Desa Kalisat", "Desa Glagahwero", "Desa Ajung", "Desa Sumber Jeruk"],
  Ajung: ["Desa Ajung", "Desa Klompangan", "Desa Pancakarya", "Desa Sukamakmur"],
  Sumbersari: ["Kel. Sumbersari", "Kel. Antirogo", "Kel. Kranjingan", "Kel. Wirolegi"],
  Patrang: ["Kel. Patrang", "Kel. Baratan", "Kel. Gebang", "Kel. Jemberlor"],
  // Bondowoso
  Bondowoso: ["Kel. Dabasah", "Kel. Kotakulon", "Kel. Blindungan", "Kel. Badean"],
  Maesan: ["Desa Maesan", "Desa Suger Lor", "Desa Pujerbaru", "Desa Gunungsari"],
  Prajekan: ["Desa Prajekan Kidul", "Desa Prajekan Lor", "Desa Tarum", "Desa Walidono"],
  Tamanan: ["Desa Tamanan", "Desa Kalianyar", "Desa Sukodono", "Desa Wonosuko"],
  // Probolinggo
  Krucil: ["Desa Bermi", "Desa Guyangan", "Desa Betek", "Desa Tambelang", "Desa Kalianan"],
  Tiris: ["Desa Tiris", "Desa Andungsari", "Desa Ranuagung", "Desa Tegalwatu"],
  Dringu: ["Desa Dringu", "Desa Pabean", "Desa Kalirejo", "Desa Kedungdalem"],
  Kraksaan: ["Kel. Sidomukti", "Kel. Patokan", "Kel. Semampir", "Desa Kandangjati Wetan"],
  // Blitar
  Sutojayan: ["Desa Pandanarum", "Kel. Sukorejo", "Kel. Kalipang", "Desa Jingglong"],
  Kanigoro: ["Kel. Kanigoro", "Desa Satreyan", "Desa Sawentar", "Desa Tlogo"],
  Talun: ["Kel. Talun", "Desa Pasirharjo", "Desa Duren", "Desa Bendosewu"],
  Wlingi: ["Kel. Wlingi", "Kel. Beru", "Kel. Babadan", "Desa Tegalasri"],
  // Lamongan
  Lamongan: ["Kel. Sidoharjo", "Kel. Sukorejo", "Desa Made", "Desa Tanjung"],
  Babat: ["Kel. Babat", "Desa Bedahan", "Desa Plaosan", "Desa Gembong"],
  Paciran: ["Desa Paciran", "Desa Tunggul", "Desa Kranji", "Desa Weru"],
  Tikung: ["Desa Tikung", "Desa Bakalanpule", "Desa Pengumbulanadi", "Desa Jatirejo"],
  // Surabaya
  Wonokromo: ["Kel. Wonokromo", "Kel. Darmo", "Kel. Jagir", "Kel. Ngagel", "Kel. Sawunggaling"],
  Rungkut: ["Kel. Rungkut Lor", "Kel. Kali Rungkut", "Kel. Kedung Baruk", "Kel. Medokan Ayu"],
  Tegalsari: ["Kel. Tegalsari", "Kel. Dr. Soetomo", "Kel. Kedungdoro", "Kel. Keputran"],
  Tambaksari: ["Kel. Tambaksari", "Kel. Pacarkeling", "Kel. Gading", "Kel. Ploso"],
};

export const MASTER_PUSKESMAS_INFO: Record<string, PuskesmasInfo> = {
  Socah: {
    namaPuskesmas: "Puskesmas Socah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    alamat: "Jl. Raya Socah No. 45, Socah, Bangkalan 69161",
    kepalaPuskesmas: "dr. H. Achmad Syafi'i",
    nutrisionisPJ: "dr. Nurul Hidayati, M.Gizi",
    telepon: "(031) 3098124",
  },
  Burneh: {
    namaPuskesmas: "Puskesmas Burneh",
    kecamatan: "Burneh",
    kabupaten: "Kab. Bangkalan",
    alamat: "Jl. Raya Burneh No. 12, Burneh, Bangkalan 69121",
    kepalaPuskesmas: "dr. Hj. Ratna Indrawati",
    nutrisionisPJ: "Siti Maryam, S.Gz",
    telepon: "(031) 3092211",
  },
  Bangkalan: {
    namaPuskesmas: "Puskesmas Bangkalan Kota",
    kecamatan: "Bangkalan",
    kabupaten: "Kab. Bangkalan",
    alamat: "Jl. Pemuda Kaffa No. 8, Bangkalan 69112",
    kepalaPuskesmas: "dr. Tri Sulistyo",
    nutrisionisPJ: "Dewi Anggraini, S.Tr.Gz",
    telepon: "(031) 3095030",
  },
  Kedungdung: {
    namaPuskesmas: "Puskesmas Kedungdung",
    kecamatan: "Kedungdung",
    kabupaten: "Kab. Sampang",
    alamat: "Jl. Raya Kedungdung No. 88, Sampang 69252",
    kepalaPuskesmas: "dr. Mochammad Fauzan",
    nutrisionisPJ: "Husnul Hotimah, A.Md.Gz",
    telepon: "(0323) 321890",
  },
  Sukowono: {
    namaPuskesmas: "Puskesmas Sukowono",
    kecamatan: "Sukowono",
    kabupaten: "Kab. Jember",
    alamat: "Jl. PB Sudirman No. 15, Sukowono, Jember 68194",
    kepalaPuskesmas: "dr. Andy Kurniawan",
    nutrisionisPJ: "Rina Kusuma, S.Gz",
    telepon: "(0331) 561234",
  },
  Sutojayan: {
    namaPuskesmas: "Puskesmas Sutojayan",
    kecamatan: "Sutojayan",
    kabupaten: "Kab. Blitar",
    alamat: "Jl. Raya Barat Sutojayan No. 20, Blitar 66172",
    kepalaPuskesmas: "dr. Eko Prasetyo",
    nutrisionisPJ: "Lestari Wulandari, S.Tr.Gz",
    telepon: "(0342) 441029",
  },
};

// Data Awal Posyandu Desa Terdaftar di Jawa Timur
export const POSYANDU_MIKRO_DATA: PosyanduMikro[] = [
  // --- KECAMATAN SOCAH (KAB. BANGKALAN) ---
  {
    id: "POS-SCH-01",
    posyandu: "Posyandu Mawar 01",
    desa: "Desa Bilaporah",
    alamatPosyandu: "Balai RW 01, Dusun Krajan Barat, Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Siti Rahmawati, S.Pd",
    noHpKader: "081234567891",
    emailAkun: "posyandu.mawar01@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "1 Okt 2026",
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
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
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
        statusRujukan: "Belum Perlu Rujukan",
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
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
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
        statusRujukan: "Dalam Pemantauan Kader",
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
        zBbu: +0.1,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Gizi baik, nafsu makan tinggi, aktif bermain.",
        statusRujukan: "Belum Perlu Rujukan",
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
        zBbu: -2.4,
        statusGizi: "Gizi Buruk / Rujukan Faskes",
        alokasiPaket: "Paket C (Terapi Medis F100)",
        catatanKlinis: "Terindikasi gizi kurang berat + riwayat batuk kronis. Wajib pemeriksaan spesialis anak di Puskesmas.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },
  {
    id: "POS-SCH-02",
    posyandu: "Posyandu Mawar 02",
    desa: "Desa Bilaporah",
    alamatPosyandu: "Balai Dusun Jedingan RT 03 / RW 04, Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Dewi Lestari, S.Pd",
    noHpKader: "081234567801",
    emailAkun: "posyandu.mawar02@jatim.go.id",
    statusAkun: "Menunggu Verifikasi",
    tglDaftar: "Hari ini, 08:30 WIB",
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
        zBbu: -2.2,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Pendek kronis. Orang tua petani, edukasi PMT berbasis pangan hewani lokal.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
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
        zTbu: +0.1,
        zBbu: +0.05,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Pertumbuhan normal, imunisasi dasar lengkap.",
        statusRujukan: "Belum Perlu Rujukan",
      },
    ],
  },
  {
    id: "POS-SCH-03",
    posyandu: "Posyandu Melati 01",
    desa: "Desa Dakiring",
    alamatPosyandu: "Balai Desa Dakiring Timur RT 01 / RW 01, Socah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Nur Aini",
    noHpKader: "081234567802",
    emailAkun: "posyandu.dakiring@jatim.go.id",
    statusAkun: "Menunggu Verifikasi",
    tglDaftar: "Kemarin, 14:15 WIB",
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
        zTbu: -2.3,
        zBbu: -1.95,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Stunting derajat sedang. Perlu pendampingan pola asuh makan.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
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
        zBbu: +0.2,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Tumbuh kembang sangat baik di zona hijau KIA.",
        statusRujukan: "Belum Perlu Rujukan",
      },
    ],
  },
  {
    id: "POS-SCH-04",
    posyandu: "Posyandu Kamboja 02",
    desa: "Desa Jaddih",
    alamatPosyandu: "Balai Dusun Jaddih Barat RT 02 / RW 03",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Musdalifah",
    noHpKader: "081234567803",
    emailAkun: "posyandu.jaddih02@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "15 Okt 2026",
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
        zBbu: -2.1,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Prioritas intervensi telur & lele dari Dapur MBG Socah.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },
  {
    id: "POS-SCH-05",
    posyandu: "Posyandu Cempaka 01",
    desa: "Desa Socah",
    alamatPosyandu: "Balai Desa Socah RT 01 / RW 01, Jl. Pelabuhan",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Hj. Mariyatul Qibtiyah",
    noHpKader: "081234567811",
    emailAkun: "posyandu.socah01@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "8 Okt 2026",
    totalBalita: 50,
    sehatCount: 38,
    sehatPersen: 76.0,
    stuntingCount: 9,
    stuntingPersen: 18.0,
    falteringCount: 3,
    rujukanCount: 2,
    paketA: 38,
    paketB: 9,
    paketC: 2,
    balitaList: [
      {
        id: "BAL-SCH-14",
        nama: "Rizki Ananda",
        nik: "3505121102240014",
        usiaBulan: 17,
        jenisKelamin: "L",
        namaIbu: "Siti Kholifah",
        bbKg: 9.2,
        tbCm: 76.8,
        zTbu: -2.25,
        zBbu: -1.9,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Perlu pemantauan kepatuhan konsumsi paket MBG telur Blitar harian.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
      {
        id: "BAL-SCH-15",
        nama: "Putri Anggraeni",
        nik: "3505124905250015",
        usiaBulan: 11,
        jenisKelamin: "P",
        namaIbu: "Wahyuni",
        bbKg: 8.8,
        tbCm: 73.2,
        zTbu: +0.1,
        zBbu: +0.05,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Tumbuh kembang baik, kurva KMS hijau optimal.",
        statusRujukan: "Belum Perlu Rujukan",
      },
    ],
  },
  {
    id: "POS-SCH-06",
    posyandu: "Posyandu Anggrek 01",
    desa: "Desa Keleyan",
    alamatPosyandu: "Balai Dusun Keleyan Timur RT 02 / RW 01",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Khodijah",
    noHpKader: "081234567812",
    emailAkun: "posyandu.keleyan@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "10 Okt 2026",
    totalBalita: 46,
    sehatCount: 35,
    sehatPersen: 76.1,
    stuntingCount: 8,
    stuntingPersen: 17.4,
    falteringCount: 3,
    rujukanCount: 1,
    paketA: 35,
    paketB: 8,
    paketC: 1,
    balitaList: [
      {
        id: "BAL-SCH-16",
        nama: "Fauzan Kamil",
        nik: "3505120304240016",
        usiaBulan: 22,
        jenisKelamin: "L",
        namaIbu: "Rukayah",
        bbKg: 9.3,
        tbCm: 78.5,
        zTbu: -2.4,
        zBbu: -2.1,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Kurang asupan protein hewani. Jadwal makan teratur dengan lauk ikan lele Lamongan.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },
  {
    id: "POS-SCH-07",
    posyandu: "Posyandu Kenanga 01",
    desa: "Desa Petaonan",
    alamatPosyandu: "Balai RW 01 Dusun Petaonan Barat",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Jamilah",
    noHpKader: "081234567813",
    emailAkun: "posyandu.petaonan@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "18 Okt 2026",
    totalBalita: 38,
    sehatCount: 29,
    sehatPersen: 76.3,
    stuntingCount: 7,
    stuntingPersen: 18.4,
    falteringCount: 2,
    rujukanCount: 1,
    paketA: 29,
    paketB: 7,
    paketC: 1,
    balitaList: [
      {
        id: "BAL-SCH-17",
        nama: "Alif Akbar",
        nik: "3505121408240017",
        usiaBulan: 18,
        jenisKelamin: "L",
        namaIbu: "Sumiyati",
        bbKg: 8.7,
        tbCm: 75.9,
        zTbu: -2.3,
        zBbu: -2.0,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Balita stunting ringan, nafsu makan membaik setelah pemberian bubur lele.",
        statusRujukan: "Dalam Pemantauan Kader",
      },
    ],
  },
  {
    id: "POS-SCH-08",
    posyandu: "Posyandu Flamboyan 01",
    desa: "Desa Junganyar",
    alamatPosyandu: "Balai Dusun Junganyar Pesisir RT 01",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Uswatun Hasanah",
    noHpKader: "081234567814",
    emailAkun: "posyandu.junganyar@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "22 Okt 2026",
    totalBalita: 44,
    sehatCount: 34,
    sehatPersen: 77.3,
    stuntingCount: 8,
    stuntingPersen: 18.2,
    falteringCount: 2,
    rujukanCount: 2,
    paketA: 34,
    paketB: 8,
    paketC: 2,
    balitaList: [
      {
        id: "BAL-SCH-18",
        nama: "Naila Husna",
        nik: "3505125206250018",
        usiaBulan: 13,
        jenisKelamin: "P",
        namaIbu: "Syarifah",
        bbKg: 9.3,
        tbCm: 76.0,
        zTbu: +0.05,
        zBbu: -0.05,
        statusGizi: "Sehat / Normal",
        alokasiPaket: "Paket A (Gizi Reguler)",
        catatanKlinis: "Anak sehat pesisir pantai, konsumsi ikan laut cukup.",
        statusRujukan: "Belum Perlu Rujukan",
      },
    ],
  },
  {
    id: "POS-SCH-09",
    posyandu: "Posyandu Bougenville 01",
    desa: "Desa Pernajuh",
    alamatPosyandu: "Balai RW 02 Dusun Pernajuh Tengah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Socah",
    alamatPuskesmas: "Jl. Raya Socah No. 45, Bangkalan",
    kaderPenanggungJawab: "Salimah",
    noHpKader: "081234567815",
    emailAkun: "posyandu.pernajuh@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "25 Okt 2026",
    totalBalita: 40,
    sehatCount: 31,
    sehatPersen: 77.5,
    stuntingCount: 7,
    stuntingPersen: 17.5,
    falteringCount: 2,
    rujukanCount: 1,
    paketA: 31,
    paketB: 7,
    paketC: 1,
    balitaList: [
      {
        id: "BAL-SCH-19",
        nama: "Fikri Haikal",
        nik: "3505121609240019",
        usiaBulan: 20,
        jenisKelamin: "L",
        namaIbu: "Rohani",
        bbKg: 8.8,
        tbCm: 77.0,
        zTbu: -2.35,
        zBbu: -2.05,
        statusGizi: "Stunting Garis Merah",
        alokasiPaket: "Paket B (Protein Ganda Jatim)",
        catatanKlinis: "Telah mendapatkan suplemen zink dan paket MBG gizi ganda.",
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },

  // --- KECAMATAN BURNEH (KAB. BANGKALAN) ---
  {
    id: "POS-BNH-01",
    posyandu: "Posyandu Kenanga 01",
    desa: "Desa Burneh",
    alamatPosyandu: "Balai RW 03 Dusun Burneh Tengah",
    kecamatan: "Burneh",
    kabupaten: "Kab. Bangkalan",
    puskesmas: "Puskesmas Burneh",
    alamatPuskesmas: "Jl. Raya Burneh No. 12, Bangkalan",
    kaderPenanggungJawab: "Halimah",
    noHpKader: "081234567804",
    emailAkun: "posyandu.burneh01@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "20 Okt 2026",
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
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },

  // --- KECAMATAN KEDUNGDUNG (KAB. SAMPANG) ---
  {
    id: "POS-SMP-01",
    posyandu: "Posyandu Melati 03",
    desa: "Desa Banjarsari",
    alamatPosyandu: "Balai Dusun Banjarsari Timur RT 02",
    kecamatan: "Kedungdung",
    kabupaten: "Kab. Sampang",
    puskesmas: "Puskesmas Kedungdung",
    alamatPuskesmas: "Jl. Raya Kedungdung No. 88, Sampang",
    kaderPenanggungJawab: "Sri Utami",
    noHpKader: "081234567805",
    emailAkun: "posyandu.banjarsari@jatim.go.id",
    statusAkun: "Disetujui",
    tglDaftar: "12 Okt 2026",
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
        statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
      },
    ],
  },
];

// Helper: Ambil nama Puskesmas resmi berdasarkan Kecamatan
export function getPuskesmasNameByKecamatan(kecamatan: string): string {
  if (MASTER_PUSKESMAS_INFO[kecamatan]) {
    return MASTER_PUSKESMAS_INFO[kecamatan].namaPuskesmas;
  }
  return `Puskesmas ${kecamatan}`;
}

// Helper: Ambil alamat Puskesmas resmi berdasarkan Kecamatan
export function getPuskesmasAddressByKecamatan(kecamatan: string): string {
  if (MASTER_PUSKESMAS_INFO[kecamatan]) {
    return MASTER_PUSKESMAS_INFO[kecamatan].alamat;
  }
  return `Jl. Raya Kecamatan ${kecamatan}, Jawa Timur`;
}

// -------------------------------------------------------------
// STRUKTUR JADWAL PERTEMUAN STUNTING (PUSKESMAS -> POSYANDU)
// -------------------------------------------------------------
export interface JadwalPertemuanStunting {
  id: string;
  puskesmas: string;
  posyanduTarget: string;
  desa: string;
  namaBalita: string;
  nikBalita: string;
  tglPertemuan: string;
  waktuPertemuan: string;
  lokasi: string;
  dokterPemeriksa: string;
  agendaIntervensi: string;
  catatanKhusus: string;
  status: "Dijadwalkan" | "Selesai" | "Dibatalkan";
  tglDibuat: string;
}

export const INITIAL_JADWAL_PERTEMUAN: JadwalPertemuanStunting[] = [
  {
    id: "JADWAL-SCH-01",
    puskesmas: "Puskesmas Socah",
    posyanduTarget: "Posyandu Mawar 01",
    desa: "Desa Bilaporah",
    namaBalita: "Ahmad Fauzi",
    nikBalita: "3505126804240001",
    tglPertemuan: "18 Nov 2026",
    waktuPertemuan: "09:00 WIB",
    lokasi: "Poli Gizi Puskesmas Socah",
    dokterPemeriksa: "dr. Nurul Hidayati, M.Gizi",
    agendaIntervensi: "Pemeriksaan Antropometri Lanjutan & Preskripsi Paket B Ekstra Hewani Jatim",
    catatanKhusus: "Mohon Ibu balita membawa Buku KIA dan catatan makan 3 hari terakhir.",
    status: "Dijadwalkan",
    tglDibuat: "Hari ini, 08:30 WIB",
  },
  {
    id: "JADWAL-SCH-02",
    puskesmas: "Puskesmas Socah",
    posyanduTarget: "Posyandu Melati 01",
    desa: "Desa Dakiring",
    namaBalita: "Muhammad Rizki",
    nikBalita: "3505122104240002",
    tglPertemuan: "19 Nov 2026",
    waktuPertemuan: "10:30 WIB",
    lokasi: "Poli Anak Puskesmas Socah",
    dokterPemeriksa: "dr. H. Achmad Syafi'i",
    agendaIntervensi: "Konsultasi Infeksi Penyerta & Evaluasi Asupan Protein Baduta Faltering",
    catatanKhusus: "Balita terindikasi batuk berulang, perlu cek tuberkulin nakes faskes.",
    status: "Dijadwalkan",
    tglDibuat: "Kemarin, 14:00 WIB",
  },
];

// -------------------------------------------------------------
// DATA PEMETAAN DAPUR MBG (SPPG) DI JAWA TIMUR
// Wilayah kerja spesifik agar antar dapur tidak tabrakan/tumpang tindih
// -------------------------------------------------------------
export interface DapurMbgWilayah {
  id: string;
  namaDapur: string;
  pengelola: string;
  noKontak: string;
  kabupaten: string;
  kecamatanLayanan: string[];
  posyanduSasaran: string[];
  kapasitasHarian: number;
  kuotaPaketA: number; // Reguler Baduta Sehat
  kuotaPaketB: number; // Stunting / Ekstra Protein Hewani Ganda
  statusOperasional: "Aktif Melayani" | "Persiapan Dapur" | "Pemeliharaan";
  suplierLokal: string; // e.g. "Peternak Telur Blitar, Pembudidaya Lele Lamongan"
}

export const MASTER_DAPUR_MBG: DapurMbgWilayah[] = [
  {
    id: "SPPG-BKL-01",
    namaDapur: "SPPG Dapur Sehat Socah Mandiri",
    pengelola: "H. Mustofa Kamal",
    noKontak: "081234567111",
    kabupaten: "Kab. Bangkalan",
    kecamatanLayanan: ["Socah"],
    posyanduSasaran: [
      "Posyandu Mawar 01 (Desa Bilaporah)",
      "Posyandu Mawar 02 (Desa Bilaporah)",
      "Posyandu Melati 01 (Desa Dakiring)",
      "Posyandu Dahlia 01 (Desa Jaddih)",
      "Posyandu Kenanga 01 (Desa Socah)",
      "Posyandu Anggrek 01 (Desa Keleyan)",
      "Posyandu Bougenville 01 (Desa Petaonan)",
      "Posyandu Cempaka 01 (Desa Junganyar)",
      "Posyandu Teratai 01 (Desa Pernajuh)",
    ],
    kapasitasHarian: 450,
    kuotaPaketA: 330,
    kuotaPaketB: 120,
    statusOperasional: "Aktif Melayani",
    suplierLokal: "Koperasi Telur Barokah Blitar & Kelompok Budidaya Lele Babat",
  },
  {
    id: "SPPG-BKL-02",
    namaDapur: "SPPG Burneh Berkah Nutrisi",
    pengelola: "Hj. Siti Aminah",
    noKontak: "081234567222",
    kabupaten: "Kab. Bangkalan",
    kecamatanLayanan: ["Burneh"],
    posyanduSasaran: [
      "Posyandu Mawar 01 (Desa Burneh)",
      "Posyandu Melati 02 (Desa Langkap)",
      "Posyandu Anggrek 01 (Desa Sobih)",
    ],
    kapasitasHarian: 380,
    kuotaPaketA: 280,
    kuotaPaketB: 100,
    statusOperasional: "Aktif Melayani",
    suplierLokal: "Sentra Telur Unggas Bangkalan & Bandeng Segar Kamal",
  },
  {
    id: "SPPG-SMP-01",
    namaDapur: "SPPG Kedungdung Sejahtera",
    pengelola: "H. Abdul Wahid",
    noKontak: "081234567333",
    kabupaten: "Kab. Sampang",
    kecamatanLayanan: ["Kedungdung"],
    posyanduSasaran: [
      "Posyandu Melati 03 (Desa Banjarsari)",
      "Posyandu Mawar 01 (Desa Moktesareh)",
      "Posyandu Anggrek 02 (Desa Rabasan)",
    ],
    kapasitasHarian: 420,
    kuotaPaketA: 300,
    kuotaPaketB: 120,
    statusOperasional: "Aktif Melayani",
    suplierLokal: "Peternak Puyuh & Lele Lokal Sampang",
  },
];

