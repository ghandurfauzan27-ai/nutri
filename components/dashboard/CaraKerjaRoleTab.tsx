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
      subtitle: "Standar Operasional Pencatatan Balita, Notifikasi Puskesmas & Konfirmasi MBG",
      roleBadge: "Garda Terdepan Desa",
      badgeColor: "#38E8F5",
      deskripsi:
        "Sebagai Akun Resmi Posyandu di tingkat desa, Anda bertugas mendata balita secara mandiri, mencatat penimbangan rutin, menerima jadwal pertemuan dokter dari Puskesmas pembina, dan mengonfirmasi penerimaan paket MBG harian anak.",
      tanggungJawabUtama: [
        "Mendaftarkan balita baru secara manual lewat ketikan form (cukup 1x di awal).",
        "Menimbang berat badan (BB) dan mengukur tinggi badan (TB/PB) setiap jadwal posyandu.",
        "Melihat visual kurva pertumbuhan Z-score WHO resmi Dinkes Jatim (Hijau, Kuning, Merah).",
        "Menerima notifikasi otomatis jadwal pertemuan dokter dari Puskesmas untuk balita stunting.",
        "Konfirmasi penerimaan paket Makan Bergizi Gratis (MBG) harian per anak melalui tabel checklist sederhana."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Pendaftaran Balita Baru (Input Manual Form)",
          deskripsi:
            "Klik tombol '[+ Daftarkan Balita Baru Manual]'. Masukkan Nama, NIK 16 digit, Tanggal Lahir, Nama Ibu, BB, dan TB. Data tersimpan permanen di Posyandu Anda dan otomatis terbaca oleh Puskesmas pembina.",
          tipsKader: "Cukup daftarkan 1 kali saja. Pada bulan berikutnya, nama anak langsung ada di dropdown pilihan.",
          icon: "📝"
        },
        {
          nomor: 2,
          judul: "Penimbangan Rutin Bulanan",
          deskripsi:
            "Pilih nama anak dari daftar 'PILIH BALITA TERDAFTAR'. Masukkan BB (kg) dan TB (cm) terbaru untuk melihat pergerakan kurva KMS.",
          tipsKader: "Pastikan timbangan diletakkan di permukaan rata agar akurasi gramasi presisi.",
          icon: "⚖️"
        },
        {
          nomor: 3,
          judul: "Terima Notifikasi Jadwal Dokter Puskesmas",
          deskripsi:
            "Jika anak terdeteksi stunting, Puskesmas pembina akan menjadwalkan jadwal intervensi poli gizi/dokter. Notifikasi jadwal langsung muncul di bagian atas halaman Posyandu dengan rincian tanggal, jam, dokter, dan catatan.",
          tipsKader: "Kader dapat mengonfirmasi 'Tandai Telah Disampaikan' setelah memberi tahu ibu balita.",
          icon: "🔔"
        },
        {
          nomor: 4,
          judul: "Konfirmasi Penerimaan Paket Gizi Harian (Checklist Cepat)",
          deskripsi:
            "Buka tab 'Konfirmasi MBG'. Dapur SPPG telah mengirimkan Paket A (Reguler) atau Paket B (Protein Hewani Ganda). Cukup klik tombol '✓ Konfirmasi Diterima' per anak tanpa perlu scan kamera yang merepotkan.",
          tipsKader: "Bisa juga menggunakan tombol 'Konfirmasi Semua Paket Diterima' jika seluruh anak hadir di balai.",
          icon: "🍱"
        }
      ],
      aturanKunci: [
        "Satu Posyandu memiliki satu akun resmi yang terdaftar di bawah naungan Puskesmas kecamatan setempat.",
        "Posyandu hanya mengakses dan mengelola balita di wilayah posyandunya sendiri.",
        "Tidak menggunakan kamera/scan barcode; konfirmasi MBG menggunakan sistem checklist harian digital."
      ]
    },
    puskesmas: {
      title: "Alur & Cara Kerja Petugas Gizi & Dokter Puskesmas",
      subtitle: "Pengawasan Posyandu Binaan, Penjadwalan Intervensi Stunting, & Koordinasi Faskes",
      roleBadge: "Tenaga Kesehatan Pembina",
      badgeColor: "#10B981",
      deskripsi:
        "Sebagai Puskesmas Pembina di tingkat kecamatan, Anda mengawasi seluruh posyandu dan desa di wilayah kerja Anda, memantau balita yang terdeteksi stunting, dan membuat jadwal pertemuan intervensi medis yang terhubung langsung ke akun posyandu.",
      tanggungJawabUtama: [
        "Memantau persentase balita sehat dan kasus stunting di setiap desa binaan.",
        "Melihat rincian anak stunting (nama, NIK, usia, nilai Z-score, dan jenis paket MBG).",
        "Menjadwalkan pertemuan intervensi klinis dokter/poli gizi untuk balita stunting.",
        "Sistem langsung mengirimkan notifikasi jadwal otomatis ke akun Posyandu terkait.",
        "Memverifikasi akun pendaftaran Posyandu baru di wilayah kerja kecamatan."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Masuk Melalui Akun Puskesmas Wilayah Sendiri",
          deskripsi:
            "Semua akun Puskesmas se-Jawa Timur telah terdaftar di sistem. Pilih nama Puskesmas Anda pada halaman login untuk langsung masuk ke dasbor wilayah kerja.",
          icon: "🏥"
        },
        {
          nomor: 2,
          judul: "Pantau Rincian Desa & Posyandu Binaan",
          deskripsi:
            "Klik pada kartu desa binaan untuk melihat persentase stunting, nama anak yang terdampak, serta status intervensi Paket B (Protein Hewani Ganda).",
          icon: "📊"
        },
        {
          nomor: 3,
          judul: "Buat Jadwal Intervensi Dokter untuk Anak Stunting",
          deskripsi:
            "Klik tombol 'Buat Jadwal Intervensi' pada baris balita stunting. Tentukan tanggal, jam, dokter pemeriksa, lokasi poli gizi, dan instruksi KIA.",
          icon: "📅"
        },
        {
          nomor: 4,
          judul: "Notifikasi Otomatis Terkirim ke Posyandu",
          deskripsi:
            "Saat jadwal disimpan, notifikasi langsung terkirim secara otomatis ke akun Posyandu tempat anak tersebut terdaftar tanpa perlu konfirmasi manual terpisah.",
          icon: "📨"
        }
      ],
      aturanKunci: [
        "Setiap Puskesmas hanya dapat melihat data desa dan posyandu di bawah wilayah kecamatannya sendiri.",
        "Akun Puskesmas tidak dapat saling mengintip data Puskesmas atau kecamatan lain.",
        "Jadwal pertemuan klinis yang dibuat tersinkronisasi langsung dengan dasbor Posyandu."
      ]
    },
    dapur: {
      title: "Alur & Cara Kerja Pengelola Dapur MBG (SPPG)",
      subtitle: "Pembagian Wilayah Layanan Dapur, Penyiapan Menu Presisi, & Pantau Penerimaan",
      roleBadge: "Juru Masak & Logistik MBG",
      badgeColor: "#7866FF",
      deskripsi:
        "Sebagai Pengelola Dapur Mandiri SPPG, Anda bertugas mengolah pangan bergizi untuk wilayah posyandu sasaran yang telah ditentukan agar tidak terjadi tumpang tindih antar dapur, menyiapkan Paket A & Paket B, serta memantau checklist konfirmasi penerimaan.",
      tanggungJawabUtama: [
        "Melayani wilayah posyandu sasaran sesuai pembagian zona kerja kecamatan agar tidak tabrakan.",
        "Menyiapkan kuota Paket A (Reguler Sehat) dan Paket B (Protein Hewani Ganda Telur Blitar & Lele Lamongan).",
        "Menggunakan kalkulator gramasi bahan baku lokal Jawa Timur.",
        "Memantau status konfirmasi penerimaan paket oleh Posyandu secara real-time."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Periksa Wilayah Layanan & Posyandu Sasaran",
          deskripsi:
            "Dasbor Dapur menampilkan posyandu mana saja yang menjadi tanggung jawab Anda, sehingga antar dapur SPPG di kecamatan memiliki zona kerja yang tegas.",
          icon: "🗺️"
        },
        {
          nomor: 2,
          judul: "Kalkulasi Kebutuhan Bahan Baku Harian",
          deskripsi:
            "Sistem mengonversi jumlah porsi menjadi kebutuhan riil: kg telur Blitar, kg lele Lamongan, hati ayam, dan daun kelor organik dari mitra lokal.",
          icon: "🛒"
        },
        {
          nomor: 3,
          judul: "Produksi Paket A & Paket B",
          deskripsi:
            "Masak paket gizi sesuai standar formulasi: Paket A untuk balita umum dan Paket B berprotein hewani ganda untuk balita faltering/stunting.",
          icon: "🍳"
        },
        {
          nomor: 4,
          judul: "Pantau Konfirmasi Penerimaan dari Posyandu",
          deskripsi:
            "Setelah paket didistribusikan ke balai posyandu, pantau status konfirmasi penerimaan yang dicentang oleh kader posyandu secara langsung.",
          icon: "✅"
        }
      ],
      aturanKunci: [
        "Dapur SPPG memiliki pembagian wilayah posyandu sasaran yang pasti agar tidak berebut atau tabrakan.",
        "Paket B diformulasikan khusus dengan protein hewani ganda lokal Jawa Timur.",
        "Status distribusi terkonfirmasi langsung saat kader posyandu mencentang penerimaan paket."
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
            {role === "posyandu" && onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("kms")}
                className="rounded-2xl border-2 border-[#18140B] bg-[#18140B] px-5 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Mulai Catat Balita Posyandu →
              </button>
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
                Buka Manajemen Dapur MBG →
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
