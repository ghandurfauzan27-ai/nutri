// Data pendukung otentikasi peran NutriTrack Jatim.
// Disesuaikan dengan alur nyata: Posyandu Desa, Puskesmas Pembina se-Jatim, Dapur MBG (SPPG), dan Dinkes Jatim.

export type AuthRole = "posyandu" | "kader" | "puskesmas" | "dapur" | "dinkes";

export interface AuthRoleInfo {
  key: AuthRole;
  name: string;
  loginIdLabel: string;
  contactLabel: string;
  unitLabel: string;
  inviteOnly?: boolean;
  deskripsi: string;
}

export const authRoles: AuthRoleInfo[] = [
  {
    key: "posyandu",
    name: "Posyandu Desa",
    loginIdLabel: "Email Akun Posyandu / Kode Posyandu",
    contactLabel: "Nomor WhatsApp Petugas Posyandu",
    unitLabel: "Nama Posyandu, Desa & Alamat",
    deskripsi: "Pencatatan balita, input penimbangan KMS digital, menerima jadwal pertemuan stunting dari Puskesmas, dan konfirmasi penerimaan paket MBG harian.",
  },
  {
    key: "puskesmas",
    name: "Puskesmas Pembina",
    loginIdLabel: "Email Dinas Puskesmas / NIP Dokter Faskes",
    contactLabel: "Email dinas / No. Telp Faskes",
    unitLabel: "Nama Puskesmas & Kecamatan Binaan",
    inviteOnly: true, // Akun sudah otomatis dibuatkan untuk seluruh Puskesmas se-Jatim
    deskripsi: "Pengawasan stunting khusus desa/posyandu naungan, pembuatan jadwal pertemuan intervensi klinis balita stunting, dan verifikasi akun posyandu.",
  },
  {
    key: "dapur",
    name: "Dapur MBG (SPPG)",
    loginIdLabel: "ID Dapur MBG atau Email Resmi",
    contactLabel: "Email resmi / No. HP Pengelola Dapur",
    unitLabel: "Nama Dapur SPPG & Wilayah Kerja",
    inviteOnly: true,
    deskripsi: "Produksi paket gizi (Paket A gizi reguler & Paket B ekstra protein hewani Jatim) sesuai pembagian wilayah posyandu sasaran agar tidak tumpang tindih.",
  },
  {
    key: "dinkes",
    name: "Dinas Kesehatan Prov. Jatim",
    loginIdLabel: "NIP / Akun Eksekutif Dinkes Jatim",
    contactLabel: "Email dinas provinsi",
    unitLabel: "Dinas Kesehatan Provinsi Jawa Timur",
    inviteOnly: true,
    deskripsi: "Pemantauan makro peta sebaran stunting di 38 Kabupaten/Kota Jawa Timur, audit prevalensi, dan alokasi logistik MBG terpadu.",
  },
];

export const jatimRegions: string[] = [
  "Kab. Bangkalan", "Kab. Banyuwangi", "Kab. Blitar", "Kab. Bojonegoro", "Kab. Bondowoso", "Kab. Gresik",
  "Kab. Jember", "Kab. Jombang", "Kab. Kediri", "Kab. Lamongan", "Kab. Lumajang", "Kab. Madiun",
  "Kab. Magetan", "Kab. Malang", "Kab. Mojokerto", "Kab. Nganjuk", "Kab. Ngawi", "Kab. Pacitan",
  "Kab. Pamekasan", "Kab. Pasuruan", "Kab. Ponorogo", "Kab. Probolinggo", "Kab. Sampang", "Kab. Sidoarjo",
  "Kab. Situbondo", "Kab. Sumenep", "Kab. Trenggalek", "Kab. Tuban", "Kab. Tulungagung",
  "Kota Batu", "Kota Blitar", "Kota Kediri", "Kota Madiun", "Kota Malang", "Kota Mojokerto",
  "Kota Pasuruan", "Kota Probolinggo", "Kota Surabaya",
];

export interface PredefinedAccount {
  role: AuthRole;
  email: string;
  name: string;
  unit: string;
  wilayah: string;
  faskesCode?: string;
  puskesmasPembina?: string;
  sppgDituju?: string;
  sppgId?: string;
  kabupaten?: string;
  statusOperasional?: string;
  kapasitasHarian?: number;
  passwordDefault?: string;
  ahliGizi?: string;
  noHp?: string;
}

