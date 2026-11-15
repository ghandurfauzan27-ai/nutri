"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RESEP_MOCK, SUPPLY_LOGS_MOCK, type RecipeItem } from "@/lib/app-data";
import {
  MASTER_DAPUR_MBG,
  type DapurMbgWilayah,
  type PesananMbgPuskesmas,
  type StatusPesananMbg,
  PAKET_MBG_SPECS,
  getInitialOrdersForSppg,
  INITIAL_PESANAN_MBG_PUSKESMAS,
} from "@/lib/puskesmas-data";
import { MASTER_SPPG_ACCOUNTS } from "@/lib/auth-data";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

export default function ModulBDapurTab() {
  const [selectedDapurId, setSelectedDapurId] = useState<string>(MASTER_DAPUR_MBG[0].id);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("dapur");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Modal states
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [showSpecModal, setShowSpecModal] = useState<boolean>(false);
  const [selectedSpecKey, setSelectedSpecKey] = useState<"Paket A" | "Paket B" | "Paket C">("Paket B");
  const [showSupplyModal, setShowSupplyModal] = useState<boolean>(false);
  const [sppgFilterQuery, setSppgFilterQuery] = useState<string>("");

  // Orders State
  const [orders, setOrders] = useState<PesananMbgPuskesmas[]>([]);
  const [statusFilter, setStatusFilter] = useState<"semua" | "Diterima" | "Diproses" | "Diantar" | "Selesai">("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(RESEP_MOCK[0]);
  const [activeRecipeFilter, setActiveRecipeFilter] = useState<"semua" | "Paket B" | "Paket A">("semua");

  // Deteksi sesi login SPPG untuk mengunci akses akun (RBAC & UU PDP No. 27/2022)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const rawSession = localStorage.getItem("nt_current_session");
        if (rawSession) {
          const session = JSON.parse(rawSession);
          setUserRole(session.role || "dapur");

          if (session.role === "dapur") {
            let matched = MASTER_DAPUR_MBG.find((d) => d.id === session.sppgId);
            if (!matched && session.email) {
              const acc = MASTER_SPPG_ACCOUNTS.find((a) => a.email.toLowerCase() === session.email.toLowerCase());
              if (acc && acc.sppgId) {
                matched = MASTER_DAPUR_MBG.find((d) => d.id === acc.sppgId);
              }
            }
            if (!matched && session.unit) {
              matched = MASTER_DAPUR_MBG.find(
                (d) =>
                  session.unit.toLowerCase().includes(d.namaDapur.toLowerCase()) ||
                  d.namaDapur.toLowerCase().includes(session.unit.toLowerCase())
              );
            }

            if (matched) {
              setSelectedDapurId(matched.id);
              setIsAccountLocked(true);
            }
          }
        }
      }
    } catch (e) {}
  }, []);

  const activeDapur = MASTER_DAPUR_MBG.find((d) => d.id === selectedDapurId) || MASTER_DAPUR_MBG[0];

  // Muat Pesanan MBG khusus untuk SPPG ini dari localStorage dengan listener real-time
  useEffect(() => {
    const loadSppgOrders = () => {
      if (typeof window === "undefined") return;
      try {
        const rawOrders = localStorage.getItem("nt_mbg_orders_puskesmas");
        let allOrders: PesananMbgPuskesmas[] = [];

        if (rawOrders !== null) {
          allOrders = JSON.parse(rawOrders) || [];
        } else {
          allOrders = INITIAL_PESANAN_MBG_PUSKESMAS;
          localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(INITIAL_PESANAN_MBG_PUSKESMAS));
        }

        // Cari pesanan yang ditujukan ke SPPG ini
        const relevant = allOrders.filter(
          (o) =>
            o.sppgId === activeDapur.id ||
            o.sppgDituju.toLowerCase().includes(activeDapur.namaDapur.toLowerCase()) ||
            activeDapur.namaDapur.toLowerCase().includes(o.sppgDituju.toLowerCase())
        );

        setOrders(relevant);
      } catch (err) {
        setOrders([]);
      }
    };

    loadSppgOrders();

    window.addEventListener("storage", loadSppgOrders);
    window.addEventListener("nt_orders_updated", loadSppgOrders);
    return () => {
      window.removeEventListener("storage", loadSppgOrders);
      window.removeEventListener("nt_orders_updated", loadSppgOrders);
    };
  }, [activeDapur]);

  // Fungsi Reset / Hapus Riwayat Verifikasi SPPG
  const handleResetSppgOrders = () => {
    if (!confirm("Reset seluruh status verifikasi pesanan di SPPG ini kembali ke status awal?")) return;
    const initialSppgOrders = getInitialOrdersForSppg(activeDapur);
    setOrders(initialSppgOrders);
    if (typeof window !== "undefined") {
      try {
        const rawAll = localStorage.getItem("nt_mbg_orders_puskesmas");
        const allList: PesananMbgPuskesmas[] = rawAll ? JSON.parse(rawAll) : [];
        const initialMap = new Map(initialSppgOrders.map((io) => [io.id, io]));
        const updatedAll = allList.map((item) => initialMap.get(item.id) || item);
        localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(updatedAll));
      } catch (e) {}
    }
    setToastMessage("✓ Seluruh riwayat verifikasi pesanan SPPG berhasil direset ke status awal.");
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Fungsi Verifikasi Status Pesanan (Diterima -> Diproses -> Diantar -> Selesai)
  const handleUpdateOrderStatus = (orderId: string, nextStatus: StatusPesananMbg) => {
    const nowTime =
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const updated: PesananMbgPuskesmas = {
          ...o,
          statusPesanan: nextStatus,
        };

        if (nextStatus === "Diterima" || nextStatus === "Diterima Dapur MBG") {
          updated.jamDiterima = nowTime;
        } else if (nextStatus === "Diproses" || nextStatus === "Sedang Dimasak (Diproses)") {
          if (!updated.jamDiterima) updated.jamDiterima = "07:15 WIB";
          updated.jamDiproses = nowTime;
        } else if (nextStatus === "Diantar" || nextStatus === "Dalam Pengiriman") {
          if (!updated.jamDiterima) updated.jamDiterima = "07:15 WIB";
          if (!updated.jamDiproses) updated.jamDiproses = "08:00 WIB";
          updated.jamDiantar = nowTime;
        } else if (nextStatus === "Selesai" || nextStatus === "Tiba di Posyandu") {
          if (!updated.jamDiterima) updated.jamDiterima = "07:15 WIB";
          if (!updated.jamDiproses) updated.jamDiproses = "08:00 WIB";
          if (!updated.jamDiantar) updated.jamDiantar = "08:35 WIB";
          updated.jamSelesai = nowTime;
          updated.verifikasiPosyandu = {
            waktuTiba: `Hari ini, ${nowTime}`,
            kaderPenerima: `Kader ${o.posyanduTarget.split("(")[0].trim()}`,
            paketADiterima: o.jumlahPaketA,
            paketBDiterima: o.jumlahPaketB,
            paketCDiterima: o.jumlahPaketC,
            totalDiterima: o.totalPorsi,
            kondisiMakanan: "Sangat Baik & Hangat (Suhu ≥60°C)",
            catatanPenerima: "Ransum lengkap, lauk telur omega & lele dalam kondisi prima.",
          };
        }

        return updated;
      }
      return o;
    });

    setOrders(updatedOrders);

    // Sinkronkan ke master storage localStorage nt_mbg_orders_puskesmas
    if (typeof window !== "undefined") {
      try {
        const rawAll = localStorage.getItem("nt_mbg_orders_puskesmas");
        const allList: PesananMbgPuskesmas[] = rawAll ? JSON.parse(rawAll) : [];
        const mapped = allList.map((item) => {
          const matchUpdated = updatedOrders.find((u) => u.id === item.id);
          return matchUpdated || item;
        });

        // Pastikan order yang baru ada di allList
        updatedOrders.forEach((uo) => {
          if (!mapped.some((m) => m.id === uo.id)) {
            mapped.push(uo);
          }
        });

        localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(mapped));
        window.dispatchEvent(new Event("nt_orders_updated"));
      } catch (e) {}
    }

    const orderTarget = orders.find((o) => o.id === orderId)?.posyanduTarget || "Posyandu Target";
    setToastMessage(`✓ Pesanan ${orderTarget} berhasil diverifikasi: "${nextStatus}"`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // Helper normalisasi status
  const isAccepted = (s: StatusPesananMbg) =>
    s === "Diterima" || s === "Diterima Dapur MBG";
  const isProcessing = (s: StatusPesananMbg) =>
    s === "Diproses" || s === "Sedang Dimasak (Diproses)";
  const isDelivering = (s: StatusPesananMbg) =>
    s === "Diantar" || s === "Dalam Pengiriman";
  const isFinished = (s: StatusPesananMbg) =>
    s === "Selesai" || s === "Tiba di Posyandu";

  // Statistik Pesanan Masuk
  const countDiterima = orders.filter((o) => isAccepted(o.statusPesanan)).length;
  const countDiproses = orders.filter((o) => isProcessing(o.statusPesanan)).length;
  const countDiantar = orders.filter((o) => isDelivering(o.statusPesanan)).length;
  const countSelesai = orders.filter((o) => isFinished(o.statusPesanan)).length;

  const totalPorsiAktif = orders.reduce((sum, o) => sum + o.totalPorsi, 0);
  const totalPaketA = orders.reduce((sum, o) => sum + o.jumlahPaketA, 0);
  const totalPaketB = orders.reduce((sum, o) => sum + o.jumlahPaketB, 0);
  const totalPaketC = orders.reduce((sum, o) => sum + o.jumlahPaketC, 0);

  // Filter Pesanan
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "Diterima") {
      if (!isAccepted(o.statusPesanan)) return false;
    } else if (statusFilter === "Diproses") {
      if (!isProcessing(o.statusPesanan)) return false;
    } else if (statusFilter === "Diantar") {
      if (!isDelivering(o.statusPesanan)) return false;
    } else if (statusFilter === "Selesai") {
      if (!isFinished(o.statusPesanan)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.nomorPo.toLowerCase().includes(q) ||
        o.posyanduTarget.toLowerCase().includes(q) ||
        o.desa.toLowerCase().includes(q) ||
        o.puskesmasPemesan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Otomatisasi Kebutuhan Bahan Baku Harian
  const kgTelur = Math.round((totalPaketB * 55) / 1000); // 55g per porsi Paket B
  const kgLele = Math.round((totalPaketB * 35) / 1000); // 35g per porsi Paket B
  const kgHatiAyam = Math.round((totalPaketB * 25) / 1000); // 25g per porsi Paket B
  const kgBeras = Math.round((totalPaketA * 50 + totalPaketB * 45) / 1000);
  const ikatKelor = Math.round((totalPaketB * 15) / 250); // 1 ikat ~ 250g

  // State Modal Cetak Dokumen Resmi SPPG
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

  const handlePrintManifestMbg = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setPrintReportData({
      instansi: "BADAN GIZI NASIONAL · PEMERINTAH PROVINSI JAWA TIMUR",
      subInstansi: `SENTRA PELAYANAN PANGAN BERGIZI (SPPG) · ${activeDapur.namaDapur.toUpperCase()}`,
      alamatInstansi: `${activeDapur.alamatDapur} · Wilayah Layanan ${activeDapur.kabupaten}`,
      judulLaporan: "SURAT JALAN & MANIFEST DISTRIBUSI RANSUM MAKAN BERGIZI GRATIS (MBG)",
      nomorSurat: `SJ-MBG/${activeDapur.kodeSppg}/${new Date().getFullYear()}`,
      wilayah: activeDapur.kabupaten,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: activeDapur.pengelola,
        jabatan: "Kepala Sentra Dapur MBG (SPPG)",
      },
      summaryItems: [
        { label: "Total Pesanan Faskes", value: `${orders.length} Posyandu Binaan` },
        { label: "Paket A (Gizi Reguler)", value: `${totalPaketA} Porsi`, subtext: "Menu Balita Sehat" },
        { label: "Paket B (Protein Ganda)", value: `${totalPaketB} Porsi`, subtext: "Dobel Telur Blitar & Lele" },
        { label: "Kapasitas Harian", value: `${activeDapur.kapasitasHarian} Porsi/Hari` },
      ],
      columns: [
        { header: "Nomor PO / Surat Pesanan", key: "nomorPo" },
        { header: "Posyandu & Desa Tujuan", key: "posyanduTujuan" },
        { header: "Faskes Pemesan", key: "puskesmasPemesan" },
        { header: "Jadwal & Sesi", key: "jadwalDistribusi" },
        { header: "Paket A (Porsi)", key: "jumlahPaketA", align: "center" },
        { header: "Paket B (Porsi)", key: "jumlahPaketB", align: "center" },
        { header: "Total Porsi", key: "totalPorsi", align: "center" },
        { header: "Status Distribusi", key: "statusPesanan" },
      ],
      data: orders.map((o) => ({
        nomorPo: o.nomorPo,
        posyanduTujuan: `${o.posyanduTarget} (Desa ${o.desa})`,
        puskesmasPemesan: o.puskesmasPemesan,
        jadwalDistribusi: `${o.tglPenyaluran} (${o.sesiPenyaluran})`,
        jumlahPaketA: o.jumlahPaketA,
        jumlahPaketB: o.jumlahPaketB,
        totalPorsi: o.totalPorsi,
        statusPesanan: o.statusPesanan,
      })),
      catatanKhusus: `Semua porsi Paket B wajib menggunakan bahan baku protein hewani bersertifikasi lokal Jatim (telur omega Blitar & lele segar Lamongan) serta diuji organoleptik sebelum didistribusikan. Suhu makanan minimal 60°C saat pengantaran.`,
      filenameCsv: `manifest-distribusi-${activeDapur.kodeSppg.toLowerCase()}.csv`,
    });
  };

  const filteredRecipes = RESEP_MOCK.filter((r) => {
    if (activeRecipeFilter === "semua") return true;
    return r.tipePaket.includes(activeRecipeFilter);
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-purple-300 bg-purple-50 p-4 text-purple-950 font-mono text-xs font-bold flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#7866FF] text-white text-[10px]">
                ✓
              </span>
              <span>{toastMessage}</span>
            </div>
            <span className="text-[11px] opacity-75">Tersimpan di Sistem Logistik MBG</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info & Identitas Akun SPPG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7866FF] animate-pulse" />
            <span className="rounded-md bg-[#7866FF] px-2 py-0.5 font-mono text-[9px] font-black uppercase text-white">
              {activeDapur.id}
            </span>
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              {activeDapur.namaDapur}
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Penanggung Jawab: <strong className="text-zinc-800">{activeDapur.pengelola}</strong> ({activeDapur.noKontak}) · Ahli Gizi: <strong className="text-zinc-800">{activeDapur.ahliGiziPj}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrintManifestMbg}
            className="rounded-2xl bg-[#18140B] text-white hover:bg-[#7866FF] px-4 py-2 font-sans text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>🖨️</span>
            <span>Cetak Surat Jalan & Manifest MBG</span>
          </button>

          {/* Identitas Dapur MBG (SPPG) Terkunci Permanen Sesuai Akun Login (Tidak Bisa Pindah) */}
          <div className="flex items-center gap-2 rounded-2xl border border-purple-300 bg-purple-50 px-3.5 py-2 font-mono text-xs font-bold text-purple-950 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#7866FF]" />
            <span className="text-zinc-500 font-bold text-[11px]">Akun Dapur SPPG:</span>
            <span className="font-sans font-black text-purple-950 text-xs truncate max-w-[280px]">
              {activeDapur.namaDapur}
            </span>
            <span className="rounded-md bg-[#7866FF] px-1.5 py-0.5 text-[9px] font-black text-white">
              Terkunci Akun
            </span>
          </div>
        </div>
      </div>

      {/* Banner SOP Verifikasi Resmi SPPG (Tugas Utama: Diterima -> Diproses -> Diantar -> Selesai) */}
      <div className="rounded-3xl border-2 border-[#7866FF]/30 bg-gradient-to-r from-purple-50/90 via-white to-sky-50/60 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#7866FF] text-2xl text-white shadow-md">
              🍲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
                  Tugas Resmi Akun SPPG: Verifikasi 4 Tahap Pesanan
                </h3>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white">
                  SOP Standar Jatim
                </span>
              </div>
              <p className="mt-1 font-sans text-xs text-zinc-600 max-w-3xl leading-relaxed">
                Tugas akun SPPG fokus memverifikasi setiap pesanan masuk melalui 4 tahapan alur resmi:{" "}
                <strong className="text-purple-950 font-black">1. Diterima</strong> (konfirmasi order) →{" "}
                <strong className="text-amber-950 font-black">2. Diproses</strong> (masak & packing isi wadah) →{" "}
                <strong className="text-sky-950 font-black">3. Diantar</strong> (armada meluncur ke balai desa) →{" "}
                <strong className="text-emerald-950 font-black">4. Selesai</strong> (serah terima tuntas di posyandu).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedSpecKey("Paket B");
                setShowSpecModal(true);
              }}
              className="rounded-2xl border border-purple-300 bg-white px-3.5 py-2 font-mono text-xs font-bold text-purple-950 hover:bg-purple-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>🍱</span>
              <span>Panduan Isi Wadah</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSupplyModal(true)}
              className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
            >
              Rantai Pasok
            </button>
          </div>
        </div>
      </div>

      {/* METRIC CARDS 4 TAHAP VERIFIKASI PESANAN */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Diterima */}
        <div
          onClick={() => setStatusFilter("Diterima")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-xs ${
            statusFilter === "Diterima"
              ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300"
              : "border-zinc-200 bg-white hover:border-purple-200"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px] uppercase font-bold">
            <span>1. Diterima</span>
            <span className="h-2 w-2 rounded-full bg-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-black text-purple-950">{countDiterima}</span>
            <span className="font-mono text-xs text-purple-700 font-bold">Pesanan</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-zinc-500">Menunggu antrean dapur</p>
        </div>

        {/* Card 2: Diproses */}
        <div
          onClick={() => setStatusFilter("Diproses")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-xs ${
            statusFilter === "Diproses"
              ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300"
              : "border-zinc-200 bg-white hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px] uppercase font-bold">
            <span>2. Diproses</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-black text-amber-950">{countDiproses}</span>
            <span className="font-mono text-xs text-amber-700 font-bold">Pesanan</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-zinc-500">Sedang dimasak & dipacking</p>
        </div>

        {/* Card 3: Diantar */}
        <div
          onClick={() => setStatusFilter("Diantar")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-xs ${
            statusFilter === "Diantar"
              ? "border-sky-400 bg-sky-50 ring-2 ring-sky-300"
              : "border-zinc-200 bg-white hover:border-sky-200"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px] uppercase font-bold">
            <span>3. Diantar</span>
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-black text-sky-950">{countDiantar}</span>
            <span className="font-mono text-xs text-sky-700 font-bold">Pesanan</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-zinc-500">Armada meluncur ke lokasi</p>
        </div>

        {/* Card 4: Selesai */}
        <div
          onClick={() => setStatusFilter("Selesai")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-xs ${
            statusFilter === "Selesai"
              ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
              : "border-zinc-200 bg-white hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px] uppercase font-bold">
            <span>4. Selesai</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-black text-emerald-950">{countSelesai}</span>
            <span className="font-mono text-xs text-emerald-700 font-bold">Pesanan</span>
          </div>
          <p className="mt-2 font-mono text-[10px] text-zinc-500">Tiba & terverifikasi posyandu</p>
        </div>

        {/* Card 5: Total Porsi Ransum */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 text-white shadow-xs">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-zinc-400">
            <span>Total Ransum</span>
            <span className="rounded bg-white/20 px-1 py-0.2 text-[9px] text-white">Hari Ini</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-sans text-3xl font-black text-white">{totalPorsiAktif}</span>
            <span className="font-mono text-xs text-[#38E8F5] font-bold">Kotak</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-300">
            <span>Paket A: <strong>{totalPaketA}</strong></span>
            <span>Paket B: <strong>{totalPaketB}</strong></span>
          </div>
        </div>
      </div>

      {/* PAPAN VERIFIKASI PESANAN MASUK (CORE WORKSTATION) */}
      <div className="rounded-[32px] border-2 border-[#7866FF]/40 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#7866FF] text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase">
                Papan Verifikasi SPPG
              </span>
              <h3 className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950">
                Pesanan Ransum Masuk & Panduan Isi Wadah
              </h3>
            </div>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              Kelola dan verifikasi setiap pesanan posyandu: pastikan menu paket diisi lengkap sebelum diberangkatkan.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari posyandu / desa / PO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-44 sm:w-56 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-[#7866FF]"
              />
            </div>

            <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("semua")}
                className={`rounded-xl px-2.5 py-1 font-bold transition-colors ${
                  statusFilter === "semua" ? "bg-[#18140B] text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Diterima")}
                className={`rounded-xl px-2.5 py-1 font-bold transition-colors ${
                  statusFilter === "Diterima" ? "bg-purple-600 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Diterima ({countDiterima})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Diproses")}
                className={`rounded-xl px-2.5 py-1 font-bold transition-colors ${
                  statusFilter === "Diproses" ? "bg-amber-500 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Diproses ({countDiproses})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Diantar")}
                className={`rounded-xl px-2.5 py-1 font-bold transition-colors ${
                  statusFilter === "Diantar" ? "bg-sky-500 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Diantar ({countDiantar})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Selesai")}
                className={`rounded-xl px-2.5 py-1 font-bold transition-colors ${
                  statusFilter === "Selesai" ? "bg-emerald-600 text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Selesai ({countSelesai})
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetSppgOrders}
              className="rounded-2xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-2 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
              title="Reset seluruh status verifikasi pesanan SPPG"
            >
              <span>🗑️ Hapus Riwayat Verifikasi</span>
            </button>
          </div>
        </div>

        {/* LIST KARTU PESANAN */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center font-mono text-xs text-zinc-500">
            Tidak ada pesanan dengan filter &quot;{statusFilter}&quot;.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const accepted = isAccepted(order.statusPesanan);
              const processing = isProcessing(order.statusPesanan);
              const delivering = isDelivering(order.statusPesanan);
              const finished = isFinished(order.statusPesanan);

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                    finished
                      ? "border-emerald-200 bg-emerald-50/20"
                      : delivering
                      ? "border-sky-300 bg-sky-50/30 ring-1 ring-sky-300"
                      : processing
                      ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-300"
                      : "border-purple-200 bg-purple-50/20"
                  }`}
                >
                  {/* Header Pesanan */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-200/60 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                          {order.nomorPo}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          Pemesan: <strong>{order.puskesmasPemesan}</strong>
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">· {order.tglPenyaluran}</span>
                      </div>
                      <h4 className="font-sans text-lg font-black text-zinc-950 mt-1">
                        {order.posyanduTarget}
                      </h4>
                      <p className="font-mono text-xs text-zinc-500">
                        📍 {order.desa}, Kec. {order.kecamatan} · {order.sesiPenyaluran}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center gap-2">
                      {finished && (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-xs flex items-center gap-1.5">
                          <span>✓</span>
                          <span>4. SELESAI (TIBA DI POSYANDU)</span>
                        </span>
                      )}
                      {delivering && (
                        <span className="rounded-full bg-sky-600 px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-xs animate-pulse flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                          <span>3. SEDANG DIANTAR</span>
                        </span>
                      )}
                      {processing && (
                        <span className="rounded-full bg-amber-500 px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-xs flex items-center gap-1.5">
                          <span>🍳</span>
                          <span>2. SEDANG DIPROSES</span>
                        </span>
                      )}
                      {accepted && (
                        <span className="rounded-full bg-[#7866FF] px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-xs flex items-center gap-1.5">
                          <span>📥</span>
                          <span>1. DITERIMA SPPG</span>
                        </span>
                      )}
                      {!accepted && !processing && !delivering && !finished && (
                        <span className="rounded-full bg-zinc-600 px-3 py-1 font-mono text-xs font-black uppercase text-white shadow-xs">
                          DIAJUKAN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rincian Porsi & Paket Masuk */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="rounded-2xl border border-zinc-200/90 bg-white p-3 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">Total Ransum</span>
                      <strong className="text-xl font-black text-zinc-950">{order.totalPorsi}</strong>
                      <span className="text-[10px] text-zinc-500 block">Kotak Makanan</span>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-white p-3 space-y-0.5">
                      <span className="text-[10px] text-emerald-800 block uppercase font-bold">● Paket A (Reguler)</span>
                      <strong className="text-xl font-black text-emerald-900">{order.jumlahPaketA}</strong>
                      <span className="text-[10px] text-zinc-500 block">Balita Sehat</span>
                    </div>

                    <div className="rounded-2xl border border-purple-300 bg-white p-3 space-y-0.5">
                      <span className="text-[10px] text-purple-900 block uppercase font-bold">● Paket B (Protein Ganda)</span>
                      <strong className="text-xl font-black text-purple-950">{order.jumlahPaketB}</strong>
                      <span className="text-[10px] text-zinc-500 block">Stunting / Faltering</span>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-white p-3 space-y-0.5">
                      <span className="text-[10px] text-rose-800 block uppercase font-bold">● Paket C (Medis)</span>
                      <strong className="text-xl font-black text-rose-950">{order.jumlahPaketC}</strong>
                      <span className="text-[10px] text-zinc-500 block">Formula F-100</span>
                    </div>
                  </div>

                  {/* FITUR UTAMA: HARUS DIISI APA? (PANDUAN KOMPOSISI ISI WADAH) */}
                  <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/60 via-white to-purple-50/30 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                        <span>🍱</span>
                        <span>Harus Diisi Apa? (Panduan Komposisi Kotak Ransum Pesanan Ini)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpecKey("Paket B");
                          setShowSpecModal(true);
                        }}
                        className="font-mono text-[11px] font-bold text-[#7866FF] hover:underline"
                      >
                        Buka SOP Detail →
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      {/* Isi Paket B */}
                      <div className="rounded-xl border border-purple-200 bg-white p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="font-sans font-black text-purple-950 text-xs">
                            Isi Wadah Paket B ({order.jumlahPaketB} Porsi Stunting)
                          </strong>
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[9px] font-black text-purple-900">
                            Booster Protein
                          </span>
                        </div>
                        <ul className="font-sans text-[11px] text-zinc-700 space-y-1">
                          <li>🍚 <strong>Nasi Tim Kaldu Ayam:</strong> 45g (lembut mudah cerna)</li>
                          <li>🥚 <strong>Dobel Telur Omega Blitar:</strong> 55g (1-2 butir rebus lembut)</li>
                          <li>🐟 <strong>Fillet Lele Lamongan:</strong> 35g (kukus serai aromatik)</li>
                          <li>🥩 <strong>Hati Ayam Kampung:</strong> 25g (kaya zat besi heme)</li>
                          <li>🌿 <strong>Puree Daun Kelor:</strong> 15g (sumber zink alami)</li>
                        </ul>
                      </div>

                      {/* Isi Paket A */}
                      <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="font-sans font-black text-emerald-950 text-xs">
                            Isi Wadah Paket A ({order.jumlahPaketA} Porsi Reguler)
                          </strong>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-black text-emerald-900">
                            Gizi Seimbang
                          </span>
                        </div>
                        <ul className="font-sans text-[11px] text-zinc-700 space-y-1">
                          <li>🍚 <strong>Nasi Tim Beras Lokal:</strong> 50g pulen bergizi</li>
                          <li>🍗 <strong>Ayam Suwir / Ikan Segar:</strong> 40g (protein esensial)</li>
                          <li>🍲 <strong>Tahu Kukus / Tempe Kediri:</strong> 25g (protein nabati)</li>
                          <li>🥦 <strong>Sup Sayur Brokoli Wortel:</strong> 25g (vitamin A & serat)</li>
                        </ul>
                      </div>
                    </div>

                    {order.catatanKlinis && (
                      <p className="font-mono text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                        ⚠️ <strong>Catatan Puskesmas:</strong> {order.catatanKlinis}
                      </p>
                    )}
                  </div>

                  {/* VISUAL STEPPER 4 TAHAP */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-zinc-600">Alur Verifikasi Tahapan:</span>
                      <span className="text-[11px] text-zinc-400">
                        Armada: <strong>{order.kurirArmada || "Mobil Box Termal #01"}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      {/* Step 1: Diterima */}
                      <div className={`p-2.5 rounded-xl border ${accepted || processing || delivering || finished ? "border-purple-300 bg-purple-50 text-purple-950 font-black" : "border-zinc-200 bg-white text-zinc-400"}`}>
                        <div className="text-[10px] uppercase">1. Diterima</div>
                        <div className="text-[11px] font-bold mt-0.5">{order.jamDiterima || "✓ Siap"}</div>
                      </div>

                      {/* Step 2: Diproses */}
                      <div className={`p-2.5 rounded-xl border ${processing || delivering || finished ? "border-amber-300 bg-amber-50 text-amber-950 font-black" : "border-zinc-200 bg-white text-zinc-400"}`}>
                        <div className="text-[10px] uppercase">2. Diproses</div>
                        <div className="text-[11px] font-bold mt-0.5">{order.jamDiproses || "-"}</div>
                      </div>

                      {/* Step 3: Diantar */}
                      <div className={`p-2.5 rounded-xl border ${delivering || finished ? "border-sky-300 bg-sky-50 text-sky-950 font-black" : "border-zinc-200 bg-white text-zinc-400"}`}>
                        <div className="text-[10px] uppercase">3. Diantar</div>
                        <div className="text-[11px] font-bold mt-0.5">{order.jamDiantar || "-"}</div>
                      </div>

                      {/* Step 4: Selesai */}
                      <div className={`p-2.5 rounded-xl border ${finished ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-black" : "border-zinc-200 bg-white text-zinc-400"}`}>
                        <div className="text-[10px] uppercase">4. Selesai</div>
                        <div className="text-[11px] font-bold mt-0.5">{order.jamSelesai || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {/* TOMBOL AKSI VERIFIKASI 1-KLIK */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {/* Tombol Aksi Kontekstual */}
                      {accepted && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Diproses")}
                          className="rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>🍳</span>
                          <span>Mulai Proses Masak & Packing (Tahap 2)</span>
                        </button>
                      )}

                      {processing && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Diantar")}
                          className="rounded-2xl bg-sky-600 hover:bg-sky-700 px-5 py-2.5 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>🚚</span>
                          <span>Berangkatkan Armada Logistik (Tahap 3 - Diantar)</span>
                        </button>
                      )}

                      {delivering && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Selesai")}
                          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>🏁</span>
                          <span>Selesaikan Serah Terima di Posyandu (Tahap 4 - Selesai)</span>
                        </button>
                      )}

                      {finished && (
                        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-950 font-mono text-xs font-bold flex items-center gap-2">
                          <span>✓</span>
                          <span>
                            Pesanan Selesai ({order.verifikasiPosyandu?.kaderPenerima || "Kader Posyandu"} · {order.jamSelesai || "09:15 WIB"})
                          </span>
                        </div>
                      )}

                      {!accepted && !processing && !delivering && !finished && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, "Diterima")}
                          className="rounded-2xl bg-[#7866FF] hover:bg-purple-700 px-5 py-2.5 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <span>📥</span>
                          <span>Terima Pesanan Ini (Tahap 1 - Diterima)</span>
                        </button>
                      )}
                    </div>

                    {/* Dropdown Bypass / Ganti Manual jika diperlukan */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                      <span>Ubah Status Manual:</span>
                      <select
                        value={order.statusPesanan}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as StatusPesananMbg)}
                        className="rounded-xl border border-zinc-200 bg-white px-2 py-1 text-xs font-bold text-zinc-900 outline-none"
                      >
                        <option value="Diterima">1. Diterima</option>
                        <option value="Diproses">2. Diproses</option>
                        <option value="Diantar">3. Diantar</option>
                        <option value="Selesai">4. Selesai</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KALKULASI KEBUTUHAN BAHAN BAKU HARIAN SPPG */}
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
              Kalkulasi Kebutuhan Bahan Baku Harian Dapur SPPG
            </h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Dihitung otomatis: Gramasi Standar Resep Gizi Jatim × Total Kuota ({totalPorsiAktif} porsi hari ini)
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
              ~{totalPaketB} butir (Koperasi Peternak Blitar)
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
              Mina Tani Makmur Babat
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
              Zat Besi Heme Anti-Anemia
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
              Petani Sayur Batu & Pasuruan
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

      {/* KATALOG RESEP MPASI LOKAL JATIM */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
              Katalog Resep Standar MPASI Jatim
            </h3>
            <div className="flex rounded-xl border border-zinc-200 bg-white p-1 text-[11px] font-bold">
              {(["semua", "Paket B", "Paket A"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveRecipeFilter(filter)}
                  className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                    activeRecipeFilter === filter ? "bg-[#18140B] text-white" : "text-zinc-600"
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
                      {r.energiKkal} kcal
                    </span>
                  </div>
                  <h4 className="font-sans font-black text-sm text-zinc-950">{r.nama}</h4>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500 line-clamp-1">
                    Bahan: {r.komoditasUtama}
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
                  {selectedRecipe.nama}
                </h3>
                <p className="font-mono text-xs text-zinc-500 mt-0.5">
                  Basis: {selectedRecipe.komoditasUtama} ({selectedRecipe.asalKomoditas})
                </p>
              </div>

              <span className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs font-bold text-zinc-800">
                Resep Standar Dinkes Jatim
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 rounded-2xl bg-zinc-50 p-4 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Energi</span>
                <strong className="text-sm font-black text-zinc-900">{selectedRecipe.energiKkal}</strong> kcal
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Protein</span>
                <strong className="text-sm font-black text-[#7866FF]">{selectedRecipe.proteinGram}g</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Lemak</span>
                <strong className="text-sm font-black text-zinc-900">{selectedRecipe.lemakGram}g</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Karbo</span>
                <strong className="text-sm font-black text-emerald-700">{selectedRecipe.karboGram}g</strong>
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
                <span>💡</span> Petunjuk Pengolahan & Penyajian Dapur:
              </h5>
              <p className="font-sans text-xs text-amber-900 leading-relaxed">
                {selectedRecipe.langkahMasak.join(" ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: DETAIL SPESIFIKASI PAKET & APA YANG HARUS DIISI */}
      <AnimatePresence>
        {showSpecModal && (
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
                    Panduan & Komposisi Pengisian Wadah Kotak MBG
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Standar Teknis Dapur SPPG · Gramasi, Komponen & Checklist QC Wadah
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpecModal(false)}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Selector Paket */}
              <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 font-mono text-xs">
                {(["Paket B", "Paket A", "Paket C"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSpecKey(key)}
                    className={`flex-1 rounded-xl py-2 font-bold transition-all ${
                      selectedSpecKey === key
                        ? "bg-[#18140B] text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Konten Detail Spesifikasi */}
              {PAKET_MBG_SPECS[selectedSpecKey] && (
                <div className="space-y-5">
                  <div className={`rounded-2xl border p-4 ${PAKET_MBG_SPECS[selectedSpecKey].warnaTema.border} ${PAKET_MBG_SPECS[selectedSpecKey].warnaTema.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-black uppercase text-white ${PAKET_MBG_SPECS[selectedSpecKey].warnaTema.badge}`}>
                        {PAKET_MBG_SPECS[selectedSpecKey].kode}
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-600">
                        {PAKET_MBG_SPECS[selectedSpecKey].standarAkg.energiKkal} kkal · {PAKET_MBG_SPECS[selectedSpecKey].standarAkg.proteinGram}g Protein
                      </span>
                    </div>
                    <h4 className="font-sans font-black text-base text-zinc-950 mt-1">
                      {PAKET_MBG_SPECS[selectedSpecKey].namaLengkap}
                    </h4>
                    <p className="font-mono text-xs text-zinc-600 mt-0.5">
                      Target Sasaran: <strong>{PAKET_MBG_SPECS[selectedSpecKey].sasaranBalita}</strong>
                    </p>
                  </div>

                  {/* Komposisi Isi Wadah */}
                  <div className="space-y-3">
                    <h5 className="font-sans text-xs font-black uppercase tracking-wider text-zinc-900">
                      Komponen yang Wajib Diisikan ke Kotak Ransum:
                    </h5>
                    <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                      <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-600">
                          <tr>
                            <th className="py-2.5 px-3">Bahan Makanan</th>
                            <th className="py-2.5 px-3">Gramasi / Takaran</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Asal Komoditas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium">
                          {PAKET_MBG_SPECS[selectedSpecKey].komposisiWadah.map((k, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/50">
                              <td className="py-2.5 px-3 font-bold text-zinc-900">{k.bahan}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-purple-900">{k.gramasi}</td>
                              <td className="py-2.5 px-3">
                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-700">
                                  {k.kategori}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-zinc-600">{k.asalKomoditas}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Langkah Pengisian & QC */}
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                      <strong className="font-sans font-black text-zinc-950 block">
                        Instruksi Pengemasan Wadah:
                      </strong>
                      <ul className="space-y-1.5 text-zinc-600 list-disc list-inside">
                        {PAKET_MBG_SPECS[selectedSpecKey].panduanPengisianWadah.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                      <strong className="font-sans font-black text-emerald-950 block">
                        Checklist Quality Control (QC) Dapur:
                      </strong>
                      <ul className="space-y-1.5 text-emerald-900">
                        {PAKET_MBG_SPECS[selectedSpecKey].checklistQc.map((c, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-emerald-700">✓</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSpecModal(false)}
                  className="rounded-full bg-[#18140B] px-5 py-2.5 font-sans text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
                >
                  Tutup Panduan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DIREKTORI 20 AKUN SPPG BEROPERASI SE-JATIM */}
      <AnimatePresence>
        {showDirectoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-7 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#7866FF] px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white">
                      Direktori Resmi
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      20 Sentra SPPG se-Jawa Timur
                    </span>
                  </div>
                  <h3 className="font-sans text-xl font-black uppercase text-zinc-950 mt-1">
                    Daftar Akun Dapur MBG (SPPG) Terdaftar & Beroperasi
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Setiap SPPG memiliki zona kerja eksklusif posyandu dan kredensial login mandiri.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDirectoryModal(false)}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Cari SPPG berdasarkan nama, kabupaten, atau ID..."
                  value={sppgFilterQuery}
                  onChange={(e) => setSppgFilterQuery(e.target.value)}
                  className="w-full bg-transparent font-sans text-xs font-bold text-zinc-900 outline-none"
                />
              </div>

              {/* Grid 20 Akun SPPG */}
              <div className="grid gap-3 sm:grid-cols-2">
                {MASTER_SPPG_ACCOUNTS.filter((s) => {
                  const q = sppgFilterQuery.toLowerCase();
                  return (
                    s.unit.toLowerCase().includes(q) ||
                    s.name.toLowerCase().includes(q) ||
                    s.wilayah.toLowerCase().includes(q) ||
                    (s.kabupaten || "").toLowerCase().includes(q) ||
                    (s.sppgId || "").toLowerCase().includes(q)
                  );
                }).map((s) => {
                  const isActive = activeDapur.id === s.sppgId;

                  return (
                    <div
                      key={s.email}
                      className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                        isActive
                          ? "border-[#7866FF] bg-purple-50/50 ring-2 ring-[#7866FF]/20"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                            {s.sppgId}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ● {s.statusOperasional || "Aktif Beroperasi"}
                          </span>
                        </div>
                        <h4 className="font-sans font-black text-sm text-zinc-950">{s.unit}</h4>
                        <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
                          📍 {s.wilayah}
                        </p>
                        <div className="mt-2 text-[11px] font-mono text-zinc-600 space-y-0.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <div>Penanggung Jawab: <strong>{s.name}</strong></div>
                          <div>Email: <code className="font-bold text-purple-900">{s.email}</code></div>
                          <div>Kapasitas: <strong>{s.kapasitasHarian || 500} porsi/hari</strong></div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-400">
                          Password: Password123!
                        </span>
                        <span
                          className={`rounded-xl px-3 py-1 font-mono text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}
                        >
                          {isActive ? "✓ Sedang Aktif" : "🔒 Akun Terpisah"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <span className="font-mono text-xs text-zinc-500">
                  Total 20 Sentra SPPG Resmi di Seluruh Wilayah Jawa Timur
                </span>
                <button
                  type="button"
                  onClick={() => setShowDirectoryModal(false)}
                  className="rounded-full bg-zinc-900 px-5 py-2 font-sans text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: LOG PEMASOK & PETERNAK LOKAL */}
      <AnimatePresence>
        {showSupplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-7 shadow-2xl space-y-6"
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
                  ✕
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

      {/* Modal Cetak Dokumen Resmi Surat Jalan & Manifest MBG */}
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
