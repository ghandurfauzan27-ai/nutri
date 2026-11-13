# 🌾 NutriTrack Jatim: Platform Presisi Intervensi Stunting & Pemantauan MBG

> **Sistem Presisi Intervensi Stunting & Pemantauan Makan Bergizi Gratis (MBG) Berbasis Komoditas Lokal Jawa Timur**  
> *Sesuai Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) NutriTrack Jatim v1.0 & Standar Permenkes RI No. 2/2020*

---

## 🌟 3 Fitur Inti Spesifik Jawa Timur

1. **Smart KMS Digital (Fokus Kantong Stunting Jatim):**
   - **Filter Wilayah Prioritas:** Pilihan dropdown desa/kecamatan di kantong stunting prioritas Jawa Timur (Madura/Bangkalan & Sampang, Jember, Bondowoso, dan Probolinggo).
   - **Visual Kurva Buku KIA Dinkes Jatim:** Menggunakan kode warna standar KIA (Hijau: Normal, Kuning: Waspada / Growth Faltering, Merah: BGM / Stunting Berat).
   - **Early Warning Growth Faltering:** Peringatan instan jika berat badan anak mendatar atau turun 2 bulan berturut-turut sebelum menjadi stunting permanen.

2. **Rekomendasi Menu MBG Berbasis Komoditas Lokal Jawa Timur:**
   - **Kategori Hijau (Gizi Seimbang Reguler):** Nasi tim beras lokal Jatim + kuah sayur bayam/daun kelor + tempe mendoan Kediri + suwir ayam ras.
   - **Kategori Kuning/Merah (Intervensi Protein Hewani Ganda):** Memanfaatkan sentra protein hewani melimpah di Jawa Timur:
     - **Telur Ayam Ras Blitar:** Sentra telur terbesar di Jatim (350 ton/hari), porsi dobel atau olahan telur kukus lembut.
     - **Lele & Ikan Kembung Lamongan/Tulungagung:** Sumber protein hewani & omega-3 DHA tinggi yang murah dibanding salmon.
     - **Hati Ayam Kampung & Daun Kelor Organik Batu:** Booster percepatan kenaikan berat badan baduta faltering.

3. **Dasbor Dapur SPPG & Monitoring Wilayah Jatim:**
   - **Peta Pantau Mikro:** Menampilkan titik desa di kabupaten terpilih di Jawa Timur yang sedang diintervensi dapur MBG lokal.
   - **Kalkulator Belanja Bahan Lokal:** Dasbor dapur otomatis menghitung kebutuhan bahan yang bisa langsung diserap dari pasar induk atau peternak lokal Jawa Timur (*contoh: "Kebutuhan hari ini: 15 kg telur Blitar, 8 kg lele Lamongan"*), memperkuat narasi **100% perputaran uang tetap berada di Jawa Timur**.

---

## 🚀 Panduan Menjalankan Sistem di Localhost

### A. Menjalankan Backend Decision Engine (Port 5000)

Backend baru dirancang modular, ringan, dan **zero-configuration** (auto-database & auto-seeding tanpa setup database eksternal yang rumit):

```bash
cd backend
npm install
npm run dev
```

- **URL Dasbor & Live API Explorer:** [http://localhost:5000](http://localhost:5000)
- **Health Check API:** [http://localhost:5000/health](http://localhost:5000/health)

### B. Menjalankan Frontend Next.js (Port 3000)

Frontend Next.js 14 App Router + Tailwind CSS + Framer Motion:

```bash
# Di root project
npm install
npm run dev
```

- Buka di browser: [http://localhost:3000](http://localhost:3000)
- Dasbor Aplikasi: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 📂 Struktur Repositori

```
├── app/                         # Frontend Next.js 14 (App Router)
├── components/                  # Komponen UI, Dashboard Shell, & Modul A-D
├── docs/                        # Dokumentasi PRD & Desain NutriTrack Jatim
├── lib/
│   ├── api-client.ts            # Client HTTP terintegrasi ke Backend Express (Port 5000)
│   ├── app-data.ts              # Data model & master data frontend
│   └── auth-data.ts             # Role-based access control definition
├── backend/                     # 🆕 BACKEND API & DECISION ENGINE JAWA TIMUR
│   ├── src/
│   │   ├── config/              # Master wilayah Jatim, komoditas lokal, standar WHO & KIA
│   │   ├── controllers/         # Controller SKPL-F01 s/d SKPL-F14
│   │   ├── database/            # Document store engine mandiri & auto-seeder
│   │   ├── routes/              # Express API Routes
│   │   ├── services/            # Engine Z-score, Kalkulator Belanja Lokal, & Token QR
│   │   ├── public/              # Dasbor Interaktif & Live API Tester di browser
│   │   └── server.js            # Server Express Port 5000
│   ├── data/db/                 # File JSON database lokal
│   ├── README.md                # Dokumentasi lengkap Backend & referensi API
│   └── package.json
└── README.md
```

---

## 🔑 Akun Demo Pengujian & Pitching

| Role / Peran | Email | Password | Wilayah Tugas |
|---|---|---|---|
| **Kader Posyandu** | `kader.socah@jatim.go.id` | `password123` | Posyandu Mawar 01, Socah, Bangkalan |
| **Pengelola Dapur MBG** | `dapur.sppg@jatim.go.id` | `password123` | Dapur SPPG Kec. Socah, Bangkalan |
| **Nutrisionis Puskesmas** | `gizi.puskesmas@jatim.go.id` | `password123` | Puskesmas Socah |
| **Dinkes & TPID Prov. Jatim** | `dinkes.jatim@jatimprov.go.id` | `password123` | Provinsi Jawa Timur |
