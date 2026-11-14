"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KECAMATAN_PER_KABUPATEN,
  POSYANDU_MIKRO_DATA,
  type PosyanduMikro,
  type BalitaMikro,
} from "@/lib/puskesmas-data";

interface PendingKader {
  id: string;
  nama: string;
  email: string;
  posyandu: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  noHp: string;
  tglDaftar: string;
  status: "Menunggu Verifikasi" | "Disetujui" | "Ditolak";
}

const INITIAL_PENDING_KADERS: PendingKader[] = [
  {
    id: "KDR-REG-01",
    nama: "Dewi Lestari, S.Pd",
    email: "dewi.lestari@posyandu.id",
    posyandu: "Posyandu Mawar 02",
    desa: "Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567801",
    tglDaftar: "Hari ini, 08:30 WIB",
    status: "Menunggu Verifikasi",
  },
  {
    id: "KDR-REG-02",
    nama: "Nur Aini",
    email: "nur.aini@posyandu.id",
    posyandu: "Posyandu Melati 03",
    desa: "Desa Dakiring",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567802",
    tglDaftar: "Kemarin, 14:15 WIB",
    status: "Menunggu Verifikasi",
  },
  {
    id: "KDR-REG-03",
    nama: "Siti Rahmawati, S.Pd",
    email: "kader.socah@jatim.go.id",
    posyandu: "Posyandu Mawar 01",
    desa: "Desa Bilaporah",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567891",
    tglDaftar: "2 Nov 2026",
    status: "Disetujui",
  },
];

