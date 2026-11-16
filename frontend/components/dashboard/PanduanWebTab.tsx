"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PanduanWebTabProps {
  onNavigateTab?: (tab: string) => void;
}

interface StepItem {
  id: string;
  category: "awal" | "posyandu" | "puskesmas" | "dapur" | "konsumsi" | "dinkes" | "profil";
  categoryLabel: string;
  categoryColor: string;
  stepNumber: string;
  title: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  userActions: string[];
  systemReactions: string[];
  targetTab?: string;
  targetTabLabel?: string;
}

const PANDUAN_STEPS: StepItem[] = [
  {
    id: "step-landing",
    category: "awal",
    categoryLabel: "Awal & Akses",
    categoryColor: "bg-blue-100 text-blue-900 border-blue-300",
    stepNumber: "LANGKAH 01",
    title: "Akses Halaman Landing & Tampilan Dasbor Online",
    summary: "Website sudah aktif dan berjalan secara online di cloud Railway, tanpa perlu instalasi atau setting localhost.",
    imageSrc: "/panduan/landing.png",
    imageAlt: "Tampilan Landing Page NutriTrack",
    imageCaption: "Halaman Landing NutriTrack Jawa Timur dengan Informasi Program dan Fitur Terintegrasi",
    userActions: [
      "Buka browser (Google Chrome, Edge, atau Firefox) di laptop atau smartphone Anda.",
      "Akses tautan online: https://nutri-frontend-production-cd025f29.up.railway.app",
      "Gunakan tombol '🌐 Beranda Web' di pojok kanan atas dasbor kapan saja untuk membaca profil program.",
    ],
    systemReactions: [
      "Sistem langsung memuat platform interaktif tanpa perlu menyalakan server lokal (localhost).",
      "Langsung menampilkan Dasbor Operasional dengan bilah navigasi lengkap untuk semua peran.",
    ],
    targetTab: "ringkasan",
    targetTabLabel: "Lihat Dasbor Utama",
  },
  {
    id: "step-login",
    category: "awal",
    categoryLabel: "Awal & Akses",
    categoryColor: "bg-blue-100 text-blue-900 border-blue-300",
    stepNumber: "LANGKAH 02",
    title: "Masuk / Login Akun Resmi Sesuai Peran Faskes",
    summary: "Sistem menyediakan akun bawaan untuk 4 peran faskes yang langsung dapat dipilih dengan 1 kali klik.",
    imageSrc: "/panduan/login.png",
    imageAlt: "Modal Login Resmi NutriTrack",
    imageCaption: "Jendela Pemilihan Peran Akun Resmi (Posyandu, Puskesmas, Dapur SPPG, Dinkes)",
    userActions: [
      "Klik tombol 'Ganti Akun / Masuk' di pojok kanan atas dasbor.",
      "Pilih salah satu kartu peran faskes Anda: Posyandu Desa, Puskesmas Pembina, Sentra Dapur MBG, atau Dinkes.",
      "Email dan kata sandi bawaan (Password123!) otomatis terisi, lalu klik tombol hitam 'Masuk ke Dasbor Resmi'.",
    ],
    systemReactions: [
      "Sistem memverifikasi otorisasi identitas faskes dan langsung mengarahkan Anda ke modul kerja yang sesuai.",
      "Identitas nama petugas dan wilayah kerja faskes terkunci aman di bilah status atas.",
    ],
    targetTab: "profil",
    targetTabLabel: "Cek Status Akun Aktif",
  },
  {
    id: "step-register",
    category: "awal",
    categoryLabel: "Awal & Akses",
    categoryColor: "bg-blue-100 text-blue-900 border-blue-300",
    stepNumber: "LANGKAH 03",
    title: "Pendaftaran Mandiri Posyandu Baru ke Puskesmas Terdekat",
    summary: "Posyandu baru dapat mendaftarkan unitnya sendiri dan langsung dipetakan ke Puskesmas pembina terdekat.",
    imageSrc: "/panduan/register.png",
    imageAlt: "Form Pendaftaran Posyandu",
    imageCaption: "Formulir Pendaftaran Posyandu Baru dengan Deteksi Otomatis Faskes Pembina Terdekat",
    userActions: [
      "Pada jendela login, klik tombol abu-abu 'Daftar Akun Baru'.",
      "Isi nama kader, nomor WhatsApp aktif, dan kata sandi baru.",
      "Pilih Kabupaten, Kecamatan, dan Desa wilayah posyandu Anda.",
      "Ketik nama posyandu (contoh: Posyandu Melati 03) dan alamat balai RW, lalu klik 'Daftar Sekarang'.",
    ],
    systemReactions: [
      "Sistem secara otomatis mendeteksi Puskesmas Pembina terdekat dan Sentra Dapur MBG penyuplai wilayah tersebut.",
      "Akun langsung terbuat berstatus 'Menunggu Konfirmasi' dan seketika muncul di meja Puskesmas terdekat untuk disahkan.",
    ],
  },
  {
    id: "step-timbang",
    category: "posyandu",
    categoryLabel: "Kader Posyandu",
    categoryColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    stepNumber: "LANGKAH 04",
    title: "Kader Posyandu: Input Pengukuran Antropometri Balita",
    summary: "Pencatatan penimbangan bulanan balita di meja timbang hari-H posyandu.",
    imageSrc: "/panduan/posyandu_timbang.png",
    imageAlt: "Meja Penimbangan Posyandu",
    imageCaption: "Formulir Pengisian Berat Badan (BB) dan Tinggi Badan (TB) di Tab Posyandu",
    userActions: [
      "Klik tab menu '1. Posyandu (Penimbangan & KMS)'.",
      "Pilih nama anak dari daftar balita binaan (atau klik tombol '+ Tambah Balita Baru').",
      "Ketik angka timbangan Berat Badan (kg) dan Tinggi Badan (cm).",
      "Klik tombol biru '💾 Simpan & Hitung Z-Score WHO'.",
    ],
    systemReactions: [
      "Sistem menghitung nilai Z-Score standar WHO (TB/U, BB/U) secara instan.",
      "Data pengukuran tersimpan ke log penimbangan posyandu dan kurva pertumbuhan anak langsung ter-update.",
    ],
    targetTab: "kms",
    targetTabLabel: "Buka Meja Penimbangan KMS",
  },
  {
    id: "step-kms",
    category: "posyandu",
    categoryLabel: "Kader Posyandu",
    categoryColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    stepNumber: "LANGKAH 05",
    title: "Kader Posyandu: Membaca Kurva KMS Digital & Rekomendasi MBG",
    summary: "Hasil penimbangan otomatis memplot titik kurva KIA WHO dan menentukan paket makanan bergizi presisi.",
    imageSrc: "/panduan/kurva_kms.png",
    imageAlt: "Grafik Kurva KMS Digital",
    imageCaption: "Grafik Pertumbuhan KIA Digital dan Peringatan Otomatis Status Gizi Balita",
    userActions: [
      "Amati grafik kurva KIA digital di samping formulir penimbangan.",
      "Perhatikan posisi titik koordinat pertumbuhan balita apakah di zona hijau atau zona kuning/merah.",
    ],
    systemReactions: [
      "Balita Sehat (titik kurva hijau): Otomatis dialokasikan jatah ransum Paket A (Gizi Reguler).",
      "Balita Faltering / Garis Merah (titik stagnan atau Z-Score < -2 SD): Sistem membunyikan badge 'Waspada', menaikkan jatah ke Paket B (Protein Hewani Ganda Jatim: Telur Blitar Ganda + Lele Lamongan), dan otomatis mengirimkan data anak ke antrean rujukan dokter Puskesmas.",
    ],
    targetTab: "kms",
    targetTabLabel: "Cek Kurva KMS Balita",
  },
  {
    id: "step-binaan",
    category: "puskesmas",
    categoryLabel: "Puskesmas Pembina",
    categoryColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    stepNumber: "LANGKAH 06",
    title: "Puskesmas: Konfirmasi & Sahkan Posyandu Binaan Baru",
    summary: "Petugas faskes kecamatan memvalidasi posyandu baru yang mendaftar di wilayah yurisdiksinya.",
    imageSrc: "/panduan/puskesmas_binaan.png",
    imageAlt: "Daftar Posyandu Binaan Puskesmas",
    imageCaption: "Sub-Tab Posyandu Binaan dengan Tombol Konfirmasi Akun dan Cetak SK Penetapan Faskes",
    userActions: [
      "Masuk sebagai akun Puskesmas Pembina (contoh: puskesmas.socah@jatim.go.id).",
      "Klik tab '2. Puskesmas' → pilih sub-tab 'Posyandu Binaan & Verifikasi Akun'.",
      "Cek data posyandu baru (berlabel 'Menunggu Konfirmasi'), lalu klik tombol hijau '✓ Konfirmasi Akun Resmi'.",
    ],
    systemReactions: [
      "Status posyandu langsung berubah menjadi 'RESMI TERVERIFIKASI & DINAUNGI PUSKESMAS'.",
      "Tombol '🖨️ Surat SK Binaan' aktif untuk mencetak surat pengesahan resmi berkop dinas faskes.",
    ],
    targetTab: "posyandu_binaan",
    targetTabLabel: "Buka Posyandu Binaan Puskesmas",
  },
  {
    id: "step-rujukan",
    category: "puskesmas",
    categoryLabel: "Puskesmas Pembina",
    categoryColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    stepNumber: "LANGKAH 07",
    title: "Puskesmas: Tangani Balita Rujukan Merah & Buat Jadwal Dokter",
    summary: "Dokter dan nutrisionis puskesmas memantau balita stunting dan menjadwalkan konseling klinis.",
    imageSrc: "/panduan/puskesmas_rujukan.png",
    imageAlt: "Daftar Balita Rujukan Masuk",
    imageCaption: "Daftar Kasus Rujukan Garis Merah dan Modal Penjadwalan Intervensi Medis Puskesmas",
    userActions: [
      "Buka sub-tab '🚨 Daftar Rujukan Balita Garis Merah'.",
      "Klik tombol merah '📅 Buat Jadwal Intervensi Klinis' pada balita rujukan.",
      "Tentukan tanggal konsultasi, jam periksa, nama dokter (contoh: dr. Spesialis Anak), dan poli tujuan, lalu klik simpan.",
    ],
    systemReactions: [
      "Layar ini HANYA menampilkan balita bermasalah gizi (balita normal tidak akan masuk).",
      "Status anak seketika berganti menjadi bergaris hijau 'Terjadwal Konseling Dokter' dan otomatis tersinkron ke posyandu bersangkutan.",
    ],
    targetTab: "puskesmas",
    targetTabLabel: "Cek Balita Rujukan Puskesmas",
  },
  {
    id: "step-pesan",
    category: "puskesmas",
    categoryLabel: "Puskesmas Pembina",
    categoryColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    stepNumber: "LANGKAH 08",
    title: "Puskesmas: Terbitkan Surat Pesanan MBG ke Dapur SPPG",
    summary: "Puskesmas menerbitkan pesanan ransum bergizi resmi ke sentra dapur pengolah makanan.",
    imageSrc: "/panduan/puskesmas_pesan.png",
    imageAlt: "Form Pemesanan MBG Puskesmas",
    imageCaption: "Formulir Pemesanan Menu Ransum MBG Puskesmas ke Sentra Dapur SPPG Terdekat",
    userActions: [
      "Buka sub-tab 'Surat Pesanan MBG ke Dapur'.",
      "Pilih posyandu sasaran, tentukan jumlah porsi Paket A dan Paket B, serta pilih tanggal dan shift pengantaran.",
      "Klik tombol hitam 'Kirim Surat Pesanan ke Dapur SPPG'.",
    ],
    systemReactions: [
      "Surat Pesanan resmi ber-nomor registrasi dinas otomatis terbit.",
      "Rincian pesanan langsung masuk seketika secara real-time ke layar pengelola Dapur SPPG.",
    ],
    targetTab: "puskesmas",
    targetTabLabel: "Buka Form Pesanan MBG",
  },
  {
    id: "step-dapur",
    category: "dapur",
    categoryLabel: "Sentra Dapur SPPG",
    categoryColor: "bg-amber-100 text-amber-900 border-amber-300",
    stepNumber: "LANGKAH 09",
    title: "Dapur SPPG: Terima Pesanan, Masak Resep Hewani Ganda & Kirim",
    summary: "Pengolahan bahan pangan lokal Jawa Timur dan pembaruan alur status masakan secara transparan.",
    imageSrc: "/panduan/dapur_resep.png",
    imageAlt: "Manajemen Resep Dapur SPPG",
    imageCaption: "Layar Dapur SPPG: Resep Pangan Lokal Unggulan Jatim dan Tombol Alur Proses Masak",
    userActions: [
      "Masuk sebagai akun Dapur SPPG (sppg.socah@jatim.go.id).",
      "Klik tab '3. Dapur SPPG' untuk membaca pesanan masuk dari Puskesmas.",
      "Perhatikan resep protein hewani ganda lokal (Telur Blitar ganda, Lele Lamongan, Hati Ayam, Tempe, Daun Kelor).",
      "Klik tombol alur secara bertahap: 'Mulai Masak' → 'Siap Antar Kurir' → 'Selesai / Tiba'.",
    ],
    systemReactions: [
      "Status pengerjaan makanan langsung ter-update transparan.",
      "Puskesmas dan Posyandu bisa melihat secara langsung apakah makanan sedang dimasak, diantar kurir, atau sudah tiba.",
    ],
    targetTab: "dapur",
    targetTabLabel: "Buka Layar Dapur SPPG",
  },
  {
    id: "step-konsumsi",
    category: "konsumsi",
    categoryLabel: "Verifikasi Konsumsi",
    categoryColor: "bg-teal-100 text-teal-900 border-teal-300",
    stepNumber: "LANGKAH 10",
    title: "Kader Posyandu: Catat Daya Habis Makanan Balita",
    summary: "Verifikasi kepatuhan makan anak untuk evaluasi klinis berkala oleh dokter faskes.",
    imageSrc: "/panduan/konsumsi_mbg.png",
    imageAlt: "Verifikasi Konsumsi MBG Posyandu",
    imageCaption: "Meja Verifikasi Kepatuhan Konsumsi Ransum MBG di Posyandu",
    userActions: [
      "Klik tab '4. Verifikasi Konsumsi MBG'.",
      "Pilih nama posyandu dan tanggal makan hari ini.",
      "Pada tiap balita yang makan, pilih salah satu opsi: 🟢 Habis Total (100%), 🟡 Tersisa Sebagian (50%), atau 🔴 Tidak Habis (0%).",
      "Klik tombol hitam '💾 Simpan Verifikasi Konsumsi'.",
    ],
    systemReactions: [
      "Data daya habis makanan tersimpan permanen.",
      "Dokter Puskesmas dapat memantau balita mana yang menolak makan atau memiliki pantangan alergi bahan tertentu.",
    ],
    targetTab: "konsumsi",
    targetTabLabel: "Buka Meja Verifikasi Konsumsi",
  },
  {
    id: "step-profil",
    category: "profil",
    categoryLabel: "Profil & Keamanan",
    categoryColor: "bg-purple-100 text-purple-900 border-purple-300",
    stepNumber: "LANGKAH 11",
    title: "Edit Informasi Profil Faskes & Ubah Kata Sandi Akun",
    summary: "Setiap faskes memiliki kendali penuh memperbarui identitas unit dan menjaga keamanan sandi.",
    imageSrc: "/panduan/profil_faskes.png",
    imageAlt: "Profil Faskes dan Keamanan Akun",
    imageCaption: "Layar Profil Akun: Kolom Identitas Faskes (Kiri) dan Kolom Ubah Kata Sandi (Kanan)",
    userActions: [
      "Buka tab 'Profil Akun & Faskes' di ujung kanan baris navigasi.",
      "Kolom Kiri: Klik '✏️ Edit Profil Faskes' untuk mengubah nama pimpinan, nama unit, alamat, atau nomor WhatsApp.",
      "Kolom Kanan: Masukkan kata sandi saat ini (Password123!), ketik kata sandi baru (min. 6 karakter), lalu simpan.",
    ],
    systemReactions: [
      "Perubahan nama dan faskes seketika tercermin pada seluruh dokumen cetak, kop surat, dan SK pengesahan.",
      "Kata sandi baru langsung aktif untuk proses otentikasi login selanjutnya.",
    ],
    targetTab: "profil",
    targetTabLabel: "Kelola Profil & Sandi",
  },
  {
    id: "step-dinkes",
    category: "dinkes",
    categoryLabel: "Dinas Kesehatan",
    categoryColor: "bg-rose-100 text-rose-900 border-rose-300",
    stepNumber: "LANGKAH 12",
    title: "Dinas Kesehatan: Pantau Peta Interaktif 38 Kab/Kota Jawa Timur",
    summary: "Dashboard pimpinan eksekutif untuk monitoring sebaran stunting dan alokasi anggaran intervensi provinsi.",
    imageSrc: "/panduan/peta_jatim.png",
    imageAlt: "Peta Interaktif Stunting Jawa Timur",
    imageCaption: "Peta Interaktif 38 Kabupaten/Kota Jawa Timur dan Dasbor Monitoring Eksekutif Dinkes",
    userActions: [
      "Masuk sebagai akun Dinas Kesehatan Provinsi.",
      "Klik atau arahkan kursor ke wilayah kabupaten di peta Jawa Timur (contoh: Bangkalan, Sampang, Jember).",
      "Lihat grafik perbandingan laju penurunan stunting dan total porsi MBG yang terserap.",
    ],
    systemReactions: [
      "Sistem mengagregasi ribuan data dari tingkat posyandu secara otomatis ke level provinsi.",
      "Menyajikan analitik faktual untuk mendukung target Zero New Stunting Jawa Timur.",
    ],
    targetTab: "analitik",
    targetTabLabel: "Buka Peta Interaktif Dinkes",
  },
];