// Akun bawaan SPPG Dapur MBG se-Jawa Timur (Terkunci Sesuai Wilayah Kerja Dapur)
export const MASTER_SPPG_ACCOUNTS: PredefinedAccount[] = [
  // Madura Raya
  {
    role: "dapur",
    sppgId: "SPPG-BKL-01",
    email: "sppg.socah@jatim.go.id",
    name: "H. Mustofa Kamal (Kepala SPPG Socah)",
    unit: "SPPG Dapur Sehat Socah Mandiri",
    wilayah: "Wilayah Layanan: 9 Posyandu Kec. Socah, Bangkalan",
    kabupaten: "Kab. Bangkalan",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 500,
    passwordDefault: "Password123!",
    ahliGizi: "Nur Aisyah, S.Gz",
    noHp: "081234567111",
  },
  {
    role: "dapur",
    sppgId: "SPPG-BKL-02",
    email: "sppg.burneh@jatim.go.id",
    name: "Hj. Siti Aminah, S.Pd (Kepala SPPG Burneh)",
    unit: "SPPG Burneh Berkah Nutrisi",
    wilayah: "Wilayah Layanan: Kec. Burneh, Kab. Bangkalan",
    kabupaten: "Kab. Bangkalan",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 450,
    passwordDefault: "Password123!",
    ahliGizi: "dr. Lailatul Badriyah",
    noHp: "081234567112",
  },
  {
    role: "dapur",
    sppgId: "SPPG-SMP-01",
    email: "sppg.kedungdung@jatim.go.id",
    name: "H. Abdul Wahid (Kepala SPPG Kedungdung)",
    unit: "SPPG Kedungdung Sejahtera",
    wilayah: "Wilayah Layanan: Kec. Kedungdung, Kab. Sampang",
    kabupaten: "Kab. Sampang",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 550,
    passwordDefault: "Password123!",
    ahliGizi: "Rizki Amalia, S.Tr.Gz",
    noHp: "081234567113",
  },
  {
    role: "dapur",
    sppgId: "SPPG-PMK-01",
    email: "sppg.pamekasan@jatim.go.id",
    name: "H. Achmad Zaini, S.Sos (Kepala SPPG Pamekasan)",
    unit: "SPPG Ronggosukowati Mandiri",
    wilayah: "Wilayah Layanan: Kec. Pamekasan & Proppo, Kab. Pamekasan",
    kabupaten: "Kab. Pamekasan",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 480,
    passwordDefault: "Password123!",
    ahliGizi: "Faizah Wardani, S.Gz",
    noHp: "081234567114",
  },
  {
    role: "dapur",
    sppgId: "SPPG-SMN-01",
    email: "sppg.sumenep@jatim.go.id",
    name: "Drs. H. Moh. Saleh (Kepala SPPG Sumenep)",
    unit: "SPPG Keraton Gizi Sumenep",
    wilayah: "Wilayah Layanan: Kec. Kota Sumenep & Kalianget, Kab. Sumenep",
    kabupaten: "Kab. Sumenep",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 520,
    passwordDefault: "Password123!",
    ahliGizi: "Qurrota A'yun, S.Gz",
    noHp: "081234567115",
  },

  // Surabaya Raya & Sekitarnya
  {
    role: "dapur",
    sppgId: "SPPG-SBY-01",
    email: "sppg.gayungan@jatim.go.id",
    name: "Drs. Eko Prasetyo, M.M (Kepala SPPG Surabaya Selatan)",
    unit: "SPPG Sentral Surabaya Selatan (Gayungan)",
    wilayah: "Wilayah Layanan: Kec. Gayungan & Wonokromo, Kota Surabaya",
    kabupaten: "Kota Surabaya",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 600,
    passwordDefault: "Password123!",
    ahliGizi: "Dina Mariana, S.Gz, RD",
    noHp: "081234567116",
  },
  {
    role: "dapur",
    sppgId: "SPPG-SDA-01",
    email: "sppg.waru@jatim.go.id",
    name: "Ir. H. Dedy Kurniawan (Kepala SPPG Waru)",
    unit: "SPPG Waru Agro Bahari Berkah",
    wilayah: "Wilayah Layanan: Kec. Waru & Sedati, Kab. Sidoarjo",
    kabupaten: "Kab. Sidoarjo",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 580,
    passwordDefault: "Password123!",
    ahliGizi: "Bambang Triyono, S.Gz",
    noHp: "081234567117",
  },
  {
    role: "dapur",
    sppgId: "SPPG-GRS-01",
    email: "sppg.kebomas@jatim.go.id",
    name: "H. Saifullah, S.T (Kepala SPPG Kebomas)",
    unit: "SPPG Giri Sejahtera Mandiri",
    wilayah: "Wilayah Layanan: Kec. Kebomas & Manyar, Kab. Gresik",
    kabupaten: "Kab. Gresik",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 500,
    passwordDefault: "Password123!",
    ahliGizi: "Anisa Rahma, S.Tr.Gz",
    noHp: "081234567118",
  },

  // Malang Raya & Blitar - Kediri
  {
    role: "dapur",
    sppgId: "SPPG-MLG-01",
    email: "sppg.kepanjen@jatim.go.id",
    name: "Ir. Bambang Sugiarto (Kepala SPPG Kepanjen)",
    unit: "SPPG Agro Nutrisi Kepanjen Makmur",
    wilayah: "Wilayah Layanan: Kec. Kepanjen & Sumberpucung, Kab. Malang",
    kabupaten: "Kab. Malang",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 560,
    passwordDefault: "Password123!",
    ahliGizi: "Ratna Sari Dewi, S.Gz",
    noHp: "081234567119",
  },
  {
    role: "dapur",
    sppgId: "SPPG-BLT-01",
    email: "sppg.sutojayan@jatim.go.id",
    name: "H. Sukadi Wibowo (Kepala SPPG Sutojayan)",
    unit: "SPPG Sentra Telur Omega Sutojayan",
    wilayah: "Wilayah Layanan: Kec. Sutojayan & Kanigoro, Kab. Blitar",
    kabupaten: "Kab. Blitar",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 540,
    passwordDefault: "Password123!",
    ahliGizi: "dr. Hendra Setiawan",
    noHp: "081234567120",
  },
  {
    role: "dapur",
    sppgId: "SPPG-KDR-01",
    email: "sppg.pesantren@jatim.go.id",
    name: "H. Suyatno, S.E (Kepala SPPG Pesantren)",
    unit: "SPPG Brantas Nutrisi Pesantren",
    wilayah: "Wilayah Layanan: Kec. Pesantren & Mojoroto, Kota Kediri",
    kabupaten: "Kota Kediri",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 460,
    passwordDefault: "Password123!",
    ahliGizi: "Wahyu Hidayat, S.Gz",
    noHp: "081234567121",
  },

  // Pantura & Tapal Kuda
  {
    role: "dapur",
    sppgId: "SPPG-LMG-01",
    email: "sppg.babat@jatim.go.id",
    name: "Drs. H. Miftachul Huda (Kepala SPPG Babat)",
    unit: "SPPG Samudra Lele & Bandeng Babat",
    wilayah: "Wilayah Layanan: Kec. Babat & Lamongan, Kab. Lamongan",
    kabupaten: "Kab. Lamongan",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 550,
    passwordDefault: "Password123!",
    ahliGizi: "Luluk Farida, S.Gz",
    noHp: "081234567122",
  },
  {
    role: "dapur",
    sppgId: "SPPG-JBR-01",
    email: "sppg.patrang@jatim.go.id",
    name: "Hj. Endang Sulistyowati (Kepala SPPG Patrang)",
    unit: "SPPG Suwar-Suwir Nutrisi Patrang",
    wilayah: "Wilayah Layanan: Kec. Patrang & Sumbersari, Kab. Jember",
    kabupaten: "Kab. Jember",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 580,
    passwordDefault: "Password123!",
    ahliGizi: "Irfan Hakim, S.Gz",
    noHp: "081234567123",
  },
  {
    role: "dapur",
    sppgId: "SPPG-BWI-01",
    email: "sppg.rogojampi@jatim.go.id",
    name: "Drs. H. Sugiono (Kepala SPPG Rogojampi)",
    unit: "SPPG Blambangan Sehat Rogojampi",
    wilayah: "Wilayah Layanan: Kec. Rogojampi & Kabat, Kab. Banyuwangi",
    kabupaten: "Kab. Banyuwangi",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 500,
    passwordDefault: "Password123!",
    ahliGizi: "Fitri Astuti, S.Tr.Gz",
    noHp: "081234567124",
  },
  {
    role: "dapur",
    sppgId: "SPPG-PRB-01",
    email: "sppg.dringu@jatim.go.id",
    name: "H. Sukarnoto (Kepala SPPG Dringu)",
    unit: "SPPG Bromo Mandiri Dringu",
    wilayah: "Wilayah Layanan: Kec. Dringu & Krucil, Kab. Probolinggo",
    kabupaten: "Kab. Probolinggo",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 490,
    passwordDefault: "Password123!",
    ahliGizi: "Ahmad Choiri, S.Gz",
    noHp: "081234567125",
  },
  {
    role: "dapur",
    sppgId: "SPPG-PAS-01",
    email: "sppg.pandaan@jatim.go.id",
    name: "Hj. Mariatul Kiptiyah (Kepala SPPG Pandaan)",
    unit: "SPPG Pandaan Makmur Berkah",
    wilayah: "Wilayah Layanan: Kec. Pandaan & Gempol, Kab. Pasuruan",
    kabupaten: "Kab. Pasuruan",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 520,
    passwordDefault: "Password123!",
    ahliGizi: "Dewi Anggraini, S.Gz",
    noHp: "081234567126",
  },
  {
    role: "dapur",
    sppgId: "SPPG-BJN-01",
    email: "sppg.bojonegoro@jatim.go.id",
    name: "H. Bambang Irawan (Kepala SPPG Bojonegoro)",
    unit: "SPPG Angling Dharma Bojonegoro",
    wilayah: "Wilayah Layanan: Kec. Bojonegoro & Kapas, Kab. Bojonegoro",
    kabupaten: "Kab. Bojonegoro",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 470,
    passwordDefault: "Password123!",
    ahliGizi: "Kurniawati, S.Gz",
    noHp: "081234567127",
  },
  {
    role: "dapur",
    sppgId: "SPPG-TBN-01",
    email: "sppg.tuban@jatim.go.id",
    name: "H. Choirul Anam, S.Pd (Kepala SPPG Tuban)",
    unit: "SPPG Ronggolawe Nutrisi Tuban",
    wilayah: "Wilayah Layanan: Kec. Tuban & Semanding, Kab. Tuban",
    kabupaten: "Kab. Tuban",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 490,
    passwordDefault: "Password123!",
    ahliGizi: "Rudi Hartono, S.Gz",
    noHp: "081234567128",
  },
  {
    role: "dapur",
    sppgId: "SPPG-MDN-01",
    email: "sppg.madiun@jatim.go.id",
    name: "Drs. H. Hartono (Kepala SPPG Madiun)",
    unit: "SPPG Pendekar Gizi Sehat Madiun",
    wilayah: "Wilayah Layanan: Kec. Taman & Kartoharjo, Kota Madiun",
    kabupaten: "Kota Madiun",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 450,
    passwordDefault: "Password123!",
    ahliGizi: "dr. Maya Indriani",
    noHp: "081234567129",
  },
  {
    role: "dapur",
    sppgId: "SPPG-BDW-01",
    email: "sppg.bondowoso@jatim.go.id",
    name: "H. Fauzi Rahman (Kepala SPPG Bondowoso)",
    unit: "SPPG Ijen Nutrisi Mandiri",
    wilayah: "Wilayah Layanan: Kec. Bondowoso & Maesan, Kab. Bondowoso",
    kabupaten: "Kab. Bondowoso",
    statusOperasional: "Aktif Beroperasi",
    kapasitasHarian: 480,
    passwordDefault: "Password123!",
    ahliGizi: "Siti Masitoh, S.Gz",
    noHp: "081234567130",
  },
];

