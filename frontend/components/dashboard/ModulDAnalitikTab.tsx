"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REGIONS_JATIM_DATA, RON_COHORT_DATA, type JatimRegionData } from "@/lib/app-data";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

export default function ModulDAnalitikTab() {
  const [selectedRegion, setSelectedRegion] = useState<JatimRegionData>(REGIONS_JATIM_DATA[0]);
  const [hoveredRegion, setHoveredRegion] = useState<JatimRegionData | null>(null);
  const [filterCategory, setFilterCategory] = useState<"semua" | "merah" | "kuning" | "hijau">("semua");
  const [selectedZona, setSelectedZona] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"peta" | "tabel">("peta");
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showHeatGlow, setShowHeatGlow] = useState<boolean>(true);
  const [showTopography, setShowTopography] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "xlsx">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  // Zoom preset per zona wilayah
  const handleSelectZonaZoom = (z: string) => {
    setSelectedZona(z);
    if (z === "Madura") {
      setZoomLevel(1.55);
      setPanPosition({ x: -210, y: 110 });
    } else if (z === "Tapal Kuda") {
      setZoomLevel(1.45);
      setPanPosition({ x: -230, y: -60 });
    } else if (z === "Surabaya Raya") {
      setZoomLevel(1.7);
      setPanPosition({ x: -140, y: -25 });
    } else if (z === "Mataraman") {
      setZoomLevel(1.4);
      setPanPosition({ x: 130, y: -60 });
    } else if (z === "Malang Raya") {
      setZoomLevel(1.6);
      setPanPosition({ x: -60, y: -90 });
    } else if (z === "Pantura") {
      setZoomLevel(1.5);
      setPanPosition({ x: 70, y: 60 });
    } else {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setSelectedZona("semua");
  };

  // Filter daftar wilayah
  const filteredRegions = useMemo(() => {
    return REGIONS_JATIM_DATA.filter((r) => {
      // Filter Kategori
      if (filterCategory === "merah" && !r.kategori.includes("Merah")) return false;
      if (filterCategory === "kuning" && !r.kategori.includes("Kuning")) return false;
      if (filterCategory === "hijau" && !r.kategori.includes("Hijau")) return false;

      // Filter Zona Wilayah
      if (selectedZona !== "semua" && r.wilayahZona !== selectedZona) return false;

      // Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.nama.toLowerCase().includes(q);
        const matchShort = (r.namaSingkat || "").toLowerCase().includes(q);
        const matchZone = (r.wilayahZona || "").toLowerCase().includes(q);
        if (!matchName && !matchShort && !matchZone) return false;
      }

      return true;
    });
  }, [filterCategory, selectedZona, searchQuery]);

  // Statistik Ringkasan Jawa Timur
  const totalBalitaJatim = useMemo(
    () => REGIONS_JATIM_DATA.reduce((acc, r) => acc + r.totalBalita, 0),
    []
  );
  const totalPaketBJatim = useMemo(
    () => REGIONS_JATIM_DATA.reduce((acc, r) => acc + r.porsiPaketB, 0),
    []
  );
  const avgPrevalensiJatim = useMemo(() => {
    const sum = REGIONS_JATIM_DATA.reduce((acc, r) => acc + r.prevalensiPersen, 0);
    return (sum / REGIONS_JATIM_DATA.length).toFixed(1);
  }, []);

  const countMerah = useMemo(
    () => REGIONS_JATIM_DATA.filter((r) => r.prevalensiPersen >= 20).length,
    []
  );
  const countKuning = useMemo(
    () => REGIONS_JATIM_DATA.filter((r) => r.prevalensiPersen >= 14 && r.prevalensiPersen < 20).length,
    []
  );
  const countHijau = useMemo(
    () => REGIONS_JATIM_DATA.filter((r) => r.prevalensiPersen < 14).length,
    []
  );

  // State Modal Cetak Dokumen Eksekutif
  const [printReportData, setPrintReportData] = useState<{
    instansi: string;
    subInstansi?: string;
    alamatInstansi?: string;
    judulLaporan: string;
    nomorSurat: string;
    wilayah: string;
    tanggalLaporan: string;
    penanggungJawab: { nama: string; jabatan: string; nip?: string };
    summaryItems?: LaporanSummaryItem[];
    columns: LaporanColumn[];
    data: any[];
    catatanKhusus?: string;
    filenameCsv?: string;
  } | null>(null);

  const handlePrintDinkesReport = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const totalBalitaJatim = REGIONS_JATIM_DATA.reduce((sum, r) => sum + r.totalBalita, 0);
    const avgPrevalensi = (
      REGIONS_JATIM_DATA.reduce((sum, r) => sum + r.prevalensiPersen, 0) / REGIONS_JATIM_DATA.length
    ).toFixed(1);

    setPrintReportData({
      instansi: "KEMENTERIAN KESEHATAN RI · PEMERINTAH PROVINSI JAWA TIMUR",
      subInstansi: "DINAS KESEHATAN PROVINSI · SATGAS PERCEPATAN PENURUNAN STUNTING (TPPS)",
      alamatInstansi: "Jl. Ahmad Yani No. 118, Gayungan, Kota Surabaya · Portal Geospasial Stunting Jatim",
      judulLaporan: "LAPORAN EKSEKUTIF PREVALENSI STUNTING & INTERVENSI MBG 38 KABUPATEN/KOTA",
      nomorSurat: `440/LAP-STUNTING-JTM/XI/${new Date().getFullYear()}`,
      wilayah: "Provinsi Jawa Timur (38 Kabupaten/Kota)",
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. Erwin Astha Triyono, Sp.PD, K-PTI, FINASIM",
        jabatan: "Kepala Dinas Kesehatan Provinsi Jawa Timur",
        nip: "19680315 199703 1 003",
      },
      summaryItems: [
        { label: "Cakupan Wilayah", value: "38 Kab / Kota", subtext: "100% Terintegrasi" },
        { label: "Rata-Rata Prevalensi", value: `${avgPrevalensi}%`, subtext: "Target Nasional: 14%" },
        { label: "Zona Merah (≥20%)", value: `${countMerah} Daerah`, subtext: "Prioritas Intervensi" },
        { label: "Zona Hijau (<14%)", value: `${countHijau} Daerah`, subtext: "Target Tercapai" },
      ],
      columns: [
        { header: "Kabupaten / Kota", key: "name" },
        { header: "Zona Wilayah", key: "zona" },
        { header: "Prevalensi (%)", key: "prevalensiStr", align: "center" },
        { header: "Kategori Risiko", key: "kategoriStr", align: "center" },
        { header: "Balita Terpantau", key: "balitaCountStr", align: "center" },
        { header: "Balita Faltering / MBG B", key: "falteringStr", align: "center" },
        { header: "Status Program MBG", key: "sppgMitra" },
      ],
      data: REGIONS_JATIM_DATA.map((r) => ({
        name: r.nama,
        zona: r.wilayahZona || "Jawa Timur",
        prevalensiStr: `${r.prevalensiPersen}%`,
        kategoriStr: r.kategori,
        balitaCountStr: `${r.totalBalita.toLocaleString("id-ID")} Anak`,
        falteringStr: `${r.balitaFaltering.toLocaleString("id-ID")} Anak`,
        sppgMitra: r.statusProgram,
      })),
      catatanKhusus:
        "Laporan eksekutif ini disusun berdasarkan data penimbangan riil terintegrasi dari seluruh faskes puskesmas dan posyandu desa se-Jawa Timur untuk penyelarasan alokasi Program Makan Bergizi Gratis (MBG) Nasional.",
      filenameCsv: "laporan-eksekutif-stunting-jatim-38-kabkota.csv",
    });
  };

  const handleSimulateExport = () => {
    handlePrintDinkesReport();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Info & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#38E8F5] animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Modul D: Analitik Dampak & Dasbor Pimpinan Daerah
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Dinas Kesehatan Provinsi Jawa Timur · TPID & Bappeda · Evaluasi Siklus 30/60/90 Hari
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintDinkesReport}
          className="rounded-2xl bg-[#18140B] px-5 py-2.5 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#38E8F5]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>🖨️ Cetak / Ekspor Laporan Prevalensi Jatim (38 Kab/Kota)</span>
        </button>
      </div>

      {/* SKPL-F12: PETA GEOSPASIAL INTERAKTIF STUNTING JAWA TIMUR (38 KAB/KOTA) */}
      <div className="rounded-[32px] border-2 border-zinc-200/90 bg-white p-5 lg:p-7 shadow-sm space-y-6">
        {/* Top Title & Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider">
                Peta Geospasial Interaktif
              </span>
              <span className="font-mono text-xs text-zinc-500 font-bold">
                SKPL-F12 · 38 Kabupaten / Kota se-Jatim
              </span>
            </div>
            <h3 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950 mt-1">
              Peta Sebaran Prevalensi Stunting & Alokasi MBG Jawa Timur
            </h3>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              Klik titik kabupaten/kota pada peta untuk menginspeksi rincian prevalensi, balita faltering, dan kuota dapur SPPG.
            </p>
          </div>

          {/* Toggle View: Peta vs Tabel */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode("peta")}
              className={`rounded-xl px-3.5 py-1.5 font-sans text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "peta"
                  ? "bg-[#18140B] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <span>🗺️</span>
              <span>Peta Interaktif Jatim</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tabel")}
              className={`rounded-xl px-3.5 py-1.5 font-sans text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "tabel"
                  ? "bg-[#18140B] text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <span>📋</span>
              <span>Daftar 38 Kab/Kota</span>
            </button>
          </div>
        </div>

        {/* Baris Ringkasan Statistik Provinsi Jawa Timur */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Rata-Rata Prevalensi Jatim</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-zinc-950">{avgPrevalensiJatim}%</span>
              <span className="text-[10px] text-zinc-500">Target: &lt;14%</span>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5">
            <span className="text-[10px] text-rose-800 font-bold uppercase block">🔴 Prioritas Merah (&gt;20%)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-rose-700">{countMerah}</span>
              <span className="text-[10px] text-rose-600 font-semibold">Kabupaten</span>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5">
            <span className="text-[10px] text-amber-800 font-bold uppercase block">🟡 Waspada (14–20%)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-amber-700">{countKuning}</span>
              <span className="text-[10px] text-amber-600 font-semibold">Daerah</span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">🟢 Terkendali (&lt;14%)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-emerald-700">{countHijau}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Daerah</span>
            </div>
          </div>
        </div>

        {/* Filter Pills, Pencarian & Kontrol Peta */}
        <div className="space-y-3 pt-1">
          {/* Baris Spektrum Prevalensi Interaktif (Bisa Diklik untuk Filter) */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
              <span className="font-bold text-zinc-700 flex items-center gap-1.5">
                <span>📊</span>
                <span>Distribusi Sebaran 38 Kab/Kota Jawa Timur:</span>
              </span>
              <span className="text-zinc-500 text-[11px]">
                Klik segmen warna untuk menyaring tampilan peta
              </span>
            </div>

            {/* Progress Segment Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-zinc-200 cursor-pointer">
              <div
                onClick={() => setFilterCategory(filterCategory === "hijau" ? "semua" : "hijau")}
                style={{ width: `${(countHijau / 38) * 100}%` }}
                className={`h-full bg-emerald-500 hover:bg-emerald-600 transition-all flex items-center justify-center text-[10px] font-mono font-black text-white ${
                  filterCategory === "hijau" ? "ring-2 ring-white scale-y-110" : ""
                }`}
                title={`Terkendali: ${countHijau} Kab/Kota (<14%)`}
              >
                {countHijau} Hijau (&lt;14%)
              </div>
              <div
                onClick={() => setFilterCategory(filterCategory === "kuning" ? "semua" : "kuning")}
                style={{ width: `${(countKuning / 38) * 100}%` }}
                className={`h-full bg-amber-500 hover:bg-amber-600 transition-all flex items-center justify-center text-[10px] font-mono font-black text-white ${
                  filterCategory === "kuning" ? "ring-2 ring-white scale-y-110" : ""
                }`}
                title={`Waspada: ${countKuning} Kab/Kota (14-20%)`}
              >
                {countKuning} Kuning (14-20%)
              </div>
              <div
                onClick={() => setFilterCategory(filterCategory === "merah" ? "semua" : "merah")}
                style={{ width: `${(countMerah / 38) * 100}%` }}
                className={`h-full bg-rose-600 hover:bg-rose-700 transition-all flex items-center justify-center text-[10px] font-mono font-black text-white ${
                  filterCategory === "merah" ? "ring-2 ring-white scale-y-110" : ""
                }`}
                title={`Prioritas Merah: ${countMerah} Kab/Kota (>20%)`}
              >
                {countMerah} Merah (&gt;20%)
              </div>
            </div>
          </div>

          {/* Baris Kontrol Toolbar Peta */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filter Kategori Prevalensi */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "semua", label: "Semua Kategori (38)" },
                { key: "merah", label: `🔴 Prioritas Merah (${countMerah})` },
                { key: "kuning", label: `🟡 Waspada (${countKuning})` },
                { key: "hijau", label: `🟢 Terkendali (${countHijau})` },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterCategory(f.key as any)}
                  className={`rounded-xl px-3 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    filterCategory === f.key
                      ? "bg-[#18140B] text-white shadow-sm ring-2 ring-zinc-900/10"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Input Pencarian Kab/Kota */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Kab / Kota di Jatim..."
                className="h-10 w-full rounded-xl border border-zinc-300 bg-zinc-50 pl-8 pr-3 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/30"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-zinc-400">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-zinc-400 hover:text-zinc-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Baris Pintasan Zona & Fitur Layer Peta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 text-xs font-mono">
            {/* Pintasan Zona Fokus (Auto-Zoom) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-zinc-400 text-[11px] font-bold mr-1">🎯 Fokus Zona:</span>
              {[
                { key: "semua", label: "Seluruh Jatim" },
                { key: "Madura", label: "Pulau Madura" },
                { key: "Surabaya Raya", label: "Surabaya Raya" },
                { key: "Pantura", label: "Pantura Barat" },
                { key: "Mataraman", label: "Mataraman" },
                { key: "Malang Raya", label: "Malang Raya" },
                { key: "Tapal Kuda", label: "Tapal Kuda" },
              ].map((z) => (
                <button
                  key={z.key}
                  type="button"
                  onClick={() => handleSelectZonaZoom(z.key)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    selectedZona === z.key
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            {/* Kontrol Layer & Tema Tampilan Peta */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tema Peta: Dark vs Light */}
              <button
                type="button"
                onClick={() => setMapTheme(mapTheme === "dark" ? "light" : "dark")}
                className="rounded-xl border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-800 shadow-2xs hover:bg-zinc-50 cursor-pointer flex items-center gap-1.5"
                title="Beralih antara tema gelap (Command Center) dan tema kartografi terang"
              >
                <span>{mapTheme === "dark" ? "🌙 Dark Command" : "☀️ Kartografi Terang"}</span>
              </button>

              {/* Toggle Heat Radiance */}
              <button
                type="button"
                onClick={() => setShowHeatGlow(!showHeatGlow)}
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  showHeatGlow
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-zinc-300 bg-white text-zinc-500"
                }`}
                title="Aktifkan / nonaktifkan kilau zona panas (heatmap radiance)"
              >
                <span>🔥</span>
                <span>Radiance</span>
              </button>

              {/* Toggle Angka Prevalensi */}
              <button
                type="button"
                onClick={() => setShowNumbers(!showNumbers)}
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  showNumbers
                    ? "border-sky-300 bg-sky-50 text-sky-800"
                    : "border-zinc-300 bg-white text-zinc-500"
                }`}
                title="Tampilkan label angka persentase stunting langsung di atas titik"
              >
                <span>%</span>
                <span>Angka</span>
              </button>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-0.5 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.2))}
                  className="h-6 w-6 rounded-lg bg-white text-xs font-black text-zinc-800 shadow-2xs hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                  title="Perbesar Peta"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.85))}
                  className="h-6 w-6 rounded-lg bg-white text-xs font-black text-zinc-800 shadow-2xs hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                  title="Perkecil Peta"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 h-6 rounded-lg bg-white text-[10px] font-bold text-zinc-600 shadow-2xs hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                  title="Reset Posisi & Zoom"
                >
                  ⟲
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAMPILAN 1: PETA INTERAKTIF JAWA TIMUR (VIEWPORT VECTOR MAP) */}
        {/* ========================================================================= */}
        {viewMode === "peta" && (
          <div
            className={`relative overflow-hidden rounded-[28px] border-2 transition-colors duration-500 ${
              mapTheme === "dark"
                ? "border-slate-800 bg-gradient-to-br from-[#070A12] via-[#0F172A] to-[#030712] shadow-2xl"
                : "border-zinc-200/90 bg-gradient-to-b from-[#EBF8FB]/60 via-[#F5FCFD]/40 to-white shadow-inner"
            }`}
          >
            {/* Legend & Watermark */}
            <div
              className={`absolute top-4 left-4 z-10 hidden sm:flex flex-col gap-1.5 p-3.5 rounded-2xl border shadow-lg font-mono text-[10px] backdrop-blur-md transition-colors ${
                mapTheme === "dark"
                  ? "bg-slate-900/80 border-slate-700/80 text-slate-200"
                  : "bg-white/90 border-zinc-200 text-zinc-700"
              }`}
            >
              <div
                className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  mapTheme === "dark" ? "text-cyan-400" : "text-zinc-900"
                }`}
              >
                <span>📍</span>
                <span>Indeks Prevalensi Stunting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-600 shadow-xs ring-2 ring-rose-400/30" />
                <span>&gt; 20% (Prioritas Intervensi Merah)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500 shadow-xs ring-2 ring-amber-400/30" />
                <span>14% – 20% (Waspada Pertumbuhan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600 shadow-xs ring-2 ring-emerald-400/30" />
                <span>&lt; 14% (Terkendali / Sesuai Target)</span>
              </div>
            </div>

            {/* Arah Mata Angin (Kompas) */}
            <div
              className={`absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[10px] backdrop-blur-sm ${
                mapTheme === "dark"
                  ? "bg-slate-900/80 border-slate-700/70 text-slate-400"
                  : "bg-white/80 border-zinc-200 text-zinc-500"
              }`}
            >
              <span className={`font-black ${mapTheme === "dark" ? "text-cyan-400" : "text-zinc-900"}`}>🧭 UTARA</span>
              <span>· Provinsi Jawa Timur</span>
              <span>· 38 Daerah Administratif</span>
            </div>

            {/* Status Zoom Saat Ini */}
            {zoomLevel !== 1 && (
              <div
                className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-xl border font-mono text-[10px] backdrop-blur-sm ${
                  mapTheme === "dark"
                    ? "bg-slate-900/80 border-cyan-500/50 text-cyan-300"
                    : "bg-white/80 border-emerald-300 text-emerald-800 font-bold"
                }`}
              >
                🔍 Zoom: {Math.round(zoomLevel * 100)}% · {selectedZona}
              </div>
            )}

            {/* SVG Interactive Canvas */}
            <div className="relative w-full aspect-[920/460] min-h-[400px] md:min-h-[500px]">
              <svg
                viewBox="0 0 920 460"
                className="w-full h-full select-none"
                style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.06))" }}
              >
                <defs>
                  {/* Gradien Daratan Jawa Timur (Light Mode) */}
                  <linearGradient id="jatimMainlandLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ECFDF5" />
                    <stop offset="50%" stopColor="#D1FAE5" />
                    <stop offset="100%" stopColor="#A7F3D0" />
                  </linearGradient>

                  {/* Gradien Daratan Jawa Timur (Dark Command Mode) */}
                  <linearGradient id="jatimMainlandDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="50%" stopColor="#0F172A" />
                    <stop offset="100%" stopColor="#0A0F1D" />
                  </linearGradient>

                  {/* Gradien Pulau Madura (Light Mode) */}
                  <linearGradient id="maduraIslandLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF2F2" />
                    <stop offset="50%" stopColor="#FEE2E2" />
                    <stop offset="100%" stopColor="#FECACA" />
                  </linearGradient>

                  {/* Gradien Pulau Madura (Dark Mode) */}
                  <linearGradient id="maduraIslandDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2A121E" />
                    <stop offset="50%" stopColor="#1C0D17" />
                    <stop offset="100%" stopColor="#140810" />
                  </linearGradient>

                  {/* Soft Radial Heat Radiance Gradient (Merah) */}
                  <radialGradient id="heatRedGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#E11D48" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
                  </radialGradient>

                  {/* Soft Radial Heat Radiance Gradient (Kuning) */}
                  <radialGradient id="heatAmberGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>

                  {/* Soft Radial Heat Radiance Gradient (Hijau) */}
                  <radialGradient id="heatGreenGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#10B981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>

                  {/* Filter Glow saat Hover/Aktif */}
                  <filter id="activeGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#38E8F5" floodOpacity="0.75" />
                  </filter>
                  <filter id="neonPulseGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#E11D48" floodOpacity="0.7" />
                  </filter>
                </defs>

                {/* Kontainer Transform Zoom & Pan */}
                <g
                  transform={`translate(${panPosition.x}, ${panPosition.y}) scale(${zoomLevel})`}
                  style={{
                    transformOrigin: "460px 230px",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Garis Grid Kartografi Faint */}
                  <g
                    stroke={mapTheme === "dark" ? "#1E293B" : "#94A3B8"}
                    strokeWidth="0.8"
                    strokeDasharray="4 6"
                    opacity={mapTheme === "dark" ? "0.4" : "0.25"}
                  >
                    <line x1="80" y1="20" x2="80" y2="440" />
                    <line x1="220" y1="20" x2="220" y2="440" />
                    <line x1="360" y1="20" x2="360" y2="440" />
                    <line x1="500" y1="20" x2="500" y2="440" />
                    <line x1="640" y1="20" x2="640" y2="440" />
                    <line x1="780" y1="20" x2="780" y2="440" />
                    <line x1="20" y1="80" x2="900" y2="80" />
                    <line x1="20" y1="180" x2="900" y2="180" />
                    <line x1="20" y1="280" x2="900" y2="280" />
                    <line x1="20" y1="380" x2="900" y2="380" />
                  </g>

                  {/* Label Lautan Sekitar Jawa Timur */}
                  <g
                    fill={mapTheme === "dark" ? "#38E8F5" : "#0284C7"}
                    opacity={mapTheme === "dark" ? "0.45" : "0.35"}
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="bold"
                    letterSpacing="3"
                  >
                    <text x="280" y="45">LAUT JAWA</text>
                    <text x="560" y="145">SELAT MADURA</text>
                    <text x="795" y="220">SELAT BALI</text>
                    <text x="320" y="425">SAMUDRA HINDIA</text>
                  </g>

                  {/* LAYER RADIANCE HEATMAP (ZONA PANAS GLOW) */}
                  {showHeatGlow && (
                    <g opacity={mapTheme === "dark" ? 0.9 : 0.75}>
                      {/* Madura Hotspot Glow */}
                      <circle cx="620" cy="90" r="110" fill="url(#heatRedGlow)" />
                      {/* Tapal Kuda Hotspot Glow */}
                      <circle cx="650" cy="240" r="120" fill="url(#heatRedGlow)" />
                      {/* Southern Pacitan Hotspot */}
                      <circle cx="140" cy="340" r="75" fill="url(#heatRedGlow)" />
                      {/* Mataraman Warm Glow */}
                      <circle cx="240" cy="240" r="110" fill="url(#heatAmberGlow)" />
                      {/* Pantura Warm Glow */}
                      <circle cx="310" cy="110" r="95" fill="url(#heatAmberGlow)" />
                      {/* Surabaya & Sidoarjo Cool Green Glow */}
                      <circle cx="470" cy="170" r="80" fill="url(#heatGreenGlow)" />
                      {/* Malang Cool Green Glow */}
                      <circle cx="400" cy="265" r="75" fill="url(#heatGreenGlow)" />
                    </g>
                  )}

                  {/* SILUET PULAU BAWEAN (GRESIK - UTARA LAUT JAWA) */}
                  <g>
                    <ellipse
                      cx="380"
                      cy="32"
                      rx="16"
                      ry="10"
                      fill={mapTheme === "dark" ? "#1E293B" : "#D1FAE5"}
                      stroke={mapTheme === "dark" ? "#38E8F5" : "#10B981"}
                      strokeWidth="1.5"
                    />
                    <text
                      x="380"
                      y="48"
                      textAnchor="middle"
                      fill={mapTheme === "dark" ? "#94A3B8" : "#047857"}
                      fontFamily="monospace"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      P. Bawean
                    </text>
                  </g>

                  {/* SILUET DARATAN JAWA TIMUR (MAINLAND) DENGAN KONTUR REALISTIK */}
                  <path
                    d="M 60 215 C 75 165 110 135 160 135 C 210 135 240 85 270 75 C 320 75 350 95 400 105 C 440 110 460 135 480 160 C 490 190 520 195 555 185 C 590 175 640 160 680 155 C 720 160 740 210 765 245 C 785 270 790 300 765 315 C 730 330 670 295 620 305 C 570 315 540 335 480 330 C 430 345 370 355 310 345 C 250 345 200 340 160 340 C 130 340 110 300 120 260 C 120 230 70 240 60 215 Z"
                    fill={mapTheme === "dark" ? "url(#jatimMainlandDark)" : "url(#jatimMainlandLight)"}
                    stroke={mapTheme === "dark" ? "#38E8F5" : "#10B981"}
                    strokeWidth={mapTheme === "dark" ? "2.4" : "2"}
                    strokeLinejoin="round"
                    filter={mapTheme === "dark" ? "drop-shadow(0 0 10px rgba(56,232,245,0.25))" : undefined}
                  />

                  {/* SEMENANJUNG BLAMBANGAN (ALAS PURWO - UJUNG TENGGARA BANYUWANGI) */}
                  <path
                    d="M 765 315 C 785 325 805 340 810 360 C 805 375 780 370 765 355 C 755 345 750 330 765 315 Z"
                    fill={mapTheme === "dark" ? "url(#jatimMainlandDark)" : "url(#jatimMainlandLight)"}
                    stroke={mapTheme === "dark" ? "#38E8F5" : "#10B981"}
                    strokeWidth="1.8"
                  />
                  <text
                    x="815"
                    y="370"
                    fill={mapTheme === "dark" ? "#64748B" : "#047857"}
                    fontFamily="monospace"
                    fontSize="7.5"
                    fontWeight="bold"
                  >
                    Semenanjung Blambangan
                  </text>

                  {/* SILUET PULAU MADURA */}
                  <path
                    d="M 465 95 C 480 75 540 70 610 72 C 670 72 740 68 775 80 C 785 92 770 105 730 110 C 660 115 580 110 520 112 C 485 110 460 105 465 95 Z"
                    fill={mapTheme === "dark" ? "url(#maduraIslandDark)" : "url(#maduraIslandLight)"}
                    stroke={mapTheme === "dark" ? "#F43F5E" : "#E11D48"}
                    strokeWidth={mapTheme === "dark" ? "2.4" : "2"}
                    strokeLinejoin="round"
                    filter={mapTheme === "dark" ? "drop-shadow(0 0 12px rgba(244,63,94,0.3))" : undefined}
                  />

                  {/* KEPULAUAN SUMENEP (KANGEAN, SAPUDI, RAAS, SAPEKEN) */}
                  <g
                    fill={mapTheme === "dark" ? "#2A121E" : "#FEE2E2"}
                    stroke={mapTheme === "dark" ? "#F43F5E" : "#E11D48"}
                    strokeWidth="1.5"
                  >
                    <ellipse cx="820" cy="88" rx="20" ry="10" />
                    <ellipse cx="860" cy="95" rx="14" ry="7" />
                    <ellipse cx="795" cy="115" rx="9" ry="6" />
                    <ellipse cx="885" cy="88" rx="8" ry="5" />
                  </g>
                  <text
                    x="825"
                    y="115"
                    fill={mapTheme === "dark" ? "#FDA4AF" : "#BE123C"}
                    fontFamily="monospace"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Kep. Kangean &amp; Sapudi
                  </text>

                  {/* IKON GUNUNG & TOPOGRAFI UTAMA JAWA TIMUR */}
                  {showTopography && (
                    <g
                      fill={mapTheme === "dark" ? "#E2E8F0" : "#475569"}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      opacity={mapTheme === "dark" ? 0.75 : 0.6}
                    >
                      {/* G. Semeru */}
                      <g transform="translate(515, 305)">
                        <polygon points="0,-9 7,4 -7,4" fill={mapTheme === "dark" ? "#F43F5E" : "#94A3B8"} />
                        <text x="9" y="1" fill={mapTheme === "dark" ? "#FDA4AF" : "#334155"}>G. Semeru (3.676m)</text>
                      </g>
                      {/* G. Bromo */}
                      <g transform="translate(535, 260)">
                        <polygon points="0,-7 5,3 -5,3" fill={mapTheme === "dark" ? "#F59E0B" : "#94A3B8"} />
                        <text x="8" y="1">Bromo</text>
                      </g>
                      {/* G. Arjuno-Welirang */}
                      <g transform="translate(435, 235)">
                        <polygon points="0,-7 5,3 -5,3" fill={mapTheme === "dark" ? "#10B981" : "#94A3B8"} />
                        <text x="7" y="1">Arjuno</text>
                      </g>
                      {/* G. Ijen - Raung */}
                      <g transform="translate(710, 240)">
                        <polygon points="0,-8 6,3 -6,3" fill={mapTheme === "dark" ? "#F43F5E" : "#94A3B8"} />
                        <text x="8" y="1">G. Raung-Ijen</text>
                      </g>
                      {/* G. Kelud */}
                      <g transform="translate(340, 275)">
                        <polygon points="0,-7 5,3 -5,3" fill={mapTheme === "dark" ? "#F59E0B" : "#94A3B8"} />
                        <text x="7" y="1">Kelud</text>
                      </g>
                      {/* G. Lawu */}
                      <g transform="translate(100, 195)">
                        <polygon points="0,-8 6,3 -6,3" fill={mapTheme === "dark" ? "#10B981" : "#94A3B8"} />
                        <text x="8" y="1">G. Lawu</text>
                      </g>
                    </g>
                  )}

                  {/* ================================================================= */}
                  {/* 38 TITIK KABUPATEN / KOTA DENGAN ANGKA PREVALENSI INTERAKTIF */}
                  {/* ================================================================= */}
                  {REGIONS_JATIM_DATA.map((region) => {
                    const isSelected = selectedRegion.nama === region.nama;
                    const isHovered = hoveredRegion?.nama === region.nama;
                    const isMatchFilter = filteredRegions.some((r) => r.nama === region.nama);

                    const isRed = region.prevalensiPersen >= 20;
                    const isYellow = region.prevalensiPersen >= 14 && region.prevalensiPersen < 20;

                    // Dimmed jika tidak masuk filter aktif
                    const opacity = isMatchFilter ? 1 : 0.2;

                    // Warna Badge Pin
                    const badgeBg = isRed
                      ? mapTheme === "dark" ? "#E11D48" : "#E11D48"
                      : isYellow
                      ? mapTheme === "dark" ? "#D97706" : "#F59E0B"
                      : mapTheme === "dark" ? "#059669" : "#059669";

                    const badgeBorder = isSelected
                      ? "#38E8F5"
                      : isRed
                      ? "#FDA4AF"
                      : isYellow
                      ? "#FDE68A"
                      : "#A7F3D0";

                    return (
                      <g
                        key={region.nama}
                        transform={`translate(${region.x}, ${region.y})`}
                        opacity={opacity}
                        onClick={() => setSelectedRegion(region)}
                        onMouseEnter={() => setHoveredRegion(region)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className="cursor-pointer transition-all duration-200"
                        filter={isSelected ? "url(#activeGlow)" : undefined}
                      >
                        {/* Pulse Ring Berulang untuk Daerah Prioritas Merah (>20%) */}
                        {isRed && (
                          <>
                            <circle
                              cx="0"
                              cy="0"
                              r="16"
                              fill="none"
                              stroke="#F43F5E"
                              strokeWidth="1.8"
                              opacity="0.55"
                              className="animate-ping origin-center"
                            />
                            <circle
                              cx="0"
                              cy="0"
                              r="8"
                              fill="#E11D48"
                              opacity="0.3"
                            />
                          </>
                        )}

                        {/* Halo Bidik / Targeting Reticle Saat Daerah Dipilih */}
                        {isSelected && (
                          <>
                            <circle
                              cx="0"
                              cy="0"
                              r="20"
                              fill="none"
                              stroke="#38E8F5"
                              strokeWidth="3"
                              strokeDasharray="5 3"
                              className="animate-spin"
                            />
                            <circle
                              cx="0"
                              cy="0"
                              r="28"
                              fill="none"
                              stroke="#38E8F5"
                              strokeWidth="1"
                              opacity="0.4"
                            />
                            {/* Garis Bidik Silang */}
                            <line x1="-24" y1="0" x2="-14" y2="0" stroke="#38E8F5" strokeWidth="2" />
                            <line x1="14" y1="0" x2="24" y2="0" stroke="#38E8F5" strokeWidth="2" />
                            <line x1="0" y1="-24" x2="0" y2="-14" stroke="#38E8F5" strokeWidth="2" />
                            <line x1="0" y1="14" x2="0" y2="24" stroke="#38E8F5" strokeWidth="2" />
                          </>
                        )}

                        {/* Anchor Dot Pusat Daerah */}
                        <circle
                          cx="0"
                          cy="0"
                          r={isSelected ? 6 : 4.5}
                          fill={isSelected ? "#38E8F5" : badgeBg}
                          stroke="#FFFFFF"
                          strokeWidth={isSelected ? 2 : 1.5}
                        />

                        {/* BADGE INTERAKTIF DENGAN ANGKA PREVALENSI */}
                        {showNumbers ? (
                          <g
                            transform={`translate(-36, ${isSelected ? -34 : isHovered ? -32 : -27}) scale(${
                              isSelected ? 1.08 : isHovered ? 1.05 : 1
                            })`}
                            style={{
                              transformOrigin: "36px 14px",
                              transition: "transform 0.18s ease-out",
                            }}
                          >
                            {/* Background Container Pill */}
                            <rect
                              x="0"
                              y="0"
                              width="72"
                              height="22"
                              rx="11"
                              fill={badgeBg}
                              stroke={badgeBorder}
                              strokeWidth={isSelected ? 2.5 : 1.2}
                              filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))"
                            />

                            {/* Label Nama Singkat Kab/Kota */}
                            <text
                              x="7"
                              y="14"
                              fill="#FFFFFF"
                              fontFamily="sans-serif"
                              fontSize="9.5"
                              fontWeight="900"
                              letterSpacing="0.2"
                            >
                              {(region.namaSingkat || region.nama.replace("Kab. ", "").replace("Kota ", "")).slice(0, 7)}
                            </text>

                            {/* Kotak Angka Persentase di Kanan */}
                            <rect
                              x="42"
                              y="2"
                              width="28"
                              height="18"
                              rx="9"
                              fill="#000000"
                              opacity={0.9}
                            />
                            <text
                              x="56"
                              y="14.5"
                              textAnchor="middle"
                              fill="#38E8F5"
                              fontFamily="monospace"
                              fontSize="9.5"
                              fontWeight="900"
                            >
                              {region.prevalensiPersen}%
                            </text>
                          </g>
                        ) : (
                          // Tampilan Minimalis (Jika Mode Angka Dimatikan)
                          <g transform="translate(7, -8)">
                            <text
                              x="0"
                              y="0"
                              fill={mapTheme === "dark" ? "#F8FAFC" : "#0F172A"}
                              fontFamily="sans-serif"
                              fontSize="10"
                              fontWeight="800"
                            >
                              {region.namaSingkat}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* LIVE TOOLTIP HUD FLOATING KETIKA HOVER DAERAH */}
            {hoveredRegion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute bottom-4 right-4 z-20 w-80 rounded-2xl border-2 p-4 shadow-2xl font-mono text-xs space-y-2.5 pointer-events-none backdrop-blur-xl transition-all ${
                  mapTheme === "dark"
                    ? "border-cyan-500/70 bg-slate-900/95 text-slate-200"
                    : "border-zinc-900 bg-white/95 text-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between border-b border-zinc-500/20 pb-2">
                  <div>
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">
                      Zona: {hoveredRegion.wilayahZona || "Jawa Timur"}
                    </span>
                    <strong className="font-sans font-black text-base">
                      {hoveredRegion.nama}
                    </strong>
                  </div>
                  <span
                    className={`rounded-xl px-2.5 py-1 text-xs font-black text-white shadow-xs ${
                      hoveredRegion.prevalensiPersen >= 20
                        ? "bg-rose-600 ring-2 ring-rose-400/40"
                        : hoveredRegion.prevalensiPersen >= 14
                        ? "bg-amber-500 ring-2 ring-amber-400/40"
                        : "bg-emerald-600 ring-2 ring-emerald-400/40"
                    }`}
                  >
                    {hoveredRegion.prevalensiPersen}%
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Balita Terdata:</span>
                    <strong className="font-sans">{hoveredRegion.totalBalita.toLocaleString("id-ID")} anak</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Balita Growth Faltering:</span>
                    <strong className="text-rose-500 font-black">{hoveredRegion.balitaFaltering.toLocaleString("id-ID")} anak</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Alokasi Ransum MBG (Paket B):</span>
                    <strong className="text-[#38E8F5] font-black">{hoveredRegion.porsiPaketB.toLocaleString("id-ID")} porsi/hari</strong>
                  </div>
                </div>

                <div className="pt-2 text-[10px] border-t border-zinc-500/20 flex items-center justify-between font-bold">
                  <span className="text-emerald-400 truncate max-w-[200px]">
                    🍲 {hoveredRegion.statusProgram}
                  </span>
                  <span className="text-zinc-400">Klik untuk kunci</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAMPILAN 2: TABEL & KARTU 38 WILAYAH (OPSIONAL / VIEWMODE TABEL) */}
        {/* ========================================================================= */}
        {viewMode === "tabel" && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredRegions.map((region) => {
              const active = selectedRegion.nama === region.nama;
              const isRed = region.prevalensiPersen >= 20;
              const isYellow = region.prevalensiPersen >= 14 && region.prevalensiPersen < 20;

              return (
                <div
                  key={region.nama}
                  onClick={() => setSelectedRegion(region)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all hover:scale-[1.02] ${
                    active
                      ? "border-[#38E8F5] bg-[#EBFBFC]/70 ring-2 ring-[#38E8F5]/40 shadow-md"
                      : isRed
                      ? "border-rose-200 bg-rose-50/40 hover:bg-rose-50/70"
                      : isYellow
                      ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50/70"
                      : "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-sans font-black text-sm text-zinc-950">
                      {region.nama}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black text-white ${
                        isRed ? "bg-rose-600" : isYellow ? "bg-amber-500" : "bg-emerald-600"
                      }`}
                    >
                      {region.prevalensiPersen}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 space-y-0.5">
                    <div>Balita: {region.totalBalita.toLocaleString("id-ID")}</div>
                    <div>Paket B: <strong className="text-zinc-900">{region.porsiPaketB.toLocaleString("id-ID")} porsi</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETAIL PANEL KABUPATEN / KOTA TERPILIH */}
        {selectedRegion && (
          <div className="rounded-3xl border-2 border-[#18140B] bg-gradient-to-br from-zinc-50 via-white to-zinc-50/80 p-5 lg:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    DETAIL WILAYAH DIPILIH DARI PETA
                  </span>
                  {selectedRegion.wilayahZona && (
                    <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-700">
                      Zona: {selectedRegion.wilayahZona}
                    </span>
                  )}
                </div>
                <h4 className="font-sans text-2xl font-black text-zinc-950 mt-0.5 flex items-center gap-2">
                  <span>📍</span>
                  <span>{selectedRegion.nama}</span>
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-2xs ${
                    selectedRegion.prevalensiPersen >= 20
                      ? "bg-rose-600 text-white"
                      : selectedRegion.prevalensiPersen >= 14
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  Prevalensi Stunting: {selectedRegion.prevalensiPersen}%
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  ({selectedRegion.kategori})
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1 font-mono text-xs">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
                <span className="text-zinc-500 block text-[10px]">Total Balita Terdata</span>
                <span className="text-xl font-black text-zinc-950 mt-0.5 block">
                  {selectedRegion.totalBalita.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-zinc-400">Sasaran Posyandu se-wilayah</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
                <span className="text-zinc-500 block text-[10px]">Balita Faltering / Waspada</span>
                <span className="text-xl font-black text-rose-600 mt-0.5 block">
                  {selectedRegion.balitaFaltering.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-rose-600/80">Kenaikan BB di bawah kurva hijau</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs">
                <span className="text-zinc-500 block text-[10px]">Alokasi Kuota Paket B</span>
                <span className="text-xl font-black text-[#7866FF] mt-0.5 block">
                  {selectedRegion.porsiPaketB.toLocaleString("id-ID")} porsi
                </span>
                <span className="text-[10px] text-purple-700/80">Dobel Protein Hewani (Telur+Lele)</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-zinc-500 block text-[10px]">Status Program SPPG</span>
                <span className="text-xs font-black text-emerald-800 mt-1 block">
                  {selectedRegion.statusProgram}
                </span>
                <span className="text-[10px] text-emerald-700/80">Rantai pasok peternak lokal</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SKPL-F13: Return on Nutrition (RoN) Tracker */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm space-y-6">
        <div className="border-b border-zinc-100 pb-4">
          <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
            Return on Nutrition (RoN) Tracker · Siklus 30, 60, dan 90 Hari
          </h3>
          <p className="font-mono text-[11px] text-zinc-500">
            SKPL-F13 · Koreksi Kenaikan Z-Score vs Konsumsi Paket MBG Presisi Terverifikasi
          </p>
        </div>

        {/* 3 Kohort Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {RON_COHORT_DATA.map((cohort, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#18140B] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-white">
                  {cohort.siklus}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  {cohort.statusAudit}
                </span>
              </div>

              <div className="pt-2">
                <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold block">
                  Kenaikan Z-Score Rata-Rata (ΔZ)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-3xl font-black text-emerald-600 tracking-tight">
                    +{cohort.deltaZTBU} SD
                  </span>
                  <span className="font-mono text-xs text-zinc-500 font-bold">Tinggi Badan</span>
                </div>
                <div className="font-mono text-xs text-zinc-600 mt-1">
                  Berat Badan: <strong>+{cohort.deltaZBBU} SD</strong>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Balita Kohort:</span>
                  <span className="font-bold text-zinc-900">{cohort.balitaKohort.toLocaleString("id-ID")} anak</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tingkat Pemulihan:</span>
                  <span className="font-bold text-emerald-600">{cohort.recoveryRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kepatuhan Konsumsi:</span>
                  <span className="font-bold text-[#7866FF]">{cohort.porsiDihabiskan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-600 leading-relaxed">
          <strong>Catatan Metodologi:</strong> Nilai Return on Nutrition (RoN) dihitung dari korelasi peningkatan Z-score anak penerima Paket B berurutan dengan tingkat konsumsi &ge; 90% porsi habis. Laporan siap diaudit dan diintegrasikan ke SIPD Pemprov Jawa Timur.
        </div>
      </div>

      {/* Modal Ekspor Laporan Audit Resmi (SKPL-F14) */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              data-lenis-prevent="true"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-7 shadow-2xl space-y-6 custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="font-sans text-xl font-black uppercase text-zinc-950">
                    Ekspor Laporan Audit NutriTrack
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    SKPL-F14 · Dokumen Resmi Rekapitulasi MBG & Prevalensi Stunting
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Official Letterhead Sample Preview */}
              <div className="rounded-2xl border-2 border-zinc-200 bg-zinc-50 p-5 space-y-3 text-center">
                <div className="text-xs font-mono font-bold uppercase text-zinc-800">
                  PEMERINTAH PROVINSI JAWA TIMUR<br />
                  DINAS KESEHATAN & TIM PERCEPATAN PENURUNAN STUNTING (TPPS)
                </div>
                <div className="h-0.5 w-full bg-zinc-300" />
                <h5 className="font-sans text-sm font-black text-zinc-900 uppercase">
                  LAPORAN AUDIT PREVALENSI STUNTING & EFISIENSI MBG LOKAL TAHUN 2026
                </h5>
                <p className="font-mono text-[10px] text-zinc-500">
                  Cakupan: 38 Kabupaten/Kota · 14.250 Balita Terpantau · Rantai Pasok Gapoktan
                </p>
              </div>

              {/* Format Selection */}
              <div>
                <span className="block font-mono text-xs font-bold uppercase text-zinc-600 mb-2">
                  Pilih Format Berkas:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat("pdf")}
                    className={`rounded-2xl border-2 p-3 text-center transition-all ${
                      exportFormat === "pdf"
                        ? "border-[#18140B] bg-zinc-100 font-black shadow-sm"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <span className="text-2xl block mb-1">📄</span>
                    <span className="font-sans text-xs font-black">PDF Berkop Resmi</span>
                    <span className="font-mono text-[10px] text-zinc-500 block">Siap Cetak & Presentasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("xlsx")}
                    className={`rounded-2xl border-2 p-3 text-center transition-all ${
                      exportFormat === "xlsx"
                        ? "border-emerald-600 bg-emerald-50 font-black shadow-sm"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <span className="text-2xl block mb-1">📊</span>
                    <span className="font-sans text-xs font-black text-emerald-950">Excel Data Mentah</span>
                    <span className="font-mono text-[10px] text-emerald-700 block">Audit BPKP & TPID</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <span className="font-mono text-[11px] text-zinc-400">
                  Data otomatis di-anonymize sesuai ketentuan UU No. 27/2022 (PDP).
                </span>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleSimulateExport}
                  className="rounded-full bg-[#18140B] px-6 py-2.5 font-sans text-xs font-black text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isExporting ? "Membuat Berkas..." : `Unduh ${exportFormat.toUpperCase()}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cetak Laporan Eksekutif Stunting Jatim (Format Kemenkes RI) */}
      {printReportData && (
        <CetakLaporanModal
          {...printReportData}
          isOpen={!!printReportData}
          onClose={() => setPrintReportData(null)}
        />
      )}
    </div>
  );
}

