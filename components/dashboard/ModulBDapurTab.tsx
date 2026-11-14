"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RESEP_MOCK, SUPPLY_LOGS_MOCK, type RecipeItem } from "@/lib/app-data";
import { MASTER_DAPUR_MBG, type DapurMbgWilayah } from "@/lib/puskesmas-data";

export default function ModulBDapurTab() {
  const [selectedDapurId, setSelectedDapurId] = useState<string>(MASTER_DAPUR_MBG[0].id);
  const activeDapur = MASTER_DAPUR_MBG.find((d) => d.id === selectedDapurId) || MASTER_DAPUR_MBG[0];

  const [activePortionB, setActivePortionB] = useState<number>(activeDapur.kuotaPaketB);
  const [activePortionA, setActivePortionA] = useState<number>(activeDapur.kuotaPaketA);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(RESEP_MOCK[0]);
  const [activeFilter, setActiveFilter] = useState<"semua" | "Paket B" | "Paket A">("semua");
  const [printLabelModal, setPrintLabelModal] = useState(false);
  const [showSupplyModal, setShowSupplyModal] = useState(false);

  // Status konfirmasi penerimaan yang dicentang oleh Posyandu
  const [confirmedDeliveries, setConfirmedDeliveries] = useState<any[]>([]);

  useEffect(() => {
    // Sinkron kuota ketika memilih dapur berbeda
    setActivePortionB(activeDapur.kuotaPaketB);
    setActivePortionA(activeDapur.kuotaPaketA);
  }, [activeDapur]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("nt_konfirmasi_mbg_posyandu");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setConfirmedDeliveries(parsed);
          }
        }
      } catch (e) {
        console.error("Gagal membaca konfirmasi mbg posyandu", e);
      }
    }
  }, []);

  const totalPortion = activePortionA + activePortionB;

  // Otomatisasi Kebutuhan Bahan Baku Harian
  const kgTelur = Math.round((activePortionB * 55) / 1000); // 55g per porsi Paket B
  const kgLele = Math.round((activePortionB * 35) / 1000); // 35g per porsi Paket B
  const kgHatiAyam = Math.round((activePortionB * 25) / 1000); // 25g per porsi Paket B
  const kgBeras = Math.round(((activePortionA * 50) + (activePortionB * 45)) / 1000);
  const ikatKelor = Math.round((activePortionB * 15) / 250); // 1 ikat ~ 250g

  const filteredRecipes = RESEP_MOCK.filter((r) => {
    if (activeFilter === "semua") return true;
    return r.tipePaket.includes(activeFilter);
  });

  const totalDiterimaCount = confirmedDeliveries.filter((d) => d.statusDiterima).length;
  const totalAnakSampel = confirmedDeliveries.length || 6;
  const persenDiterima = Math.round(((totalDiterimaCount || 4) / totalAnakSampel) * 100);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7866FF] animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Modul Dapur MBG: Pengelolaan Wilayah & Preskripsi Porsi
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Dapur Mandiri SPPG Â· Pembagian Wilayah Binaan & Konversi Timbangan Posyandu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector Switch Dapur MBG */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl px-3 py-1.5">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">Unit Dapur:</span>
            <select
              value={selectedDapurId}
              onChange={(e) => setSelectedDapurId(e.target.value)}
              className="bg-transparent font-sans text-xs font-black text-zinc-900 outline-none cursor-pointer"
            >
              {MASTER_DAPUR_MBG.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.namaDapur} ({d.kabupaten})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setPrintLabelModal(true)}
            className="rounded-2xl border-2 border-[#18140B] bg-[#18140B] px-4 py-2 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h.01M7 17h.01M17 7h.01M12 12h.01" />
            </svg>
            <span>Label Pengiriman Kotak MBG</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSupplyModal(true)}
            className="rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-2 font-sans text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            Log Peternak & Pemasok Lokal
          </button>
        </div>
      </div>

      {/* CARD PEMBAGIAN WILAYAH SASARAN DAPUR (AGAR TIDAK TABRAKAN ANTAR DAPUR) */}
      <div className="rounded-[30px] border-2 border-[#7866FF]/30 bg-gradient-to-br from-[#FAF8FF] via-white to-purple-50/20 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-purple-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#7866FF] px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white">
                Wilayah Layanan Eksklusif
              </span>
              <span className="font-mono text-xs text-zinc-500 font-bold">
                {activeDapur.id} Â· {activeDapur.statusOperasional}
              </span>
            </div>
            <h3 className="font-sans text-xl font-black text-zinc-950 mt-1">
              {activeDapur.namaDapur}
            </h3>
            <p className="font-sans text-xs text-zinc-600 mt-0.5">
              Penanggung Jawab: <strong className="text-zinc-900">{activeDapur.pengelola}</strong> ({activeDapur.noKontak}) Â· Wilayah Kecamatan: <strong className="text-zinc-900">{activeDapur.kecamatanLayanan.join(", ")}</strong>, {activeDapur.kabupaten}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-purple-200 rounded-2xl p-3 shadow-xs">
            <div className="text-right">
              <span className="font-mono text-[10px] text-zinc-500 block uppercase font-bold">Suplier Bahan Lokal</span>
              <span className="font-sans text-xs font-bold text-zinc-900 block max-w-xs truncate">
                {activeDapur.suplierLokal}
              </span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 grid place-items-center font-bold text-sm">
              ðŸšš
            </div>
          </div>
        </div>

        {/* Daftar Posyandu Sasaran agar Tidak Tabrakan */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <span>ðŸ“</span> Posyandu Sasaran Layanan Harian ({activeDapur.posyanduSasaran.length} Posyandu Binaan):
            </span>
            <span className="font-mono text-[11px] text-purple-700 font-bold bg-purple-100/70 px-2.5 py-0.5 rounded-full">
              Terpeta Bebas Tumpang Tindih
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {activeDapur.posyanduSasaran.map((pos, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-3 text-xs shadow-2xs hover:border-[#7866FF]/60 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-zinc-900 font-mono text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="font-sans font-bold text-zinc-900 truncate">{pos}</span>
                </div>
                <span className="rounded-md bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards: Kuota Harian Otomatis */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-[26px] border border-zinc-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Total Porsi MBG Hari Ini
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-black text-zinc-950 tracking-tight">
              {totalPortion.toLocaleString("id-ID")}
            </span>
            <span className="font-mono text-xs text-zinc-500 font-bold">porsi anak</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Terdistribusi ke {activeDapur.posyanduSasaran.length} Posyandu</span>
            <span className="font-bold text-emerald-600">Kapasitas: {activeDapur.kapasitasHarian}</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[26px] border-2 border-[#7866FF]/40 bg-gradient-to-br from-[#F3F0FF] to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#7866FF]">
              Paket B Â· Protein Hewani Ganda
            </span>
            <span className="rounded-full bg-[#7866FF] px-2 py-0.5 font-mono text-[9px] font-black text-white">
              STUNTING & FALTERING
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-black text-[#24135E] tracking-tight">
              {activePortionB.toLocaleString("id-ID")}
            </span>
            <span className="font-mono text-xs text-[#7866FF] font-bold">
              porsi ({Math.round((activePortionB / totalPortion) * 100)}%)
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-zinc-600">
            Telur Ayam Blitar + Lele Segar Lamongan + Hati Ayam Kampung (Anti-Anemia).
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[26px] border border-zinc-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Paket A Â· Menu Reguler Balita
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-700">
              GIZI SEIMBANG
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-4xl font-black text-zinc-950 tracking-tight">
              {activePortionA.toLocaleString("id-ID")}
            </span>
            <span className="font-mono text-xs text-zinc-500 font-bold">
              porsi ({Math.round((activePortionA / totalPortion) * 100)}%)
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-zinc-600">
            Standar AKG harian balita sehat Jawa Timur berbasis bahan segar lokal.
          </p>
        </div>
      </div>

      {/* PEMANTAUAN KONFIRMASI PENERIMAAN MBG DARI POSYANDU */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
                Pemantauan Konfirmasi Penerimaan Paket oleh Posyandu
              </h3>
            </div>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              Data real-time: Saat posyandu mencentang penerimaan, status langsung terbarui di dapur SPPG.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold block">Telah Diterima</span>
              <span className="font-sans text-sm font-black text-emerald-700">
                {persenDiterima}% ({totalDiterimaCount || 4}/{totalAnakSampel} Anak Terpantau)
              </span>
            </div>
            <div className="h-10 w-24 rounded-full bg-zinc-100 overflow-hidden p-1 flex items-center">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${persenDiterima}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Per Posyandu Binaan */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-bold text-xs text-zinc-900">Posyandu Mawar 01 (Bilaporah)</span>
              <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5">
                âœ“ Lengkap (100%)
              </span>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">
              Paket A: 12 porsi Â· Paket B: 3 porsi (Ahmad Fauzi & 2 lainnya)
            </p>
            <span className="font-mono text-[10px] text-emerald-700 font-medium block mt-2">
              Diterima pkl 11:15 WIB oleh Kader Mawar
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-bold text-xs text-zinc-900">Posyandu Melati 01 (Dakiring)</span>
              <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5">
                âœ“ Lengkap (100%)
              </span>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">
              Paket A: 14 porsi Â· Paket B: 2 porsi
            </p>
            <span className="font-mono text-[10px] text-emerald-700 font-medium block mt-2">
              Diterima pkl 11:20 WIB oleh Kader Melati
            </span>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-bold text-xs text-zinc-900">Posyandu Dahlia 01 (Jaddih)</span>
              <span className="rounded-md bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-2 py-0.5">
                â³ Dalam Pengiriman
              </span>
            </div>
            <p className="font-mono text-[11px] text-zinc-600">
              Paket A: 10 porsi Â· Paket B: 4 porsi
            </p>
            <span className="font-mono text-[10px] text-amber-700 font-medium block mt-2">
              Kurir Dapur sedang menuju Balai Dusun
            </span>
          </div>
        </div>
      </div>

      {/* Kalkulator Kebutuhan Bahan Baku Harian Otomatis */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
              Kalkulasi Kebutuhan Bahan Baku Harian Dapur
            </h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Dihitung otomatis: Gramasi Resep Standar Gizi Ã— Kuota Balita Hari Ini
            </p>
          </div>
          <span className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            94% Rantai Pasok Petani & Peternak Lokal Jatim
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <span className="font-mono text-[10px] uppercase font-bold text-amber-800 block">
              Telur Ayam Blitar
            </span>
            <span className="font-sans text-2xl font-black text-amber-950 block mt-1">
              {kgTelur} kg
            </span>
            <span className="font-mono text-[10px] text-amber-700 mt-1 block">
              ~{activePortionB.toLocaleString("id-ID")} butir (Koperasi Blitar)
            </span>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
            <span className="font-mono text-[10px] uppercase font-bold text-[#032D30] block">
              Fillet Lele Lamongan
            </span>
            <span className="font-sans text-2xl font-black text-[#032D30] block mt-1">
              {kgLele} kg
            </span>
            <span className="font-mono text-[10px] text-[#0A7680] mt-1 block">
              Segar dari Gapoktan Mina Makmur
            </span>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
            <span className="font-mono text-[10px] uppercase font-bold text-rose-800 block">
              Hati Ayam Kampung
            </span>
            <span className="font-sans text-2xl font-black text-rose-950 block mt-1">
              {kgHatiAyam} kg
            </span>
            <span className="font-mono text-[10px] text-rose-700 mt-1 block">
              Zat Besi & Pencegah Anemia
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 block">
              Daun Kelor Organik
            </span>
            <span className="font-sans text-2xl font-black text-emerald-950 block mt-1">
              {ikatKelor} Ikat
            </span>
            <span className="font-mono text-[10px] text-emerald-700 mt-1 block">
              Petani Sayur Malang & Pasuruan
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-600 block">
              Beras Pulen Lokal
            </span>
            <span className="font-sans text-2xl font-black text-zinc-950 block mt-1">
              {kgBeras} kg
            </span>
            <span className="font-mono text-[10px] text-zinc-500 mt-1 block">
              Gapoktan Lumbung Padi
            </span>
          </div>
        </div>
      </div>

      {/* Katalog Resep MPASI Lokal Jatim */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
              Katalog Resep MPASI Lokal Jatim
            </h3>
            <div className="flex rounded-xl border border-zinc-200 bg-white p-1 text-[11px] font-bold">
              {(["semua", "Paket B", "Paket A"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                    activeFilter === filter ? "bg-[#18140B] text-white" : "text-zinc-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRecipes.map((r) => {
              const active = selectedRecipe.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecipe(r)}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition-all ${
                    active
                      ? "border-[#7866FF] bg-[#F3F0FF]/50 shadow-md ring-2 ring-[#7866FF]/20"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-black uppercase ${
                        r.tipePaket.includes("Paket B")
                          ? "bg-[#7866FF] text-white"
                          : "bg-zinc-200 text-zinc-800"
                      }`}
                    >
                      {r.tipePaket}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-zinc-500">
                      Target: {r.kelompokUsia}
                    </span>
                  </div>
                  <h4 className="font-sans font-black text-sm text-zinc-950">{r.namaMenu}</h4>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500 line-clamp-1">
                    Bahan Utama: {r.komoditasLokal}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Resep Terpilih */}
        <div className="lg:col-span-7">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md bg-purple-100 text-[#7866FF] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase">
                  {selectedRecipe.tipePaket}
                </span>
                <h3 className="font-sans text-xl font-black text-zinc-950 mt-1">
                  {selectedRecipe.namaMenu}
                </h3>
                <p className="font-mono text-xs text-zinc-500 mt-0.5">
                  Sasaran: {selectedRecipe.kelompokUsia} Â· Basis: {selectedRecipe.komoditasLokal}
                </p>
              </div>

              <span className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs font-bold text-zinc-800">
                Resep Standar Dinkes Jatim
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 rounded-2xl bg-zinc-50 p-4 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Energi</span>
                <strong className="text-sm font-black text-zinc-900">{selectedRecipe.kaloriKcal}</strong> kcal
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Protein Hewani</span>
                <strong className="text-sm font-black text-[#7866FF]">{selectedRecipe.proteinGram}g</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Lemak Baik</span>
                <strong className="text-sm font-black text-zinc-900">{selectedRecipe.lemakGram}g</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Zat Besi</span>
                <strong className="text-sm font-black text-rose-600">{selectedRecipe.zatBesiMg}mg</strong>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-sans text-xs font-black uppercase tracking-wider text-zinc-900">
                Formulasi Bahan Baku Per Porsi Balita:
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedRecipe.gramasiBahan.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-zinc-700">{b.bahan}</span>
                    <span className="font-mono font-bold text-zinc-950">{b.gram} gram</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
              <h5 className="font-sans text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                <span>ðŸ’¡</span> Petunjuk Pengolahan & Penyajian Dapur:
              </h5>
              <p className="font-sans text-xs text-amber-900 leading-relaxed">
                {selectedRecipe.instruksiMasak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Label Pengiriman Kotak MBG */}
      <AnimatePresence>
        {printLabelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-7 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="font-sans text-xl font-black uppercase text-zinc-950">
                    Label Identitas Pengiriman Kotak MBG
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Dapur: {activeDapur.namaDapur} Â· Siap Cetak untuk Wadah Pangan Anak
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintLabelModal(false)}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  âœ•
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {activeDapur.posyanduSasaran.slice(0, 6).map((pos, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border-2 border-dashed border-zinc-300 p-4 bg-zinc-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] font-bold text-zinc-400">
                          BATCH KOTAK #{idx + 1}
                        </span>
                        <span className="rounded-md bg-[#7866FF] px-2 py-0.5 font-mono text-[9px] font-black text-white">
                          PAKET B PROTEIN GANDA
                        </span>
                      </div>
                      <h5 className="font-sans font-black text-zinc-950 text-sm">
                        {pos}
                      </h5>
                      <p className="font-mono text-[10px] text-zinc-500 mt-1">
                        Menu: Telur Blitar + Puree Lele Lamongan + Daun Kelor
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                      <span>Dapur: {activeDapur.namaDapur.split(" ")[2] || "SPPG"}</span>
                      <span className="font-bold text-emerald-700">Status: Disiapkan</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <span className="font-mono text-xs text-zinc-500">
                  Total Label: {activeDapur.kuotaPaketB + activeDapur.kuotaPaketA} Lembar
                </span>
                <button
                  type="button"
                  onClick={() => {
                    alert("Label pengiriman berhasil dicetak ke printer stiker dapur!");
                    setPrintLabelModal(false);
                  }}
                  className="rounded-full bg-[#18140B] px-6 py-3 font-sans text-xs font-black text-white shadow-lg hover:scale-105 transition-transform"
                >
                  ðŸ–¨ï¸ Cetak Lembar Label Pengiriman
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Log Pembelian Peternak / Gapoktan */}
      <AnimatePresence>
        {showSupplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              data-lenis-prevent="true"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-7 shadow-2xl space-y-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="font-sans text-xl font-black uppercase text-zinc-950">
                    Log Pembelian Komoditas Peternak & Gapoktan Lokal
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Transparansi Rantai Pasok Pangan Lokal Jawa Timur Tanpa Perantara
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSupplyModal(false)}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  âœ•
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-600">
                    <tr>
                      <th className="py-3 px-4">No. Transaksi</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Mitra Pemasok</th>
                      <th className="py-3 px-4">Komoditas Pangan</th>
                      <th className="py-3 px-4">Volume</th>
                      <th className="py-3 px-4">Total Biaya</th>
                      <th className="py-3 px-4">Status Mutu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {SUPPLY_LOGS_MOCK.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">{s.id}</td>
                        <td className="py-3 px-4 font-mono text-zinc-500">{s.tanggal}</td>
                        <td className="py-3 px-4 font-bold text-zinc-900">
                          {s.pemasok}
                          <span className="block font-mono text-[10px] text-zinc-400 font-normal">
                            {s.lokasi}
                          </span>
                        </td>
                        <td className="py-3 px-4">{s.komoditas}</td>
                        <td className="py-3 px-4 font-mono font-bold">{s.volumeKg} kg</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-700">
                          Rp {s.hargaTotalRp.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {s.statusMutu}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-100 pt-4">
                <span className="font-mono text-xs text-zinc-500">
                  Total Serapan Anggaran Pangan Lokal: Rp 20.470.000 / Siklus
                </span>
                <button
                  type="button"
                  onClick={() => setShowSupplyModal(false)}
                  className="rounded-full bg-[#18140B] px-5 py-2.5 font-sans text-xs font-black text-white hover:scale-105 transition-transform"
                >
                  Tutup Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