// Akun bawaan Puskesmas se-Jatim (Semua Puskesmas sudah tersedia langsung, tidak perlu daftar ulang)
export const MASTER_PUSKESMAS_ACCOUNTS: PredefinedAccount[] = [
  // Bangkalan
  { role: "puskesmas", email: "puskesmas.socah@jatim.go.id", name: "dr. H. Achmad Syafi'i", unit: "Puskesmas Socah", wilayah: "Kecamatan Socah, Kab. Bangkalan", faskesCode: "P3526010101" },
  { role: "puskesmas", email: "puskesmas.burneh@jatim.go.id", name: "dr. Hj. Ratna Indrawati", unit: "Puskesmas Burneh", wilayah: "Kecamatan Burneh, Kab. Bangkalan", faskesCode: "P3526010102" },
  { role: "puskesmas", email: "puskesmas.bangkalan@jatim.go.id", name: "dr. Tri Sulistyo", unit: "Puskesmas Bangkalan Kota", wilayah: "Kecamatan Bangkalan, Kab. Bangkalan", faskesCode: "P3526010103" },
  { role: "puskesmas", email: "puskesmas.kamal@jatim.go.id", name: "dr. Hendra Kusuma", unit: "Puskesmas Kamal", wilayah: "Kecamatan Kamal, Kab. Bangkalan", faskesCode: "P3526010104" },
  { role: "puskesmas", email: "puskesmas.blega@jatim.go.id", name: "dr. Sri Rejeki", unit: "Puskesmas Blega", wilayah: "Kecamatan Blega, Kab. Bangkalan", faskesCode: "P3526010105" },
  { role: "puskesmas", email: "puskesmas.arosbaya@jatim.go.id", name: "dr. M. Syukron", unit: "Puskesmas Arosbaya", wilayah: "Kecamatan Arosbaya, Kab. Bangkalan", faskesCode: "P3526010106" },

  // Sampang
  { role: "puskesmas", email: "puskesmas.kedungdung@jatim.go.id", name: "dr. Mochammad Fauzan", unit: "Puskesmas Kedungdung", wilayah: "Kecamatan Kedungdung, Kab. Sampang", faskesCode: "P3527010201" },
  { role: "puskesmas", email: "puskesmas.torjun@jatim.go.id", name: "dr. Anik Wulandari", unit: "Puskesmas Torjun", wilayah: "Kecamatan Torjun, Kab. Sampang", faskesCode: "P3527010202" },
  { role: "puskesmas", email: "puskesmas.sampang@jatim.go.id", name: "dr. Budi Santoso", unit: "Puskesmas Sampang Kota", wilayah: "Kecamatan Sampang, Kab. Sampang", faskesCode: "P3527010203" },
  { role: "puskesmas", email: "puskesmas.camplong@jatim.go.id", name: "dr. Intan Pertiwi", unit: "Puskesmas Camplong", wilayah: "Kecamatan Camplong, Kab. Sampang", faskesCode: "P3527010204" },

  // Pamekasan & Sumenep
  { role: "puskesmas", email: "puskesmas.pamekasan@jatim.go.id", name: "dr. H. Rahmat Hidayat", unit: "Puskesmas Pamekasan Kota", wilayah: "Kecamatan Kota, Kab. Pamekasan", faskesCode: "P3528010301" },
  { role: "puskesmas", email: "puskesmas.sumenep@jatim.go.id", name: "dr. Slamet Rahardjo", unit: "Puskesmas Kota Sumenep", wilayah: "Kecamatan Kota Sumenep, Kab. Sumenep", faskesCode: "P3529010401" },

  // Jember & Bondowoso
  { role: "puskesmas", email: "puskesmas.sukowono@jatim.go.id", name: "dr. Andy Kurniawan", unit: "Puskesmas Sukowono", wilayah: "Kecamatan Sukowono, Kab. Jember", faskesCode: "P3509010501" },
  { role: "puskesmas", email: "puskesmas.sumbersari@jatim.go.id", name: "dr. Fitri Handayani", unit: "Puskesmas Sumbersari", wilayah: "Kecamatan Sumbersari, Kab. Jember", faskesCode: "P3509010502" },
  { role: "puskesmas", email: "puskesmas.bondowoso@jatim.go.id", name: "dr. Bambang Yudi", unit: "Puskesmas Bondowoso Kota", wilayah: "Kecamatan Bondowoso, Kab. Bondowoso", faskesCode: "P3511010601" },

  // Probolinggo & Pasuruan
  { role: "puskesmas", email: "puskesmas.krucil@jatim.go.id", name: "dr. Agus Subagyo", unit: "Puskesmas Krucil", wilayah: "Kecamatan Krucil, Kab. Probolinggo", faskesCode: "P3513010701" },
  { role: "puskesmas", email: "puskesmas.kraksaan@jatim.go.id", name: "dr. Lidiawati", unit: "Puskesmas Kraksaan", wilayah: "Kecamatan Kraksaan, Kab. Probolinggo", faskesCode: "P3513010702" },

  // Blitar & Malang
  { role: "puskesmas", email: "puskesmas.sutojayan@jatim.go.id", name: "dr. Eko Prasetyo", unit: "Puskesmas Sutojayan", wilayah: "Kecamatan Sutojayan, Kab. Blitar", faskesCode: "P3505010801" },
  { role: "puskesmas", email: "puskesmas.kanigoro@jatim.go.id", name: "dr. Danang Wijaya", unit: "Puskesmas Kanigoro", wilayah: "Kecamatan Kanigoro, Kab. Blitar", faskesCode: "P3505010802" },
  { role: "puskesmas", email: "puskesmas.klojen@jatim.go.id", name: "dr. Maria Ulfa", unit: "Puskesmas Klojen", wilayah: "Kecamatan Klojen, Kota Malang", faskesCode: "P3573010901" },

  // Lamongan & Surabaya
  { role: "puskesmas", email: "puskesmas.babat@jatim.go.id", name: "dr. Taufiqurrahman", unit: "Puskesmas Babat", wilayah: "Kecamatan Babat, Kab. Lamongan", faskesCode: "P3524011001" },
  { role: "puskesmas", email: "puskesmas.wonokromo@jatim.go.id", name: "dr. Aris Munandar", unit: "Puskesmas Wonokromo", wilayah: "Kecamatan Wonokromo, Kota Surabaya", faskesCode: "P3578011101" },
  { role: "puskesmas", email: "puskesmas.rungkut@jatim.go.id", name: "dr. Maya Indrasari", unit: "Puskesmas Rungkut", wilayah: "Kecamatan Rungkut, Kota Surabaya", faskesCode: "P3578011102" },

  // Wilayah Jawa Timur Lainnya (Total Menjangkau Seluruh 38 Kab/Kota)
  { role: "puskesmas", email: "puskesmas.banyuwangi@jatim.go.id", name: "dr. I Made Sukarta", unit: "Puskesmas Banyuwangi Kota", wilayah: "Kecamatan Banyuwangi, Kab. Banyuwangi", faskesCode: "P3510011201" },
  { role: "puskesmas", email: "puskesmas.bojonegoro@jatim.go.id", name: "dr. Bambang Irawan", unit: "Puskesmas Bojonegoro Kota", wilayah: "Kecamatan Bojonegoro, Kab. Bojonegoro", faskesCode: "P3522011301" },
  { role: "puskesmas", email: "puskesmas.gresik@jatim.go.id", name: "dr. Siti Khotijah", unit: "Puskesmas Gresik Kota", wilayah: "Kecamatan Gresik, Kab. Gresik", faskesCode: "P3525011401" },
  { role: "puskesmas", email: "puskesmas.jombang@jatim.go.id", name: "dr. Moch. Zulkifli", unit: "Puskesmas Jombang", wilayah: "Kecamatan Jombang, Kab. Jombang", faskesCode: "P3517011501" },
  { role: "puskesmas", email: "puskesmas.ngasem@jatim.go.id", name: "dr. Lilis Suryani", unit: "Puskesmas Ngasem", wilayah: "Kecamatan Ngasem, Kab. Kediri", faskesCode: "P3506011601" },
  { role: "puskesmas", email: "puskesmas.pesantren@jatim.go.id", name: "dr. Dwi Wahyuni", unit: "Puskesmas Pesantren", wilayah: "Kecamatan Pesantren, Kota Kediri", faskesCode: "P3571011701" },
  { role: "puskesmas", email: "puskesmas.lumajang@jatim.go.id", name: "dr. Agus Hermanto", unit: "Puskesmas Lumajang", wilayah: "Kecamatan Lumajang, Kab. Lumajang", faskesCode: "P3508011801" },
  { role: "puskesmas", email: "puskesmas.mejayan@jatim.go.id", name: "dr. Rr. Retno Puspita", unit: "Puskesmas Mejayan", wilayah: "Kecamatan Mejayan, Kab. Madiun", faskesCode: "P3519011901" },
  { role: "puskesmas", email: "puskesmas.manguharjo@jatim.go.id", name: "dr. Haris Nugroho", unit: "Puskesmas Manguharjo", wilayah: "Kecamatan Manguharjo, Kota Madiun", faskesCode: "P3577012001" },
  { role: "puskesmas", email: "puskesmas.magetan@jatim.go.id", name: "dr. Diana Kartika", unit: "Puskesmas Magetan", wilayah: "Kecamatan Magetan, Kab. Magetan", faskesCode: "P3520012101" },
  { role: "puskesmas", email: "puskesmas.mojosari@jatim.go.id", name: "dr. Rahmat Basuki", unit: "Puskesmas Mojosari", wilayah: "Kecamatan Mojosari, Kab. Mojokerto", faskesCode: "P3516012201" },
  { role: "puskesmas", email: "puskesmas.nganjuk@jatim.go.id", name: "dr. Budi Rahardjo", unit: "Puskesmas Nganjuk", wilayah: "Kecamatan Nganjuk, Kab. Nganjuk", faskesCode: "P3518012301" },
  { role: "puskesmas", email: "puskesmas.ngawi@jatim.go.id", name: "dr. Sri Utami", unit: "Puskesmas Ngawi", wilayah: "Kecamatan Ngawi, Kab. Ngawi", faskesCode: "P3521012401" },
  { role: "puskesmas", email: "puskesmas.pacitan@jatim.go.id", name: "dr. Hendro Prasetyo", unit: "Puskesmas Pacitan", wilayah: "Kecamatan Pacitan, Kab. Pacitan", faskesCode: "P3501012501" },
  { role: "puskesmas", email: "puskesmas.pandaan@jatim.go.id", name: "dr. Wahyudi Utomo", unit: "Puskesmas Pandaan", wilayah: "Kecamatan Pandaan, Kab. Pasuruan", faskesCode: "P3514012601" },
  { role: "puskesmas", email: "puskesmas.ponorogo@jatim.go.id", name: "dr. Anang Setiawan", unit: "Puskesmas Ponorogo", wilayah: "Kecamatan Ponorogo, Kab. Ponorogo", faskesCode: "P3502012701" },
  { role: "puskesmas", email: "puskesmas.sidoarjo@jatim.go.id", name: "dr. Farida Hanum", unit: "Puskesmas Sidoarjo", wilayah: "Kecamatan Sidoarjo, Kab. Sidoarjo", faskesCode: "P3515012801" },
  { role: "puskesmas", email: "puskesmas.situbondo@jatim.go.id", name: "dr. Mansur Hidayat", unit: "Puskesmas Situbondo Kota", wilayah: "Kecamatan Situbondo, Kab. Situbondo", faskesCode: "P3512012901" },
  { role: "puskesmas", email: "puskesmas.trenggalek@jatim.go.id", name: "dr. Joko Triyono", unit: "Puskesmas Trenggalek", wilayah: "Kecamatan Trenggalek, Kab. Trenggalek", faskesCode: "P3503013001" },
  { role: "puskesmas", email: "puskesmas.tuban@jatim.go.id", name: "dr. Hartono", unit: "Puskesmas Tuban Kota", wilayah: "Kecamatan Tuban, Kab. Tuban", faskesCode: "P3523013101" },
  { role: "puskesmas", email: "puskesmas.tulungagung@jatim.go.id", name: "dr. Yuni Astuti", unit: "Puskesmas Tulungagung", wilayah: "Kecamatan Tulungagung, Kab. Tulungagung", faskesCode: "P3504013201" },
  { role: "puskesmas", email: "puskesmas.batu@jatim.go.id", name: "dr. Kartika Sari", unit: "Puskesmas Batu", wilayah: "Kecamatan Batu, Kota Batu", faskesCode: "P3579013301" },
];

