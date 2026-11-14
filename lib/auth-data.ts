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
    deskripsi: "Pencatatan balita, input penimbangan, menerima jadwal pertemuan stunting dari Puskesmas, dan konfirmasi penerimaan paket MBG harian.",
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
}

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
];

// Akun Demo Resmi untuk masing-masing peran
export const DEMO_ACCOUNTS: PredefinedAccount[] = [
  {
    role: "posyandu",
    email: "posyandu.bilaporah@jatim.go.id",
    name: "Siti Rahmawati (Kader Utama)",
    unit: "Posyandu Mawar 01 — Desa Bilaporah",
    wilayah: "Kecamatan Socah, Kab. Bangkalan",
    puskesmasPembina: "Puskesmas Socah",
  },
  {
    role: "puskesmas",
    email: "puskesmas.socah@jatim.go.id",
    name: "dr. H. Achmad Syafi'i (Kepala Faskes)",
    unit: "Puskesmas Socah",
    wilayah: "Kecamatan Socah, Kab. Bangkalan",
    faskesCode: "P3526010101",
  },
  {
    role: "dapur",
    email: "dapur.sppg@jatim.go.id",
    name: "H. Mustofa Kamal (Kepala Dapur)",
    unit: "SPPG Dapur Sehat Socah Mandiri",
    wilayah: "Wilayah Layanan: 9 Posyandu Kec. Socah, Bangkalan",
  },
  {
    role: "dinkes",
    email: "dinkes.jatim@jatimprov.go.id",
    name: "dr. Erwin Astha Triyono, Sp.PD (Kadinkes Jatim)",
    unit: "Dinas Kesehatan Provinsi Jawa Timur",
    wilayah: "Wilayah Kerja: 38 Kabupaten / Kota se-Jawa Timur",
  },
];
