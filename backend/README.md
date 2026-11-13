# 🌾 NutriTrack Jatim - Backend Decision & Intervention Engine

> **Sistem Presisi Intervensi Stunting & Pemantauan Makan Bergizi Gratis (MBG) Berbasis Komoditas Lokal Jawa Timur**  
> *Sesuai Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) NutriTrack Jatim v1.0 & Standar Permenkes RI No. 2/2020*

---

## 📌 Ringkasan Proyek & Konteks Lokal Jawa Timur

NutriTrack Jatim memadukan pemantauan tumbuh kembang balita di tingkat Posyandu dengan rantai pasok dapur program **Makan Bergizi Gratis (MBG)**. Kekuatan terbesar sistem ini adalah **mengakar kuat pada konteks lokal Jawa Timur**, bukan sekadar teori umum, dengan menyelesaikan paradoks gizi: *Jawa Timur adalah sentra protein hewani terbesar di Indonesia (telur Blitar & lele Lamongan), namun masih memiliki kantong prevalensi stunting yang butuh perhatian serius (seperti Madura/Bangkalan-Sampang, Jember, Bondowoso, dan Probolinggo).*

---

## 🌟 3 Fitur Inti Spesifik Jawa Timur

### 1. Smart KMS Digital (Fokus Kantong Stunting Jatim)
- **Filter Wilayah Prioritas:** Dropdown desa & kecamatan di daerah prioritas penanganan stunting:
  - **Madura:** Kab. Bangkalan (Kec. Socah, Burneh, Blega, Arosbaya) & Kab. Sampang (Kec. Kedungdung, Camplong, Robatal)
  - **Tapal Kuda & Timur:** Kab. Jember (Kec. Kaliwates, Tanggul, Silo), Kab. Bondowoso (Kec. Maesan, Tamanan), dan Kab. Probolinggo (Kec. Krucil, Tiris)
- **Visual Kurva Buku KIA Resmi Dinkes Jatim:**
  - 🟢 **Hijau (Normal):** Pertumbuhan baik, dialokasikan ke **Paket A (Reguler)**.
  - 🟡 **Kuning (Waspada / Growth Faltering):** Berat badan mendatar/turun 2 bulan berturut-turut, otomatis dialokasikan ke **Paket B (Intervensi Protein Hewani Ganda)**.
  - 🔴 **Merah (BGM / Risiko Stunting Berat):** Z-score < -2 SD, intervensi intensif + notifikasi rujukan dokter Puskesmas.

### 2. Rekomendasi Menu MBG Berbasis Komoditas Lokal Jawa Timur
- **Kategori Hijau (Gizi Seimbang Reguler):**
  - *Nasi tim beras lokal Jatim + kuah sayur bayam/daun kelor + tempe mendoan Kediri + suwir ayam ras.*
- **Kategori Kuning/Merah (Intervensi Protein Hewani Ganda):**
  - **Telur Ayam Ras Blitar:** Sentra telur terbesar di Jatim (350 ton/hari), porsi dobel atau olahan telur kukus lembut.
  - **Lele & Ikan Kembung Lamongan/Tulungagung:** Sumber protein hewani & omega-3 DHA tinggi yang murah dibanding salmon impor.
  - **Hati Ayam Kampung & Daun Kelor Organik Batu:** Booster zat besi heme dan vitamin A untuk percepatan kejar tumbuh baduta faltering.

### 3. Dasbor Dapur SPPG & Monitoring Wilayah Jatim
- **Peta Pantau Mikro:** Menampilkan titik koordinat desa di kantong stunting Jatim yang sedang diintervensi dapur MBG.
- **Kalkulator Belanja Bahan Lokal:** Dasbor dapur otomatis menghitung kebutuhan gramasi bahan yang diserap langsung dari peternak dan kelompok tani (Gapoktan) lokal Jawa Timur:
  - Contoh: *"Kebutuhan hari ini: 15 kg telur Blitar, 8 kg lele Lamongan, 5 kg hati ayam Jombang, 12 ikat kelor Batu"*.
  - **100% Perputaran Uang Berada di Jawa Timur**, memberdayakan ekonomi peternak dan nelayan lokal.