// Akun bawaan Posyandu Desa se-Jatim (Terkunci Sesuai Posyandu & Desa Masing-Masing)
export const MASTER_POSYANDU_ACCOUNTS: PredefinedAccount[] = [
  {
    role: "posyandu",
    email: "posyandu.mawar01@jatim.go.id",
    name: "Siti Rahmawati, S.Pd (Kader Posyandu)",
    unit: "Posyandu Mawar 01",
    wilayah: "Desa Bilaporah, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567891",
  },
  {
    role: "posyandu",
    email: "posyandu.dakiring@jatim.go.id",
    name: "Halimah (Kader Posyandu)",
    unit: "Posyandu Melati 01",
    wilayah: "Desa Dakiring, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567892",
  },
  {
    role: "posyandu",
    email: "posyandu.jaddih@jatim.go.id",
    name: "Nurul Aini (Kader Posyandu)",
    unit: "Posyandu Dahlia 01",
    wilayah: "Desa Jaddih, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567893",
  },
  {
    role: "posyandu",
    email: "posyandu.socah01@jatim.go.id",
    name: "Fatimah Azzahra (Kader Posyandu)",
    unit: "Posyandu Kenanga 01",
    wilayah: "Desa Socah, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567894",
  },
  {
    role: "posyandu",
    email: "posyandu.mawar02@jatim.go.id",
    name: "Dewi Lestari (Kader Posyandu)",
    unit: "Posyandu Mawar 02",
    wilayah: "Desa Bilaporah, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567895",
  },
  {
    role: "posyandu",
    email: "posyandu.keleyan@jatim.go.id",
    name: "Sri Wahyuni (Kader Posyandu)",
    unit: "Posyandu Anggrek 01",
    wilayah: "Desa Keleyan, Kec. Socah (Bangkalan)",
    puskesmasPembina: "Puskesmas Socah",
    passwordDefault: "Password123!",
    noHp: "081234567896",
  },
  {
    role: "posyandu",
    email: "posyandu.burengan@jatim.go.id",
    name: "Endang Suprihatin (Kader Posyandu)",
    unit: "Posyandu Melati 01 (Burengan)",
    wilayah: "Kel. Burengan, Kec. Pesantren (Kota Kediri)",
    puskesmasPembina: "Puskesmas Pesantren",
    passwordDefault: "Password123!",
    noHp: "081234567897",
  },
  {
    role: "posyandu",
    email: "posyandu.burneh01@jatim.go.id",
    name: "Hj. Maisaroh (Kader Posyandu)",
    unit: "Posyandu Kenanga 01 (Burneh)",
    wilayah: "Desa Burneh, Kec. Burneh (Bangkalan)",
    puskesmasPembina: "Puskesmas Burneh",
    passwordDefault: "Password123!",
    noHp: "081234567898",
  },
];

