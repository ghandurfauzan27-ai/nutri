"use client";

import { motion } from "framer-motion";
import { type AuthRole } from "@/lib/auth-data";

interface CaraKerjaProps {
  role: AuthRole;
  onNavigateTab?: (tab: string) => void;
}

export default function CaraKerjaRoleTab({ role, onNavigateTab }: CaraKerjaProps) {
  const roleWorkflows: Record<
    AuthRole,
    {
      title: string;
      subtitle: string;
      roleBadge: string;
      badgeColor: string;
      deskripsi: string;
      tanggungJawabUtama: string[];
      langkahKerja: {
        nomor: number;
        judul: string;
        deskripsi: string;
        tipsKader?: string;
        icon: string;
      }[];
      aturanKunci: string[];
    }
  > = {
    posyandu: {
      title: "Alur & Cara Kerja Akun Posyandu Desa",
      subtitle: "Standar Operasional Penimbangan KMS, Notifikasi Puskesmas & Verifikasi MBG (2 Tab Terpisah)",
      roleBadge: "Garda Terdepan Desa (Posyandu Mawar 01)",
      badgeColor: "#38E8F5",
      deskripsi:
        "Sebagai Akun Resmi Posyandu di tingkat desa, sistem memisahkan tugas Anda secara tegas ke dalam 2 Tab Utama: (1) Tab Penimbangan & KMS Balita untuk pendaftaran balita manual, pengukuran antropometri rutin bulanan, grafik Z-score WHO, serta tombol hapus riwayat & reset data master; dan (2) Tab Verifikasi & Penerimaan MBG untuk menerima batch ransum SPPG (cek suhu ≥60°C & segel wadah) dan checklist serah terima 10 anak (Paket A vs B) serta tombol hapus riwayat serah terima tanpa perlu scan QR code.",
      tanggungJawabUtama: [
        "Memantau 10 Balita Master Binaan di Posyandu (sinkron 1:1 dengan Puskesmas pembina).",
        "Tab Penimbangan & KMS: Input manual penimbangan bulanan (BB, TB, LK) dengan grafik Z-Score WHO real-time.",
        "Menerima Notifikasi Real-Time: Jadwal pertemuan dokter/poli gizi dari Puskesmas pembina untuk anak stunting.",
        "Tab Verifikasi MBG (Tahap 1): Verifikasi fisik kedatangan batch dari SPPG (cek suhu ≥60°C & keutuhan segel wadah).",
        "Tab Verifikasi MBG (Tahap 2): Checklist serah terima ransum harian 10 anak (6 Paket A reguler & 4 Paket B gizi ganda) atau 1-klik konfirmasi semua.",
        "Manajemen Riwayat Mandiri: Tombol Hapus Riwayat Penimbangan, Hapus Riwayat Serah Terima MBG, dan Reset Data Master Balita."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Tab Penimbangan: Pendaftaran Balita & Input Penimbangan Rutin",
          deskripsi:
            "Buka tab 'Penimbangan & KMS Balita'. Pilih balita dari daftar 10 balita binaan (atau klik [+ Daftarkan Balita Baru Manual]). Masukkan BB (kg), TB (cm), dan LK (cm). Kurva Z-Score WHO langsung mendeteksi status gizi (Hijau Normal, Kuning Faltering, Merah Stunting).",
          tipsKader: "Tersedia tombol 'Hapus Riwayat Penimbangan' untuk membersihkan log dan 'Reset Data Master Balita' untuk mengembalikan ke 10 balita standar.",
          icon: "⚖️"
        },
        {
          nomor: 2,
          judul: "Terima Notifikasi Jadwal Dokter dari Puskesmas",
          deskripsi:
            "Jika balita terdeteksi stunting, Puskesmas pembina (misal Puskesmas Socah) menjadwalkan konsultasi dokter. Notifikasi jadwal langsung muncul di bagian atas dasbor dengan nama dokter, tanggal, jam, dan instruksi KIA.",
          tipsKader: "Kader dapat mengeklik 'Tandai Telah Disampaikan' setelah mengabari ibu balita.",
          icon: "🔔"
        },
        {
          nomor: 3,
          judul: "Tab Verifikasi MBG - Tahap 1: Verifikasi Fisik Batch SPPG",
          deskripsi:
            "Pindah ke tab 'Verifikasi & Penerimaan MBG'. Saat armada SPPG tiba, lakukan verifikasi fisik: periksa suhu makanan hangat (wajib ≥60°C), keutuhan segel wadah, dan berita acara. Klik tombol 'Konfirmasi Terima Makanan dari Dapur SPPG'.",
          tipsKader: "Status batch langsung berubah menjadi 'Telah Diterima Posyandu' dan tercatat di SPPG & Puskesmas.",
          icon: "🌡️"
        },
        {
          nomor: 4,
          judul: "Tab Verifikasi MBG - Tahap 2: Checklist Serah Terima per Balita",
          deskripsi:
            "Setelah batch diterima, buka checklist 10 sasaran balita: 6 anak menerima Paket A (Gizi Reguler) dan 4 anak menerima Paket B (Protein Hewani Ganda: Telur Blitar + Lele Lamongan). Cukup centang/klik tombol '✓ Konfirmasi Diterima' per anak atau tombol '✓ Konfirmasi Semua Paket Diterima'.",
          tipsKader: "Bebas dari repot scan QR code; tersedia tombol 'Hapus Riwayat Serah Terima MBG' jika ingin mereset riwayat harian.",
          icon: "🍱"
        }
      ],
      aturanKunci: [
        "Pemisahan tegas: Tab Penimbangan khusus meja timbang & KMS; Tab Verifikasi khusus penerimaan ransum MBG.",
        "Satu akun posyandu membina wilayah dusunnya (sinkron 10 balita master dengan Puskesmas pembina).",
        "Verifikasi kedatangan fisik wajib memastikan suhu hangat ≥60°C dan wadah higienis sebelum dibagikan ke balita.",
        "Bebas scan QR rumit: Serah terima menggunakan sistem checklist digital cepat dengan tombol hapus riwayat mandiri."
      ]
    },
    kader: {
      title: "Alur & Cara Kerja Kader Posyandu Desa",
      subtitle: "Standar Operasional Penimbangan KMS, Notifikasi Puskesmas & Verifikasi MBG (2 Tab Terpisah)",
      roleBadge: "Garda Terdepan Desa (Posyandu Mawar 01)",
      badgeColor: "#38E8F5",
      deskripsi:
        "Sebagai Kader Resmi Posyandu di tingkat desa, sistem memisahkan tugas Anda secara tegas ke dalam 2 Tab Utama: (1) Tab Penimbangan & KMS Balita untuk pendaftaran balita manual, pengukuran antropometri rutin bulanan, grafik Z-score WHO, serta tombol hapus riwayat & reset data master; dan (2) Tab Verifikasi & Penerimaan MBG untuk menerima batch ransum SPPG (cek suhu ≥60°C & segel wadah) dan checklist serah terima 10 anak (Paket A vs B) serta tombol hapus riwayat serah terima tanpa perlu scan QR code.",
      tanggungJawabUtama: [
        "Memantau 10 Balita Master Binaan di Posyandu (sinkron 1:1 dengan Puskesmas pembina).",
        "Tab Penimbangan & KMS: Input manual penimbangan bulanan (BB, TB, LK) dengan grafik Z-Score WHO real-time.",
        "Menerima Notifikasi Real-Time: Jadwal pertemuan dokter/poli gizi dari Puskesmas pembina untuk anak stunting.",
        "Tab Verifikasi MBG (Tahap 1): Verifikasi fisik kedatangan batch dari SPPG (cek suhu ≥60°C & keutuhan segel wadah).",
        "Tab Verifikasi MBG (Tahap 2): Checklist serah terima ransum harian 10 anak (6 Paket A reguler & 4 Paket B gizi ganda) atau 1-klik konfirmasi semua.",
        "Manajemen Riwayat Mandiri: Tombol Hapus Riwayat Penimbangan, Hapus Riwayat Serah Terima MBG, dan Reset Data Master Balita."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Tab Penimbangan: Pendaftaran Balita & Input Penimbangan Rutin",
          deskripsi:
            "Buka tab 'Penimbangan & KMS Balita'. Pilih balita dari daftar 10 balita binaan (atau klik [+ Daftarkan Balita Baru Manual]). Masukkan BB (kg), TB (cm), dan LK (cm). Kurva Z-Score WHO langsung mendeteksi status gizi (Hijau Normal, Kuning Faltering, Merah Stunting).",
          tipsKader: "Tersedia tombol 'Hapus Riwayat Penimbangan' untuk membersihkan log dan 'Reset Data Master Balita' untuk mengembalikan ke 10 balita standar.",
          icon: "⚖️"
        },
        {
          nomor: 2,
          judul: "Terima Notifikasi Jadwal Dokter dari Puskesmas",
          deskripsi:
            "Jika balita terdeteksi stunting, Puskesmas pembina (misal Puskesmas Socah) menjadwalkan konsultasi dokter. Notifikasi jadwal langsung muncul di bagian atas dasbor dengan nama dokter, tanggal, jam, dan instruksi KIA.",
          tipsKader: "Kader dapat mengeklik 'Tandai Telah Disampaikan' setelah mengabari ibu balita.",
          icon: "🔔"
        },
        {
          nomor: 3,
          judul: "Tab Verifikasi MBG - Tahap 1: Verifikasi Fisik Batch SPPG",
          deskripsi:
            "Pindah ke tab 'Verifikasi & Penerimaan MBG'. Saat armada SPPG tiba, lakukan verifikasi fisik: periksa suhu makanan hangat (wajib ≥60°C), keutuhan segel wadah, dan berita acara. Klik tombol 'Konfirmasi Terima Makanan dari Dapur SPPG'.",
          tipsKader: "Status batch langsung berubah menjadi 'Telah Diterima Posyandu' dan tercatat di SPPG & Puskesmas.",
          icon: "🌡️"
        },
        {
          nomor: 4,
          judul: "Tab Verifikasi MBG - Tahap 2: Checklist Serah Terima per Balita",
          deskripsi:
            "Setelah batch diterima, buka checklist 10 sasaran balita: 6 anak menerima Paket A (Gizi Reguler) dan 4 anak menerima Paket B (Protein Hewani Ganda: Telur Blitar + Lele Lamongan). Cukup centang/klik tombol '✓ Konfirmasi Diterima' per anak atau tombol '✓ Konfirmasi Semua Paket Diterima'.",
          tipsKader: "Bebas dari repot scan QR code; tersedia tombol 'Hapus Riwayat Serah Terima MBG' jika ingin mereset riwayat harian.",
          icon: "🍱"
        }
      ],
      aturanKunci: [
        "Pemisahan tegas: Tab Penimbangan khusus meja timbang & KMS; Tab Verifikasi khusus penerimaan ransum MBG.",
        "Satu akun posyandu membina wilayah dusunnya (sinkron 10 balita master dengan Puskesmas pembina).",
        "Verifikasi kedatangan fisik wajib memastikan suhu hangat ≥60°C dan wadah higienis sebelum dibagikan ke balita.",
        "Bebas scan QR rumit: Serah terima menggunakan sistem checklist digital cepat dengan tombol hapus riwayat mandiri."
      ]
    },
    puskesmas: {
      title: "Alur & Cara Kerja Petugas Gizi & Dokter Puskesmas",
      subtitle: "Pengawasan Posyandu Binaan, Pemesanan Ransum MBG & Jadwal Intervensi Stunting",
      roleBadge: "Tenaga Kesehatan Pembina Wilayah",
      badgeColor: "#10B981",
      deskripsi:
        "Sebagai Puskesmas Pembina (seperti Puskesmas Socah), Anda mengawasi posyandu binaan di wilayah kerja Anda (seperti Posyandu Mawar 01 Bilaporah), memantau data 10 balita binaan yang tersinkronisasi, menerbitkan pesanan resmi kuota MBG (6 Paket A + 4 Paket B), dan menjadwalkan pertemuan klinis dokter gizi dengan notifikasi otomatis ke akun posyandu.",
      tanggungJawabUtama: [
        "Memantau data 10 balita wilayah binaan secara sinkron (nama, NIK, status gizi Z-score, dan tren pertumbuhan).",
        "Menerbitkan Pesanan Resmi Ransum MBG (PO) ke Dapur SPPG: 10 porsi presisi (6 Paket A reguler + 4 Paket B stunting).",
        "Menjadwalkan pertemuan intervensi klinis dokter gizi/KIA untuk balita yang terdeteksi stunting akut.",
        "Notifikasi jadwal dokter otomatis terkirim langsung ke dasbor Posyandu binaan secara real-time.",
        "Manajemen data bersih: Tombol Hapus Riwayat Pesanan MBG dan Tombol Hapus Riwayat Jadwal Dokter."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "1. Masuk via Akun Puskesmas Wilayah Terdaftar",
          deskripsi:
            "Pilih nama Puskesmas Anda (misal Puskesmas Socah - Bangkalan). Sistem langsung menampilkan wilayah desa dan posyandu binaan (Posyandu Mawar 01 Bilaporah).",
          icon: "🏥"
        },
        {
          nomor: 2,
          judul: "2. Pantau Status 10 Balita & Deteksi Stunting",
          deskripsi:
            "Periksa daftar 10 balita binaan. Data berat badan, kurva KMS, dan status gizi langsung sinkron dengan hasil penimbangan kader di meja posyandu.",
          icon: "📊"
        },
        {
          nomor: 3,
          judul: "3. Terbitkan Pesanan Ransum MBG (PO) ke SPPG",
          deskripsi:
            "Klik tombol order ransum ke Dapur SPPG rekanan: sistem mengalokasikan kuota 10 porsi (6 Paket A sehat + 4 Paket B dobel protein). Status PO langsung masuk ke antrean akun SPPG terkait.",
          icon: "📝"
        },
        {
          nomor: 4,
          judul: "4. Jadwalkan Konsultasi Dokter untuk Balita Stunting",
          deskripsi:
            "Klik 'Buat Jadwal Intervensi' pada balita garis merah. Tentukan tanggal, jam, nama dokter pemeriksa, dan instruksi klinis. Notifikasi jadwal langsung muncul di dasbor Posyandu sasaran.",
          tipsKader: "Tersedia tombol 'Hapus Riwayat Jadwal' & 'Hapus Riwayat Pesanan' jika ingin mereset catatan.",
          icon: "📅"
        }
      ],
      aturanKunci: [
        "Data balita di Puskesmas sinkron 1:1 dengan data di Posyandu binaan (maksimal 10 balita master).",
        "Pemesanan MBG terintegrasi langsung dengan alur verifikasi 4 tahap di akun SPPG mitra.",
        "Setiap jadwal intervensi dokter otomatis terhubung sebagai notifikasi real-time ke posyandu terkait.",
        "Tersedia tombol hapus riwayat untuk pembersihan data berkala secara mandiri."
      ]
    },
    dapur: {
      title: "Alur & Cara Kerja Akun Dapur MBG (SPPG)",
      subtitle: "Verifikasi 4 Tahap Pesanan: Diterima → Diproses → Diantar → Selesai",
      roleBadge: "Juru Masak & Logistik SPPG (20 Akun Resmi Jatim)",
      badgeColor: "#7866FF",
      deskripsi:
        "Akun SPPG terdaftar secara resmi di 20 titik sentra gizi Jawa Timur (seperti SPPG Dapur Sehat Socah Mandiri, SPPG Brantas Nutrisi Pesantren, dll). Tugas SPPG fokus memverifikasi setiap pesanan masuk melalui 4 tahapan alur resmi: (1) Diterima, (2) Diproses, (3) Diantar, dan (4) Selesai, lengkap dengan Panduan Isi Wadah resep lokal dan tombol reset riwayat verifikasi.",
      tanggungJawabUtama: [
        "Memeriksa pesanan masuk harian (10 porsi: 6 Paket A Reguler + 4 Paket B Dobel Protein Hewani) khusus untuk posyandu sasaran binaan.",
        "Memverifikasi alur 4 tahap pesanan secara disiplin: 1. Diterima → 2. Diproses → 3. Diantar → 4. Selesai.",
        "Melihat Panduan Isi Wadah: Memastikan isian kompartemen ransum sesuai gramasi baku Kemenkes & resep lokal Jatim.",
        "Memastikan standar keamanan pangan: Wadah tersegel higienis dan suhu makanan tetap hangat (≥60°C) saat armada tiba di balai posyandu.",
        "Mereset Riwayat Verifikasi: Tombol Hapus Riwayat Verifikasi untuk memulai siklus pesanan baru yang bersih."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "1. Verifikasi Terima Pesanan (Diterima)",
          deskripsi:
            "Periksa kartu pesanan masuk dari Puskesmas pembina. Periksa alokasi 10 porsi (6 Paket A dan 4 Paket B). Klik tombol '[✓ Terima Pesanan Ini]'. Status pesanan langsung berubah menjadi 'Diterima' dan tercatat di sistem.",
          tipsKader: "SPPG hanya melayani pesanan di wilayah kerja binaannya (terkunci per akun resmi).",
          icon: "📥"
        },
        {
          nomor: 2,
          judul: "2. Memasak & Packing Isi Wadah (Diproses)",
          deskripsi:
            "Klik tombol '[🍳 Mulai Proses Masak & Packing]'. Juru masak mengolah bahan lokal berkualitas. Buka modal 'Panduan Isi Wadah' untuk mengecek rincian: Paket A (Nasi, Lele/Ayam, Sayur Sop, Buah) vs Paket B (Nasi, Dobel Protein: Telur Blitar + Lele Lamongan/Hati Ayam, Sayur, Buah).",
          tipsKader: "Semua wadah dipacking rapi dan disegel higienis tanpa menggunakan label QR code.",
          icon: "🍳"
        },
        {
          nomor: 3,
          judul: "3. Pengantaran Armada Logistik (Diantar)",
          deskripsi:
            "Setelah wadah bersegel siap dalam thermal box tertutup, armada logistik diberangkatkan menuju balai posyandu. Klik tombol '[🚚 Berangkatkan Armada (Diantar)]'.",
          tipsKader: "Posyandu penerima akan melihat status pesanan telah 'Diantar' dan bersiap di meja penerimaan.",
          icon: "🚚"
        },
        {
          nomor: 4,
          judul: "4. Konfirmasi Serah Terima Tuntas (Selesai)",
          deskripsi:
            "Ketika armada tiba di posyandu dan makanan diserahkan kepada kader dalam kondisi hangat (≥60°C), klik tombol '[🏁 Selesaikan Serah Terima (Selesai)]'.",
          tipsKader: "Serah terima tuntas dan tercatat otomatis. Gunakan tombol 'Hapus / Reset Riwayat' jika ingin mengulang siklus simulasi.",
          icon: "🏁"
        }
      ],
      aturanKunci: [
        "Fokus tugas akun SPPG adalah memverifikasi 4 tahapan alur pesanan: Diterima → Diproses → Diantar → Selesai.",
        "Paket B wajib mengandung dobel protein hewani lokal Jawa Timur untuk percepatan pemulihan stunting.",
        "Wadah higienis bersegel dengan suhu terjaga hangat minimal ≥60°C tanpa scan QR yang merepotkan.",
        "Tersedia tombol hapus riwayat verifikasi untuk tata kelola data operasional mandiri."
      ]
    },
    dinkes: {
      title: "Alur & Cara Kerja Pimpinan Dinkes Provinsi Jawa Timur",
      subtitle: "Monitoring Geospasial Makro 38 Kab/Kota & Evaluasi Kebijakan Stunting Jatim",
      roleBadge: "Pengambil Kebijakan Provinsi",
      badgeColor: "#EF4444",
      deskripsi:
        "Sebagai Pengambil Kebijakan di Dinas Kesehatan Provinsi Jawa Timur, Anda memiliki akses pemantauan tingkat makro untuk melihat peta sebaran stunting di 38 Kabupaten/Kota tanpa mengubah data mikro teknis.",
      tanggungJawabUtama: [
        "Memantau Peta Sebaran dan Heatmap Stunting di 38 Kabupaten/Kota se-Jawa Timur.",
        "Mengidentifikasi kantong-kantong prioritas intervensi (Madura, Tapal Kuda, Mataraman).",
        "Memantau kebutuhan alokasi porsi Paket B protein hewani ganda per wilayah.",
        "Mengevaluasi tren keberhasilan program NutriTrack Jatim dalam menurunkan angka stunting."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Buka Peta Interaktif Sebaran 38 Kab/Kota",
          deskripsi:
            "Amati warna indikator per kabupaten: Hijau (<10%), Kuning (10-20%), dan Merah (>20%) untuk melihat wilayah prioritas penanganan.",
          icon: "🗺️"
        },
        {
          nomor: 2,
          judul: "Analisis Kebutuhan Paket B per Daerah",
          deskripsi:
            "Periksa kebutuhan logistik Paket B yang dikirimkan oleh dapur-dapur SPPG di tiap kabupaten berdasarkan hasil penimbangan posyandu.",
          icon: "📊"
        },
        {
          nomor: 3,
          judul: "Evaluasi Kebijakan & Alokasi Bantuan Pangan",
          deskripsi:
            "Gunakan data makro untuk mengarahkan bantuan pangan lokal dan koordinasi lintas sektor bersama Gubernur, Bappeda, dan Dinkes Kabupaten/Kota.",
          icon: "📑"
        }
      ],
      aturanKunci: [
        "Akun Dinkes Jatim hanya bersifat pemantauan makro (read-only monitoring).",
        "Data disajikan transparan mencakup seluruh 38 Kabupaten/Kota di Jawa Timur."
      ]
    }
  };

  const currentWf = roleWorkflows[role] || roleWorkflows.posyandu;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/90 bg-gradient-to-br from-white via-zinc-50/60 to-purple-50/30 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: currentWf.badgeColor }}
              />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-zinc-600">
                {currentWf.roleBadge}
              </span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {currentWf.title}
            </h2>
            <p className="font-sans text-sm text-zinc-600 leading-relaxed">
              {currentWf.deskripsi}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {(role === "posyandu" || role === "kader") && onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab("kms")}
                  className="rounded-2xl border-2 border-[#18140B] bg-[#18140B] px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  1. Meja Penimbangan & KMS →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("konsumsi")}
                  className="rounded-2xl border-2 border-cyan-700 bg-cyan-600 px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  2. Verifikasi Penerimaan MBG →
                </button>
              </>
            )}
            {role === "puskesmas" && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("puskesmas")}
                className="rounded-2xl border-2 border-[#10B981] bg-[#10B981] px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Buka Wilayah Binaan Puskesmas →
              </button>
            )}
            {role === "dapur" && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("dapur")}
                className="rounded-2xl border-2 border-[#7866FF] bg-[#7866FF] px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Buka Verifikasi Pesanan SPPG →
              </button>
            )}
            {role === "dinkes" && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("analitik")}
                className="rounded-2xl border-2 border-[#EF4444] bg-[#EF4444] px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Buka Peta 38 Kab/Kota Jatim →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tanggung Jawab Utama */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-sm">
        <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 mb-4 flex items-center gap-2">
          <span>🎯</span>
          <span>Tugas Pokok & Tanggung Jawab Utama</span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {currentWf.tanggungJawabUtama.map((tj, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-mono text-xs font-bold text-white">
                {idx + 1}
              </span>
              <p className="font-sans text-xs font-medium text-zinc-800 leading-relaxed">
                {tj}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Langkah Kerja Step-by-Step */}
      <div className="space-y-4">
        <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
          <span>📋</span>
          <span>Langkah Kerja Operasional Harian</span>
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {currentWf.langkahKerja.map((step) => (
            <motion.div
              key={step.nomor}
              whileHover={{ y: -3 }}
              className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-[10px] font-black text-zinc-600">
                    LANGKAH #{step.nomor}
                  </span>
                </div>
                <h4 className="font-sans text-base font-black text-zinc-950 tracking-tight mb-2">
                  {step.judul}
                </h4>
                <p className="font-sans text-xs text-zinc-600 leading-relaxed">
                  {step.deskripsi}
                </p>
              </div>

              {step.tipsKader && (
                <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3">
                  <p className="font-sans text-[11px] font-bold text-amber-900">
                    💡 Tips: <span className="font-medium text-amber-800">{step.tipsKader}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Aturan Kunci */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-sm">
        <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 mb-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>Prinsip & Aturan Kunci Sistem</span>
        </h3>
        <ul className="space-y-2">
          {currentWf.aturanKunci.map((rule, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2.5 font-sans text-xs font-semibold text-zinc-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