export default function PuskesmasTab() {
  // Lingkup Wilayah Puskesmas (Pilihan Kabupaten & Kecamatan)
  const kabupatenList = Object.keys(KECAMATAN_PER_KABUPATEN);
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>("Kab. Bangkalan");
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Socah");

  // Tab internal sub-modul Puskesmas
  const [activeSubTab, setActiveSubTab] = useState<"posyandu_desa" | "verifikasi_kader" | "rujukan_merah">(
    "posyandu_desa"
  );

  // State untuk modal drill-down rincian nama balita
  const [selectedPosyandu, setSelectedPosyandu] = useState<PosyanduMikro | null>(null);
  const [filterBalitaStatus, setFilterBalitaStatus] = useState<"semua" | "stunting" | "sehat" | "rujukan">(
    "semua"
  );

  // State Verifikasi Akun Kader
  const [kaderList, setKaderList] = useState<PendingKader[]>(INITIAL_PENDING_KADERS);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Filter posyandu sesuai Kabupaten dan Kecamatan pilihan
  const filteredPosyandu = POSYANDU_MIKRO_DATA.filter(
    (p) => p.kabupaten === selectedKabupaten && p.kecamatan === selectedKecamatan
  );

  // Jika kecamatan yang dipilih tidak memiliki data mock langsung, gunakan fallback posyandu Socah dengan nama kecamatan disesuaikan
  const displayPosyanduList: PosyanduMikro[] =
    filteredPosyandu.length > 0
      ? filteredPosyandu
      : [
          {
            id: `POS-${selectedKecamatan.toUpperCase()}-01`,
            posyandu: `Posyandu Melati 01`,
            desa: `Desa ${selectedKecamatan} Krajan`,
            kecamatan: selectedKecamatan,
            kabupaten: selectedKabupaten,
            puskesmas: `Puskesmas ${selectedKecamatan}`,
            kaderPenanggungJawab: "Kader Posyandu Desa",
            totalBalita: 45,
            sehatCount: 34,
            sehatPersen: 75.5,
            stuntingCount: 9,
            stuntingPersen: 20.0,
            falteringCount: 2,
            rujukanCount: 2,
            paketA: 34,
            paketB: 9,
            paketC: 2,
            balitaList: [
              {
                id: `BAL-${selectedKecamatan}-01`,
                nama: "Ahmad Zainal",
                nik: "3505011402240001",
                usiaBulan: 15,
                jenisKelamin: "L",
                namaIbu: "Siti Masitoh",
                bbKg: 8.5,
                tbCm: 73.2,
                zTbu: -2.35,
                zBbu: -2.1,
                statusGizi: "Stunting Garis Merah",
                alokasiPaket: "Paket B (Protein Ganda Jatim)",
                catatanKlinis: `Stunting terdeteksi pada penimbangan rutin Posyandu di Kec. ${selectedKecamatan}.`,
                statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
              },
              {
                id: `BAL-${selectedKecamatan}-02`,
                nama: "Zaskia Nur",
                nik: "3505014805240002",
                usiaBulan: 18,
                jenisKelamin: "P",
                namaIbu: "Nurjanah",
                bbKg: 10.4,
                tbCm: 81.6,
                zTbu: +0.2,
                zBbu: +0.1,
                statusGizi: "Sehat / Normal",
                alokasiPaket: "Paket A (Gizi Reguler)",
                catatanKlinis: "Tumbuh kembang optimal di kurva hijau KIA.",
                statusRujukan: "Belum Perlu Rujukan",
              },
            ],
          },
        ];

  // Hitung total agregat kecamatan yang sedang dipilih
  const totalBalitaKecamatan = displayPosyanduList.reduce((acc, p) => acc + p.totalBalita, 0);
  const totalStuntingKecamatan = displayPosyanduList.reduce((acc, p) => acc + p.stuntingCount, 0);
  const totalSehatKecamatan = displayPosyanduList.reduce((acc, p) => acc + p.sehatCount, 0);
  const totalPaketBKecamatan = displayPosyanduList.reduce((acc, p) => acc + p.paketB, 0);
  const avgStuntingPersen =
    totalBalitaKecamatan > 0
      ? (Math.round((totalStuntingKecamatan / totalBalitaKecamatan) * 1000) / 10).toFixed(1)
      : "0";
  const avgSehatPersen =
    totalBalitaKecamatan > 0
      ? (Math.round((totalSehatKecamatan / totalBalitaKecamatan) * 1000) / 10).toFixed(1)
      : "0";

  const handleKabupatenChange = (kab: string) => {
    setSelectedKabupaten(kab);
    const availableKec = KECAMATAN_PER_KABUPATEN[kab] || ["Pusat"];
    setSelectedKecamatan(availableKec[0]);
  };

  const handleApproveKader = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Disetujui" as const } : k))
    );
    setToastMessage(`Akun Kader ${nama} BERHASIL DISETUJUI & DIAKTIFKAN oleh Puskesmas!`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleRejectKader = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Ditolak" as const } : k))
    );
    setToastMessage(`Pendaftaran Akun Kader ${nama} ditolak.`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleTindakLanjutBalita = (namaBalita: string) => {
    setToastMessage(`✓ Tindak lanjut rujukan medis & kunjungan nakes untuk ${namaBalita} berhasil dijadwalkan!`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const pendingCount = kaderList.filter((k) => k.status === "Menunggu Verifikasi").length;

  // Filter balita di dalam modal rincian
  const getFilteredBalitaInModal = () => {
    if (!selectedPosyandu) return [];
    if (filterBalitaStatus === "stunting") {
      return selectedPosyandu.balitaList.filter(
        (b) => b.statusGizi === "Stunting Garis Merah" || b.statusGizi === "Waspada (Faltering)"
      );
    }
    if (filterBalitaStatus === "sehat") {
      return selectedPosyandu.balitaList.filter((b) => b.statusGizi === "Sehat / Normal");
    }
    if (filterBalitaStatus === "rujukan") {
      return selectedPosyandu.balitaList.filter(
        (b) => b.statusGizi === "Gizi Buruk / Rujukan Faskes" || b.statusRujukan.includes("Rujukan")
      );
    }
    return selectedPosyandu.balitaList;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header & Scope Selector: Kabupaten & Kecamatan */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 lg:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
                Dasbor Puskesmas Pembina Kecamatan
              </h2>
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              Pengawasan Terpadu Posyandu Desa · Pemetaan Prevalensi Stunting & Preskripsi MBG Mikro
            </p>
          </div>

          {/* Unit Puskesmas Tag */}
          <div className="flex items-center gap-2">
            <span className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 font-mono text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-xs">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                🏥
              </span>
              <span>Puskesmas {selectedKecamatan} ({selectedKabupaten})</span>
            </span>
          </div>
        </div>

        {/* Form Selector Wilayah Kerja Puskesmas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-200/80">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              1. Pilih Kabupaten / Kota
            </label>
            <select
              value={selectedKabupaten}
              onChange={(e) => handleKabupatenChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 font-sans text-xs font-bold text-zinc-900 outline-none transition-all hover:border-zinc-300 focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/10"
            >
              {kabupatenList.map((kab) => (
                <option key={kab} value={kab}>
                  {kab}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              2. Pilih Kecamatan (Wilayah Kerja Puskesmas)
            </label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 font-sans text-xs font-bold text-zinc-900 outline-none transition-all hover:border-zinc-300 focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/10"
            >
              {(KECAMATAN_PER_KABUPATEN[selectedKabupaten] || ["Pusat"]).map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2 font-mono text-[11px] text-sky-950 flex items-center justify-between">
              <span>Status Faskes:</span>
              <strong className="text-emerald-700 font-black">● Aktif Operasional</strong>
            </div>
          </div>
        </div>

        {/* Quick KPI Bar Kecamatan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs">
            <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold block">
              Total Balita Terdata
            </span>
            <div className="font-sans text-xl font-black text-zinc-950 mt-0.5">
              {totalBalitaKecamatan.toLocaleString("id-ID")} <span className="text-xs font-normal text-zinc-500">anak</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs">
            <span className="font-mono text-[10px] uppercase text-emerald-700 font-bold block">
              Balita Sehat (Paket A)
            </span>
            <div className="font-sans text-xl font-black text-emerald-900 mt-0.5">
              {totalSehatKecamatan} <span className="text-xs font-normal">({avgSehatPersen}%)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3 shadow-xs">
            <span className="font-mono text-[10px] uppercase text-rose-700 font-bold block">
              Stunting / Faltering (Paket B)
            </span>
            <div className="font-sans text-xl font-black text-rose-900 mt-0.5">
              {totalStuntingKecamatan} <span className="text-xs font-normal">({avgStuntingPersen}%)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs">
            <span className="font-mono text-[10px] uppercase text-amber-800 font-bold block">
              Kebutuhan Paket B Harian
            </span>
            <div className="font-sans text-xl font-black text-amber-950 mt-0.5">
              {totalPaketBKecamatan} <span className="text-xs font-normal text-amber-700">porsi hewani</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 font-mono text-xs font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                ✓
              </span>
              <span>{toastMessage}</span>
            </div>
            <span className="text-[11px] opacity-75">Tersimpan di Sistem Puskesmas</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Navigasi Puskesmas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("posyandu_desa")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "posyandu_desa"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>📊</span>
          <span>Peta Pantau Mikro Posyandu & Kasus Desa ({displayPosyanduList.length} Posyandu)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("verifikasi_kader")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "verifikasi_kader"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🛡️</span>
          <span>Verifikasi Pendaftaran Kader Baru</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-400 px-2 py-0.2 font-mono text-[10px] font-black text-zinc-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("rujukan_merah")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "rujukan_merah"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🚨</span>
          <span>Kasus Rujukan Garis Merah</span>
        </button>
      </div>

      {/* SUB-TAB 1: PETA PANTAU MIKRO POSYANDU & KASUS DESA (FITUR UTAMA YANG DIMINTA) */}
      {activeSubTab === "posyandu_desa" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>📍</span>
                <span>Daftar Posyandu & Desa — Wilayah Puskesmas {selectedKecamatan}</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Klik pada kartu posyandu mana saja untuk melihat **rincian nama-nama anak balita**, status stunting, persentase sehat, dan alokasi Paket MBG.
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-700">
              Tingkat Kecamatan · {selectedKabupaten}
            </span>
          </div>

          {/* Grid Kartu Posyandu per Desa (Style Mirip Foto yang Dilampirkan Pengguna) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayPosyanduList.map((pos) => {
              const isRed = pos.stuntingPersen >= 20;
              const isYellow = pos.stuntingPersen >= 14 && pos.stuntingPersen < 20;

              return (
                <div
                  key={pos.id}
                  onClick={() => {
                    setSelectedPosyandu(pos);
                    setFilterBalitaStatus("semua");
                  }}
                  className={`group cursor-pointer rounded-[24px] border-2 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    isRed
                      ? "border-rose-200 bg-rose-50/40 hover:border-rose-400 hover:bg-rose-50/80"
                      : isYellow
                      ? "border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50/80"
                      : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 hover:bg-emerald-50/80"
                  }`}
                >
                  {/* Top Header Kartu */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-sans text-base font-black text-zinc-950 group-hover:text-[#032D30] transition-colors">
                        {pos.desa}
                      </h4>
                      <p className="font-mono text-xs font-bold text-zinc-600">
                        {pos.posyandu}
                      </p>
                    </div>

                    {/* Badge Persentase Stunting */}
                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono text-xs font-black shadow-xs ${
                        isRed
                          ? "bg-rose-600 text-white"
                          : isYellow
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {pos.stuntingPersen}% Stunting
                    </span>
                  </div>

                  {/* Progress Bar Sehat vs Stunting */}
                  <div className="my-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500">
                      <span className="text-emerald-700">🟢 Sehat: {pos.sehatPersen}% ({pos.sehatCount} anak)</span>
                      <span className="text-rose-700">🔴 Stunting: {pos.stuntingPersen}% ({pos.stuntingCount} anak)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${pos.sehatPersen}%` }}
                        title={`Sehat: ${pos.sehatPersen}%`}
                      />
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${pos.stuntingPersen}%` }}
                        title={`Stunting: ${pos.stuntingPersen}%`}
                      />
                    </div>
                  </div>

                  {/* Kebutuhan Paket MBG Desa */}
                  <div className="mt-3 pt-3 border-t border-zinc-200/70 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>Total Balita:</span>
                      <strong className="text-zinc-900 font-bold">{pos.totalBalita} anak</strong>
                    </div>
                    <div className="flex items-center justify-between text-emerald-800">
                      <span>Paket A (Gizi Reguler):</span>
                      <strong className="font-black">{pos.paketA} porsi</strong>
                    </div>
                    <div className="flex items-center justify-between text-rose-800">
                      <span>Paket B (Protein Ganda Jatim):</span>
                      <strong className="font-black">{pos.paketB} porsi</strong>
                    </div>
                    {pos.paketC > 0 && (
                      <div className="flex items-center justify-between text-amber-900">
                        <span>Paket C (Rujukan Faskes F100):</span>
                        <strong className="font-black">{pos.paketC} porsi</strong>
                      </div>
                    )}
                  </div>

                  {/* Tombol Klik Rincian */}
                  <div className="mt-4 pt-2 flex items-center justify-between text-xs font-sans font-bold text-[#032D30] group-hover:text-[#38E8F5] transition-colors">
                    <span className="font-mono text-[11px] text-zinc-500">Kader: {pos.kaderPenanggungJawab}</span>
                    <span className="flex items-center gap-1 font-black">
                      <span>Rincian Anak</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VERIFIKASI PENDAFTARAN KADER */}
      {activeSubTab === "verifikasi_kader" && (
        <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>🛡️</span>
                <span>Persetujuan & Verifikasi Pendaftaran Kader Posyandu Baru</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Setiap kader posyandu di wilayah Kec. {selectedKecamatan} wajib disetujui Puskesmas sebelum dapat menginput balita.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-300 px-3 py-1 font-mono text-xs font-bold text-amber-900">
              {pendingCount} Permohonan Menunggu
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Nama Kader</th>
                  <th className="py-3 px-3">Posyandu & Desa</th>
                  <th className="py-3 px-3">Kontak / No HP</th>
                  <th className="py-3 px-3">Waktu Daftar</th>
                  <th className="py-3 px-3">Status Verifikasi</th>
                  <th className="py-3 px-3 text-right">Aksi Puskesmas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {kaderList.map((kader) => (
                  <tr key={kader.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-zinc-950">{kader.nama}</div>
                      <div className="font-mono text-[11px] text-zinc-400">{kader.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-zinc-900">{kader.posyandu}</div>
                      <div className="text-[11px] text-zinc-500">{kader.desa}, {kader.kecamatan}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-zinc-700">{kader.noHp}</td>
                    <td className="py-3.5 px-3 font-mono text-zinc-500 text-[11px]">{kader.tglDaftar}</td>
                    <td className="py-3.5 px-3">
                      {kader.status === "Menunggu Verifikasi" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-amber-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                          Menunggu Puskesmas
                        </span>
                      )}
                      {kader.status === "Disetujui" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-emerald-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Disetujui & Aktif
                        </span>
                      )}
                      {kader.status === "Ditolak" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-red-900">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {kader.status === "Menunggu Verifikasi" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveKader(kader.id, kader.nama)}
                            className="rounded-xl bg-[#18140B] px-3 py-1.5 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs"
                          >
                            ✓ Setujui Akun
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectKader(kader.id, kader.nama)}
                            className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 font-sans text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-zinc-400">
                          {kader.status === "Disetujui" ? "Terverifikasi" : "Selesai"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DAFTAR RUJUKAN BALITA GARIS MERAH */}
      {activeSubTab === "rujukan_merah" && (
        <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-red-100 pb-4">
            <div>
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-red-950 flex items-center gap-2">
                <span>🚨</span>
                <span>Daftar Balita Rujukan Masuk ke Faskes Puskesmas {selectedKecamatan}</span>
              </h3>
              <p className="font-mono text-xs text-red-700/80 mt-0.5">
                Balita dengan Z-Score TB/U &lt; -2 SD atau faltering berat yang wajib dikonseling oleh Dokter Puskesmas.
              </p>
            </div>
            <span className="rounded-full bg-red-100 border border-red-300 px-3 py-1 font-mono text-xs font-black text-red-900">
              Perlu Intervensi Medis
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {displayPosyanduList
              .flatMap((p) => p.balitaList)
              .filter((b) => b.statusGizi === "Stunting Garis Merah" || b.statusGizi === "Gizi Buruk / Rujukan Faskes")
              .map((b) => (
                <div key={b.id} className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans text-sm font-black text-zinc-950">{b.nama} ({b.usiaBulan} Bulan)</h4>
                      <p className="font-mono text-xs text-zinc-500">NIK: {b.nik} · Ibu {b.namaIbu}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-1">Status: {b.statusGizi}</p>
                    </div>
                    <span className="rounded-lg bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5">
                      TB/U: {b.zTbu} SD
                    </span>
                  </div>
                  <div className="text-xs text-red-900 bg-white p-2.5 rounded-xl border border-red-200 font-medium">
                    <strong>Catatan Klinis:</strong> {b.catatanKlinis}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTindakLanjutBalita(b.nama)}
                      className="flex-1 rounded-xl bg-red-600 text-white py-2 font-sans text-xs font-black hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Jadwalkan Konseling Dokter Puskesmas
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. MODAL DRILL-DOWN RINCIAN NAMA BALITA MIKRO (Saat Kartu Posyandu di-klik) */}
      <AnimatePresence>
        {selectedPosyandu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPosyandu(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl z-10 custom-scrollbar space-y-6"
            >
              {/* Header Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#38E8F5] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-zinc-950">
                      Rincian Mikro Posyandu
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      ID: {selectedPosyandu.id}
                    </span>
                  </div>
                  <h3 className="font-sans text-2xl font-black text-zinc-950 mt-1">
                    {selectedPosyandu.posyandu} · {selectedPosyandu.desa}
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Kec. {selectedPosyandu.kecamatan}, {selectedPosyandu.kabupaten} · Kader: {selectedPosyandu.kaderPenanggungJawab}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPosyandu(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 3 Kartu Ringkasan Persentase Kasus di Posyandu Tersebut */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-emerald-800">
                      🟢 Balita Sehat (Normal)
                    </span>
                    <span className="rounded-md bg-emerald-600 text-white font-mono text-[11px] font-black px-2 py-0.5">
                      {selectedPosyandu.sehatPersen}%
                    </span>
                  </div>
                  <div className="mt-2 font-sans text-2xl font-black text-emerald-950">
                    {selectedPosyandu.sehatCount} <span className="text-xs font-normal text-emerald-700">anak</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-emerald-800">
                    Menerima: <strong>Paket A (Gizi Reguler)</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-rose-800">
                      🔴 Stunting / Faltering
                    </span>
                    <span className="rounded-md bg-rose-600 text-white font-mono text-[11px] font-black px-2 py-0.5">
                      {selectedPosyandu.stuntingPersen}%
                    </span>
                  </div>
                  <div className="mt-2 font-sans text-2xl font-black text-rose-950">
                    {selectedPosyandu.stuntingCount} <span className="text-xs font-normal text-rose-700">anak</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-rose-800">
                    Menerima: <strong>Paket B (Protein Ganda Blitar-Lamongan)</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-amber-900">
                      🏥 Rujukan Medis Puskesmas
                    </span>
                    <span className="rounded-md bg-amber-500 text-white font-mono text-[11px] font-black px-2 py-0.5">
                      {selectedPosyandu.rujukanCount} Anak
                    </span>
                  </div>
                  <div className="mt-2 font-sans text-2xl font-black text-amber-950">
                    {selectedPosyandu.rujukanCount} <span className="text-xs font-normal text-amber-700">kasus</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-amber-900">
                    Menerima: <strong>Paket C / Terapi F100</strong>
                  </div>
                </div>
              </div>

              {/* Filter Tabs untuk Daftar Anak Balita */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "semua", label: `Semua Anak (${selectedPosyandu.balitaList.length})` },
                    { key: "stunting", label: `🔴 Stunting / Paket B` },
                    { key: "sehat", label: `🟢 Sehat / Paket A` },
                    { key: "rujukan", label: `🏥 Perlu Rujukan` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilterBalitaStatus(tab.key as any)}
                      className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                        filterBalitaStatus === tab.key
                          ? "bg-[#18140B] text-white shadow-xs"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="font-mono text-[11px] text-zinc-400">
                  Total Terdaftar: {selectedPosyandu.totalBalita} Anak
                </span>
              </div>

              {/* Tabel / Daftar Nama Anak Balita Terinci */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-500">
                    <tr>
                      <th className="py-3 px-3.5">Nama Balita & NIK</th>
                      <th className="py-3 px-3.5">Usia & Ibu</th>
                      <th className="py-3 px-3.5">Antropometri</th>
                      <th className="py-3 px-3.5">Z-Score TB/U</th>
                      <th className="py-3 px-3.5">Status Gizi & Paket MBG</th>
                      <th className="py-3 px-3.5 text-right">Aksi Puskesmas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {getFilteredBalitaInModal().map((balita) => {
                      const isBalitaStunting =
                        balita.statusGizi === "Stunting Garis Merah" ||
                        balita.statusGizi === "Gizi Buruk / Rujukan Faskes";
                      return (
                        <tr key={balita.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-3.5">
                            <div className="font-black text-zinc-950 text-sm">{balita.nama}</div>
                            <div className="font-mono text-[11px] text-zinc-400">
                              NIK: {balita.nik}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div className="font-bold text-zinc-900">
                              {balita.usiaBulan} Bulan ({balita.jenisKelamin === "L" ? "Laki-Laki" : "Perempuan"})
                            </div>
                            <div className="text-[11px] text-zinc-500">Ibu: {balita.namaIbu}</div>
                          </td>
                          <td className="py-3.5 px-3.5 font-mono">
                            <div>BB: <strong>{balita.bbKg} kg</strong></div>
                            <div className="text-zinc-500">TB: {balita.tbCm} cm</div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`inline-block font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                                balita.zTbu < -2
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {balita.zTbu > 0 ? `+${balita.zTbu}` : balita.zTbu} SD
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div>
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                                  isBalitaStunting
                                    ? "bg-rose-50 border border-rose-200 text-rose-900"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                                }`}
                              >
                                {balita.statusGizi}
                              </span>
                            </div>
                            <div className="font-bold text-[#5C46D9] text-[11px] mt-1">
                              {balita.alokasiPaket}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            {isBalitaStunting ? (
                              <button
                                type="button"
                                onClick={() => handleTindakLanjutBalita(balita.nama)}
                                className="rounded-xl bg-[#18140B] px-3 py-1.5 font-sans text-xs font-black text-white hover:bg-rose-600 transition-colors shadow-xs"
                              >
                                🩺 Tangani Kasus
                              </button>
                            ) : (
                              <span className="font-mono text-[11px] text-emerald-700 font-bold">
                                ✓ Terpantau Baik
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-100 pt-4 font-mono text-xs text-zinc-500">
                <div>
                  Data bersumber dari penimbangan Posyandu terakhir · Terintegrasi Dapur MBG Jatim.
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPosyandu(null)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2 font-sans text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
