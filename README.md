# 🌾 NutriTrack: Platform Presisi Intervensi Stunting & Pemantauan MBG Jawa Timur

<p align="center">
  <img src="frontend/public/logo.png" alt="NutriTrack Logo" width="120" style="border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <strong>Sistem Presisi Intervensi Stunting & Pemantauan Makan Bergizi Gratis (MBG) Terintegrasi Berbasis Komoditas Lokal Jawa Timur</strong><br />
  <em>Sesuai Standar Permenkes RI No. 2/2020, Standar Antropometri WHO 2006, Dokumen SKPL v1.0, dan Kebijakan Program MBG Nasional</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Express_API-green?style=for-the-badge&logo=node.js" alt="Express" />
  <img src="https://img.shields.io/badge/Standards-WHO_Anthro_%26_Permenkes-rose?style=for-the-badge" alt="Standards" />
</p>

---

## 📑 Daftar Isi
1. [Latar Belakang & Kegunaan Web](#-latar-belakang--kegunaan-web)
2. [Arsitektur Sistem & Pemisahan Frontend-Backend](#-arsitektur-sistem--pemisahan-frontend--backend)
3. [Fitur Unggulan Berdasarkan Peran (Role-Based Features)](#-fitur-unggulan-berdasarkan-peran-role-based-features)
4. [Inovasi Spesifik Komoditas Lokal Jawa Timur](#-inovasi-spesifik-komoditas-lokal-jawa-timur)
5. [Fitur Cetak Laporan Resmi Kedinasan & Ekspor Data](#-fitur-cetak-laporan-resmi-kedinasan--ekspor-data)
6. [Struktur Folder Monorepo](#-struktur-folder-monorepo)
7. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
8. [Kredensial Akun Resmi & Demo Uji Coba](#-kredensial-akun-resmi--demo-uji-coba)
9. [Standar Medis & Regulasi Kemenkes](#-standar-medis--regulasi-kemenkes)

---

## 🎯 Latar Belakang & Kegunaan Web

### Masalah Nyata di Lapangan
- **Tingginya Prevalensi Stunting di Jawa Timur**: Beberapa wilayah kantong stunting seperti Madura (Bangkalan, Sampang), Tapal Kuda (Jember, Bondowoso, Probolinggo), dan pesisir utara masih menghadapi tantangan prevalensi di atas ambang batas target nasional 14%.
- **Program Makan Bergizi Gratis (MBG) Rawan Tidak Tepat Sasaran**: Tanpa sistem presisi, ransum MBG sering disamaratakan untuk semua anak tanpa membedakan balita sehat reguler dengan balita yang mengalami *growth faltering* (gagal tumbuh) atau stunting garis merah yang membutuhkan intervensi protein hewani ganda intensif.
- **Data Faskes Terfragmentasi (Silo Data)**: Posyandu desa mencatat manual di buku KIA, Puskesmas terlambat menerima rujukan, Sentra Dapur SPPG memasak tanpa data sasaran riil, dan Dinas Kesehatan Provinsi tidak memiliki visibilitas real-time untuk audit anggaran dan alokasi logistik.

### Solusi NutriTrack
NutriTrack hadir sebagai **platform presisi end-to-end** yang menutup celah tersebut dengan menghubungkan seluruh rantai intervensi gizi dari desa hingga provinsi:
1. **Posyandu Desa**: Menginput penimbangan bulanan, menghitung Z-score instan, dan memverifikasi penerimaan ransum per balita.
2. **Puskesmas Pembina**: Menelaah mikro data desa binaan, menjadwalkan intervensi medis bagi anak stunting/faltering, dan menerbitkan Surat Pesanan (PO) MBG ke dapur mitra.
3. **Sentra Dapur MBG (SPPG)**: Memasak menu presisi (Paket A gizi seimbang / Paket B ekstra protein) memanfaatkan 100% komoditas pangan lokal Jawa Timur.
4. **Dinas Kesehatan Provinsi / Kemenkes**: Memantau peta geospasial prevalensi 38 Kab/Kota, mengaudit serapan anggaran, dan mengelola direktori faskes se-Jawa Timur.

---

## 🏛 Arsitektur Sistem & Pemisahan Frontend / Backend

NutriTrack dibangun menggunakan arsitektur modern berstandar industri dengan pemisahan tegas antara antarmuka pengguna (**Frontend**) dan mesin pengambil keputusan (**Backend Decision Engine**):

```
                        ┌──────────────────────────────────────────────┐
                        │              NUTRI TRACK JATIM               │
                        └──────────────────────┬───────────────────────┘
                                               │
             ┌─────────────────────────────────┴─────────────────────────────────┐
             ▼                                                                   ▼
┌──────────────────────────────┐                               ┌──────────────────────────────┐
│       FRONTEND CLIENT        │                               │       BACKEND API &          │
│   (Next.js 14 + React 18)    │                               │       DECISION ENGINE        │
│                              │                               │     (Node.js + Express)      │
├──────────────────────────────┤                               ├──────────────────────────────┤
│ • App Router Architecture    │      REST API & JSON IPC      │ • WHO Anthro Z-Score Engine  │
│ • Tailwind CSS + Framer      │ ◄───────────────────────────► │ • Local Procurement Engine   │
│ • Interactive Geospasial SVG │     (Port 3000 <-> Port 5000) │ • Role-Based Access Control  │
│ • Dynamic Report Modal       │                               │ • QR Code Security Service   │
│ • Print Engine (@media print)│                               │ • Audit Logger & Data Store  │
└──────────────────────────────┘                               └──────────────────────────────┘
```

### 1. Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router) dengan TypeScript murni.
- **Styling**: Tailwind CSS, CSS Grid, custom typography, dan layout responsif desktop/tablet/mobile.
- **Animasi & Interaktivitas**: Framer Motion untuk transisi status, drawer, filter segmented role, dan interaksi mikro.
- **Geospasial**: Visualisasi peta SVG interaktif 38 Kabupaten/Kota se-Jawa Timur dengan klasifikasi warna zona risiko (Merah, Kuning, Hijau).
- **Cetak Laporan**: Template dokumen kedinasan resmi dengan Kop Surat standar Pemda/Kemenkes, ringkasan KPI, tabel data balita, tanda tangan pejabat, dan integrasi `@media print` A4 serta ekspor `.CSV`.

### 2. Backend Decision Engine (`/backend`)
- **Platform**: Node.js & Express.js (Port 5000).
- **Z-Score Calculation Engine**: Implementasi algoritma Z-score baku WHO Child Growth Standards (TB/U, BB/U, BB/TB) dengan deteksi dini *growth faltering*.
- **Local Procurement Calculator**: Algoritma kalkulasi konversi kebutuhan nutrisi anak menjadi kilogram komoditas pangan lokal Jawa Timur (telur Blitar, lele Lamongan, daun kelor Batu).
- **Security & RBAC Middleware**: Verifikasi hak akses per peran, isolasi yurisdiksi faskes sesuai UU PDP No. 27/2022.
- **Data Persistence**: Lightweight document store dengan data seed lengkap se-Jawa Timur.

---

## 🛡 Fitur Unggulan Berdasarkan Peran (Role-Based Features)

### 1. Role Posyandu Desa
- **KMS Digital Pintar**: Pencatatan penimbangan balita (BB, TB, Lingkar Kepala, Lingkar Lengan Atas) dengan visual kurva buku KIA Dinkes Jatim.
- **Deteksi Faltering Otomatis**: Notifikasi dini jika balita mengalami penurunan pertumbuhan atau Z-Score berada di zona waspada.
- **Checklist Harian Konsumsi MBG**: Verifikasi langsung saat balita memakan porsi makanan bergizi di posyandu dengan riwayat waktu santap.
- **Berita Acara Serah Terima (BAST) MBG**: Penerimaan surat jalan distribusi porsi Paket A dan Paket B dari armada SPPG.
- **Pendaftaran Akun Terverifikasi**: Pendaftaran posyandu baru yang otomatis mendeteksi dan mengarahkan naungan ke Puskesmas Pembina terdekat serta Sentra Dapur SPPG terdekat.

### 2. Role Puskesmas Pembina
- **Pengawasan Mikro Posyandu Desa**: Pemantauan seluruh posyandu di wilayah kerja kecamatan dalam satu dasbor terpadu.
- **Drill-Down Rincian Balita**: Klik pada nama posyandu untuk membuka daftar lengkap anak sasaran dengan NIK, nama ibu, antropometri, dan status nutrisi.
- **Otomatisasi Tombol Buat Jadwal Intervensi**: Setiap balita berstatus stunting/faltering otomatis memunculkan tombol **`[ 📅 Buat Jadwal Intervensi ]`** ke poli gizi faskes.
- **Penerbitan Surat Pesanan (PO) MBG**: Pembuatan pesanan ransum Paket A & Paket B Protein Ganda ke Sentra Dapur SPPG mitra secara digital.
- **Riwayat & Pelacakan Distribusi**: Memantau status pesanan (Diterima Dapur, Sedang Dimasak, Dalam Pengantaran, Tiba di Posyandu).

### 3. Role Sentra Dapur MBG (SPPG)
- **Katalog Resep Berbasis Pangan Lokal**: Menu terstandarisasi berbasis komoditas unggulan Jatim dengan takaran protein hewani presisi.
- **Kalkulator Belanja Bahan Baku Lokal**: Menghitung kebutuhan harian bahan baku segar yang langsung diserap dari peternak dan petani Jawa Timur (contoh: serapan telur Blitar & lele Lamongan).
- **Surat Jalan & Manifest Distribusi**: Pencetakan manifest pengiriman porsi MBG per armada ke setiap posyandu desa tujuan.
- **Quality Control Suhu & Organoleptik**: Verifikasi suhu minimal penyajian (≥60°C) demi higienitas dan keamanan pangan balita.

### 4. Role Dinas Kesehatan Provinsi / Kemenkes
- **Peta Geospasial Stunting Jatim**: Visualisasi interaktif 38 Kabupaten/Kota dengan kode warna zona (Prioritas Merah >20%, Waspada Kuning 14-20%, Terkendali Hijau <14%).
- **Laporan Eksekutif Prevalensi**: Analitik agregat prevalensi, tren bulanan, rasio keberhasilan intervensi MBG, dan sebaran anggaran.
- **Kelola Direktori Faskes & SPPG**: Manajemen data induk Puskesmas pembina se-Jatim, jaringan posyandu desa, dan sentra dapur SPPG.
- **Pendaftaran Faskes & Dapur Baru**: Fasilitas khusus dinas untuk meregistrasi unit puskesmas baru dan sentra dapur MBG wilayah kerja baru.

---

## 🐟 Inovasi Spesifik Komoditas Lokal Jawa Timur

NutriTrack mengintegrasikan potensi agrikultur dan perikanan Jawa Timur ke dalam formula intervensi gizi anak:

| Komoditas Lokal Jatim | Sentra Penghasil Utama | Peran Nutrisi dalam NutriTrack | Alokasi Paket MBG |
|---|---|---|---|
| **Telur Ayam Ras Blitar** | Kab. Blitar *(Sentra telur terbesar Jatim, 350 ton/hari)* | Sumber protein bernilai biologis tinggi, kolin untuk perkembangan otak baduta | **Paket B** *(Intervensi Ganda: 2 butir/porsi)* |
| **Ikan Lele & Kembung** | Kab. Lamongan & Kab. Tulungagung | Asam lemak Omega-3 & DHA tinggi untuk akselerasi pertumbuhan sel | **Paket B** *(Menu Utama Terapi Stunting)* |
| **Daun Kelor Organik** | Kota Batu & Malang Raya | Mikronutrien, zat besi (Fe), kalsium, dan vitamin A pencegah anemia | **Paket A & B** *(Sayur Bening & Kuah Tim)* |
| **Hati Ayam Kampung** | Peternak Rakyat Kediri & Jombang | Sumber zat besi heme tinggi untuk mengatasi *growth faltering* akut | **Paket C** *(Terapi Khusus Rujukan Medis)* |
| **Tempe Kediri / Madiun** | Kab. Kediri & Kab. Madiun | Protein nabati terfermentasi mudah cerna ramah saluran cerna balita | **Paket A** *(Menu Harian Gizi Seimbang)* |

---

## 🖨 Fitur Cetak Laporan Resmi Kedinasan & Ekspor Data

NutriTrack dilengkapi modul pencetakan dokumen resmi kedinasan (`CetakLaporanModal.tsx`) yang dapat diakses di seluruh peran:

### Fitur Dokumen:
1. **Kop Surat Kedinasan**: Lambang instansi, identitas Pemda/Kemenkes, alamat faskes, nomor register surat resmi, dan dasar hukum regulasi.
2. **Kartu Ringkasan Indikator (KPI)**: Total sasaran, persentase balita sehat, jumlah kasus stunting/faltering, dan status alokasi porsi.
3. **Tabel Data Komprehensif**: Format tabel rapi dengan NIK, usia, antropometri, Z-score, status gizi, dan tindak lanjut faskes.
4. **Catatan Klinis & Rekomendasi**: Ruang instruksi dari dokter pemeriksa atau nutrisionis puskesmas.
5. **Legalisasi & Tanda Tangan Resmi**: Titimangsa tanggal laporan, jabatan penanggung jawab, nama terang pejabat, dan NIP resmi.
6. **Watermark Digital**: Bukti keaslian data terverifikasi Dinas Kesehatan Provinsi Jawa Timur.
7. **Dukungan Cetak A4 & CSV**:
   - Tombol **`🖨️ Cetak Dokumen / Simpan PDF`** memicu `window.print()` dengan styling khusus `@media print` (menyembunyikan navigasi dan tombol antarmuka).
   - Tombol **`📥 Unduh Format Excel (.CSV)`** mengunduh file spreadsheet siap olah untuk kebutuhan arsip dan pelaporan berjenjang.

---

## 📂 Struktur Folder Monorepo

```
nutri/
├── package.json                 # Monorepo root package.json (orchestrator scripts)
├── .gitignore                   # Global gitignore untuk frontend & backend
├── README.md                    # Dokumentasi utama proyek NutriTrack Jatim
│
├── frontend/                    # 🌐 FRONTEND APPLICATION (Next.js 14)
│   ├── app/                     # App Router Next.js
│   │   ├── (auth)/              # Route group login & pendaftaran posyandu
│   │   ├── app/page.tsx         # Dasbor utama dengan tab dinamis 4 role
│   │   ├── globals.css          # Styling global & media print rules A4
│   │   └── layout.tsx           # Root layout & providers
│   ├── components/
│   │   ├── auth/                # Formulir login mandiri & register posyandu
│   │   ├── dashboard/           # Komponen dasbor operasional:
│   │   │   ├── AppShell.tsx     # Shell navigasi & role switching
│   │   │   ├── CetakLaporanModal.tsx  # Modal cetak laporan kedinasan & CSV
│   │   │   ├── ProfilAkunTab.tsx      # Manajemen profil & ubah password
│   │   │   ├── ModulAKmsTab.tsx       # Modul Posyandu (KMS Digital)
│   │   │   ├── PuskesmasTab.tsx       # Modul Puskesmas (Mikro & PO MBG)
│   │   │   ├── ModulBDapurTab.tsx     # Modul Dapur SPPG (Resep & Logistik)
│   │   │   ├── ModulCKonsumsiTab.tsx  # Modul Posyandu (Checklist MBG)
│   │   │   ├── ModulDAnalitikTab.tsx  # Modul Dinkes (Peta Geospasial 38 Kota)
│   │   │   └── DinkesKelolaFaskesTab.tsx # Modul Dinkes (Kelola Faskes Jatim)
│   │   ├── layout/              # Navbar, Footer
│   │   ├── sections/            # Landing page hero, pillars, commodities, etc.
│   │   └── ui/                  # Reusable UI primitives
│   ├── lib/
│   │   ├── auth-data.ts         # Master akun resmi, autentikasi, & hash password
│   │   ├── app-data.ts          # Data geospasial 38 Kab/Kota Jawa Timur
│   │   ├── puskesmas-data.ts    # Direktori Puskesmas Jatim & mapping desa
│   │   └── demo-data.ts         # Mock data balita & resep komoditas
│   ├── public/                  # Aset logo resmi, ikon, & ilustrasi SVG komoditas
│   ├── next.config.mjs          # Konfigurasi Next.js
│   ├── tailwind.config.ts       # Konfigurasi Tailwind CSS
│   ├── tsconfig.json            # Konfigurasi TypeScript frontend
│   └── package.json             # Dependensi frontend
│
├── backend/                     # ⚙️ BACKEND DECISION ENGINE (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Konfigurasi master komoditas lokal & standar KIA
│   │   ├── controllers/         # Handler REST API SKPL-F01 s/d SKPL-F14
│   │   ├── database/            # Document store & seeder database
│   │   ├── middleware/          # Auth middleware & error handling
│   │   ├── routes/              # Routing endpoint API
│   │   ├── services/            # Engine Z-score, Kalkulator Bahan, QR Service
│   │   ├── public/              # Live API Explorer di browser
│   │   └── server.js            # Express server (Port 5000)
│   ├── data/db/                 # File JSON database lokal
│   ├── README.md                # Dokumentasi teknis endpoint API backend
│   └── package.json             # Dependensi backend
│
└── docs/                        # 📄 DOKUMENTASI PROYEK
    └── SKPL_NutriTrack_Jatim.md # Spesifikasi Kebutuhan Perangkat Lunak v1.0
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat Sistem
- **Node.js**: Versi `18.17.0` atau lebih baru.
- **NPM**: Versi `9.0.0` atau lebih baru.
- **Sistem Operasi**: Windows, macOS, atau Linux.

### 1. Kloning Repositori
```bash
git clone https://github.com/myakunjefri-collab/NutriTrack.git
cd NutriTrack
```

### 2. Instalasi Dependensi
Anda dapat menginstal dependensi seluruh modul sekaligus dari root:
```bash
# Instalasi modul frontend
cd frontend
npm install

# Instalasi modul backend
cd ../backend
npm install

# Kembali ke root
cd ..
```

### 3. Menjalankan Aplikasi

#### Opsi A: Menjalankan dari Root Monorepo
```bash
# Menjalankan frontend (Port 3000)
npm run dev:frontend

# Menjalankan backend di terminal terpisah (Port 5000)
npm run dev:backend
```

#### Opsi B: Menjalankan Langsung di Masing-Masing Folder
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# Akses di browser: http://localhost:3000

# Terminal 2 - Backend
cd backend
npm run dev
# Akses API Explorer: http://localhost:5000
```

---

## 🔑 Kredensial Akun Resmi & Demo Uji Coba

Setiap pengguna masuk menggunakan **Email Resmi** dan **Kata Sandi**. Kata sandi bawaan seluruh akun adalah `Password123!` dan dapat diperbarui secara mandiri melalui menu **Profil Akun**.

| Peran (Role) | Instansi / Faskes | Email Login | Kata Sandi Bawaan | Wilayah Kerja |
|---|---|---|---|---|
| **Dinas Kesehatan Prov. Jatim** | Dinas Kesehatan Provinsi Jawa Timur | `dinkes.jatim@jatimprov.go.id` | `Password123!` | Pengawasan 38 Kabupaten / Kota se-Jatim |
| **Puskesmas Pembina (Madura)** | Puskesmas Socah | `puskesmas.socah@jatim.go.id` | `Password123!` | Kec. Socah, Kab. Bangkalan |
| **Puskesmas Pembina (Pantura)** | Puskesmas Kedungdung | `puskesmas.kedungdung@jatim.go.id` | `Password123!` | Kec. Kedungdung, Kab. Sampang |
| **Posyandu Desa** | Posyandu Mawar 01 | `posyandu.mawar01@jatim.go.id` | `Password123!` | Desa Bilaporah, Kec. Socah |
| **Posyandu Desa** | Posyandu Melati 01 | `posyandu.dakiring@jatim.go.id` | `Password123!` | Desa Dakiring, Kec. Socah |
| **Sentra Dapur MBG (SPPG)** | SPPG Dapur Sehat Socah Mandiri | `sppg.socah@jatim.go.id` | `Password123!` | Layanan Ransum Wilayah Kec. Socah |

> **Fitur Demo Cepat (1-Klik)**: Di halaman login (`/login`), tersedia tombol `⚡ Masuk Cepat / Demo Akun` untuk mempermudah evaluasi tanpa mengetik ulang kredensial.

---

## ⚕ Standar Medis & Regulasi Kemenkes

NutriTrack mematuhi pedoman teknis kesehatan nasional dan internasional:
1. **Permenkes RI No. 2 Tahun 2020** tentang Standar Antropometri Anak:
   - Standar deviasi Z-score Tinggi Badan menurut Umur (TB/U):
     - `Z < -3 SD`: Sangat Pendek (*Severely Stunted*)
     - `-3 SD ≤ Z < -2 SD`: Pendek (*Stunted*)
     - `-2 SD ≤ Z ≤ +3 SD`: Normal
     - `Z > +3 SD`: Tinggi
2. **WHO Child Growth Standards (2006)**: Menjadi basis formula engine perhitungan antropometri.
3. **Konsep Early Warning Growth Faltering**: Intervensi dini dilakukan saat balita berada di zona waspada sebelum terjadi stunting permanen.
4. **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)**: Isolasi yurisdiksi data antar faskes kecamatan untuk menjamin kerahasiaan riwayat medis balita.

---

<p align="center">
  <strong>NutriTrack Jawa Timur</strong> — Mewujudkan Generasi Emas Bebas Stunting Melalui Presisi Data & Pangan Bergizi Lokal.<br />
  © 2026 Tim Pengembang NutriTrack. Dibuat dengan dedikasi untuk kesehatan anak Jawa Timur dan Indonesia.
</p>
