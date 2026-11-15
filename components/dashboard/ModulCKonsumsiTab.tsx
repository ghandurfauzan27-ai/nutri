"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BALITA_MOCK, type BalitaRecord } from "@/lib/app-data";
import {
  INITIAL_PESANAN_MBG_PUSKESMAS,
  type PesananMbgPuskesmas,
} from "@/lib/puskesmas-data";
import { MASTER_POSYANDU_ACCOUNTS, type PredefinedAccount } from "@/lib/auth-data";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

// Helper pencocokan pesanan spesifik hanya untuk posyandu yang aktif
const isOrderForPosyandu = (order: PesananMbgPuskesmas, account: PredefinedAccount) => {
  if (!order || !order.posyanduTarget) return false;
  const target = order.posyanduTarget.toLowerCase();
  const unit = (account.unit || "").toLowerCase();
  const wilayah = (account.wilayah || "").toLowerCase();

  const knownPosyandus = [
    "mawar 01",
    "mawar 02",
    "melati 01",
    "dahlia 01",
    "kenanga 01",
    "anggrek 01",
    "cempaka 01",
    "kamboja 02",
  ];
  for (const kp of knownPosyandus) {
    if (unit.includes(kp)) {
      return target.includes(kp);
    }
  }

  const desaName = wilayah.split(",")[0].replace("desa", "").trim().toLowerCase();
  if (desaName && target.includes(desaName)) {
    return true;
  }

  return target.includes(unit) || unit.includes(target.split("(")[0].trim().toLowerCase());
};

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
  catatanPetugas?: string;
}

const createMbgListFromBalita = (
  balitas: BalitaRecord[],
  savedMap = new Map<string, any>()
): MbgBalitaDelivery[] => {
  return balitas.map((b) => {
    const existing = savedMap.get(b.id);
    const isPaketB =
      b.paketMBG?.includes("Paket B") ||
      b.isFaltering ||
      b.statusNutrisi === "Waspada / Faltering" ||
      b.statusNutrisi === "Stunting";

    const jenisPaket = isPaketB
      ? ("Paket B (Protein Ganda Jatim)" as const)
      : ("Paket A (Gizi Reguler)" as const);

    const menuHariIni = isPaketB
      ? "Nasi Tim Hati Ayam + Dobel Telur Omega Blitar + Puree Lele Lamongan"
      : "Nasi Lembek + Sup Wortel Daging Cincang + Tempe Bacem Manis";

    return {
      id: b.id,
      namaAnak: b.nama,
      nik: b.nik,
      usiaBulan: b.usiaBulan,
      namaIbu: b.namaIbu,
      jenisPaket,
      menuHariIni,
      statusDiterima: existing ? existing.statusDiterima : true,
      waktuDiterima: existing?.waktuDiterima || "Hari ini, 11:15 WIB",
      catatanPetugas: existing?.catatanPetugas || "Tervalidasi langsung oleh petugas posyandu saat penyerahan paket.",
    };
  });
};

const INITIAL_MBG_BALITA_LIST: MbgBalitaDelivery[] = createMbgListFromBalita(BALITA_MOCK);