---

## 🚀 Cara Menjalankan Backend di Localhost

Backend ini dirancang **sangat mudah dijalankan (zero-pain)** tanpa membutuhkan Docker, database PostgreSQL eksternal yang rumit, atau dependensi C++ native compiler:

### 1. Masuk ke direktori backend
```bash
cd backend
```

### 2. Install dependensi
```bash
npm install
```

### 3. Jalankan server backend
```bash
npm run dev
# atau
node src/server.js
```

### 4. Buka di Browser
- **Dasbor Interaktif & Live API Explorer:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

> 💡 **Auto-Seeding:** Saat pertama kali dijalankan, sistem otomatis membuat basis data dan mengisi data awal balita wilayah Jatim, resep lokal, log peternak, serta akun demo untuk 4 role.

---

## 🔑 Akun Demo untuk Pengujian & Pitching

| Role / Peran | Email | Password | Wilayah Tugas |
|---|---|---|---|
| **Kader Posyandu** | `kader.socah@jatim.go.id` | `password123` | Posyandu Mawar 01, Socah, Bangkalan |
| **Pengelola Dapur MBG** | `dapur.sppg@jatim.go.id` | `password123` | Dapur SPPG Kec. Socah, Bangkalan |
| **Nutrisionis Puskesmas** | `gizi.puskesmas@jatim.go.id` | `password123` | Puskesmas Socah |
| **Dinkes & TPID Prov. Jatim** | `dinkes.jatim@jatimprov.go.id` | `password123` | Provinsi Jawa Timur |
| **Orang Tua Balita** | `orangtua.ahmad@gmail.com` | `password123` | Desa Bilaporah, Socah |

---

## 📡 Daftar Endpoint REST API Lengkap

### 1. Autentikasi & Akun (`/api/auth`)
- `POST /api/auth/login` : Login user (menghasilkan token JWT).
- `POST /api/auth/register` : Registrasi akun kader/dapur/puskesmas.
- `GET /api/auth/me` : Profil user yang sedang login (butuh Bearer Token).
- `GET /api/auth/demo-accounts` : Daftar akun demo untuk pengujian juri.

### 2. Manajemen Balita (`/api/children`)
- `GET /api/children` : Mengambil daftar balita (Filter: `kabupaten`, `kecamatan`, `desa`, `kurvaKIA`, `isFaltering`, `q`).
- `GET /api/children/:id` : Detail data balita beserta seluruh riwayat kurva KMS dan distribusi MBG.
- `POST /api/children` : Pendaftaran balita baru (otomatis kalkulasi Z-Score Kemenkes/WHO).
- `PUT /api/children/:id` : Update data balita.
- `DELETE /api/children/:id` : Hapus data balita.

### 3. Smart KMS & Z-Score Engine (`/api/growth-records`)
- `POST /api/growth-records/calculate` : **Live simulation** perhitungan Z-Score BB/U, TB/U, BB/TB, deteksi growth faltering, warna kurva KIA Jatim, dan alokasi MBG tanpa menyimpan ke DB.
- `POST /api/growth-records` : Menyimpan hasil penimbangan posyandu bulanan.
- `POST /api/growth-records/sync` : Sinkronisasi batch penimbangan posyandu saat kembali online (**Offline-Ready PWA / SKPL-F05**).

### 4. Katalog Resep MBG Jatim (`/api/recipes`)
- `GET /api/recipes` : Mengambil katalog menu MBG lokal Jatim (Filter: `kategori=Paket A|Paket B`, `komoditas`).
- `GET /api/recipes/:id` : Detail gramasi bahan, tekstur, dan langkah memasak resep.
- `POST /api/recipes` : Tambah menu lokal baru.

