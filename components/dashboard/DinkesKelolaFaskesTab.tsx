"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MASTER_PUSKESMAS_ACCOUNTS,
  MASTER_SPPG_ACCOUNTS,
  MASTER_POSYANDU_ACCOUNTS,
  jatimRegions,
  type PredefinedAccount,
} from "@/lib/auth-data";
import {
  MASTER_DAPUR_MBG,
  KECAMATAN_PER_KABUPATEN,
  DESA_PER_KECAMATAN,
  getPuskesmasNameByKecamatan,
  getClosestSppgForWilayah,
  type DapurMbgWilayah,
} from "@/lib/puskesmas-data";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

export default function DinkesKelolaFaskesTab() {
  const [activeSubTab, setActiveSubTab] = useState<"puskesmas" | "sppg" | "direktori">("puskesmas");
  const [toastMessage, setToastMessage] = useState("");

  // State Modal Cetak Dokumen Direktori Faskes
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

  // --- STATE PUSKESMAS BARU ---
  const [namaPuskesmas, setNamaPuskesmas] = useState("");
  const [kabupatenPuskesmas, setKabupatenPuskesmas] = useState("Kab. Bangkalan");
  const [kecamatanPuskesmas, setKecamatanPuskesmas] = useState("Modung");
  const [kodeFaskes, setKodeFaskes] = useState("P3526010107");
  const [kepalaPuskesmas, setKepalaPuskesmas] = useState("dr. H. Ahmad Zaki, M.Kes");
  const [nutrisionisPuskesmas, setNutrisionisPuskesmas] = useState("Rina Rahmawati, S.Gz");
  const [alamatPuskesmas, setAlamatPuskesmas] = useState("Jl. Raya Modung No. 12, Bangkalan");
  const [teleponPuskesmas, setTeleponPuskesmas] = useState("(031) 3099881");
  const [customPuskesmasList, setCustomPuskesmasList] = useState<PredefinedAccount[]>([]);

  // --- STATE SPPG BARU ---
  const [namaSppg, setNamaSppg] = useState("");
  const [kabupatenSppg, setKabupatenSppg] = useState("Kab. Bangkalan");
  const [kecamatanSppg, setKecamatanSppg] = useState("Modung, Blega");
  const [pengelolaSppg, setPengelolaSppg] = useState("H. Mochammad Idris, S.T");
  const [ahliGiziSppg, setAhliGiziSppg] = useState("Nurul Aisyah, S.Gz");
  const [alamatSppg, setAlamatSppg] = useState("Jl. Sentra Pangan No. 8, Modung, Bangkalan");
  const [kontakSppg, setKontakSppg] = useState("081234991122");
  const [kapasitasSppg, setKapasitasSppg] = useState(600);
  const [customSppgList, setCustomSppgList] = useState<PredefinedAccount[]>([]);

  // --- STATE POSYANDU TERDAFTAR (DARI REGISTRASI) ---
  const [registeredPosyandu, setRegisteredPosyandu] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("Semua");

  // Load custom data from localStorage
  const loadCustomData = () => {
    try {
      if (typeof window !== "undefined") {
        const rawPuskesmas = localStorage.getItem("nt_registered_puskesmas");
        if (rawPuskesmas) {
          setCustomPuskesmasList(JSON.parse(rawPuskesmas));
        }

        const rawSppg = localStorage.getItem("nt_registered_sppg");
        if (rawSppg) {
          setCustomSppgList(JSON.parse(rawSppg));
        }

        const rawPosyandu = localStorage.getItem("nt_registered_posyandu");
        if (rawPosyandu) {
          setRegisteredPosyandu(JSON.parse(rawPosyandu));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadCustomData();
    window.addEventListener("nt_posyandu_registered", loadCustomData);
    window.addEventListener("nt_puskesmas_registered", loadCustomData);
    window.addEventListener("nt_sppg_registered", loadCustomData);
    return () => {
      window.removeEventListener("nt_posyandu_registered", loadCustomData);
      window.removeEventListener("nt_puskesmas_registered", loadCustomData);
      window.removeEventListener("nt_sppg_registered", loadCustomData);
    };
  }, []);

  // Update email otomatis saat kecamatan berubah
  const emailPuskesmasOtomatis = `puskesmas.${(kecamatanPuskesmas || "faskes").toLowerCase().replace(/[^a-z0-9]/g, "")}@jatim.go.id`;
  const emailSppgOtomatis = `sppg.${(namaSppg || "dapur").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14)}@jatim.go.id`;

  // Submit Registrasi Puskesmas Baru
  const handleRegisterPuskesmas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPuskesmas.trim()) {
      alert("Nama Puskesmas wajib diisi.");
      return;
    }

    const newAcc: PredefinedAccount = {
      role: "puskesmas",
      email: emailPuskesmasOtomatis,
      name: `${kepalaPuskesmas} (Kepala Faskes)`,
      unit: namaPuskesmas,
      wilayah: `Kecamatan ${kecamatanPuskesmas}, ${kabupatenPuskesmas}`,
      faskesCode: kodeFaskes,
      passwordDefault: "Password123!",
      noHp: teleponPuskesmas,
    };

    const updated = [newAcc, ...customPuskesmasList];
    setCustomPuskesmasList(updated);
    try {
      localStorage.setItem("nt_registered_puskesmas", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_puskesmas_registered"));
    } catch (err) {}

    setToastMessage(`✓ Sukses! ${namaPuskesmas} berhasil didaftarkan dan diotorisasi resmi.`);
    setTimeout(() => setToastMessage(""), 4500);

    // Reset form
    setNamaPuskesmas("");
    setKecamatanPuskesmas("");
  };

  // Submit Registrasi Dapur SPPG Baru
  const handleRegisterSppg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSppg.trim()) {
      alert("Nama Sentra Dapur SPPG wajib diisi.");
      return;
    }

    const generatedId = `SPPG-JTM-${Date.now().toString().slice(-4)}`;
    const newAcc: PredefinedAccount = {
      role: "dapur",
      email: emailSppgOtomatis,
      name: `${pengelolaSppg} (Kepala Dapur)`,
      unit: namaSppg,
      wilayah: `Wilayah Layanan: Kec. ${kecamatanSppg}, ${kabupatenSppg}`,
      kabupaten: kabupatenSppg,
      sppgId: generatedId,
      statusOperasional: "Aktif Beroperasi",
      kapasitasHarian: Number(kapasitasSppg) || 500,
      passwordDefault: "Password123!",
      ahliGizi: ahliGiziSppg,
      noHp: kontakSppg,
    };

    const updated = [newAcc, ...customSppgList];
    setCustomSppgList(updated);
    try {
      localStorage.setItem("nt_registered_sppg", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_sppg_registered"));
    } catch (err) {}

    setToastMessage(`✓ Sukses! Sentra ${namaSppg} berhasil didaftarkan. Siap menerima alokasi order MBG.`);
    setTimeout(() => setToastMessage(""), 4500);

    // Reset form
    setNamaSppg("");
    setKecamatanSppg("");
  };

  // Gabungan List Puskesmas
  const allPuskesmas = [...customPuskesmasList, ...MASTER_PUSKESMAS_ACCOUNTS];
  // Gabungan List SPPG
  const allSppg = [...customSppgList, ...MASTER_SPPG_ACCOUNTS];
  // Gabungan List Posyandu
  const allPosyandu = [
    ...registeredPosyandu.map((rp) => ({
      role: "posyandu" as const,
      email: rp.emailAkun,
      name: rp.kaderPenanggungJawab,
      unit: rp.posyandu,
      wilayah: `${rp.desa}, Kec. ${rp.kecamatan} (${rp.kabupaten})`,
      puskesmasPembina: rp.puskesmas,
      sppgDituju: rp.sppgDituju,
      passwordDefault: "Password123!",
      isNew: true,
    })),
    ...MASTER_POSYANDU_ACCOUNTS,
  ];

  // Filtering
  const filteredPuskesmas = allPuskesmas.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQ = p.unit.toLowerCase().includes(q) || p.wilayah.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    const matchKab = filterKabupaten === "Semua" || p.wilayah.includes(filterKabupaten);
    return matchQ && matchKab;
  });

  const filteredSppg = allSppg.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchQ = s.unit.toLowerCase().includes(q) || s.wilayah.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    const matchKab = filterKabupaten === "Semua" || s.wilayah.includes(filterKabupaten);
    return matchQ && matchKab;
  });

  const filteredPosyandu = allPosyandu.filter((pos) => {
    const q = searchQuery.toLowerCase();
    const matchQ = pos.unit.toLowerCase().includes(q) || pos.wilayah.toLowerCase().includes(q) || (pos.puskesmasPembina || "").toLowerCase().includes(q);
    const matchKab = filterKabupaten === "Semua" || pos.wilayah.includes(filterKabupaten);
    return matchQ && matchKab;
  });

  const handlePrintDirektori = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setPrintReportData({
      instansi: "PEMERINTAH PROVINSI JAWA TIMUR · DINAS KESEHATAN PROVINSI",
      subInstansi: "SEKRETARIAT OTORISASI FASKES & SENTRA PELAYANAN PANGAN BERGIZI (SPPG)",
      alamatInstansi: "Jl. Ahmad Yani No. 118, Gayungan, Kota Surabaya · Telp: (031) 8280713",
      judulLaporan: "DIREKTORI RESMI KETERKAITAN FASKES PEMBINA, SENTRA SPPG & POSYANDU DESA",
      nomorSurat: `440/DIR-FASKES/DINKES-JTM/${new Date().getFullYear()}`,
      wilayah: "Provinsi Jawa Timur (38 Kabupaten/Kota)",
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. Erwin Astha Triyono, Sp.PD, K-PTI, FINASIM",
        jabatan: "Kepala Dinas Kesehatan Provinsi Jawa Timur",
        nip: "19680315 199703 1 003",
      },
      summaryItems: [
        { label: "Puskesmas Pembina", value: `${allPuskesmas.length} Faskes`, subtext: "Kecamatan Terlindungi" },
        { label: "Sentra Dapur MBG (SPPG)", value: `${allSppg.length} Unit`, subtext: "Kapasitas Ransum Gizi" },
        { label: "Posyandu Terhubung", value: `${allPosyandu.length} Titik`, subtext: "Otomatisasi Wilayah Terdekat" },
        { label: "Cakupan Daerah", value: "38 Kab / Kota", subtext: "100% Terintegrasi" },
      ],
      columns: [
        { header: "Posyandu Desa", key: "posyanduName" },
        { header: "Kader Penanggung Jawab", key: "kader" },
        { header: "Wilayah Desa & Kecamatan", key: "wilayah" },
        { header: "Puskesmas Pembina Terdekat", key: "puskesmas" },
        { header: "Dapur MBG (SPPG) Penyuplai", key: "sppg" },
        { header: "Email Resmi Faskes", key: "email" },
      ],
      data: allPosyandu.map((pos) => {
        const puskesmas = pos.puskesmasPembina || getPuskesmasNameByKecamatan(pos.wilayah);
        const sppgObj = getClosestSppgForWilayah("Kab. Bangkalan", pos.wilayah);
        const sppg = pos.sppgDituju || sppgObj?.namaDapur || "SPPG Terdekat";
        return {
          posyanduName: pos.unit,
          kader: pos.name,
          wilayah: pos.wilayah,
          puskesmas: puskesmas,
          sppg: sppg,
          email: pos.email,
        };
      }),
      catatanKhusus:
        "Berdasarkan SK Kepala Dinas Kesehatan Provinsi Jawa Timur, seluruh Posyandu desa terhubung secara otomatis ke Puskesmas Pembina di wilayah kecamatannya dan dialokasikan ke Dapur MBG (SPPG) terdekat tanpa konflik yurisdiksi.",
      filenameCsv: "direktori-resmi-faskes-posyandu-sppg-jatim.csv",
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-xl flex items-center gap-2"
          >
            <span>✓</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-[10px] font-black text-sky-800 uppercase">
              <span className="h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
              OTORITAS RESMI DINAS KESEHATAN PROVINSI JAWA TIMUR · SKPL-F14
            </div>
            <h2 className="mt-2 font-sans text-2xl font-black uppercase tracking-tight text-zinc-950">
              Registrasi & Tata Kelola Faskes se-Jawa Timur
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-600 max-w-3xl">
              Sesuai ketentuan sistem: <strong>Pendaftaran publik hanya untuk Posyandu Desa</strong>. Seluruh Puskesmas Pembina dan Sentra Dapur MBG (SPPG) didaftarkan dan diotorisasi secara terpusat oleh Dinas Kesehatan Provinsi Jawa Timur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrintDirektori}
              className="rounded-2xl bg-[#18140B] text-white hover:bg-emerald-600 px-4 py-2 font-sans text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Cetak Direktori Faskes & SPPG</span>
            </button>
            <span className="rounded-2xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 font-mono text-xs font-black text-emerald-950 shadow-xs flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Dinkes Prov. Jatim</span>
            </span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-zinc-100 font-mono">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Puskesmas Terdaftar</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-emerald-950">{allPuskesmas.length}</span>
              <span className="text-xs text-emerald-800 font-bold">Faskes</span>
            </div>
            <span className="text-[10px] text-emerald-700 block mt-1">Menanungi seluruh kecamatan</span>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
            <span className="text-[10px] text-purple-800 font-bold uppercase block">Sentra Dapur MBG (SPPG)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-purple-950">{allSppg.length}</span>
              <span className="text-xs text-purple-800 font-bold">Sentra Dapur</span>
            </div>
            <span className="text-[10px] text-purple-700 block mt-1">Rantai pasok protein lokal</span>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
            <span className="text-[10px] text-sky-800 font-bold uppercase block">Posyandu Desa Terkoneksi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-sky-950">{allPosyandu.length}</span>
              <span className="text-xs text-sky-800 font-bold">Titik Meja Timbang</span>
            </div>
            <span className="text-[10px] text-sky-700 block mt-1">Otomatis terhubung faskes</span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Cakupan Wilayah</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl font-black text-zinc-950">38</span>
              <span className="text-xs text-zinc-600 font-bold">Kabupaten / Kota</span>
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1">100% Terintegrasi Jatim</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigasi */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("puskesmas")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 font-sans text-xs font-black transition-all ${
            activeSubTab === "puskesmas"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🏥</span>
          <span>Daftarkan Puskesmas Pembina</span>
          <span className="rounded-full bg-emerald-500/20 text-emerald-700 px-2 py-0.5 text-[10px] font-mono font-bold">
            {allPuskesmas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("sppg")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 font-sans text-xs font-black transition-all ${
            activeSubTab === "sppg"
              ? "bg-[#7866FF] text-white shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🍲</span>
          <span>Daftarkan Sentra Dapur MBG (SPPG)</span>
          <span className="rounded-full bg-purple-500/20 text-purple-700 px-2 py-0.5 text-[10px] font-mono font-bold">
            {allSppg.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("direktori")}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 font-sans text-xs font-black transition-all ${
            activeSubTab === "direktori"
              ? "bg-[#032D30] text-[#38E8F5] shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>📋</span>
          <span>Direktori Lengkap Keterkaitan Faskes & Posyandu</span>
          <span className="rounded-full bg-sky-500/20 text-sky-800 px-2 py-0.5 text-[10px] font-mono font-bold">
            {allPosyandu.length} Posyandu
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. FORM & DAFTAR PUSKESMAS PEMBINA */}
      {/* ============================================================== */}
      {activeSubTab === "puskesmas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulir Pendaftaran Puskesmas */}
          <div className="lg:col-span-5 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                FORMULIR RESMI DINKES
              </span>
              <h3 className="font-sans text-lg font-black uppercase text-zinc-950 mt-0.5">
                + Daftarkan Puskesmas Baru
              </h3>
              <p className="font-mono text-xs text-zinc-500">
                Puskesmas yang didaftarkan akan otomatis menjadi naungan posyandu desa di kecamatannya.
              </p>
            </div>

            <form onSubmit={handleRegisterPuskesmas} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Nama Puskesmas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Puskesmas Modung"
                  value={namaPuskesmas}
                  onChange={(e) => setNamaPuskesmas(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Kabupaten / Kota *
                  </label>
                  <select
                    value={kabupatenPuskesmas}
                    onChange={(e) => setKabupatenPuskesmas(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                  >
                    {jatimRegions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Kecamatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Modung"
                    value={kecamatanPuskesmas}
                    onChange={(e) => setKecamatanPuskesmas(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Kode Faskes Kemenkes *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="P3526010107"
                    value={kodeFaskes}
                    onChange={(e) => setKodeFaskes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-mono font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    No Telepon Faskes
                  </label>
                  <input
                    type="text"
                    placeholder="(031) 3099881"
                    value={teleponPuskesmas}
                    onChange={(e) => setTeleponPuskesmas(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-sans font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Nama Kepala Puskesmas (Dokter Faskes) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="dr. H. Ahmad Zaki, M.Kes"
                  value={kepalaPuskesmas}
                  onChange={(e) => setKepalaPuskesmas(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Nama Nutrisionis PJ (Ahli Gizi Puskesmas)
                </label>
                <input
                  type="text"
                  placeholder="Rina Rahmawati, S.Gz"
                  value={nutrisionisPuskesmas}
                  onChange={(e) => setNutrisionisPuskesmas(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Alamat Lengkap Faskes *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Raya Modung No. 12, Bangkalan"
                  value={alamatPuskesmas}
                  onChange={(e) => setAlamatPuskesmas(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Preview Kredensial Login Otomatis */}
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 space-y-1 font-mono text-[11px]">
                <div className="font-bold text-emerald-950">🔑 Akun Login Terbit Otomatis:</div>
                <div className="text-emerald-900">Email: <strong className="font-mono">{emailPuskesmasOtomatis}</strong></div>
                <div className="text-emerald-900">Password Default: <strong className="font-mono">Password123!</strong></div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 font-sans text-xs font-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                + Otorisasi & Daftarkan Puskesmas Resmi
              </button>
            </form>
          </div>

          {/* Tabel / Daftar Puskesmas Terdaftar */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-sans text-base font-black uppercase text-zinc-950">
                  Daftar Puskesmas Pembina se-Jatim ({allPuskesmas.length})
                </h3>
                <p className="font-mono text-xs text-zinc-500">
                  Faskes primer yang menaungi posyandu desa dan menerbitkan PO MBG.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari puskesmas / kecamatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-sans text-xs font-bold text-zinc-900 outline-none"
                />
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {filteredPuskesmas.map((p, idx) => (
                <div
                  key={p.email + idx}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-emerald-300 transition-all shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {p.faskesCode || "Faskes Jatim"}
                      </span>
                      <h4 className="font-sans font-black text-xs text-zinc-950">{p.unit}</h4>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-600">
                      📍 {p.wilayah} · Kepala: <strong>{p.name}</strong>
                    </p>
                    <p className="font-mono text-[10px] text-emerald-800">
                      Email Login: <code className="font-bold">{p.email}</code> · PW: <code>Password123!</code>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-2 py-0.5">
                      ● Aktif Beroperasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. FORM & DAFTAR SENTRA DAPUR MBG (SPPG) */}
      {/* ============================================================== */}
      {activeSubTab === "sppg" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulir Pendaftaran SPPG */}
          <div className="lg:col-span-5 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <span className="font-mono text-[10px] uppercase font-bold text-purple-800 tracking-wider">
                FORMULIR RESMI DINKES
              </span>
              <h3 className="font-sans text-lg font-black uppercase text-zinc-950 mt-0.5">
                + Daftarkan Sentra Dapur MBG (SPPG) Baru
              </h3>
              <p className="font-mono text-xs text-zinc-500">
                Sentra dapur yang memproduksi dan mendistribusikan ransum Paket A & Paket B.
              </p>
            </div>

            <form onSubmit={handleRegisterSppg} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Nama Sentra Dapur SPPG *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SPPG Dapur Sehat Modung Mandiri"
                  value={namaSppg}
                  onChange={(e) => setNamaSppg(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Kabupaten / Kota *
                  </label>
                  <select
                    value={kabupatenSppg}
                    onChange={(e) => setKabupatenSppg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  >
                    {jatimRegions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Kapasitas Porsi / Hari
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={2500}
                    value={kapasitasSppg}
                    onChange={(e) => setKapasitasSppg(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  Kecamatan Layanan (Zona Distribusi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modung, Blega, Galis"
                  value={kecamatanSppg}
                  onChange={(e) => setKecamatanSppg(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Nama Penanggung Jawab SPPG *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="H. Mochammad Idris, S.T"
                    value={pengelolaSppg}
                    onChange={(e) => setPengelolaSppg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Ahli Gizi PJ (Sertifikasi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nurul Aisyah, S.Gz"
                    value={ahliGiziSppg}
                    onChange={(e) => setAhliGiziSppg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    No Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="081234991122"
                    value={kontakSppg}
                    onChange={(e) => setKontakSppg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Alamat Lengkap Dapur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Sentra Pangan No. 8"
                    value={alamatSppg}
                    onChange={(e) => setAlamatSppg(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 p-2.5 font-bold text-zinc-900 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Preview Kredensial Login Otomatis */}
              <div className="rounded-2xl border border-purple-300 bg-purple-50/70 p-3.5 space-y-1 font-mono text-[11px]">
                <div className="font-bold text-purple-950">🔑 Akun Login Terbit Otomatis:</div>
                <div className="text-purple-900">Email: <strong className="font-mono">{emailSppgOtomatis}</strong></div>
                <div className="text-purple-900">Password Default: <strong className="font-mono">Password123!</strong></div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#7866FF] hover:bg-[#6854e6] text-white p-3.5 font-sans text-xs font-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                + Otorisasi & Daftarkan Dapur SPPG Resmi
              </button>
            </form>
          </div>

          {/* Tabel / Daftar SPPG Terdaftar */}
          <div className="lg:col-span-7 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-sans text-base font-black uppercase text-zinc-950">
                  Daftar Sentra Dapur MBG (SPPG) se-Jatim ({allSppg.length})
                </h3>
                <p className="font-mono text-xs text-zinc-500">
                  Dapur mandiri berkapasitas 500–1000 porsi/hari dengan rantai pasok lokal.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari SPPG / kabupaten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-sans text-xs font-bold text-zinc-900 outline-none"
                />
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {filteredSppg.map((s, idx) => (
                <div
                  key={s.email + idx}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white hover:border-purple-300 transition-all shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                        {s.sppgId || "SPPG JATIM"}
                      </span>
                      <h4 className="font-sans font-black text-xs text-zinc-950">{s.unit}</h4>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-600">
                      📍 {s.wilayah} · PJ: <strong>{s.name}</strong> · Ahli Gizi: <strong>{s.ahliGizi || "Tersertifikasi"}</strong>
                    </p>
                    <p className="font-mono text-[10px] text-purple-900">
                      Email: <code className="font-bold">{s.email}</code> · Kapasitas: <strong>{s.kapasitasHarian || 500} porsi/hari</strong>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-2 py-0.5">
                      ● {s.statusOperasional || "Aktif"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DIREKTORI KETERKAITAN OTOMATIS: POSYANDU -> PUSKESMAS -> SPPG */}
      {/* ============================================================== */}
      {activeSubTab === "direktori" && (
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-black px-2.5 py-0.5 uppercase">
                  SINKRONISASI GEOSPASIAL
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  Total {allPosyandu.length} Posyandu Terintegrasi
                </span>
              </div>
              <h3 className="font-sans text-lg font-black uppercase text-zinc-950 mt-1">
                Matriks Keterkaitan Otomatis: Posyandu Desa ➔ Puskesmas Pembina ➔ Dapur MBG
              </h3>
              <p className="font-mono text-xs text-zinc-500">
                Setiap Posyandu yang terdaftar otomatis terhubung ke Puskesmas dan Dapur SPPG terdekat berdasarkan teritori wilayah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cari desa / posyandu / puskesmas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 font-sans text-xs font-bold text-zinc-900 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 font-mono text-[11px] font-black uppercase text-zinc-600">
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">Posyandu & Desa</th>
                  <th className="py-3 px-3">Wilayah</th>
                  <th className="py-3 px-3">🏥 Puskesmas Pembina (Naungan)</th>
                  <th className="py-3 px-3">🍲 Alokasi Dapur SPPG Terdekat</th>
                  <th className="py-3 px-3">Akun Login Posyandu</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {filteredPosyandu.map((pos, idx) => (
                  <tr key={pos.email + idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-zinc-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <strong className="text-zinc-950 font-black block">{pos.unit}</strong>
                      <span className="font-mono text-[11px] text-zinc-500">PJ: {pos.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-700">
                      {pos.wilayah}
                    </td>
                    <td className="py-3 px-3">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-950 font-bold inline-block">
                        🏥 {pos.puskesmasPembina || "Puskesmas Pembina Terdekat"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="rounded-xl bg-purple-50 border border-purple-200 px-2.5 py-1 text-purple-950 font-bold inline-block">
                        🍲 {pos.sppgDituju || "SPPG Terdekat (Alokasi Otomatis)"}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <code className="text-emerald-900 font-bold block">{pos.email}</code>
                      <span className="text-zinc-400">PW: Password123!</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-2 py-0.5">
                        ● Terhubung
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cetak Dokumen Laporan Direktori Faskes & SPPG */}
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
