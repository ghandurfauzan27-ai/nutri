"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LaporanColumn {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  render?: (val: any, row: any, index: number) => React.ReactNode;
}

export interface LaporanSummaryItem {
  label: string;
  value: string | number;
  subtext?: string;
}

export interface CetakLaporanProps {
  isOpen: boolean;
  onClose: () => void;
  instansi: string; // misal: "DINAS KESEHATAN PROVINSI JAWA TIMUR" atau "PUSKESMAS SOCAH" atau "POSYANDU MAWAR 01"
  subInstansi?: string; // misal: "SATUAN TUGAS PERCEPATAN PENURUNAN STUNTING (TPPS)"
  alamatInstansi?: string;
  judulLaporan: string;
  nomorSurat: string;
  wilayah: string;
  tanggalLaporan: string;
  penanggungJawab: {
    nama: string;
    jabatan: string;
    nip?: string;
  };
  summaryItems?: LaporanSummaryItem[];
  columns: LaporanColumn[];
  data: any[];
  catatanKhusus?: string;
  filenameCsv?: string;
}

export default function CetakLaporanModal({
  isOpen,
  onClose,
  instansi,
  subInstansi,
  alamatInstansi,
  judulLaporan,
  nomorSurat,
  wilayah,
  tanggalLaporan,
  penanggungJawab,
  summaryItems = [],
  columns,
  data,
  catatanKhusus,
  filenameCsv = "laporan-nutritrack.csv",
}: CetakLaporanProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Tutup dengan tombol Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadCsv = () => {
    setIsExportingCsv(true);
    try {
      const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
      const rows = data.map((item, index) => {
        return columns
          .map((col) => {
            const rawVal = item[col.key];
            const cleanVal =
              rawVal !== undefined && rawVal !== null
                ? String(rawVal).replace(/"/g, '""')
                : "";
            return `"${cleanVal}"`;
          })
          .join(",");
      });

      const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filenameCsv);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop (disembunyikan saat print via CSS .no-print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs no-print"
        />

        {/* Modal Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl z-10 custom-scrollbar border border-zinc-200"
        >
          {/* Action Toolbar Atas (No-Print) */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-zinc-50/95 backdrop-blur-md px-6 py-3.5 no-print">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#18140B] text-[#38E8F5] text-xs font-mono font-black">
                🖨️
              </span>
              <div>
                <h4 className="font-sans text-xs font-black uppercase tracking-tight text-zinc-950">
                  Pratinjau Dokumen Laporan Resmi
                </h4>
                <p className="font-mono text-[10px] text-zinc-500">
                  Siap Dicetak / Disimpan sebagai PDF Standar Kemenkes RI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={isExportingCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors shadow-2xs"
              >
                <span>📥</span>
                <span>{isExportingCsv ? "Mengekspor..." : "Unduh CSV / Excel"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#18140B] px-4 py-1.5 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs"
              >
                <span>🖨️</span>
                <span>Cetak Dokumen Sekarang</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-200/70 text-zinc-600 hover:bg-zinc-300 transition-colors"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* DOKUMEN CETAK UTAMA (Class: printable-document) */}
          <div className="printable-document p-6 sm:p-10 font-sans text-zinc-950 space-y-6">
            {/* KOP SURAT RESMI */}
            <div className="border-b-2 border-zinc-900 pb-3 text-center space-y-1">
              <div className="flex items-center justify-between gap-4">
                <div className="h-14 w-14 shrink-0 grid place-items-center rounded-xl border border-zinc-300 bg-zinc-50 text-xl font-bold font-mono">
                  🏥
                </div>
                <div className="flex-1">
                  <h2 className="font-sans text-base sm:text-lg font-black uppercase tracking-wider text-zinc-900">
                    {instansi}
                  </h2>
                  {subInstansi && (
                    <h3 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-800">
                      {subInstansi}
                    </h3>
                  )}
                  <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                    {alamatInstansi || "Sistem Presisi NutriTrack Jawa Timur · Portal Terpadu Intervensi Gizi & MBG"}
                  </p>
                </div>
                <div className="h-14 w-14 shrink-0 grid place-items-center rounded-xl border border-zinc-300 bg-zinc-50 text-xl font-bold font-mono">
                  🇮🇩
                </div>
              </div>
              <div className="mt-2 border-t border-zinc-400 pt-0.5" />
            </div>

            {/* JUDUL LAPORAN & NOMOR RESMI */}
            <div className="text-center space-y-1 pt-1">
              <h3 className="font-sans text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950">
                {judulLaporan}
              </h3>
              <p className="font-mono text-xs font-bold text-zinc-700">
                Nomor Register: <u>{nomorSurat}</u>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-zinc-600 pt-1">
                <span>📍 Wilayah: <strong>{wilayah}</strong></span>
                <span>•</span>
                <span>📅 Periode: <strong>{tanggalLaporan}</strong></span>
                <span>•</span>
                <span>Standar: <strong>Permenkes No. 2/2020 & WHO Growth Standard</strong></span>
              </div>
            </div>

            {/* RINGKASAN METRIK / INDIKATOR (JIKA ADA) */}
            {summaryItems && summaryItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {summaryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-300 bg-zinc-50/80 p-3 text-center"
                  >
                    <span className="font-mono text-[9px] uppercase font-bold text-zinc-500 block">
                      {item.label}
                    </span>
                    <span className="font-sans text-lg font-black text-zinc-900 block mt-0.5">
                      {item.value}
                    </span>
                    {item.subtext && (
                      <span className="font-mono text-[10px] text-zinc-600 block mt-0.5">
                        {item.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TABEL DATA RINCI */}
            <div className="overflow-x-auto rounded-xl border border-zinc-300">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-zinc-100 border-b border-zinc-300 font-mono text-[10px] uppercase text-zinc-700">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">No</th>
                    {columns.map((col, cIdx) => (
                      <th
                        key={cIdx}
                        className={`py-2.5 px-3 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-900">
                  {data && data.length > 0 ? (
                    data.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-3 font-mono text-center text-zinc-500 text-[11px]">
                          {rIdx + 1}
                        </td>
                        {columns.map((col, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 ${
                              col.align === "center"
                                ? "text-center"
                                : col.align === "right"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {col.render
                              ? col.render(row[col.key], row, rIdx)
                              : row[col.key] !== undefined && row[col.key] !== null
                              ? String(row[col.key])
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="py-6 text-center text-zinc-400 font-mono text-xs"
                      >
                        Tidak ada data untuk dicetak.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CATATAN RESMI */}
            {catatanKhusus && (
              <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3.5 text-xs font-mono space-y-1">
                <span className="font-bold uppercase text-zinc-700">Catatan Klinis / Arahan Petugas:</span>
                <p className="text-zinc-600 leading-relaxed">{catatanKhusus}</p>
              </div>
            )}

            {/* LEMBAR PENGESAHAN & TANDA TANGAN */}
            <div className="pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs font-sans">
              <div>
                <p className="font-mono text-zinc-500 text-[11px]">
                  Dicetak secara digital melalui:
                </p>
                <p className="font-bold text-zinc-900 mt-0.5">
                  NutriTrack Jawa Timur (Portal Terpadu MBG & Stunting)
                </p>
                <p className="font-mono text-[10px] text-zinc-400 mt-1">
                  Integritas Data Terverifikasi Dinas Kesehatan Prov. Jatim
                </p>
              </div>

              <div className="text-right space-y-1">
                <p className="font-mono text-zinc-600 text-[11px]">
                  {wilayah.split(",")[0].trim()}, {tanggalLaporan}
                </p>
                <p className="font-bold text-zinc-900">
                  {penanggungJawab.jabatan}
                </p>
                <div className="h-14" /> {/* Ruang tanda tangan */}
                <p className="font-black text-zinc-950 underline decoration-zinc-400 underline-offset-4">
                  {penanggungJawab.nama}
                </p>
                {penanggungJawab.nip && (
                  <p className="font-mono text-[10px] text-zinc-500">
                    NIP: {penanggungJawab.nip}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