// Akun Demo Resmi untuk masing-masing peran
export const DEMO_ACCOUNTS: PredefinedAccount[] = [
  {
    role: "posyandu",
    email: "posyandu.bilaporah@jatim.go.id",
    name: "Siti Rahmawati, S.Pd (Kader Utama)",
    unit: "Posyandu Mawar 01 (Desa Bilaporah)",
    wilayah: "Desa Bilaporah, Kec. Socah, Kab. Bangkalan",
    puskesmasPembina: "Puskesmas Socah",
    faskesCode: "POS-3526-01",
    sppgId: "SPPG-BKL-01",
  },
  {
    role: "puskesmas",
    email: "puskesmas.socah@jatim.go.id",
    name: "dr. H. Achmad Syafi'i (Kepala Faskes)",
    unit: "Puskesmas Socah",
    wilayah: "Kecamatan Socah, Kab. Bangkalan",
    faskesCode: "P3526010101",
    sppgId: "SPPG-BKL-01",
  },
  {
    role: "dapur",
    email: "sppg.socah@jatim.go.id",
    name: "H. Mustofa Kamal (Kepala Dapur)",
    unit: "SPPG Dapur Sehat Socah Mandiri",
    wilayah: "Wilayah Layanan: 9 Posyandu Kec. Socah, Kab. Bangkalan",
    sppgId: "SPPG-BKL-01",
  },
  {
    role: "dinkes",
    email: "dinkes.jatim@jatimprov.go.id",
    name: "dr. Erwin Astha Triyono, Sp.PD (Kadinkes Jatim)",
    unit: "Dinas Kesehatan Provinsi Jawa Timur",
    wilayah: "Wilayah Pengawasan: 38 Kabupaten / Kota se-Jawa Timur",
    sppgId: "SPPG-PROV-01",
  },
];