export default function ModulCKonsumsiTab() {
  // 1. Akun Posyandu Aktif (Isolasi total per akun Posyandu Desa)
  const [activePosyanduIndex, setActivePosyanduIndex] = useState<number>(0);
  const activeAccount = MASTER_POSYANDU_ACCOUNTS[activePosyanduIndex] || MASTER_POSYANDU_ACCOUNTS[0];

  // 2. Data Pesanan Batch dari SPPG (Tersinkronisasi 100% Real-Time dari Puskesmas & Dapur SPPG)
  const [incomingMbgOrders, setIncomingMbgOrders] = useState<PesananMbgPuskesmas[]>([]);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [verifyPaketA, setVerifyPaketA] = useState<number>(0);
  const [verifyPaketB, setVerifyPaketB] = useState<number>(0);
  const [verifyPaketC, setVerifyPaketC] = useState<number>(0);
  const [verifyKondisi, setVerifyKondisi] = useState<string>("Sangat Baik & Hangat (≥60°C)");
  const [verifyKaderName, setVerifyKaderName] = useState<string>(activeAccount.name);
  const [verifyCatatan, setVerifyCatatan] = useState<string>("Ransum lengkap, higienis, lauk telur omega & lele dalam kondisi hangat.");

  // State Modal Cetak Dokumen Laporan
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

  const handlePrintBeritaAcara = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const relevantOrders = incomingMbgOrders.filter((order) => isOrderForPosyandu(order, activeAccount));
    const totalA = relevantOrders.reduce((acc, o) => acc + o.jumlahPaketA, 0);
    const totalB = relevantOrders.reduce((acc, o) => acc + o.jumlahPaketB, 0);

    setPrintReportData({
      instansi: "PEMERINTAH KABUPATEN BANGKALAN",
      subInstansi: `DINAS KESEHATAN · ${activeAccount.unit.toUpperCase()}`,
      alamatInstansi: `Wilayah Kerja ${activeAccount.wilayah}`,
      judulLaporan: "BERITA ACARA SERAH TERIMA & VERIFIKASI RANSUM MBG DARI SPPG",
      nomorSurat: `BAST-MBG/POS/${new Date().getFullYear()}`,
      wilayah: `${activeAccount.unit}, ${activeAccount.wilayah}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: activeAccount.name,
        jabatan: "Kader Penanggung Jawab Posyandu",
      },
      summaryItems: [
        { label: "Posyandu Penerima", value: activeAccount.unit },
        { label: "Total Surat Pesanan", value: `${relevantOrders.length} Dokumen` },
        { label: "Paket A Diterima", value: `${totalA} Porsi`, subtext: "Gizi Reguler" },
        { label: "Paket B Diterima", value: `${totalB} Porsi`, subtext: "Protein Hewani Ganda" },
      ],
      columns: [
        { header: "ID Pesanan", key: "id" },
        { header: "Jadwal & Sesi", key: "jadwal" },
        { header: "Paket A", key: "paketA", align: "center" },
        { header: "Paket B", key: "paketB", align: "center" },
        { header: "Kondisi Fisik", key: "kondisi" },
        { header: "Status Verifikasi", key: "status" },
      ],
      data: relevantOrders.map((o) => ({
        id: o.id,
        jadwal: `${o.tglPenyaluran} (${o.sesiPenyaluran})`,
        paketA: `${o.jumlahPaketA} Porsi`,
        paketB: `${o.jumlahPaketB} Porsi`,
        kondisi: o.catatanKlinis || "Sangat Baik & Hangat (≥60°C)",
        status: o.statusPesanan,
      })),
      catatanKhusus: "Berita acara ini menjadi bukti sah serah terima makanan bergizi gratis dari Sentra Dapur SPPG ke Posyandu Desa untuk diteruskan ke balita sasaran.",
      filenameCsv: `berita-acara-mbg-${activeAccount.name.toLowerCase().replace(/\s+/g, "-")}.csv`,
    });
  };

  const handlePrintChecklistBalita = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const total = list.length;
    const sudah = list.filter((m) => m.statusDiterima).length;
    const belum = total - sudah;

    setPrintReportData({
      instansi: "PEMERINTAH KABUPATEN BANGKALAN",
      subInstansi: `DINAS KESEHATAN · ${activeAccount.unit.toUpperCase()}`,
      alamatInstansi: `Wilayah Kerja ${activeAccount.wilayah}`,
      judulLaporan: "CHECKLIST PENERIMAAN RANSUM GIZI INDIVIDUAL BALITA SASARAN",
      nomorSurat: `CKL-BALITA/${new Date().getFullYear()}`,
      wilayah: `${activeAccount.unit}, ${activeAccount.wilayah}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: activeAccount.name,
        jabatan: "Kader Penanggung Jawab Posyandu",
      },
      summaryItems: [
        { label: "Total Balita Sasaran", value: `${total} Anak` },
        { label: "Sudah Mengonsumsi", value: `${sudah} Anak`, subtext: `${Math.round((sudah / (total || 1)) * 100)}% Tersalurkan` },
        { label: "Belum Mengonsumsi", value: `${belum} Anak` },
        { label: "Posyandu Desa", value: activeAccount.unit },
      ],
      columns: [
        { header: "Nama Balita & NIK", key: "namaNik" },
        { header: "Usia", key: "usia", align: "center" },
        { header: "Nama Ibu", key: "namaIbu" },
        { header: "Paket MBG", key: "jenisPaket" },
        { header: "Menu Diterima", key: "menuHariIni" },
        { header: "Status Penerimaan", key: "statusDiterimaStr" },
        { header: "Waktu Penerimaan", key: "waktuDiterima" },
      ],
      data: list.map((m) => ({
        namaNik: `${m.namaAnak} (NIK: ${m.nik})`,
        usia: `${m.usiaBulan} Bulan`,
        namaIbu: m.namaIbu,
        jenisPaket: m.jenisPaket,
        menuHariIni: m.menuHariIni,
        statusDiterimaStr: m.statusDiterima ? "✓ Sudah Diterima & Dimakan" : "Belum Diterima",
        waktuDiterima: m.waktuDiterima || "-",
      })),
      catatanKhusus: "Semua balita penerima Paket B (Stunting/Faltering) dipastikan mengonsumsi habis porsi protein hewani ganda di hadapan kader/keluarga.",
      filenameCsv: `checklist-distribusi-balita-${activeAccount.name.toLowerCase().replace(/\s+/g, "-")}.csv`,
    });
  };

  // 3. Data Penyerahan Per Balita
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

  // Sinkronkan data konfirmasi, daftar balita & batch order SPPG dari localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // Ambil nama user login kader
        const syncSessionAccount = () => {
          const rawSession = localStorage.getItem("nt_current_session");
          if (rawSession) {
            try {
              const parsedSession = JSON.parse(rawSession);
              const idx = MASTER_POSYANDU_ACCOUNTS.findIndex(
                (p) =>
                  (parsedSession.unit && parsedSession.unit.toLowerCase().includes(p.unit.toLowerCase())) ||
                  (parsedSession.name && parsedSession.name.toLowerCase().includes(p.unit.toLowerCase())) ||
                  (parsedSession.email && parsedSession.email.toLowerCase() === p.email.toLowerCase())
              );
              if (idx !== -1) {
                setActivePosyanduIndex(idx);
                setVerifyKaderName(MASTER_POSYANDU_ACCOUNTS[idx].name);
              } else if (parsedSession.name) {
                setVerifyKaderName(parsedSession.name);
              }
            } catch (e) {}
          }
        };

        syncSessionAccount();
        window.addEventListener("nt_session_updated", syncSessionAccount);

        // Ambil batch pesanan dari SPPG (Tersinkronisasi 100%)
        const rawOrders = localStorage.getItem("nt_mbg_orders_puskesmas");
        if (rawOrders !== null) {
          try {
            const parsed = JSON.parse(rawOrders);
            setIncomingMbgOrders(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setIncomingMbgOrders([]);
          }
        } else {
          setIncomingMbgOrders(INITIAL_PESANAN_MBG_PUSKESMAS);
          localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(INITIAL_PESANAN_MBG_PUSKESMAS));
        }

        // Ambil data balita terkini (termasuk pendaftaran balita baru manual)
        let activeBalitas = [...BALITA_MOCK];
        const rawBalita = localStorage.getItem("nt_custom_balita");
        if (rawBalita) {
          const customBalitas = JSON.parse(rawBalita);
          if (Array.isArray(customBalitas) && customBalitas.length > 0) {
            const customMap = new Map(customBalitas.map((cb: any) => [cb.id, cb]));
            const merged = activeBalitas.map((b) => customMap.get(b.id) || b);
            const prevIds = new Set(activeBalitas.map((b) => b.id));
            const brandNew = customBalitas.filter((cb: any) => !prevIds.has(cb.id));
            activeBalitas = [...brandNew, ...merged];
          }
        }

        // Ambil riwayat konfirmasi per balita
        const rawKonfirmasi = localStorage.getItem("nt_konfirmasi_mbg_posyandu");
        const savedMap = new Map<string, any>();
        if (rawKonfirmasi) {
          const parsed = JSON.parse(rawKonfirmasi);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => savedMap.set(item.id, item));
          }
        }

        const syncedList = createMbgListFromBalita(activeBalitas.slice(0, 10), savedMap);
        setList(syncedList);
      }
    } catch (e) {}
  }, []);

  // Real-Time Sync Listener: Menangkap perubahan pesanan dari Puskesmas & Dapur SPPG secara live
  useEffect(() => {
    const handleSync = () => {
      try {
        const rawOrders = localStorage.getItem("nt_mbg_orders_puskesmas");
        if (rawOrders !== null) {
          const parsed = JSON.parse(rawOrders);
          setIncomingMbgOrders(Array.isArray(parsed) ? parsed : []);
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("nt_orders_updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("nt_orders_updated", handleSync);
    };
  }, []);

  // Handler Hapus/Reset Riwayat Berita Acara SPPG
  const handleResetBatchReceiptHistory = () => {
    if (!confirm("Hapus seluruh berita acara verifikasi kedatangan ransum SPPG dan kembalikan ke status awal?")) return;
    const resetOrders = incomingMbgOrders.map((o) => ({
      ...o,
      statusPesanan: "Dalam Pengiriman" as const,
      verifikasiPosyandu: undefined,
    }));
    setIncomingMbgOrders(resetOrders);
    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(resetOrders));
      window.dispatchEvent(new Event("nt_orders_updated"));
    } catch (e) {}
    setToastMessage("✓ Berita acara penerimaan batch SPPG berhasil dibersihkan & direset.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Handler Hapus/Reset Riwayat Serah Terima MBG Per Balita
  const handleResetDistributionHistory = () => {
    if (!confirm("Reset seluruh status serah terima MBG balita kembali ke belum diterima?")) return;
    const resetList = list.map((item) => ({
      ...item,
      statusDiterima: false,
      waktuDiterima: undefined,
      catatanPetugas: undefined,
    }));
    setList(resetList);
    try {
      localStorage.removeItem("nt_konfirmasi_mbg_posyandu");
    } catch (e) {}
    setToastMessage("✓ Seluruh riwayat serah terima MBG balita berhasil dibersihkan.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Handler Verifikasi Kedatangan Batch PO dari Dapur SPPG
  const handleStartVerify = (order: PesananMbgPuskesmas) => {
    setVerifyingOrderId(order.id);
    setVerifyPaketA(order.jumlahPaketA);
    setVerifyPaketB(order.jumlahPaketB);
    setVerifyPaketC(order.jumlahPaketC);
    setVerifyKondisi("Sangat Baik & Hangat (≥60°C)");
    setVerifyCatatan("Ransum lengkap, higienis, lauk telur omega & lele dalam kondisi hangat.");
  };

  const handleConfirmVerifyReceipt = (orderId: string) => {
    const nowStr =
      "Hari ini, " +
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
      " WIB";

    const updated = incomingMbgOrders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          statusPesanan: "Tiba di Posyandu" as const,
          verifikasiPosyandu: {
            waktuTiba: nowStr,
            kaderPenerima: verifyKaderName || "Kader Posyandu",
            paketADiterima: Number(verifyPaketA),
            paketBDiterima: Number(verifyPaketB),
            paketCDiterima: Number(verifyPaketC),
            totalDiterima: Number(verifyPaketA) + Number(verifyPaketB) + Number(verifyPaketC),
            kondisiMakanan: verifyKondisi,
            catatanPenerima: verifyCatatan,
          },
        };
      }
      return o;
    });

    setIncomingMbgOrders(updated);
    setVerifyingOrderId(null);

    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_orders_updated"));

      const rawConfirm = localStorage.getItem("nt_konfirmasi_mbg_posyandu");
      const confirms = rawConfirm ? JSON.parse(rawConfirm) : [];
      confirms.unshift({
        orderId,
        waktu: nowStr,
        kader: verifyKaderName,
        paketA: Number(verifyPaketA),
        paketB: Number(verifyPaketB),
        paketC: Number(verifyPaketC),
        kondisi: verifyKondisi,
      });
      localStorage.setItem("nt_konfirmasi_mbg_posyandu", JSON.stringify(confirms));
    } catch (e) {}

    const totalDiterima = Number(verifyPaketA) + Number(verifyPaketB) + Number(verifyPaketC);
    setToastMessage(
      `✓ Verifikasi Batch Diterima! ${totalDiterima} porsi telah diverifikasi oleh ${verifyKaderName}. Berita acara serah terima langsung diteruskan ke Dapur SPPG.`
    );
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Handler Konfirmasi Distribusi Per Balita
  const handleConfirmSingle = (id: string, namaAnak: string) => {
    const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          statusDiterima: true,
          waktuDiterima: `Hari ini, ${jam}`,
          catatanPetugas: "Dikonfirmasi langsung oleh petugas posyandu saat penyerahan paket.",
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
      catatanPetugas: item.catatanPetugas || "Dikonfirmasi langsung oleh petugas posyandu saat penyerahan paket.",
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
      {/* Banner Identitas Modul Penerimaan & Verifikasi MBG */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-sky-50/60 to-white p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Verifikasi & Penerimaan Paket Gizi MBG
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-700 mt-1">
            <strong className="text-emerald-950 font-black">{activeAccount.unit}</strong> — {activeAccount.wilayah} · Petugas PJ: <strong>{activeAccount.name}</strong>
          </p>
          <p className="font-sans text-xs text-emerald-900 font-bold mt-1">
            📅 Tanggal: {currentDate} (Penyaluran Siang) · Suplai: SPPG Dapur Sehat Socah Mandiri
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Label Akun Posyandu Terkunci (Akun Otentik Sesuai Sesi Login - Tidak Bisa Pindah) */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-emerald-300 shadow-xs font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-zinc-500 font-bold text-[11px]">Akun Posyandu:</span>
            <span className="font-sans font-black text-emerald-950 text-xs">
              {activeAccount.unit}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmAll}
            className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 font-sans text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>✓</span>
            <span>Konfirmasi Semua Paket Diterima</span>
          </button>
          <button
            type="button"
            onClick={handleResetDistributionHistory}
            className="rounded-2xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3.5 py-2.5 font-sans text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Reset / hapus riwayat checklist serah terima ke balita"
          >
            <span>🗑️ Hapus Riwayat Serah Terima</span>
          </button>
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
            <span className="text-[11px] opacity-75">Tersimpan di Sistem & Dilaporkan ke Dapur SPPG</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. BAGIAN VERIFIKASI FISIK KEDATANGAN RANSUM DARI DAPUR SPPG (BATCH PO) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-white to-sky-50/40 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white text-base shadow-xs">
              📦
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white tracking-wider">
                  Tahap 1: Verifikasi Kedatangan SPPG
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">
                  Pemeriksaan Fisik Ransum Masuk
                </span>
              </div>
              <h4 className="font-sans text-base font-black text-zinc-950 mt-0.5">
                Kedatangan Paket Ransum MBG dari Dapur SPPG Hari Ini
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Indikator Akun Posyandu Terkunci / Terisolasi */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 font-mono text-xs text-emerald-950 shadow-2xs">
              <span className="text-zinc-500 font-bold text-[11px]">📍 Posyandu:</span>
              <strong className="font-black text-emerald-950">{activeAccount.unit}</strong>
              <span className="text-[10px] text-emerald-700 font-semibold">({activeAccount.wilayah.split(",")[0].trim()})</span>
            </div>

            <button
              type="button"
              onClick={handlePrintBeritaAcara}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 px-3 py-1.5 font-mono text-[11px] font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Cetak Berita Acara MBG</span>
            </button>

            <button
              type="button"
              onClick={handleResetBatchReceiptHistory}
              className="rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 px-3 py-1.5 font-mono text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
              title="Reset seluruh berita acara penerimaan paket dari SPPG"
            >
              🗑️ Reset Berita Acara
            </button>
          </div>
        </div>

        {/* Filter Orders Khusus untuk Posyandu yang Sedang Aktif (Isolasi Total per Posyandu Desa) */}
        {(() => {
          const relevantOrders = incomingMbgOrders.filter((order) => isOrderForPosyandu(order, activeAccount));

          if (relevantOrders.length === 0) {
            return (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center space-y-3">
                <div className="text-3xl">📭</div>
                <h5 className="font-sans text-sm font-black text-zinc-800">
                  Belum Ada Surat Pesanan (PO) MBG untuk {activeAccount.unit}
                </h5>
                <p className="font-mono text-xs text-zinc-500 max-w-lg mx-auto">
                  Ransum MBG belum dipesan oleh Puskesmas Pembina untuk <strong>{activeAccount.unit} ({activeAccount.wilayah.split(",")[0].trim()})</strong>.
                  Pesanan untuk posyandu desa lain otomatis masuk ke akun Posyandu desa masing-masing dan tidak tampil di sini.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-mono text-[11px] font-bold">
                    🔒 Akun Terisolasi: Setiap Posyandu Desa hanya menerima & memverifikasi ransum wilayah kerjanya sendiri.
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className="grid gap-3.5">
              {relevantOrders.map((order) => {
                const isDelivering = order.statusPesanan === "Dalam Pengiriman" || order.statusPesanan === "Diantar";
                const isVerified = order.statusPesanan === "Tiba di Posyandu" || order.statusPesanan === "Selesai";
                const isCooking =
                  order.statusPesanan === "Diterima Dapur MBG" ||
                  order.statusPesanan === "Diterima" ||
                  order.statusPesanan === "Diproses" ||
                  order.statusPesanan === "Sedang Dimasak (Diproses)";
                const isSubmitted = order.statusPesanan === "Diajukan ke SPPG";
                const isVerifyingThis = verifyingOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all ${
                      isDelivering
                        ? "border-sky-300 bg-sky-50/50 shadow-sm"
                        : isVerified
                        ? "border-emerald-200 bg-white"
                        : isCooking
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-zinc-200 bg-zinc-50/70"
                    }`}
                  >
                    {/* Header Bar PO */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-zinc-900">{order.nomorPo}</span>
                          <span className="font-mono text-[10px] text-zinc-500">· Dipesan Puskesmas: {order.tglDibuat}</span>
                          <span className="font-mono text-[10px] text-zinc-400">({order.tglPenyaluran})</span>
                        </div>
                        <h5 className="font-sans text-sm font-black text-zinc-950 mt-0.5">
                          📍 {order.posyanduTarget}
                        </h5>
                      </div>

                      {/* Status Badge Dinamis Sesuai Tahap Verifikasi Dapur MBG */}
                      <div>
                        {isDelivering && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400 bg-sky-100 px-3 py-1 font-mono text-[10px] font-black uppercase text-sky-950 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
                            Armada SPPG Sedang Mengantar / Tiba
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 font-mono text-[10px] font-black uppercase text-emerald-950">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            ✓ Telah Diverifikasi Tiba di Posyandu
                          </span>
                        )}
                        {isCooking && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-mono text-[10px] font-black uppercase text-amber-900">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Sedang Dimasak di Dapur SPPG
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 font-mono text-[10px] font-black uppercase text-zinc-700">
                            <span className="h-2 w-2 rounded-full bg-zinc-400" />
                            Menunggu Konfirmasi Dapur SPPG
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detail Pengiriman & Porsi yang Dipesan Puskesmas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block font-bold uppercase">Dapur Penyedia (SPPG):</span>
                        <strong className="text-zinc-900 text-[11px] truncate block">{order.sppgDituju}</strong>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-zinc-100">
                        <span className="text-[10px] text-zinc-400 block font-bold uppercase">Sesi Pengiriman:</span>
                        <strong className="text-zinc-900 text-[11px] block">{order.sesiPenyaluran}</strong>
                      </div>
                      <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block font-bold uppercase">Rincian Paket MBG:</span>
                        <strong className="text-emerald-950 font-black text-xs block">
                          A: {order.jumlahPaketA} · B: {order.jumlahPaketB} {order.jumlahPaketC > 0 ? `· C: ${order.jumlahPaketC}` : ""}
                        </strong>
                      </div>
                      <div className="bg-emerald-100/70 p-2.5 rounded-xl border border-emerald-300">
                        <span className="text-[10px] text-emerald-800 block font-bold uppercase">Total Ransum Dipesan:</span>
                        <strong className="text-emerald-950 font-black text-sm block">{order.totalPorsi} Porsi</strong>
                      </div>
                    </div>

                    {/* Alur Waktu Sinkron: Puskesmas -> Dapur SPPG -> Posyandu */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      <div>
                        <span className="text-zinc-400 block font-semibold">1. Dipesan Puskesmas:</span>
                        <strong className="text-zinc-800">{order.tglDibuat}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block font-semibold">2. Diterima Dapur SPPG:</span>
                        <strong className={isCooking || isDelivering || isVerified ? "text-amber-900 font-bold" : "text-zinc-400 font-normal"}>
                          {order.jamDiterima || (isCooking || isDelivering || isVerified ? "07:15 WIB" : "Menunggu")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block font-semibold">3. Armada Berangkat:</span>
                        <strong className={isDelivering || isVerified ? "text-sky-900 font-bold" : "text-zinc-400 font-normal"}>
                          {order.jamDiantar || (isDelivering || isVerified ? "08:45 WIB" : "Belum Berangkat")}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block font-semibold">4. Serah Terima Posyandu:</span>
                        <strong className={isVerified ? "text-emerald-900 font-bold" : "text-zinc-400 font-normal"}>
                          {order.verifikasiPosyandu?.waktuTiba || "Menunggu Tiba"}
                        </strong>
                      </div>
                    </div>

                    {/* Info Catatan Pengiriman Puskesmas */}
                    {order.catatanKlinis && (
                      <p className="text-[11px] font-mono text-zinc-600 bg-white/70 p-2 rounded-xl border border-zinc-100">
                        💬 <strong>Instruksi Puskesmas:</strong> {order.catatanKlinis}
                      </p>
                    )}

                    {/* Banner Keterangan Jika Pesanan Masih di Tahap Awal */}
                    {isSubmitted && (
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700 flex items-center gap-2">
                        <span>⏳</span>
                        <span>Surat Pesanan telah diterbitkan oleh <strong>{order.puskesmasPemesan}</strong>. Menunggu Dapur SPPG (<strong>{order.sppgDituju}</strong>) mengonfirmasi dan memulai jadwal masak.</span>
                      </div>
                    )}

                    {isCooking && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 font-mono text-xs text-amber-900 flex items-center gap-2">
                        <span>🍳</span>
                        <span>Dapur SPPG (<strong>{order.sppgDituju}</strong>) sedang memasak ransum balita. Menunggu armada mobil termal diberangkatkan ke Posyandu.</span>
                      </div>
                    )}

                    {/* JIKA SUDAH DIVERIFIKASI: Tampilkan Tanda Terima Resmi */}
                    {isVerified && order.verifikasiPosyandu && (
                      <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 font-mono text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-emerald-950 font-bold border-b border-emerald-200 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <span className="text-emerald-600">✓</span>
                            <span>Berita Acara Serah Terima Ransum Lengkap</span>
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            {order.verifikasiPosyandu.waktuTiba}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-700">
                          <div>
                            <span className="text-zinc-500">Kader Penerima: </span>
                            <strong className="text-zinc-950">{order.verifikasiPosyandu.kaderPenerima}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-500">Kondisi Fisik: </span>
                            <strong className="text-emerald-800">{order.verifikasiPosyandu.kondisiMakanan}</strong>
                          </div>
                        </div>
                        <div className="text-[11px] text-emerald-950 font-semibold bg-white p-2 rounded-lg border border-emerald-200">
                          Porsi Diterima: Paket A: {order.verifikasiPosyandu.paketADiterima} porsi | Paket B: {order.verifikasiPosyandu.paketBDiterima} porsi {order.verifikasiPosyandu.paketCDiterima > 0 ? `| Paket C: ${order.verifikasiPosyandu.paketCDiterima} porsi` : ""} — Total: {order.verifikasiPosyandu.totalDiterima} porsi
                        </div>
                      </div>
                    )}

                    {/* Tombol Buka Form Verifikasi Kedatangan (Hanya Saat Armada Sedang Mengantar) */}
                    {isDelivering && !isVerifyingThis && (
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-sky-100/60 p-3 rounded-xl border border-sky-300">
                        <span className="font-mono text-xs text-sky-950 font-bold flex items-center gap-1.5">
                          <span>🚚</span>
                          <span>Armada SPPG telah tiba? Periksa fisik porsi & konfirmasi penerimaan:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartVerify(order)}
                          className="rounded-2xl bg-emerald-600 px-4 py-2 font-sans text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>✓</span>
                          <span>Verifikasi Paket Diterima</span>
                        </button>
                      </div>
                    )}

                    {/* FORM INPUT DETAIL VERIFIKASI */}
                    {isVerifyingThis && (
                      <div className="rounded-2xl border-2 border-emerald-400 bg-white p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <h6 className="font-sans text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                            <span>📝</span>
                            <span>Formulir Verifikasi Fisik Kedatangan Ransum MBG</span>
                          </h6>
                          <button
                            type="button"
                            onClick={() => setVerifyingOrderId(null)}
                            className="text-zinc-400 hover:text-zinc-700 font-mono text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-mono text-[10px] text-emerald-800 font-bold block mb-1">
                              Paket A (Gizi Reguler) Diterima:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={verifyPaketA}
                              onChange={(e) => setVerifyPaketA(Number(e.target.value))}
                              className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 p-2 font-mono text-xs font-black text-emerald-950 text-center"
                            />
                          </div>
                          <div>
                            <label className="font-mono text-[10px] text-rose-800 font-bold block mb-1">
                              Paket B (Protein Hewani Ganda):
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={verifyPaketB}
                              onChange={(e) => setVerifyPaketB(Number(e.target.value))}
                              className="w-full rounded-xl border border-rose-300 bg-rose-50/30 p-2 font-mono text-xs font-black text-rose-950 text-center"
                            />
                          </div>
                          <div>
                            <label className="font-mono text-[10px] text-amber-800 font-bold block mb-1">
                              Paket C (Medis F-100 jika ada):
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={verifyPaketC}
                              onChange={(e) => setVerifyPaketC(Number(e.target.value))}
                              className="w-full rounded-xl border border-amber-300 bg-amber-50/30 p-2 font-mono text-xs font-black text-amber-950 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-mono text-[10px] text-zinc-600 font-bold block mb-1">
                              Kondisi Suhu & Higiene Makanan:
                            </label>
                            <select
                              value={verifyKondisi}
                              onChange={(e) => setVerifyKondisi(e.target.value)}
                              className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-sans text-xs font-bold text-zinc-900"
                            >
                              <option value="Sangat Baik & Hangat (≥60°C)">Sangat Baik & Hangat (≥60°C)</option>
                              <option value="Baik & Segel Kemasan Utuh">Baik & Segel Kemasan Utuh</option>
                              <option value="Higienis & Siap Santap">Higienis & Siap Santap</option>
                              <option value="Suhu Kurang Hangat (Perlu Dihangatkan)">Suhu Kurang Hangat (Perlu Dihangatkan)</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-mono text-[10px] text-zinc-600 font-bold block mb-1">
                              Nama Kader Posyandu Penerima:
                            </label>
                            <input
                              type="text"
                              value={verifyKaderName}
                              onChange={(e) => setVerifyKaderName(e.target.value)}
                              placeholder="Nama Kader Penanggung Jawab..."
                              className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-sans text-xs font-bold text-zinc-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-mono text-[10px] text-zinc-600 font-bold block mb-1">
                            Catatan Pemeriksaan Fisik:
                          </label>
                          <input
                            type="text"
                            value={verifyCatatan}
                            onChange={(e) => setVerifyCatatan(e.target.value)}
                            placeholder="Keterangan kelengkapan porsi, lauk lele & telur omega, dll..."
                            className="w-full rounded-xl border border-zinc-300 bg-white p-2 font-sans text-xs font-bold text-zinc-900"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                          <div className="font-mono text-xs">
                            <span className="text-zinc-500">Total Porsi Diverifikasi: </span>
                            <strong className="text-emerald-950 font-black">
                              {Number(verifyPaketA) + Number(verifyPaketB) + Number(verifyPaketC)} Porsi
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleConfirmVerifyReceipt(order.id)}
                            className="rounded-2xl bg-emerald-600 px-5 py-2.5 font-sans text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <span>✓</span>
                            <span>Konfirmasi & Simpan Berita Acara Penerimaan</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* 2. BAGIAN CHECKLIST DISTRIBUSI RANSUM KE BALITA SASARAN (PER ANAK)        */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-600 text-white text-base shadow-xs">
              👶
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-700 px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white tracking-wider">
                  Tahap 2: Serah Terima Balita
                </span>
                <span className="font-mono text-xs font-bold text-zinc-500">
                  Checklist Distribusi Individu
                </span>
              </div>
              <h4 className="font-sans text-base font-black text-zinc-950 mt-0.5">
                Checklist Penyerahan Paket Gizi ke Masing-Masing Balita Sasaran
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrintChecklistBalita}
            className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>🖨️</span>
            <span>Cetak Checklist Balita</span>
          </button>
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
                          <div className="font-mono text-[10px] text-zinc-500 font-semibold">
                            {item.waktuDiterima}
                          </div>
                          <div className="font-sans text-[10px] text-emerald-700 font-bold">
                            Tervalidasi oleh Petugas Posyandu
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

      {/* Modal Cetak Dokumen Laporan Resmi Posyandu MBG */}
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