export default function PanduanWebTab({ onNavigateTab }: PanduanWebTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [previewImage, setPreviewImage] = useState<{ src: string; caption: string } | null>(null);

  const categories = [
    { key: "semua", label: "🌟 Semua Alur (12 Langkah)", count: PANDUAN_STEPS.length },
    { key: "awal", label: "🚀 Awal & Registrasi", count: PANDUAN_STEPS.filter((s) => s.category === "awal").length },
    { key: "posyandu", label: "⚖️ Kader Posyandu", count: PANDUAN_STEPS.filter((s) => s.category === "posyandu").length },
    { key: "puskesmas", label: "🏥 Puskesmas Pembina", count: PANDUAN_STEPS.filter((s) => s.category === "puskesmas").length },
    { key: "dapur", label: "🍳 Dapur SPPG", count: PANDUAN_STEPS.filter((s) => s.category === "dapur").length },
    { key: "konsumsi", label: "🍱 Verifikasi Konsumsi", count: PANDUAN_STEPS.filter((s) => s.category === "konsumsi").length },
    { key: "profil", label: "⚙️ Profil & Sandi", count: PANDUAN_STEPS.filter((s) => s.category === "profil").length },
    { key: "dinkes", label: "📊 Dinas Kesehatan", count: PANDUAN_STEPS.filter((s) => s.category === "dinkes").length },
  ];

  const filteredSteps =
    selectedCategory === "semua"
      ? PANDUAN_STEPS
      : PANDUAN_STEPS.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER BANNER */}
      <div className="rounded-[32px] border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 font-mono text-xs font-black text-blue-900">
              <span>📖</span>
              <span>BUKU PANDUAN PENGOPERASIAN WEB NUTRITRACK</span>
            </div>
            <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tight text-zinc-950">
              Panduan Praktis Penggunaan Sistem & Alur Kerja Tiap Peran
            </h2>
            <p className="font-sans text-sm text-zinc-600 leading-relaxed">
              Bukan sekadar teks teori — ini adalah panduan konkret <strong>tampilan layar nyata website</strong> yang
              menjelaskan apa yang dilakukan pengguna (klik tombol apa, isi apa) dan apa yang direspons sistem secara otomatis.
            </p>
          </div>

          {/* Quick Credential Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs font-mono text-xs space-y-2 lg:w-80 shrink-0">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hosting Live Railway:</span>
            </p>
            <p className="text-zinc-600 truncate bg-zinc-50 p-1.5 rounded-lg border border-zinc-200 font-mono text-[11px]">
              nutri-frontend-production-cd025f29.up.railway.app
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100">
              <span>Sandi Bawaan Seluruh Akun:</span>
              <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-black">Password123!</strong>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-blue-100/70">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-xl px-3.5 py-1.5 font-sans text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? "bg-zinc-950 text-white shadow-xs scale-105"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  selectedCategory === cat.key ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP CARDS CONTAINER */}
      <div className="space-y-8">
        {filteredSteps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow space-y-6"
          >
            {/* Top Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-zinc-950 text-white px-3 py-1 font-mono text-xs font-black tracking-wide">
                  {step.stepNumber}
                </span>
                <span className={`rounded-lg border px-2.5 py-0.5 font-mono text-[11px] font-black ${step.categoryColor}`}>
                  {step.categoryLabel}
                </span>
              </div>

              {step.targetTab && onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab(step.targetTab!)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#38E8F5]/20 hover:bg-[#38E8F5]/40 text-[#032D30] border border-[#38E8F5]/40 px-3.5 py-1.5 font-sans text-xs font-black transition-all"
                >
                  <span>🚀</span>
                  <span>{step.targetTabLabel || "Buka Fitur Ini"}</span>
                  <span className="text-[10px] font-mono">→</span>
                </button>
              )}
            </div>

            {/* Title & Summary */}
            <div className="space-y-1">
              <h3 className="font-sans text-xl md:text-2xl font-black text-zinc-950">
                {step.title}
              </h3>
              <p className="font-sans text-sm text-zinc-600">
                {step.summary}
              </p>
            </div>

            {/* REAL SCREENSHOT CONTAINER */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 overflow-hidden group">
              <div
                className="relative aspect-[16/9] w-full max-h-[460px] rounded-xl overflow-hidden cursor-zoom-in bg-zinc-100 border border-zinc-200"
                onClick={() => setPreviewImage({ src: step.imageSrc, caption: step.imageCaption })}
                title="Klik untuk memperbesar gambar"
              >
                <Image
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.01]"
                  priority={idx < 2}
                />
                <div className="absolute bottom-2 right-2 rounded-lg bg-zinc-900/75 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 flex items-center gap-1">
                  <span>🔍</span>
                  <span>Klik Perbesar</span>
                </div>
              </div>
              <p className="mt-2 text-center font-mono text-xs text-zinc-500 italic">
                📸 {step.imageCaption}
              </p>
            </div>

            {/* DUAL ACTION BOX: USER VS SYSTEM */}
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              {/* User Action (Blue) */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-950 font-sans font-black text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    👉
                  </span>
                  <h4>Yang Anda Lakukan di Layar:</h4>
                </div>
                <ul className="space-y-2 text-xs text-zinc-700 leading-relaxed font-sans">
                  {step.userActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-blue-600 mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* System Reaction (Green) */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-sans font-black text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                    ⚡
                  </span>
                  <h4>Yang Terjadi di Sistem (Otomatis):</h4>
                </div>
                <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed font-sans">
                  {step.systemReactions.map((reaction, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-emerald-600 mt-0.5">✓</span>
                      <span>{reaction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[95vw] w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-3 shadow-2xl flex flex-col items-center"
            >
              <div className="flex justify-between items-center w-full pb-2 px-2 border-b border-zinc-800 text-white text-xs font-mono">
                <span>{previewImage.caption}</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1 font-bold text-white transition-colors"
                >
                  ✕ Tutup
                </button>
              </div>
              <div className="relative w-full h-[75vh] mt-2">
                <Image
                  src={previewImage.src}
                  alt={previewImage.caption}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
