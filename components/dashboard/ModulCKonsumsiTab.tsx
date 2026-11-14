"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MbgBalitaDelivery {
  id: string;
  namaAnak: string;
  nik: string;
  usiaBulan: number;
  namaIbu: string;
  jenisPaket: "Paket A (Gizi Reguler)" | "Paket B (Protein Ganda Jatim)" | "Paket C (F100 Medis)";
  menuHariIni: string;
  statusDiterima: boolean;
  waktuDiterima?: string;
  dayaTerima: "Habis (100%)" | "Tersisa Sebagian (50%)" | "Tidak Habis" | "Belum Konfirmasi";
  catatanPetugas?: string;
}

const INITIAL_MBG_BALITA_LIST: MbgBalitaDelivery[] = [
  {
    id: "MBG-001",
    namaAnak: "Ahmad Fauzi",
    nik: "3505126804240001",
    usiaBulan: 14,
    namaIbu: "Siti Rahayu",
    jenisPaket: "Paket B (Protein Ganda Jatim)",
    menuHariIni: "Nasi Tim Hati Ayam + Dobel Telur Omega Blitar + Puree Lele Lamongan",
    statusDiterima: true,
    waktuDiterima: "Hari ini, 11:15 WIB",
    dayaTerima: "Habis (100%)",
    catatanPetugas: "Diterima langsung oleh Ibu Siti di Balai RW 01.",
  },
  {
    id: "MBG-002",
    namaAnak: "Zaskia Putri",
    nik: "3505124508240002",
    usiaBulan: 18,
    namaIbu: "Nurjanah",
    jenisPaket: "Paket A (Gizi Reguler)",
    menuHariIni: "Nasi Lembek + Sup Wortel Daging Cincang + Tempe Bacem Manis",
    statusDiterima: true,
    waktuDiterima: "Hari ini, 11:20 WIB",
    dayaTerima: "Habis (100%)",
    catatanPetugas: "Diserahkan saat penimbangan rutin posyandu.",
  },
  {
    id: "MBG-003",
    namaAnak: "Rian Pratama",
    nik: "3505121206240003",
    usiaBulan: 22,
    namaIbu: "Fatimah",
    jenisPaket: "Paket B (Protein Ganda Jatim)",
    menuHariIni: "Nasi Tim Ikan Bandeng Presto + Telur Puyuh Rebus + Sup Labu Kuning",
    statusDiterima: false,
    dayaTerima: "Belum Konfirmasi",
    catatanPetugas: "",
  },
  {
    id: "MBG-004",
    namaAnak: "Dewi Kurniasari",
    nik: "3505125501240004",
    usiaBulan: 16,
    namaIbu: "Kusnul Khotimah",
    jenisPaket: "Paket A (Gizi Reguler)",
    menuHariIni: "Nasi Tim Ayam Suwir + Tahu Kukus Telur + Sup Brokoli Wortel",
    statusDiterima: true,
    waktuDiterima: "Hari ini, 11:30 WIB",
    dayaTerima: "Tersisa Sebagian (50%)",
    catatanPetugas: "Balita agak flu, nafsu makan agak menurun.",
  },
  {
    id: "MBG-005",
    namaAnak: "Muhammad Rizki",
    nik: "3505122104240005",
    usiaBulan: 11,
    namaIbu: "Fitriyah",
    jenisPaket: "Paket B (Protein Ganda Jatim)",
    menuHariIni: "Bubur Halus Hati Ayam + Kuning Telur Bebek Blitar + Puree Wortel",
    statusDiterima: false,
    dayaTerima: "Belum Konfirmasi",
    catatanPetugas: "",
  },
  {
    id: "MBG-006",
    namaAnak: "Anisa Rahma",
    nik: "3505127203240006",
    usiaBulan: 20,
    namaIbu: "Maryam",
    jenisPaket: "Paket A (Gizi Reguler)",
    menuHariIni: "Nasi Lembek + Semur Daging Sapi Halus + Sayur Bayam Bening",
    statusDiterima: true,
    waktuDiterima: "Hari ini, 11:35 WIB",
    dayaTerima: "Habis (100%)",
    catatanPetugas: "Keluarga mengambil tepat waktu di pos penyerahan posyandu.",
  },
];

