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
    kader: {
      title: "Alur & Cara Kerja Kader Posyandu Desa",
      subtitle: "Standar Operasional Pencatatan Antropometri, Deteksi Dini, & Verifikasi MBG",
      roleBadge: "Garda Terdepan Posyandu",
      badgeColor: "#38E8F5",
      deskripsi:
        "Sebagai Kader Posyandu, Anda bertugas mendeteksi dini risiko stunting dan kelemahan kenaikan berat badan (growth faltering) pada balita di tingkat dusun/balai RW, serta memverifikasi paket Makan Bergizi Gratis (MBG) yang tiba.",
      tanggungJawabUtama: [
        "Mendaftarkan balita baru yang berdomisili di wilayah posyandu (cukup 1x di awal).",
        "Menimbang berat badan (BB) dan mengukur tinggi/panjang badan (TB/PB) setiap bulan.",
        "Melihat visual kurva KMS digital resmi Dinkes Jatim (Hijau, Kuning, atau Merah).",
        "Memverifikasi penerimaan paket makanan MBG dengan memindai kode QR.",
        "Mencatat survei daya terima makanan (Habis, Tersisa Sebagian, atau Ditolak)."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Pendaftaran Balita Baru (Input Manual)",
          deskripsi:
            "Jika ada balita baru lahir atau baru pindah ke desa, klik tombol '[+ Daftarkan Balita Baru]'. Masukkan Nama, NIK 16 digit, Tanggal Lahir, Nama Ibu, dan hasil timbangan pertama. Data akan tersimpan permanen di Posyandu Anda.",
          tipsKader: "Cukup daftarkan 1 kali saja di awal. Bulan depan nama anak sudah ada di dropdown.",
          icon: "📝"
        },
        {
          nomor: 2,
          judul: "Penimbangan Rutin Bulanan",
          deskripsi:
            "Setiap hari buka Posyandu, pilih nama balita dari dropdown 'PILIH BALITA TERDAFTAR'. Masukkan Berat Badan (kg) dan Panjang/Tinggi Badan (cm) saat ini.",
          tipsKader: "Pastikan timbangan bayi diletakkan di permukaan rata dan anak memakai pakaian seringan mungkin.",
          icon: "⚖️"
        },
        {
          nomor: 3,
          judul: "Cek Warna Kurva KMS & Sinyal Faltering",
          deskripsi:
            "Sistem otomatis menghitung Z-score WHO. Perhatikan warna kurva: Hijau = Normal (Paket A Reguler), Kuning = Waspada / Growth Faltering (Otomatis dapat Paket B Protein Ganda), Merah = BGM / Stunting Berat.",
          tipsKader: "Jika berat badan tidak naik 2 bulan berurutan, sistem akan membunyikan alarm peringatan kuning/merah.",
          icon: "📈"
        },
        {
          nomor: 4,
          judul: "Otomasi Pesanan ke Dapur MBG (SPPG)",
          deskripsi:
            "Anda tidak perlu menelepon juru masak dapur. Hasil timbangan Anda otomatis masuk ke dasbor Dapur SPPG kecamatan untuk menentukan apakah anak dimasakan Paket A atau Paket B (Telur Blitar & Lele Lamongan).",
          tipsKader: "Data timbangan sebelum jam 09.00 WIB langsung masuk ke kuota masak hari yang sama.",
          icon: "🍲"
        },
        {
          nomor: 5,
          judul: "Scan Verifikasi Paket MBG & Catat Daya Terima",
          deskripsi:
            "Saat kotak makanan tiba di Posyandu atau rumah balita, buka tab 'Scan & Konsumsi', arahkan kamera ke kode QR di kotak makan, lalu pilih status daya terima: Habis (100%), Sebagian (50%), atau Tidak Termakan (0%).",
          tipsKader: "Laporan daya terima ini penting untuk mengevaluasi apakah balita menyukai rasa masakan dapur.",
          icon: "📱"
        }
      ],
      aturanKunci: [
        "Akun kader baru wajib mendapatkan persetujuan/verifikasi dari Tenaga Gizi Puskesmas Pembina sebelum aktif.",
        "Kader hanya memiliki hak akses input timbangan & verifikasi di wilayah posyandunya sendiri.",
        "Aplikasi mendukung mode offline di balai desa tanpa sinyal internet (tersimpan otomatis dan sinkron saat ada sinyal)."
      ]
    },
    dapur: {
      title: "Alur & Cara Kerja Pengelola Dapur MBG (SPPG)",
      subtitle: "Standar Operasional Penyiapan Menu Presisi & Rantai Pasok Peternak Lokal Jatim",
      roleBadge: "Juru Masak & Logistik MBG",
      badgeColor: "#7866FF",
      deskripsi:
        "Sebagai Pengelola Dapur Mandiri SPPG, tugas Anda adalah mengonversi data timbangan posyandu menjadi porsi menu presisi, belanja bahan baku langsung ke peternak/petani lokal Jawa Timur, memasak higienis, dan menempelkan label QR pelacakan.",
      tanggungJawabUtama: [
        "Melihat rekapitulasi kuota harian: Berapa porsi Paket A (Reguler) dan Paket B (Intervensi Gizi Tinggi).",
        "Menggunakan Kalkulator Belanja Bahan Lokal untuk menyerap telur Blitar, lele Lamongan, hati ayam, dan kelor.",
        "Memasak sesuai formulasi resep komoditas lokal Jawa Timur dan tekstur usia anak.",
        "Mencetak dan menempelkan stiker QR Code unik pada setiap wadah makanan anak."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Buka Dasbor Kuota Masak Pagi Hari",
          deskripsi:
            "Setiap pagi jam 06.00 WIB, buka Dasbor Dapur SPPG. Sistem menampilkan total porsi yang harus dimasak hari ini, terbagi antara Paket A (Reguler) dan Paket B (Intervensi Balita Faltering/Stunting).",
          icon: "📊"
        },
        {
          nomor: 2,
          judul: "Cek Kalkulator Belanja Peternak Lokal",
          deskripsi:
            "Sistem otomatis menghitung gramasi bahan baku dalam kilogram (misal: 15 kg telur Blitar, 8 kg lele Lamongan). Pasokan diserap langsung dari mitra Koperasi Peternak Blitar Jaya & Gapoktan Mina Makmur Lamongan.",
          icon: "🛒"
        },
        {
          nomor: 3,
          judul: "Proses Memasak Sesuai Resep Jatim",
          deskripsi:
            "Masak menu intervensi sesuai standar gizi: porsi dobel telur ayam ras Blitar kukus lembut, kaldu lele asap Lamongan, hati ayam kampung penambah zat besi heme, dan puree daun kelor organik.",
          icon: "🍳"
        },
        {
          nomor: 4,
          judul: "Cetak Label QR Kotak Makan & Distribusi",
          deskripsi:
            "Klik 'Cetak Semua Label QR Kotak Makan'. Tempelkan stiker pada tutup wadah makan anak sebelum diantar kurir ke Posyandu sasaran.",
          icon: "🏷️"
        }
      ],
      aturanKunci: [
        "100% bahan baku hewani dan nabati diserap dari produsen lokal Jawa Timur.",
        "Menu Paket B tidak boleh disamakan dengan Paket A karena balita faltering membutuhkan booster protein hewani ganda.",
        "Wadah makan harus bersegel higienis dengan QR Code terpasang rapi."
      ]
    },
    puskesmas: {
      title: "Alur & Cara Kerja Petugas Gizi / Dokter Puskesmas",
      subtitle: "Validasi Akun Kader, Penanganan Rujukan Medis, & Evaluasi Wilayah Kerja",
      roleBadge: "Tenaga Kesehatan Pembina",
      badgeColor: "#10B981",
      deskripsi:
        "Sebagai Petugas Gizi Puskesmas Pembina di tingkat kecamatan, Anda memegang kendali verifikasi akun kader baru posyandu, memvalidasi rujukan balita yang masuk ke Zona Merah (BGM), dan memberikan terapi gizi lanjutan.",
      tanggungJawabUtama: [
        "Memverifikasi dan menyetujui pendaftaran akun Kader Posyandu baru di desa binaan.",
        "Menerima notifikasi rujukan otomatis balita Zona Merah (BGM) atau stunting berat.",
        "Mengeluarkan resep terapi gizi lanjutan (F-75/F-100/PKMK) jika diperlukan.",
        "Mengevaluasi tren pertumbuhan balita per desa di wilayah kerja kecamatan."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Verifikasi Pendaftaran Akun Kader Baru",
          deskripsi:
            "Buka tab 'Verifikasi Kader Baru'. Periksa identitas pendaftar, asal desa, dan posyandu. Klik tombol '[✓ Setujui Akun Kader]' untuk mengaktifkan akses mereka mencatat data balita.",
          icon: "🛡️"
        },
        {
          nomor: 2,
          judul: "Pantau Notifikasi Rujukan Balita Zona Merah",
          deskripsi:
            "Jika ada kader yang menginput balita dengan Z-score TB/U < -2 SD atau faltering parah, sistem langsung menampilkannya di daftar rujukan prioritas Puskesmas.",
          icon: "🚨"
        },
        {
          nomor: 3,
          judul: "Pemeriksaan Medis & Konseling Klinis",
          deskripsi:
            "Jadwalkan balita untuk pemeriksaan fisik dokter di Puskesmas, evaluasi penyakit penyerta (seperti TBC anak atau diare kronis), dan dampingi intervensi MBG dengan suplemen mikro.",
          icon: "🩺"
        }
      ],
      aturanKunci: [
        "Kader posyandu baru tidak bisa login sampai disetujui oleh akun Puskesmas kecamatan.",
        "Balita zona merah wajib dievaluasi dalam waktu maksimal 7 hari kerja sejak terdeteksi."
      ]
    },
    dinkes: {
      title: "Alur & Cara Kerja Pimpinan Dinkes & TPID Provinsi Jawa Timur",
      subtitle: "Monitoring Geospasial, Evaluasi RoN (Return on Nutrition), & Audit Akuntabilitas",
      roleBadge: "Pengambil Kebijakan Daerah",
      badgeColor: "#EF4444",
      deskripsi:
        "Sebagai Pengambil Kebijakan di Dinas Kesehatan dan Tim Pengendalian Stunting Provinsi Jawa Timur, Anda memantau prevalensi di kantong prioritas (Madura, Tapal Kuda), mengaudit serapan pangan lokal, dan mengevaluasi efektivitas intervensi MBG.",
      tanggungJawabUtama: [
        "Memantau Heatmap Geospasial sebaran stunting di kabupaten/kota Jawa Timur.",
        "Mengevaluasi grafik Return on Nutrition (RoN) Tracker pada siklus 30, 60, dan 90 hari.",
        "Mengaudit dampak ekonomi belanja MBG terhadap perputaran uang di peternak Jatim.",
        "Mengunduh laporan rekapitulasi berkala format PDF dan Excel untuk Bappeda dan BPKP."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Analisis Heatmap Kantong Stunting Prioritas",
          deskripsi:
            "Pantau titik merah di Kab. Bangkalan, Sampang, Jember, Bondowoso, dan Probolinggo untuk memastikan dapur SPPG aktif mengintervensi balita faltering.",
          icon: "🗺️"
        },
        {
          nomor: 2,
          judul: "Audit Return on Nutrition (RoN)",
          deskripsi:
            "Buktikan efektivitas anggaran program MBG melalui data riil kenaikan Z-score (+0.6 SD dalam 60 hari) dan tingkat pemulihan anak keluar dari zona waspada.",
          icon: "📊"
        },
        {
          nomor: 3,
          judul: "Ekspor Laporan Pertanggungjawaban",
          deskripsi:
            "Unduh laporan audit resmi untuk rapat koordinasi lintas sektoral bersama Gubernur, Bappeda, dan Kementerian Kesehatan.",
          icon: "📑"
        }
      ],
      aturanKunci: [
        "Data bersifat agregat dan terenkripsi untuk melindungi privasi data pribadi keluarga balita.",
        "Evaluasi dilakukan berkala setiap siklus 30 hari penimbangan serentak."
      ]
    },
    orangtua: {
      title: "Alur & Panduan untuk Keluarga Sasaran Balita",
      subtitle: "Pemantauan Pertumbuhan Anak & Konfirmasi Penerimaan Paket Makan Bergizi",
      roleBadge: "Keluarga Sasaran",
      badgeColor: "#38E8F5",
      deskripsi:
        "Sebagai orang tua atau keluarga balita, Anda dapat melihat riwayat tumbuh kembang anak, mengetahui menu makanan bergizi yang diterima, serta memberikan masukan rasa masakan.",
      tanggungJawabUtama: [
        "Membawa balita ke Posyandu setiap bulan untuk penimbangan berat dan tinggi badan.",
        "Menerima paket makanan bergizi gratis dari Dapur SPPG sesuai anjuran kader.",
        "Memastikan makanan dihabiskan oleh anak dan mencatat status konsumsinya."
      ],
      langkahKerja: [
        {
          nomor: 1,
          judul: "Kunjungi Posyandu Setiap Bulan",
          deskripsi: "Bawa anak ke Posyandu untuk ditimbang dan dicatat kurva pertumbuhannya oleh kader.",
          icon: "📅"
        },
        {
          nomor: 2,
          judul: "Terima & Cek Paket Makanan MBG",
          deskripsi: "Pastikan makanan masih hangat dan higienis dengan stiker QR Code resmi NutriTrack.",
          icon: "🍱"
        },
        {
          nomor: 3,
          judul: "Beri Asupan Bergizi & Konfirmasi",
          deskripsi: "Suapi anak dengan sabar dan sampaikan masukan jika anak menyukai atau ada sisa makanan.",
          icon: "❤️"
        }
      ],
      aturanKunci: [
        "Makanan MBG Paket B dikhususkan untuk anak baduta, bukan untuk konsumsi anggota keluarga dewasa."
      ]
    }
  };

  const currentWorkflow = roleWorkflows[role] || roleWorkflows.kader;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner Role Specific */}
      <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 mb-3">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: currentWorkflow.badgeColor }}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700">
                {currentWorkflow.roleBadge}
              </span>
            </div>
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-zinc-950">
              {currentWorkflow.title}
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-500 max-w-2xl">
              {currentWorkflow.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <span className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-xs font-bold text-zinc-700 block text-center">
              Peran: <strong className="text-zinc-950 uppercase">{role}</strong>
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-600 leading-relaxed max-w-3xl">
          {currentWorkflow.deskripsi}
        </div>
      </div>

      {/* Tanggung Jawab Utama Card */}
      <div className="rounded-[24px] border border-zinc-200/80 bg-gradient-to-br from-zinc-50 to-white p-6">
        <h3 className="font-sans text-sm font-black uppercase tracking-wider text-zinc-900 mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>Tanggung Jawab Utama Anda:</span>
        </h3>
        <ul className="grid gap-2.5 sm:grid-cols-2 text-xs text-zinc-700">
          {currentWorkflow.tanggungJawabUtama.map((t, idx) => (
            <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-zinc-100 shadow-2xs">
              <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] grid place-items-center shrink-0 mt-0.5">
                ✓
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Langkah-langkah Kerja Kronologis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
            <span>🪜</span>
            <span>Tahapan Alur Kerja Langkah Demi Langkah</span>
          </h3>
          <span className="font-mono text-xs text-zinc-400">
            {currentWorkflow.langkahKerja.length} Langkah Terstruktur
          </span>
        </div>

        <div className="space-y-4">
          {currentWorkflow.langkahKerja.map((step) => (
            <div
              key={step.nomor}
              className="relative overflow-hidden rounded-[22px] border border-zinc-200 bg-white p-5 shadow-2xs hover:border-zinc-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-zinc-900 text-white font-sans text-base font-black shadow-sm">
                  <span>{step.icon}</span>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Langkah {step.nomor}
                    </span>
                    <h4 className="font-sans text-base font-bold text-zinc-950">
                      {step.judul}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    {step.deskripsi}
                  </p>

                  {step.tipsKader && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-900 font-medium">
                      <span>💡 <strong>Tips Operasional:</strong> {step.tipsKader}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aturan Kunci & Integritas Data */}
      <div className="rounded-[22px] border border-red-200 bg-red-50/50 p-5">
        <h4 className="font-sans text-xs font-black uppercase tracking-wider text-red-950 mb-2 flex items-center gap-2">
          <span>⚠️</span>
          <span>Aturan Kunci & Integritas Penugasan:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-red-900">
          {currentWorkflow.aturanKunci.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