// ============================================================================
// MANAJEMEN PASSWORD AKUN (DEFAULT & CUSTOM STORAGE)
// ============================================================================
export const DEFAULT_UNIVERSAL_PASSWORD = "Password123!";

/**
 * Mengambil kata sandi aktif untuk email/ID akun tertentu.
 * Jika akun pernah mengubah password di profil, ambil dari localStorage.
 * Jika belum, kembalikan password default "Password123!".
 */
export function getAccountPassword(emailOrId: string): string {
  if (typeof window === "undefined" || !emailOrId) return DEFAULT_UNIVERSAL_PASSWORD;
  try {
    const raw = localStorage.getItem("nt_user_passwords");
    if (raw) {
      const map = JSON.parse(raw);
      const cleanKey = emailOrId.toLowerCase().trim();
      if (map && map[cleanKey]) {
        return map[cleanKey];
      }
    }
  } catch (e) {
    // fallback ke default jika gagal membaca JSON
  }
  return DEFAULT_UNIVERSAL_PASSWORD;
}

/**
 * Menyimpan pembaruan kata sandi akun ke localStorage dan memancarkan event pembaruan.
 */
export function setAccountPassword(emailOrId: string, newPassword: string): boolean {
  if (typeof window === "undefined" || !emailOrId || !newPassword) return false;
  try {
    const raw = localStorage.getItem("nt_user_passwords");
    const map = raw ? JSON.parse(raw) : {};
    const cleanKey = emailOrId.toLowerCase().trim();
    map[cleanKey] = newPassword;
    localStorage.setItem("nt_user_passwords", JSON.stringify(map));

    // Catat waktu perubahan
    const metaRaw = localStorage.getItem("nt_password_meta");
    const metaMap = metaRaw ? JSON.parse(metaRaw) : {};
    metaMap[cleanKey] = {
      updatedAt: new Date().toISOString(),
      updatedText: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
    };
    localStorage.setItem("nt_password_meta", JSON.stringify(metaMap));

    // Pancarkan custom event agar tab lain/form lain terupdate
    window.dispatchEvent(
      new CustomEvent("nt_password_changed", {
        detail: { email: cleanKey, newPassword },
      })
    );
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Mengambil metadata tanggal terakhir kali password diubah.
 */
export function getPasswordLastUpdated(emailOrId: string): string | null {
  if (typeof window === "undefined" || !emailOrId) return null;
  try {
    const raw = localStorage.getItem("nt_password_meta");
    if (raw) {
      const meta = JSON.parse(raw);
      const cleanKey = emailOrId.toLowerCase().trim();
      if (meta && meta[cleanKey]) {
        return meta[cleanKey].updatedText;
      }
    }
  } catch (e) {}
  return null;
}