export default function ModulCKonsumsiTab() {
  const [list, setList] = useState<MbgBalitaDelivery[]>(INITIAL_MBG_BALITA_LIST);
  const [filterPaket, setFilterPaket] = useState<"semua" | "paket_b" | "paket_a" | "belum">("semua");
  const [toastMessage, setToastMessage] = useState("");
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  // Sinkronkan data konfirmasi dari localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("nt_konfirmasi_mbg_posyandu");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setList(parsed);
          }
        }
      }
    } catch (e) {}
  }, []);

  const handleConfirmSingle = (id: string, namaAnak: string) => {
    const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          statusDiterima: true,
          waktuDiterima: `Hari ini, ${jam}`,
          dayaTerima: "Habis (100%)" as const,
          catatanPetugas: "Dikonfirmasi langsung oleh petugas posyandu saat penerimaan paket.",
        };
      }
      return item;
    });

    setList(updated);
    try {
      localStorage.setItem("nt_konfirmasi_mbg_posyandu", JSON.stringify(updated));
    } catch (e) {}

    setToastMessage(`✓ Paket Gizi MBG untuk "${namaAnak}" BERHASIL DIKONFIRMASI DITERIMA!`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleConfirmAll = () => {
    const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const updated = list.map((item) => ({
      ...item,
      statusDiterima: true,
      waktuDiterima: item.waktuDiterima || `Hari ini, ${jam}`,
      dayaTerima: item.dayaTerima === "Belum Konfirmasi" ? ("Habis (100%)" as const) : item.dayaTerima,
    }));

    setList(updated);
    try {
      localStorage.setItem("nt_konfirmasi_mbg_posyandu", JSON.stringify(updated));
    } catch (e) {}

    setToastMessage("✓ SEMUA PAKET GIZI MBG HARI INI BERHASIL DIKONFIRMASI SEKALIGUS!");
    setTimeout(() => setToastMessage(""), 4500);
  };

  const totalPaket = list.length;
  const sudahDiterima = list.filter((l) => l.statusDiterima).length;
  const persenDiterima = totalPaket > 0 ? Math.round((sudahDiterima / totalPaket) * 100) : 0;
  const totalPaketB = list.filter((l) => l.jenisPaket.includes("Paket B")).length;

  const filteredList = list.filter((item) => {
    if (filterPaket === "paket_b") return item.jenisPaket.includes("Paket B");
    if (filterPaket === "paket_a") return item.jenisPaket.includes("Paket A");
    if (filterPaket === "belum") return !item.statusDiterima;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Identitas Penyaluran MBG Posyandu */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-sky-50/60 to-white p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Konfirmasi Penerimaan Paket Gizi MBG Harian
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-600 mt-1">
            Posyandu Mawar 01 — Desa Bilaporah, Kec. Socah · Suplai: SPPG Dapur Sehat Socah Mandiri
          </p>
          <p className="font-sans text-xs text-emerald-900 font-bold mt-1">
            📅 Tanggal: {currentDate} (Penyaluran Siang)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConfirmAll}
            className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 font-sans text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>✓</span>
            <span>Konfirmasi Semua Paket Diterima</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Bar MBG Posyandu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold block">
            Total Sasaran Balita
          </span>
          <div className="font-sans text-2xl font-black text-zinc-950 mt-0.5">
            {totalPaket} <span className="text-xs font-normal text-zinc-500">anak</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase text-emerald-700 font-bold block">
            Paket Sudah Diterima
          </span>
          <div className="font-sans text-2xl font-black text-emerald-950 mt-0.5">
            {sudahDiterima} <span className="text-xs font-normal">({persenDiterima}%)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase text-rose-700 font-bold block">
            Paket B (Protein Ganda Jatim)
          </span>
          <div className="font-sans text-2xl font-black text-rose-950 mt-0.5">
            {totalPaketB} <span className="text-xs font-normal text-rose-700">porsi stunting</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <span className="font-mono text-[10px] uppercase text-amber-800 font-bold block">
            Belum Konfirmasi
          </span>
          <div className="font-sans text-2xl font-black text-amber-950 mt-0.5">
            {totalPaket - sudahDiterima} <span className="text-xs font-normal text-amber-700">anak</span>
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
            <span className="text-[11px] opacity-75">Tersimpan di Sistem & Dilaporkan ke Dapur MBG</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "semua", label: `Semua Balita (${list.length})` },
            { key: "paket_b", label: `Paket B Ekstra Hewani (${totalPaketB})` },
            { key: "paket_a", label: "Paket A Reguler" },
            { key: "belum", label: `Belum Diterima (${totalPaket - sudahDiterima})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterPaket(tab.key as any)}
              className={`rounded-xl px-3.5 py-2 font-sans text-xs font-bold transition-all ${
                filterPaket === tab.key
                  ? "bg-[#18140B] text-white shadow-xs"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="font-mono text-xs text-zinc-400">
          *Cukup klik konfirmasi tanpa scan QR code rumit
        </p>
      </div>

      {/* Tabel Konfirmasi MBG Balita */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left font-sans text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-500">
            <tr>
              <th className="py-3.5 px-4">Nama Balita & NIK</th>
              <th className="py-3.5 px-4">Ibu Kandung</th>
              <th className="py-3.5 px-4">Alokasi Paket & Menu MBG Hari Ini</th>
              <th className="py-3.5 px-4">Status Penerimaan</th>
              <th className="py-3.5 px-4 text-right">Aksi Konfirmasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {filteredList.map((item) => {
              const isPaketB = item.jenisPaket.includes("Paket B");
              return (
                <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-black text-zinc-950 text-sm">{item.namaAnak}</div>
                    <div className="font-mono text-[11px] text-zinc-400">
                      {item.usiaBulan} Bulan · NIK: {item.nik}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-zinc-700">
                    Ibu {item.namaIbu}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span
                      className={`inline-block font-mono text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isPaketB
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {item.jenisPaket}
                    </span>
                    <p className="text-[11px] text-zinc-600 mt-1 leading-normal font-medium">
                      {item.menuHariIni}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.statusDiterima ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <span>✓ Diterima</span>
                        </span>
                        <div className="font-mono text-[10px] text-zinc-400">
                          {item.waktuDiterima}
                        </div>
                        <div className="font-sans text-[10px] text-emerald-700 font-bold">
                          Daya Terima: {item.dayaTerima}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        <span>⏳ Menunggu Penyerahan</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.statusDiterima ? (
                      <span className="font-mono text-xs text-zinc-400 font-bold">
                        ✓ Terkonfirmasi
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmSingle(item.id, item.namaAnak)}
                        className="rounded-xl bg-[#18140B] px-4 py-2 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                      >
                        <span>✓</span>
                        <span>Konfirmasi Diterima</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
