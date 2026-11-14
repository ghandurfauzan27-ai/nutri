// Data pendukung halaman Masuk/Daftar. Peran mengikuti PRD NutriTrack Jatim bagian 3.

export type AuthRole = "kader" | "orangtua" | "dapur" | "puskesmas" | "dinkes";

export interface AuthRoleInfo {
  key: AuthRole;
  name: string;
  /** Label kolom identitas saat masuk */
  loginIdLabel: string;
  /** Label kolom kontak saat daftar */
  contactLabel: string;
  /** Label kolom unit kerja pada langkah 2 pendaftaran */
  unitLabel: string;
  /** true = tidak bisa daftar mandiri (hanya lewat undangan Admin) */
  inviteOnly?: boolean;
}

export const authRoles: AuthRoleInfo[] = [
  { key: "kader", name: "Posyandu Desa", loginIdLabel: "Kode Posyandu, Email, atau HP Kader", contactLabel: "Nomor WhatsApp Kader / Petugas", unitLabel: "Nama Posyandu, Desa & Alamat" },
  { key: "puskesmas", name: "Puskesmas Pembina", loginIdLabel: "NIP atau email dinas Puskesmas", contactLabel: "Email dinas / No. Telp Faskes", unitLabel: "Nama Puskesmas & Kecamatan" },
  { key: "dapur", name: "Dapur MBG (SPPG)", loginIdLabel: "ID Dapur atau email resmi", contactLabel: "Email resmi dapur", unitLabel: "Nama Dapur SPPG & Wilayah" },
  { key: "dinkes", name: "Dinkes / TPID", loginIdLabel: "NIP atau akun eksekutif", contactLabel: "Email dinas", unitLabel: "Unit kerja", inviteOnly: true },
  { key: "orangtua", name: "Orang Tua Balita", loginIdLabel: "Nomor HP terdaftar", contactLabel: "Nomor HP (WhatsApp)", unitLabel: "Posyandu tempat balita ditimbang" },
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