### 5. Dasbor Dapur & Kalkulator Belanja Lokal (`/api/kitchen`)
- `GET /api/kitchen/summary` : Ringkasan porsi harian dapur SPPG (Total porsi, Paket A vs Paket B).
- `POST /api/kitchen/procurement-calculator` : **Kalkulator Belanja Lokal** (input jumlah porsi A & B -> output kilogram Telur Blitar, Lele Lamongan, Hati Ayam, Kelor, Beras, estimasi harga Rupiah, dan serapan ekonomi lokal).
- `GET /api/kitchen/supply-logs` : Riwayat pembelian bahan pangan ke peternak/Gapoktan Jatim.
- `POST /api/kitchen/supply-logs` : Catat nota pembelian bahan baku lokal baru.

### 6. Distribusi & Scan QR Token (`/api/distributions`)
- `GET /api/distributions` : Daftar paket makanan MBG yang dikirimkan.
- `GET /api/distributions/token/:token` : Validasi token QR kotak makan.
- `POST /api/distributions/batch-daily` : Generate massal label token QR wadah makan untuk seluruh balita hari ini.
- `POST /api/distributions/token/:token/verify-consumption` : Verifikasi scan QR penerimaan makanan & survey satu-klik status daya terima (*Habis (100%)*, *Tersisa Sebagian (50%)*, *Tidak Termakan (0%)*).

### 7. Analitik Dampak & Monitoring Pimpinan (`/api/analytics`)
- `GET /api/analytics/regions` : Data heatmap kantong stunting Jatim & titik peta mikro desa.
- `GET /api/analytics/ron-cohort` : **Return on Nutrition (RoN) Tracker** siklus 30, 60, dan 90 hari.
- `GET /api/analytics/kpis` : Rekapitulasi KPI eksekutif dan total perputaran uang Jawa Timur.

### 8. Laporan Audit Pemda (`/api/reports`)
- `GET /api/reports/export?format=json|csv` : Unduh rekapitulasi data audit format CSV atau JSON untuk Bappeda/Dinkes.

---

## 📂 Struktur Direktori Backend

```
backend/
├── data/
│   └── db/                      # Database JSON mandiri (auto-created & auto-seeded)
│       ├── users.json
│       ├── children.json
│       ├── growth_records.json
│       ├── recipes.json
│       ├── distributions.json
│       ├── consumption_logs.json
│       ├── supply_logs.json
│       └── districts.json
├── src/
│   ├── config/
│   │   ├── jatimLocations.js    # Master desa/kecamatan kantong stunting & komoditas Jatim
│   │   └── whoStandards.js      # Tabel WHO & Permenkes 2/2020 + kurva KIA Dinkes Jatim
│   ├── controllers/             # Controller modular SKPL-F01 s/d SKPL-F14
│   │   ├── authController.js
│   │   ├── childrenController.js
│   │   ├── growthController.js
│   │   ├── recipeController.js
│   │   ├── kitchenController.js
│   │   ├── distributionController.js
│   │   ├── analyticsController.js
│   │   └── reportController.js
│   ├── database/
│   │   ├── db.js                # Document store adapter mandiri & zero-config
│   │   └── seed.js              # Seeder data awal balita & komoditas Jatim
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT & RBAC
│   │   └── errorHandler.js      # Global error & 404 handler
│   ├── routes/                  # Express Router per modul SKPL
│   ├── services/
│   │   ├── zscoreEngine.js      # Engine Z-score & deteksi growth faltering
│   │   ├── procurementCalculator.js # Kalkulator bahan lokal peternak Jatim
│   │   └── qrService.js         # Generator & validator token QR paket makan
│   ├── data/
│   │   └── recipesJatim.json    # Katalog resep komoditas lokal Jawa Timur
│   ├── public/
│   │   └── index.html           # Dasbor Interaktif & Live API Tester di browser
│   └── server.js                # Entry point server Express (Port 5000)
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## 🔗 Hubungan dengan Frontend Next.js

Frontend Next.js yang ada di root repo dapat memanggil backend ini secara langsung ke `http://localhost:5000` atau dengan mengatur `NEXT_PUBLIC_API_URL=http://localhost:5000` pada `.env.local` frontend.
