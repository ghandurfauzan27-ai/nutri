"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    status: "Menunggu Verifikasi"
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
    status: "Menunggu Verifikasi"
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
    status: "Disetujui"
  }
];

export default function PuskesmasTab() {
  const [kaderList, setKaderList] = useState<PendingKader[]>(INITIAL_PENDING_KADERS);
  const [successToast, setSuccessToast] = useState("");

  const handleApprove = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Disetujui" as const } : k))
    );
    setSuccessToast(`Akun Kader ${nama} BERHASIL DISETUJUI & DIAKTIFKAN oleh Puskesmas!`);
    setTimeout(() => setSuccessToast(""), 4500);
  };

  const handleReject = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Ditolak" as const } : k))
    );
    setSuccessToast(`Pendaftaran Akun Kader ${nama} ditolak.`);
    setTimeout(() => setSuccessToast(""), 4500);
  };

  const pendingCount = kaderList.filter((k) => k.status === "Menunggu Verifikasi").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Puskesmas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Modul Puskesmas: Verifikasi Kader & Rujukan Medis
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Puskesmas Pembina Kec. Socah · Validasi Otoritas Kader Posyandu Desa & Terapi Gizi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 font-mono text-xs font-bold text-amber-900">
            {pendingCount} Permohonan Kader Menunggu
          </span>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successToast && (
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
              <span>{successToast}</span>
            </div>
            <span className="text-[11px] opacity-75">Tersimpan di Basis Data Dinkes</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Bagian Verifikasi Akun Kader Baru */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
              <span>🛡️</span>
              <span>Persetujuan & Verifikasi Pendaftaran Kader Posyandu Baru</span>
            </h3>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              Setiap kader posyandu yang mendaftar melalui form registrasi wajib disetujui Puskesmas sebelum dapat menginput balita.
            </p>
          </div>
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
                          onClick={() => handleApprove(kader.id, kader.nama)}
                          className="rounded-xl bg-[#18140B] px-3 py-1.5 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs"
                        >
                          ✓ Setujui Akun
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(kader.id, kader.nama)}
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

      {/* 2. Bagian Rujukan Balita Zona Merah */}
      <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-red-100 pb-4">
          <div>
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-red-950 flex items-center gap-2">
              <span>🚨</span>
              <span>Daftar Balita Rujukan Masuk (Zona Merah / Risiko Stunting Berat)</span>
            </h3>
            <p className="font-mono text-xs text-red-700/80 mt-0.5">
              Otomatis terhubung dari hasil penimbangan kader posyandu yang berada di bawah garis merah KIA (Z-score &lt; -2 SD).
            </p>
          </div>
          <span className="rounded-full bg-red-100 border border-red-300 px-3 py-1 font-mono text-xs font-black text-red-900">
            2 Balita Butuh Tindak Lanjut
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-sans text-sm font-black text-zinc-950">Ahmad Fauzi (14 Bulan)</h4>
                <p className="font-mono text-xs text-zinc-500">NIK: 3505126804240001 · Ibu Siti Rahayu</p>
                <p className="text-xs text-zinc-600 font-medium mt-1">Posyandu Mawar 01, Desa Bilaporah</p>
              </div>
              <span className="rounded-lg bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5">
                TB/U: -2.42 SD
              </span>
            </div>
            <div className="text-xs text-red-900 bg-white p-2.5 rounded-xl border border-red-200 font-medium">
              <strong>Catatan Kader:</strong> Berat badan stagnan 2 bulan berurutan (8.4 kg). Perlu pemeriksaan dokter anak Puskesmas Socah.
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => alert("Jadwal Konseling & Terapi Gizi Ahmad Fauzi berhasil dibuat!")}
                className="flex-1 rounded-xl bg-red-600 text-white py-2 font-sans text-xs font-black hover:bg-red-700 transition-colors"
              >
                Jadwalkan Terapi Gizi
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-sans text-sm font-black text-zinc-950">Budi Santoso (24 Bulan)</h4>
                <p className="font-mono text-xs text-zinc-500">NIK: 3505141209240003 · Ibu Dewi Lestari</p>
                <p className="text-xs text-zinc-600 font-medium mt-1">Posyandu Melati 03, Kedungdung</p>
              </div>
              <span className="rounded-lg bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5">
                TB/U: -2.68 SD
              </span>
            </div>
            <div className="text-xs text-red-900 bg-white p-2.5 rounded-xl border border-red-200 font-medium">
              <strong>Catatan Kader:</strong> Stunting terkonfirmasi. Mendapat intervensi Paket B ganda protein hewani.
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => alert("Jadwal Konseling & Terapi Gizi Budi Santoso berhasil dibuat!")}
                className="flex-1 rounded-xl bg-red-600 text-white py-2 font-sans text-xs font-black hover:bg-red-700 transition-colors"
              >
                Jadwalkan Terapi Gizi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
