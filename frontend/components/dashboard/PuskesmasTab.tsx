"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  KECAMATAN_PER_KABUPATEN,
  DESA_PER_KECAMATAN,
  MASTER_PUSKESMAS_INFO,
  POSYANDU_MIKRO_DATA,
  MASTER_DAPUR_MBG,
  INITIAL_PESANAN_MBG_PUSKESMAS,
  getPuskesmasNameByKecamatan,
  getPuskesmasAddressByKecamatan,
  getClosestSppgForWilayah,
  type PosyanduMikro,
  type BalitaMikro,
  type JadwalPertemuanStunting,
  type DapurMbgWilayah,
  type TitikDistribusiMbg,
  type PesananMbgPuskesmas,
  INITIAL_JADWAL_PERTEMUAN,
} from "@/lib/puskesmas-data";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

export default function PuskesmasTab() {
  const searchParams = useSearchParams();
  const faskesParam = searchParams.get("faskes")?.toLowerCase();

  // YURISDIKSI RESMI TERKUNCI (Sesuai UU PDP No. 27/2022 & Permenkes No. 2/2020)
  // Puskesmas beroperasi per kecamatan dan DILARANG mengakses/memilih wilayah puskesmas/kabupaten lain.
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>(
    faskesParam === "kedungdung" ? "Kab. Sampang" : "Kab. Bangkalan"
  );
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(
    faskesParam === "kedungdung" ? "Kedungdung" : faskesParam === "burneh" ? "Burneh" : "Socah"
  );
  
  const puskesmasName = getPuskesmasNameByKecamatan(selectedKecamatan);
  const puskesmasAddress = getPuskesmasAddressByKecamatan(selectedKecamatan);
  const closestSppg = getClosestSppgForWilayah(selectedKabupaten, selectedKecamatan);
  const desaBinaanList = DESA_PER_KECAMATAN[selectedKecamatan] || [
    "Desa Bilaporah",
    "Desa Dakiring",
    "Desa Jaddih",
    "Desa Socah",
    "Desa Keleyan",
    "Desa Petaonan",
    "Desa Junganyar",
    "Desa Pernajuh",
  ];

  // Tab internal sub-modul Puskesmas
  const [activeSubTab, setActiveSubTab] = useState<
    "posyandu_desa" | "jadwal_pertemuan" | "pesan_mbg" | "status_pesanan" | "riwayat_pesanan" | "rujukan_merah"
  >("posyandu_desa");

  // State untuk modal drill-down rincian nama balita
  const [selectedPosyandu, setSelectedPosyandu] = useState<PosyanduMikro | null>(null);
  const [filterBalitaStatus, setFilterBalitaStatus] = useState<"semua" | "stunting" | "sehat" | "rujukan">(
    "semua"
  );

  // State Jadwal Pertemuan Stunting Puskesmas -> Posyandu
  const [jadwalList, setJadwalList] = useState<JadwalPertemuanStunting[]>(INITIAL_JADWAL_PERTEMUAN);
  const [schedulingChild, setSchedulingChild] = useState<{
    balita: BalitaMikro;
    posyandu: PosyanduMikro;
  } | null>(null);

  // Form Field State untuk Buat Jadwal Pertemuan
  const [formTgl, setFormTgl] = useState("18 Nov 2026");
  const [formJam, setFormJam] = useState("09:00 WIB");
  const [formLokasi, setFormLokasi] = useState("Poli Gizi Puskesmas");
  const [formDokter, setFormDokter] = useState("dr. Nurul Hidayati, M.Gizi");
  const [formAgenda, setFormAgenda] = useState("Pemeriksaan Antropometri Lanjutan & Preskripsi Paket B Ekstra Hewani Jatim");
  const [formCatatan, setFormCatatan] = useState("Harap Ibu membawa Buku KIA dan catatan makan balita.");

  // Master Data Posyandu Mikro yang Tersinkronisasi Otomatis
  const [allPosyandu, setAllPosyandu] = useState<PosyanduMikro[]>(POSYANDU_MIKRO_DATA);
  const [toastMessage, setToastMessage] = useState<string>("");

  // State Fitur Pemesanan MBG Puskesmas ke SPPG / Dapur MBG
  const [pesananMbgList, setPesananMbgList] = useState<PesananMbgPuskesmas[]>(INITIAL_PESANAN_MBG_PUSKESMAS);
  const [orderPosyandu, setOrderPosyandu] = useState<string>("Posyandu Mawar 01 (Desa Bilaporah)");
  const [orderSppgId, setOrderSppgId] = useState<string>("SPPG-BKL-01");
  const [orderTgl, setOrderTgl] = useState<string>("Besok, 15 Nov 2026");
  const [orderSesi, setOrderSesi] = useState<"Sesi Pagi (09:00 WIB)" | "Sesi Siang (11:30 WIB)">("Sesi Pagi (09:00 WIB)");
  const [orderPaketA, setOrderPaketA] = useState<number>(6);
  const [orderPaketB, setOrderPaketB] = useState<number>(4);
  const [orderPaketC, setOrderPaketC] = useState<number>(0);
  const [orderCatatan, setOrderCatatan] = useState<string>(
    "Preskripsi MBG Puskesmas: 4 porsi Paket B diprioritaskan protein hewani ganda (dobel telur omega Blitar + lele Babat)."
  );

  // State Filter & Pencarian Riwayat Pesanan MBG
  const [riwayatSearch, setRiwayatSearch] = useState<string>("");
  const [riwayatStatusFilter, setRiwayatStatusFilter] = useState<"semua" | "selesai" | "aktif">("semua");

  // State Modal Cetak Dokumen Resmi
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

  // Sinkronkan data pendaftaran Posyandu, Balita baru, dan Pesanan MBG dari localStorage saat mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // 0. Sinkronkan Akun Puskesmas dari Sesi Login Terkunci
        const rawSession = localStorage.getItem("nt_current_session");
        if (rawSession) {
          try {
            const parsedSession = JSON.parse(rawSession);
            if (parsedSession.role === "puskesmas") {
              if (parsedSession.unit?.toLowerCase().includes("kedungdung")) {
                setSelectedKecamatan("Kedungdung");
                setSelectedKabupaten("Kab. Sampang");
              } else if (parsedSession.unit?.toLowerCase().includes("burneh")) {
                setSelectedKecamatan("Burneh");
                setSelectedKabupaten("Kab. Bangkalan");
              } else if (parsedSession.wilayah) {
                const matchedKec = Object.keys(DESA_PER_KECAMATAN).find((k) =>
                  parsedSession.wilayah.toLowerCase().includes(k.toLowerCase())
                );
                if (matchedKec) setSelectedKecamatan(matchedKec);
                if (parsedSession.wilayah.includes("Kab.")) {
                  const matchedKab = parsedSession.wilayah.split(",").find((s: string) => s.includes("Kab."));
                  if (matchedKab) setSelectedKabupaten(matchedKab.trim());
                }
              }
            }
          } catch (e) {}
        }
        // 1. Sinkronkan pendaftaran akun Posyandu Baru
        const raw = localStorage.getItem("nt_registered_posyandu");
        if (raw) {
          const registered = JSON.parse(raw);
          if (Array.isArray(registered) && registered.length > 0) {
            setAllPosyandu((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newItems = registered.filter((r: any) => !existingIds.has(r.id));
              return [...newItems, ...prev];
            });
          }
        }

        // 2. Sinkronkan balita baru yang diketik manual oleh Posyandu
        const rawBalita = localStorage.getItem("nt_custom_balita");
        if (rawBalita) {
          const customBalitas = JSON.parse(rawBalita);
          if (Array.isArray(customBalitas) && customBalitas.length > 0) {
            setAllPosyandu((prev) =>
              prev.map((p) => {
                const matched = customBalitas.filter(
                  (cb: any) => cb.posyandu === p.posyandu || cb.desa === p.desa
                );
                if (matched.length === 0) return p;

                const converted: BalitaMikro[] = matched.map((cb: any) => ({
                  id: cb.id,
                  nama: cb.nama,
                  nik: cb.nik || `3505${Date.now()}`,
                  usiaBulan: cb.usiaBulan || 12,
                  jenisKelamin: cb.jenisKelamin || "L",
                  namaIbu: cb.namaIbu || "Ibu Balita",
                  bbKg: cb.bbKg || 8.0,
                  tbCm: cb.tbCm || 72.0,
                  zTbu: cb.zTbu || -1.8,
                  zBbu: cb.zBbu || -1.4,
                  statusGizi: cb.statusNutrisi || "Sehat / Normal",
                  alokasiPaket: cb.paketMBG || "Paket A (Gizi Reguler)",
                  catatanKlinis: cb.catatan || "Data input manual dari Posyandu Desa.",
                  statusRujukan: cb.isFaltering ? "Rujukan Aktif ke Dokter Puskesmas" : "Belum Perlu Rujukan",
                }));

                const convertedMap = new Map(converted.map((b) => [b.id, b]));
                const updatedExisting = p.balitaList.map((b) => convertedMap.get(b.id) || b);
                const existingIds = new Set(p.balitaList.map((b) => b.id));
                const fresh = converted.filter((b) => !existingIds.has(b.id));
                const mergedBalitas = [...fresh, ...updatedExisting];
                const stuntingCnt = mergedBalitas.filter(
                  (b) => b.statusGizi.includes("Stunting") || b.statusGizi.includes("Waspada")
                ).length;
                const sehatCnt = mergedBalitas.length - stuntingCnt;

                return {
                  ...p,
                  balitaList: mergedBalitas,
                  totalBalita: mergedBalitas.length,
                  stuntingCount: stuntingCnt,
                  sehatCount: sehatCnt,
                  stuntingPersen: Math.round((stuntingCnt / mergedBalitas.length) * 1000) / 10,
                  sehatPersen: Math.round((sehatCnt / mergedBalitas.length) * 1000) / 10,
                };
              })
            );
          }
        }
        // 3. Sinkronkan Jadwal Pertemuan Stunting dari localStorage
        const rawJadwal = localStorage.getItem("nt_jadwal_pertemuan_puskesmas");
        if (rawJadwal) {
          const parsedJadwal = JSON.parse(rawJadwal);
          if (Array.isArray(parsedJadwal) && parsedJadwal.length > 0) {
            setJadwalList((prev) => {
              const ids = new Set(prev.map((j) => j.id));
              const fresh = parsedJadwal.filter((j: any) => !ids.has(j.id));
              return [...fresh, ...prev];
            });
          }
        }

        // 4. Sinkronkan Pesanan MBG Puskesmas dari localStorage
        const rawOrders = localStorage.getItem("nt_mbg_orders_puskesmas");
        if (rawOrders !== null) {
          const parsedOrders = JSON.parse(rawOrders);
          setPesananMbgList(Array.isArray(parsedOrders) ? parsedOrders : []);
        } else {
          setPesananMbgList(INITIAL_PESANAN_MBG_PUSKESMAS);
          localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(INITIAL_PESANAN_MBG_PUSKESMAS));
        }
      }
    } catch (e) {}
  }, []);

  // Listener sinkronisasi perubahan pesanan dari Dapur SPPG & Posyandu
  useEffect(() => {
    const handleSyncOrders = () => {
      try {
        const raw = localStorage.getItem("nt_mbg_orders_puskesmas");
        if (raw !== null) {
          setPesananMbgList(JSON.parse(raw) || []);
        }
      } catch (e) {}
    };

    const handleSyncPosyandu = () => {
      try {
        const raw = localStorage.getItem("nt_registered_posyandu");
        if (raw) {
          const registered = JSON.parse(raw);
          if (Array.isArray(registered) && registered.length > 0) {
            setAllPosyandu((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newItems = registered.filter((r: any) => !existingIds.has(r.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleSyncOrders);
    window.addEventListener("nt_orders_updated", handleSyncOrders);
    window.addEventListener("nt_posyandu_registered", handleSyncPosyandu);
    window.addEventListener("nt_balita_updated", handleSyncPosyandu);
    return () => {
      window.removeEventListener("storage", handleSyncOrders);
      window.removeEventListener("nt_orders_updated", handleSyncOrders);
      window.removeEventListener("nt_posyandu_registered", handleSyncPosyandu);
      window.removeEventListener("nt_balita_updated", handleSyncPosyandu);
    };
  }, []);

  // Handler Hapus Riwayat Jadwal Pertemuan Puskesmas
  const handleClearJadwalHistory = () => {
    if (!confirm("Hapus seluruh riwayat jadwal pertemuan konsultasi stunting?")) return;
    setJadwalList([]);
    try {
      localStorage.removeItem("nt_jadwal_pertemuan_puskesmas");
      localStorage.removeItem("nt_posyandu_notif");
    } catch (e) {}
    setToastMessage("✓ Seluruh riwayat jadwal pertemuan berhasil dibersihkan.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Handler Hapus Seluruh Riwayat Pesanan MBG Puskesmas
  const handleClearPesananHistory = () => {
    if (!confirm("Hapus seluruh riwayat pesanan MBG dari daftar?")) return;
    setPesananMbgList([]);
    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify([]));
      window.dispatchEvent(new Event("nt_orders_updated"));
    } catch (e) {}
    setToastMessage("✓ Seluruh riwayat pesanan MBG berhasil dibersihkan.");
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Handler Hapus 1 Surat Pesanan Tertentu
  const handleDeleteOrder = (orderId: string, orderNomor?: string) => {
    if (!confirm(`Hapus surat pesanan ${orderNomor || orderId} dari daftar?`)) return;
    const updated = pesananMbgList.filter((p) => p.id !== orderId);
    setPesananMbgList(updated);
    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_orders_updated"));
    } catch (e) {}
    setToastMessage(`✓ Surat pesanan ${orderNomor || orderId} berhasil dihapus.`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filter posyandu sesuai Kabupaten dan Kecamatan pilihan
  const filteredPosyandu = allPosyandu.filter(
    (p) => p.kabupaten === selectedKabupaten && p.kecamatan === selectedKecamatan
  );

  // Jika kecamatan yang dipilih belum ada mock langsung, generate posyandu desa resmi untuk kecamatan tersebut
  const displayPosyanduList: PosyanduMikro[] =
    filteredPosyandu.length > 0
      ? filteredPosyandu
      : (DESA_PER_KECAMATAN[selectedKecamatan] || [`Desa ${selectedKecamatan} 01`, `Desa ${selectedKecamatan} 02`]).slice(0, 3).map((desaName, idx) => ({
          id: `POS-${selectedKecamatan.toUpperCase()}-0${idx + 1}`,
          posyandu: `Posyandu Melati 0${idx + 1}`,
          desa: desaName,
          alamatPosyandu: `Balai RW 0${idx + 1}, ${desaName}`,
          kecamatan: selectedKecamatan,
          kabupaten: selectedKabupaten,
          puskesmas: getPuskesmasNameByKecamatan(selectedKecamatan),
          alamatPuskesmas: getPuskesmasAddressByKecamatan(selectedKecamatan),
          kaderPenanggungJawab: `Kader ${desaName}`,
          noHpKader: `0812345670${idx + 1}`,
          emailAkun: `posyandu.${desaName.toLowerCase().replace(/[^a-z0-9]/g, "")}@jatim.go.id`,
          statusAkun: "Disetujui",
          tglDaftar: "1 Okt 2026",
          totalBalita: 42 + idx * 8,
          sehatCount: 32 + idx * 6,
          sehatPersen: 76.2,
          stuntingCount: 8 + idx * 2,
          stuntingPersen: 19.0,
          falteringCount: 2,
          rujukanCount: 2,
          paketA: 32 + idx * 6,
          paketB: 8 + idx * 2,
          paketC: 2,
          balitaList: [
            {
              id: `BAL-${selectedKecamatan}-0${idx + 1}`,
              nama: `Ahmad Zainal (Balita ${desaName})`,
              nik: `350501140224000${idx + 1}`,
              usiaBulan: 15 + idx * 2,
              jenisKelamin: "L",
              namaIbu: "Siti Masitoh",
              bbKg: 8.5,
              tbCm: 73.2,
              zTbu: -2.35,
              zBbu: -2.1,
              statusGizi: "Stunting Garis Merah",
              alokasiPaket: "Paket B (Protein Ganda Jatim)",
              catatanKlinis: `Stunting terdeteksi pada penimbangan rutin Posyandu di ${desaName}, Kec. ${selectedKecamatan}.`,
              statusRujukan: "Rujukan Aktif ke Dokter Puskesmas",
            },
            {
              id: `BAL-${selectedKecamatan}-0${idx + 2}`,
              nama: `Zaskia Putri (Balita ${desaName})`,
              nik: `350501480524000${idx + 2}`,
              usiaBulan: 18,
              jenisKelamin: "P",
              namaIbu: "Nurjanah",
              bbKg: 10.4,
              tbCm: 81.6,
              zTbu: +0.2,
              zBbu: +0.1,
              statusGizi: "Sehat / Normal",
              alokasiPaket: "Paket A (Gizi Reguler)",
              catatanKlinis: "Tumbuh kembang optimal di kurva hijau KIA Dinkes Jatim.",
              statusRujukan: "Belum Perlu Rujukan",
            },
          ],
        }));

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

  // Handler Pemesanan MBG oleh Puskesmas
  const handleCreatePesananMbg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderPosyandu) {
      setToastMessage("Harap tentukan Posyandu sasaran pemesanan MBG!");
      setTimeout(() => setToastMessage(""), 4000);
      return;
    }

    const targetPosyanduObj = allPosyandu.find((p) => p.posyandu === orderPosyandu) || displayPosyanduList[0];
    const targetSppg = closestSppg;
    const totalPorsi = Number(orderPaketA) + Number(orderPaketB) + Number(orderPaketC);

    const newPo: PesananMbgPuskesmas = {
      id: `PO-MBG-${Date.now()}`,
      nomorPo: `PO-MBG/PSK-${selectedKecamatan.toUpperCase()}/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`,
      puskesmasPemesan: puskesmasName,
      sppgDituju: targetSppg.namaDapur,
      posyanduTarget: targetPosyanduObj ? `${targetPosyanduObj.posyandu} (${targetPosyanduObj.desa})` : orderPosyandu,
      desa: targetPosyanduObj ? targetPosyanduObj.desa : `Desa ${selectedKecamatan}`,
      kecamatan: selectedKecamatan,
      tglPenyaluran: orderTgl,
      sesiPenyaluran: orderSesi,
      jumlahPaketA: Number(orderPaketA),
      jumlahPaketB: Number(orderPaketB),
      jumlahPaketC: Number(orderPaketC),
      totalPorsi,
      catatanKlinis: orderCatatan || "Preskripsi pemenuhan gizi Puskesmas.",
      statusPesanan: "Diajukan ke SPPG",
      tglDibuat: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    const updated = [newPo, ...pesananMbgList];
    setPesananMbgList(updated);
    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_orders_updated"));
    } catch (err) {}

    setToastMessage(`✓ PESANAN MBG ${newPo.nomorPo} (${totalPorsi} Porsi) BERHASIL DIKIRIM KE ${targetSppg.namaDapur}!`);
    setTimeout(() => setToastMessage(""), 5000);
    setActiveSubTab("status_pesanan");
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: PesananMbgPuskesmas["statusPesanan"]) => {
    const updated = pesananMbgList.map((po) => (po.id === orderId ? { ...po, statusPesanan: nextStatus } : po));
    setPesananMbgList(updated);
    try {
      localStorage.setItem("nt_mbg_orders_puskesmas", JSON.stringify(updated));
      window.dispatchEvent(new Event("nt_orders_updated"));
    } catch (err) {}
    setToastMessage(`✓ Status Pesanan MBG diperbarui menjadi: "${nextStatus}"`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleQuickOrderForPosyandu = (pos: PosyanduMikro) => {
    setOrderPosyandu(`${pos.posyandu} (${pos.desa})`);
    setOrderPaketA(pos.paketA);
    setOrderPaketB(pos.paketB);
    setOrderPaketC(pos.paketC || 0);
    setActiveSubTab("pesan_mbg");
    setToastMessage(`Form Pemesanan MBG diisi otomatis untuk ${pos.posyandu} (${pos.desa}).`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleSaveJadwalPertemuan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingChild) return;

    const newJadwal: JadwalPertemuanStunting = {
      id: `JADWAL-${Date.now()}`,
      puskesmas: puskesmasName,
      posyanduTarget: schedulingChild.posyandu.posyandu,
      desa: schedulingChild.posyandu.desa,
      namaBalita: schedulingChild.balita.nama,
      nikBalita: schedulingChild.balita.nik,
      tglPertemuan: formTgl,
      waktuPertemuan: formJam,
      lokasi: formLokasi,
      dokterPemeriksa: formDokter,
      agendaIntervensi: formAgenda,
      catatanKhusus: formCatatan,
      status: "Dijadwalkan",
      tglDibuat: "Hari ini, " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    const updated = [newJadwal, ...jadwalList];
    setJadwalList(updated);

    try {
      localStorage.setItem("nt_jadwal_pertemuan_puskesmas", JSON.stringify(updated));

      // Kirim notifikasi langsung ke akun Posyandu
      const rawNotif = localStorage.getItem("nt_posyandu_notif");
      const notifs = rawNotif ? JSON.parse(rawNotif) : [];
      notifs.unshift({
        id: `NOTIF-${Date.now()}`,
        puskesmas: puskesmasName,
        posyanduTarget: schedulingChild.posyandu.posyandu,
        desa: schedulingChild.posyandu.desa,
        namaBalita: schedulingChild.balita.nama,
        nikBalita: schedulingChild.balita.nik,
        tglPertemuan: formTgl,
        waktuPertemuan: formJam,
        lokasi: formLokasi,
        dokterPemeriksa: formDokter,
        agenda: formAgenda,
        catatan: formCatatan,
        waktuKirim: "Baru saja",
        dibaca: false,
      });
      localStorage.setItem("nt_posyandu_notif", JSON.stringify(notifs));
    } catch (err) {}

    setToastMessage(`✓ JADWAL PERTEMUAN STUNTING untuk "${schedulingChild.balita.nama}" BERHASIL DITERBITKAN! Notifikasi otomatis terkirim ke Akun ${schedulingChild.posyandu.posyandu}.`);
    setSchedulingChild(null);
    setActiveSubTab("jadwal_pertemuan");
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleCompleteJadwal = (id: string, namaBalita: string) => {
    const updated = jadwalList.map((j) => (j.id === id ? { ...j, status: "Selesai" as const } : j));
    setJadwalList(updated);
    try {
      localStorage.setItem("nt_jadwal_pertemuan_puskesmas", JSON.stringify(updated));
    } catch (e) {}
    setToastMessage(`✓ Pertemuan klinis & intervensi stunting untuk ${namaBalita} ditandai SELESAI.`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleTindakLanjutBalita = (namaBalita: string) => {
    setToastMessage(`✓ Tindak lanjut rujukan medis & kunjungan nakes untuk ${namaBalita} berhasil dijadwalkan!`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // 1. Cetak Laporan Rincian Balita di Posyandu Tertentu
  const handlePrintPosyanduMikro = (pos: PosyanduMikro) => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setPrintReportData({
      instansi: `PEMERINTAH KABUPATEN ${selectedKabupaten.replace("Kab. ", "").replace("Kota ", "").toUpperCase()}`,
      subInstansi: `DINAS KESEHATAN · PUSKESMAS ${puskesmasName.toUpperCase()} · ${pos.posyandu.toUpperCase()}`,
      alamatInstansi: `${puskesmasAddress} · Wilayah Binaan Desa ${pos.desa}, Kec. ${selectedKecamatan}`,
      judulLaporan: `LAPORAN HASIL PENIMBANGAN DAN SKRINING STUNTING TINGKAT POSYANDU`,
      nomorSurat: `440/${pos.id}/PKM-${selectedKecamatan.toUpperCase()}/${new Date().getFullYear()}`,
      wilayah: `${pos.posyandu}, Desa ${pos.desa}, Kec. ${selectedKecamatan}, ${selectedKabupaten}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. H. Achmad Syafi'i",
        jabatan: `Kepala ${puskesmasName}`,
        nip: "19780512 200312 1 004",
      },
      summaryItems: [
        { label: "Total Balita", value: `${pos.totalBalita} Anak` },
        { label: "Balita Sehat (Paket A)", value: `${pos.sehatCount} Anak`, subtext: `${pos.sehatPersen}% Normal` },
        { label: "Stunting / Faltering (Paket B)", value: `${pos.stuntingCount} Anak`, subtext: `${pos.stuntingPersen}% Kasus` },
        { label: "Rujukan Medis Puskesmas", value: `${pos.rujukanCount} Anak`, subtext: "Pemeriksaan Dokter" },
      ],
      columns: [
        { header: "Nama Balita & NIK", key: "namaInfo" },
        { header: "Usia & JK", key: "usiaJk" },
        { header: "Nama Ibu", key: "namaIbu" },
        { header: "Antropometri", key: "antropometri" },
        { header: "Z-Score TB/U", key: "zTbuStr" },
        { header: "Status Gizi", key: "statusGizi" },
        { header: "Alokasi MBG", key: "alokasiPaket" },
        { header: "Tindak Lanjut Faskes", key: "tindakLanjut" },
      ],
      data: pos.balitaList.map((b) => {
        const needsInterv = isBalitaStuntingOrFaltering(b);
        const existing = jadwalList.find(
          (j) =>
            (j.namaBalita.toLowerCase().trim() === b.nama.toLowerCase().trim() ||
              (j.nikBalita && b.nik && j.nikBalita === b.nik)) &&
            j.status !== "Dibatalkan"
        );
        return {
          namaInfo: `${b.nama} (NIK: ${b.nik})`,
          usiaJk: `${b.usiaBulan} Bln (${b.jenisKelamin})`,
          namaIbu: b.namaIbu,
          antropometri: `BB: ${b.bbKg}kg | TB: ${b.tbCm}cm`,
          zTbuStr: `${b.zTbu > 0 ? "+" : ""}${b.zTbu} SD`,
          statusGizi: b.statusGizi,
          alokasiPaket: b.alokasiPaket,
          tindakLanjut: existing
            ? `Terjadwal (${existing.tglPertemuan})`
            : needsInterv
            ? "Perlu Jadwal Dokter"
            : "Terpantau Baik",
        };
      }),
      catatanKhusus: `Seluruh balita yang mengalami faltering/stunting di ${pos.posyandu} telah otomatis dikoordinasikan untuk mendapatkan intervensi menu Paket B (Protein Hewani Ganda Jatim) dan terjadwal pada poli gizi ${puskesmasName}.`,
      filenameCsv: `laporan-posyandu-${pos.posyandu.toLowerCase().replace(/\s+/g, "-")}.csv`,
    });
  };

  // 2. Cetak Rekapitulasi Seluruh Wilayah Binaan Puskesmas
  const handlePrintPuskesmasRekap = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const totalBalitaKec = displayPosyanduList.reduce((acc, p) => acc + p.totalBalita, 0);
    const totalStuntingKec = displayPosyanduList.reduce((acc, p) => acc + p.stuntingCount, 0);
    const avgStunting =
      totalBalitaKec > 0 ? Math.round((totalStuntingKec / totalBalitaKec) * 1000) / 10 : 0;

    setPrintReportData({
      instansi: `PEMERINTAH KABUPATEN ${selectedKabupaten.replace("Kab. ", "").replace("Kota ", "").toUpperCase()}`,
      subInstansi: `DINAS KESEHATAN · PUSKESMAS ${puskesmasName.toUpperCase()}`,
      alamatInstansi: `${puskesmasAddress} · Wilayah Kerja Binaan Kecamatan ${selectedKecamatan}`,
      judulLaporan: `REKAPITULASI PEMANTAUAN STUNTING & DISTRIBUSI MBG KECAMATAN`,
      nomorSurat: `440/REKAP-PKM/${selectedKecamatan.toUpperCase()}/${new Date().getFullYear()}`,
      wilayah: `Kecamatan ${selectedKecamatan}, ${selectedKabupaten}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. H. Achmad Syafi'i",
        jabatan: `Kepala ${puskesmasName}`,
        nip: "19780512 200312 1 004",
      },
      summaryItems: [
        { label: "Posyandu Binaan", value: `${displayPosyanduList.length} Titik`, subtext: `${desaBinaanList.length} Desa` },
        { label: "Total Balita Terdata", value: `${totalBalitaKec} Anak` },
        { label: "Prevalensi Stunting Kec", value: `${avgStunting}%`, subtext: `${totalStuntingKec} Kasus Faltering` },
        { label: "Dapur MBG Mitra", value: closestSppg.namaDapur.split(" ")[0] + " " + closestSppg.namaDapur.split(" ")[1] },
      ],
      columns: [
        { header: "Posyandu & Desa", key: "posyanduDesa" },
        { header: "Kader Penanggung Jawab", key: "kader" },
        { header: "Total Anak", key: "totalBalita", align: "center" },
        { header: "Sehat (Paket A)", key: "sehatCount", align: "center" },
        { header: "Stunting (Paket B)", key: "stuntingCount", align: "center" },
        { header: "Rujukan Faskes", key: "rujukanCount", align: "center" },
        { header: "Prevalensi Stunting", key: "stuntingPersen", align: "center" },
        { header: "Dapur SPPG Terdekat", key: "sppg" },
      ],
      data: displayPosyanduList.map((p) => ({
        posyanduDesa: `${p.posyandu} (Desa ${p.desa})`,
        kader: p.kaderPenanggungJawab,
        totalBalita: `${p.totalBalita} Anak`,
        sehatCount: `${p.sehatCount} (${p.sehatPersen}%)`,
        stuntingCount: `${p.stuntingCount} (${p.stuntingPersen}%)`,
        rujukanCount: `${p.rujukanCount} Anak`,
        stuntingPersen: `${p.stuntingPersen}%`,
        sppg: closestSppg.namaDapur,
      })),
      catatanKhusus: `Laporan resmi ini diterbitkan secara berkala untuk pengawasan dinas kesehatan dan koordinasi rantai pasok ransum MBG lokal Jawa Timur.`,
      filenameCsv: `rekap-stunting-puskesmas-${selectedKecamatan.toLowerCase()}.csv`,
    });
  };

  // 3. Cetak Rekap Jadwal Pertemuan Stunting
  const handlePrintJadwalStunting = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setPrintReportData({
      instansi: `PEMERINTAH KABUPATEN ${selectedKabupaten.replace("Kab. ", "").replace("Kota ", "").toUpperCase()}`,
      subInstansi: `DINAS KESEHATAN · PUSKESMAS ${puskesmasName.toUpperCase()}`,
      alamatInstansi: `${puskesmasAddress}`,
      judulLaporan: `DAFTAR JADWAL LAYANAN INTERVENSI MEDIS & POLI GIZI STUNTING`,
      nomorSurat: `440/JADWAL-GIZI/PKM/${new Date().getFullYear()}`,
      wilayah: `Kecamatan ${selectedKecamatan}, ${selectedKabupaten}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. Nurul Hidayati, M.Gizi",
        jabatan: "Dokter Penanggung Jawab Gizi Klinis",
        nip: "19840215 201001 2 018",
      },
      summaryItems: [
        { label: "Total Jadwal", value: `${jadwalList.length} Balita` },
        { label: "Status Terjadwal", value: `${jadwalList.filter((j) => j.status === "Dijadwalkan").length} Kasus` },
        { label: "Status Selesai", value: `${jadwalList.filter((j) => j.status === "Selesai").length} Kasus` },
        { label: "Lokasi Layanan", value: `Poli Gizi Puskesmas` },
      ],
      columns: [
        { header: "Tanggal & Jam", key: "jadwalWaktu" },
        { header: "Nama Balita & NIK", key: "balitaInfo" },
        { header: "Posyandu Asal", key: "posyanduInfo" },
        { header: "Dokter Pemeriksa", key: "dokter" },
        { header: "Agenda Intervensi", key: "agenda" },
        { header: "Status", key: "status" },
      ],
      data: jadwalList.map((j) => ({
        jadwalWaktu: `${j.tglPertemuan} - ${j.waktuPertemuan}`,
        balitaInfo: `${j.namaBalita} (NIK: ${j.nikBalita || "-"})`,
        posyanduInfo: `${j.posyanduTarget} (${j.desa})`,
        dokter: j.dokterPemeriksa,
        agenda: j.agendaIntervensi,
        status: j.status,
      })),
      catatanKhusus: `Semua pertemuan klinis mewajibkan kehadiran orang tua balita dengan membawa Buku KIA dan buku catatan makan harian.`,
      filenameCsv: `jadwal-intervensi-stunting-${selectedKecamatan.toLowerCase()}.csv`,
    });
  };

  // 4. Cetak Rekap Pesanan MBG Puskesmas
  const handlePrintPesananMbg = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const totalA = pesananMbgList.reduce((acc, p) => acc + p.jumlahPaketA, 0);
    const totalB = pesananMbgList.reduce((acc, p) => acc + p.jumlahPaketB, 0);

    setPrintReportData({
      instansi: `PEMERINTAH KABUPATEN ${selectedKabupaten.replace("Kab. ", "").replace("Kota ", "").toUpperCase()}`,
      subInstansi: `DINAS KESEHATAN · PUSKESMAS ${puskesmasName.toUpperCase()}`,
      alamatInstansi: `${puskesmasAddress}`,
      judulLaporan: `REKAPITULASI ALOKASI PESANAN MAKAN BERGIZI GRATIS (MBG) KE SPPG`,
      nomorSurat: `440/MBG-ORDER/PKM/${new Date().getFullYear()}`,
      wilayah: `Kecamatan ${selectedKecamatan}, ${selectedKabupaten}`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "dr. H. Achmad Syafi'i",
        jabatan: `Kepala ${puskesmasName}`,
        nip: "19780512 200312 1 004",
      },
      summaryItems: [
        { label: "Total Pesanan", value: `${pesananMbgList.length} Order` },
        { label: "Total Paket A", value: `${totalA} Porsi`, subtext: "Gizi Reguler" },
        { label: "Total Paket B", value: `${totalB} Porsi`, subtext: "Ekstra Protein Hewani" },
        { label: "Sentra SPPG Tujuan", value: closestSppg.namaDapur.split(" ")[0] + " " + closestSppg.namaDapur.split(" ")[1] },
      ],
      columns: [
        { header: "ID Order", key: "idPesanan" },
        { header: "Posyandu Sasaran", key: "posyanduTarget" },
        { header: "Jadwal Kirim", key: "jadwalKirim" },
        { header: "Paket A (Porsi)", key: "paketA", align: "center" },
        { header: "Paket B (Porsi)", key: "paketB", align: "center" },
        { header: "Status Distribusi", key: "statusPesanan" },
      ],
      data: pesananMbgList.map((p) => ({
        idPesanan: p.id,
        posyanduTarget: p.posyanduTarget,
        jadwalKirim: `${p.tglPenyaluran} (${p.sesiPenyaluran})`,
        paketA: p.jumlahPaketA,
        paketB: p.jumlahPaketB,
        statusPesanan: p.statusPesanan,
      })),
      catatanKhusus: `Pesanan MBG Puskesmas wajib diverifikasi oleh nutrisionis puskesmas sebelum diserahkan ke Dapur MBG SPPG mitra.`,
      filenameCsv: `rekap-pesanan-mbg-${selectedKecamatan.toLowerCase()}.csv`,
    });
  };

  const activeOrdersCount = pesananMbgList.filter((p) => p.statusPesanan !== "Tiba di Posyandu").length;
  const completedOrdersCount = pesananMbgList.filter((p) => p.statusPesanan === "Tiba di Posyandu").length;

  // Helper deteksi komprehensif balita stunting / faltering / perlu intervensi klinis Puskesmas
  const isBalitaStuntingOrFaltering = (balita: BalitaMikro) => {
    const gizi = (balita.statusGizi || "").toLowerCase();
    const paket = (balita.alokasiPaket || "").toLowerCase();
    const rujukan = (balita.statusRujukan || "").toLowerCase();

    return (
      gizi.includes("stunting") ||
      gizi.includes("faltering") ||
      gizi.includes("waspada") ||
      gizi.includes("gizi buruk") ||
      gizi.includes("gizi kurang") ||
      gizi.includes("merah") ||
      rujukan.includes("rujuk") ||
      rujukan.includes("dokter") ||
      rujukan.includes("faskes") ||
      paket.includes("paket b") ||
      paket.includes("paket c") ||
      paket.includes("protein") ||
      balita.zTbu < -1.5
    );
  };

  const isBalitaPerluRujukan = (balita: BalitaMikro) => {
    const gizi = (balita.statusGizi || "").toLowerCase();
    const rujukan = (balita.statusRujukan || "").toLowerCase();
    const paket = (balita.alokasiPaket || "").toLowerCase();
    return (
      gizi.includes("rujukan") ||
      gizi.includes("gizi buruk") ||
      rujukan.includes("rujuk") ||
      paket.includes("paket c") ||
      balita.zTbu <= -3.0
    );
  };

  const isBalitaSehat = (balita: BalitaMikro) => {
    return !isBalitaStuntingOrFaltering(balita);
  };

  // Filter balita di dalam modal rincian mikro posyandu
  const getFilteredBalitaInModal = () => {
    if (!selectedPosyandu) return [];
    if (filterBalitaStatus === "stunting") {
      return selectedPosyandu.balitaList.filter((b) => isBalitaStuntingOrFaltering(b));
    }
    if (filterBalitaStatus === "sehat") {
      return selectedPosyandu.balitaList.filter((b) => isBalitaSehat(b));
    }
    if (filterBalitaStatus === "rujukan") {
      return selectedPosyandu.balitaList.filter((b) => isBalitaPerluRujukan(b));
    }
    return selectedPosyandu.balitaList;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Header & Yurisdiksi Resmi Puskesmas (Terkunci Sesuai Wilayah Kerja) */}
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

          {/* Unit Puskesmas Tag Terkunci Permanen & Tombol Cetak Laporan */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintPuskesmasRekap}
              className="rounded-2xl bg-[#18140B] text-white hover:bg-emerald-600 px-4 py-2 font-sans text-xs font-black transition-all shadow-xs flex items-center gap-2"
            >
              <span>🖨️</span>
              <span>Cetak Laporan Faskes Kecamatan</span>
            </button>
            <span className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 font-mono text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-xs">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                🏥
              </span>
              <span>{puskesmasName} ({selectedKabupaten})</span>
              <span className="rounded-md bg-emerald-700 px-1.5 py-0.5 text-[9px] font-black text-white">
                Terkunci Akun
              </span>
            </span>
          </div>
        </div>

        {/* Panel Yurisdiksi Resmi Terkunci (RBAC & Privasi Rekam Medis) */}
        <div className="grid gap-4 lg:grid-cols-3 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60 p-5 rounded-2xl border border-emerald-200/90 shadow-xs">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-700 text-white font-mono text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                Yurisdiksi Resmi Faskes
              </span>
              <span className="font-mono text-xs text-zinc-500 font-semibold">
                Kode Faskes Kemenkes: P3526010101
              </span>
            </div>
            <h3 className="font-sans text-xl font-black text-zinc-950 flex items-center gap-2">
              <span>{puskesmasName}</span>
              <span className="text-sm font-normal text-zinc-600">({selectedKabupaten})</span>
            </h3>
            <p className="font-sans text-xs text-zinc-700 leading-relaxed">
              📍 <strong>Wilayah Kerja Terkunci:</strong> Menanungi {desaBinaanList.length} Desa Binaan di wilayah <strong>Kecamatan {selectedKecamatan}</strong>:{" "}
              <span className="font-mono text-[11px] text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md font-bold">
                {desaBinaanList.join(", ")}
              </span>
            </p>
            <p className="font-mono text-[11px] text-zinc-500">
              Alamat Faskes: {puskesmasAddress} · Kepala Faskes: dr. H. Achmad Syafi&apos;i · Nutrisionis: dr. Nurul Hidayati, M.Gizi
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300 bg-white p-4 flex flex-col justify-between space-y-2.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">🔒</span>
              <div>
                <span className="font-sans text-xs font-black text-zinc-950 block">
                  Akses Data Medis Terbatas (Terkunci)
                </span>
                <p className="font-sans text-[11px] text-zinc-600 leading-normal mt-0.5">
                  Sesuai <strong>UU PDP No. 27/2022</strong> & <strong>Permenkes No. 2/2020</strong>, akun Puskesmas ini terkunci khusus pada wilayah kerja Kecamatan {selectedKecamatan}. Akses ke kecamatan lain tidak diperkenankan.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-2 font-mono text-[10px] text-emerald-800">
              <span>● Status Basis Data: Terhubung</span>
              <strong className="font-black">{displayPosyanduList.length} Posyandu Binaan</strong>
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
          onClick={() => setActiveSubTab("jadwal_pertemuan")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "jadwal_pertemuan"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>📅</span>
          <span>Jadwal Pertemuan Stunting ({jadwalList.length})</span>
          <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 font-mono text-[9px] font-black animate-pulse">
            Notif Posyandu
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pesan_mbg")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "pesan_mbg"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🍱</span>
          <span>Pesan Ransum MBG</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("status_pesanan")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "status_pesanan"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🚚</span>
          <span>Status Pesanan</span>
          {activeOrdersCount > 0 && (
            <span className="rounded-full bg-sky-500 text-white px-2 py-0.5 font-mono text-[9px] font-black animate-pulse">
              {activeOrdersCount} Berjalan
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("riwayat_pesanan")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "riwayat_pesanan"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>📜</span>
          <span>Riwayat Pesan MBG</span>
          <span className="rounded-full bg-zinc-200 text-zinc-800 px-2 py-0.5 font-mono text-[9px] font-black">
            {pesananMbgList.length}
          </span>
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

      {/* SUB-TAB BARU: JADWAL PERTEMUAN STUNTING & NOTIFIKASI OTOMATIS KE POSYANDU */}
      {activeSubTab === "jadwal_pertemuan" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
            <div>
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>📅</span>
                <span>Jadwal Pertemuan Intervensi Klinis Stunting — {puskesmasName}</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Setiap jadwal yang dibuat dokter faskes akan **langsung terkirim sebagai notifikasi real-time ke akun Posyandu terkait**.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrintJadwalStunting}
                className="rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-100 px-3.5 py-1.5 font-mono text-xs font-bold text-zinc-800 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Cetak Rekap Jadwal</span>
              </button>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 font-mono text-xs font-bold text-rose-800">
                ● {jadwalList.filter((j) => j.status === "Dijadwalkan").length} Pertemuan Menunggu
              </span>
              <button
                type="button"
                onClick={handleClearJadwalHistory}
                className="rounded-2xl border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1 font-mono text-xs font-bold text-rose-700 transition-colors shadow-2xs"
                title="Hapus seluruh riwayat jadwal pertemuan"
              >
                🗑️ Hapus Riwayat Jadwal
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {jadwalList.map((j) => (
              <div
                key={j.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs space-y-3 relative hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {j.posyanduTarget} · {j.desa}
                    </span>
                    <h4 className="font-sans text-lg font-black text-zinc-950 mt-1">
                      {j.namaBalita}
                    </h4>
                    <p className="font-mono text-xs text-zinc-500">NIK: {j.nikBalita}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-black ${
                      j.status === "Dijadwalkan"
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    ● {j.status}
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-zinc-700">
                    <span className="text-zinc-400">Waktu:</span>
                    <strong>{j.tglPertemuan} pukul {j.waktuPertemuan}</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-700">
                    <span className="text-zinc-400">Lokasi:</span>
                    <strong className="text-right">{j.lokasi}</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-700">
                    <span className="text-zinc-400">Dokter/Nakes:</span>
                    <strong>{j.dokterPemeriksa}</strong>
                  </div>
                </div>

                <div className="text-xs text-zinc-700 bg-sky-50/70 p-3 rounded-2xl border border-sky-200 font-sans">
                  <div className="font-bold text-sky-950 mb-0.5">Agenda Intervensi:</div>
                  <p>{j.agendaIntervensi}</p>
                  {j.catatanKhusus && (
                    <p className="mt-1 font-mono text-[11px] text-zinc-500">Catatan: {j.catatanKhusus}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">
                    ✓ Notif Terkirim ke Posyandu
                  </span>
                  {j.status === "Dijadwalkan" && (
                    <button
                      type="button"
                      onClick={() => handleCompleteJadwal(j.id, j.namaBalita)}
                      className="rounded-xl bg-[#18140B] px-3 py-1.5 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs"
                    >
                      Tandai Selesai Diperiksa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

                  {/* Tombol Aksi Puskesmas */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-sans gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickOrderForPosyandu(pos);
                      }}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-950 hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>🍱</span>
                      <span>Pesan Ransum MBG</span>
                    </button>
                    <span className="flex items-center gap-1 font-black text-[#032D30] group-hover:text-emerald-700 transition-colors">
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

      {/* ========================================================
          1. FITUR PESAN: FORMULIR PEMESANAN RANSUM MBG
          ======================================================== */}
      {activeSubTab === "pesan_mbg" && (
        <div className="space-y-6">
          {/* Header Subtab Pesan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500 text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase">
                  Surat Pesanan Resmi (PO)
                </span>
                <span className="font-mono text-xs text-zinc-500 font-bold">
                  {puskesmasName} · {selectedKabupaten}
                </span>
              </div>
              <h3 className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950 mt-1 flex items-center gap-2">
                <span>🍱</span>
                <span>Formulir Pemesanan Ransum MBG</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Penerbitan surat pesanan (PO) ransum bergizi balita untuk Posyandu sasaran, dialokasikan langsung ke Dapur SPPG mitra terdekat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab("status_pesanan")}
                className="rounded-2xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-950 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚚</span>
                <span>Status Pesanan ({activeOrdersCount} Berjalan)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("riwayat_pesanan")}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>📜</span>
                <span>Riwayat Pesan ({pesananMbgList.length})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Pemesanan MBG Puskesmas */}
            <div className="lg:col-span-7 rounded-[28px] border border-zinc-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="font-sans text-base font-black text-zinc-950 flex items-center gap-2">
                  <span>📝</span>
                  <span>Input Parameter Pemesanan Ransum</span>
                </h4>
                <p className="font-mono text-xs text-zinc-500 mt-0.5">
                  Sesuaikan jumlah porsi berdasarkan data penimbangan dan status gizi balita posyandu.
                </p>
              </div>

              <form onSubmit={handleCreatePesananMbg} className="space-y-4 text-xs font-sans">
                {/* 1. Posyandu Sasaran */}
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Posyandu Sasaran Distribusi:
                  </label>
                  <select
                    value={orderPosyandu}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setOrderPosyandu(chosen);
                      const matched = allPosyandu.find((p) => `${p.posyandu} (${p.desa})` === chosen || p.posyandu === chosen);
                      if (matched) {
                        setOrderPaketA(matched.paketA);
                        setOrderPaketB(matched.paketB);
                        setOrderPaketC(matched.paketC || 0);
                      }
                    }}
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-3 font-sans text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  >
                    {displayPosyanduList.map((pos) => (
                      <option key={pos.id} value={`${pos.posyandu} (${pos.desa})`}>
                        {pos.posyandu} ({pos.desa}) — {pos.totalBalita} Balita ({pos.stuntingCount} Stunting)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tanggal & Sesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-800 mb-1">
                      Tanggal Penyaluran:
                    </label>
                    <input
                      type="text"
                      value={orderTgl}
                      onChange={(e) => setOrderTgl(e.target.value)}
                      placeholder="e.g. Besok, 15 Nov 2026"
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-2.5 font-sans text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-800 mb-1">
                      Sesi Distribusi:
                    </label>
                    <select
                      value={orderSesi}
                      onChange={(e) => setOrderSesi(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-2.5 font-sans text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    >
                      <option value="Sesi Pagi (09:00 WIB)">Sesi Pagi (09:00 WIB)</option>
                      <option value="Sesi Siang (11:30 WIB)">Sesi Siang (11:30 WIB)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Rincian Porsi Paket */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase text-zinc-700">
                      Alokasi Porsi Paket Berdasarkan Status Gizi
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      Formula Standar Kemenkes RI
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <label className="font-mono text-[10px] text-emerald-800 font-bold block mb-1">
                        Paket A (Reguler)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={orderPaketA}
                        onChange={(e) => setOrderPaketA(Number(e.target.value))}
                        className="w-full rounded-lg border border-emerald-300 bg-emerald-50/30 p-2 font-mono text-sm font-black text-emerald-950 text-center focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[9px] text-zinc-400 block mt-1 text-center font-mono">Balita Gizi Baik</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-rose-200">
                      <label className="font-mono text-[10px] text-rose-800 font-bold block mb-1">
                        Paket B (Protein Hewani)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={orderPaketB}
                        onChange={(e) => setOrderPaketB(Number(e.target.value))}
                        className="w-full rounded-lg border border-rose-300 bg-rose-50/30 p-2 font-mono text-sm font-black text-rose-950 text-center focus:outline-none focus:border-rose-500"
                      />
                      <span className="text-[9px] text-rose-500 block mt-1 text-center font-mono">Intervensi Stunting</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <label className="font-mono text-[10px] text-amber-800 font-bold block mb-1">
                        Paket C (F-100/Khusus)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={orderPaketC}
                        onChange={(e) => setOrderPaketC(Number(e.target.value))}
                        className="w-full rounded-lg border border-amber-300 bg-amber-50/30 p-2 font-mono text-sm font-black text-amber-950 text-center focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[9px] text-amber-600 block mt-1 text-center font-mono">Terapi Pemulihan</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-200 pt-2.5 font-mono text-xs">
                    <span className="text-zinc-600 font-medium">Total Ransum Dipesan:</span>
                    <strong className="text-zinc-950 font-black text-base bg-emerald-100 text-emerald-900 px-3 py-0.5 rounded-lg border border-emerald-200">
                      {Number(orderPaketA) + Number(orderPaketB) + Number(orderPaketC)} porsi
                    </strong>
                  </div>
                </div>

                {/* 4. Catatan Klinis Puskesmas */}
                <div>
                  <label className="block font-bold text-zinc-800 mb-1">
                    Instruksi Medis / Catatan Khusus Faskes:
                  </label>
                  <textarea
                    rows={2}
                    value={orderCatatan}
                    onChange={(e) => setOrderCatatan(e.target.value)}
                    placeholder="Instruksi alergi, pengemasan hangat, atau perhatian dokter..."
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50/50 p-2.5 font-sans text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#18140B] py-3.5 text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚀</span>
                  <span>Terbitkan Surat Pesanan (PO) & Kirim ke SPPG</span>
                </button>
              </form>
            </div>

            {/* Right Column: Preview Alokasi Dapur SPPG Terdekat & Rangkuman PO */}
            <div className="lg:col-span-5 space-y-4">
              {/* Dapur SPPG Terdekat Terpilih Otomatis */}
              <div className="rounded-[28px] border border-sky-300 bg-sky-50/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-black text-sky-950 bg-sky-200/90 px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                    <span>🎯</span>
                    <span>Dapur SPPG Terdekat (Dialokasikan Otomatis)</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ● Siap Melayani
                  </span>
                </div>

                <div>
                  <h5 className="font-sans text-sm font-black text-zinc-950 flex items-center gap-1.5">
                    <span>🍲</span>
                    <span>{closestSppg.namaDapur}</span>
                  </h5>
                  <p className="font-mono text-xs text-zinc-600 mt-1 leading-relaxed">
                    📍 {closestSppg.alamatDapur}
                  </p>
                  <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
                    Zona Kerja: Kec. {closestSppg.kecamatanLayanan.join(", ")} ({closestSppg.kabupaten})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-sky-200/70 pt-3 font-mono text-[11px] text-sky-950">
                  <div className="bg-white/80 p-2 rounded-xl">
                    <span className="text-zinc-400 block text-[10px]">Kapasitas Harian</span>
                    <strong className="text-zinc-900">{closestSppg.kapasitasHarian} porsi/hari</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl">
                    <span className="text-zinc-400 block text-[10px]">Ahli Gizi PJ</span>
                    <strong className="text-zinc-900 truncate block">{closestSppg.ahliGiziPj}</strong>
                  </div>
                </div>
              </div>

              {/* Rangkuman Surat Pesanan Live */}
              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-xs space-y-3">
                <h5 className="font-sans text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Ringkasan Ransum yang Dipesan</span>
                </h5>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Posyandu Tujuan:</span>
                    <span className="font-bold text-zinc-900 text-right">{orderPosyandu}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Jadwal Pengiriman:</span>
                    <span className="font-bold text-zinc-900">{orderTgl} · {orderSesi}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Komposisi Menu:</span>
                    <span className="font-bold text-zinc-900">
                      {orderPaketA} Reguler · {orderPaketB} Hewani · {orderPaketC} Khusus
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-sm pt-1">
                    <span className="text-zinc-900 font-bold">Total Ransum:</span>
                    <span className="font-black text-emerald-700">
                      {Number(orderPaketA) + Number(orderPaketB) + Number(orderPaketC)} Porsi
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-3 border border-zinc-100 text-[11px] font-mono text-zinc-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-800 font-bold">
                    <span>🛡️</span>
                    <span>Standar Pelayanan Logistik MBG:</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    1. Ransum dikemas dalam wadah termal tertutup suhu minimum 60°C.
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    2. Pengiriman dipantau real-time pada tab <strong>Status Pesanan</strong>.
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    3. Kader Posyandu melakukan verifikasi fisik jumlah & mutu saat tiba.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. FITUR STATUS PESANAN: PELACAKAN STATUS & ARMADA YANG BERJALAN
          ======================================================== */}
      {activeSubTab === "status_pesanan" && (
        <div className="space-y-6">
          {/* Header Subtab Status Pesanan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-500 text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase">
                  Pelacakan Logistik Real-Time
                </span>
                <span className="font-mono text-xs text-zinc-500 font-bold">
                  {puskesmasName} · {selectedKabupaten}
                </span>
              </div>
              <h3 className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950 mt-1 flex items-center gap-2">
                <span>🚚</span>
                <span>Status & Pelacakan Armada Pesanan MBG</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Pelacakan alur pesanan dari verifikasi dapur SPPG hingga pengantaran armada logistik ke Posyandu sasaran.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-2xl border border-sky-300 bg-sky-50 px-3.5 py-1.5 font-mono text-xs font-bold text-sky-950 shadow-xs">
                ● {activeOrdersCount} Pesanan Sedang Berjalan
              </span>
              <button
                type="button"
                onClick={() => setActiveSubTab("pesan_mbg")}
                className="rounded-2xl bg-[#18140B] hover:bg-emerald-600 text-white px-3.5 py-1.5 font-sans text-xs font-black transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>Buat Pesanan Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs">
              <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold block">
                Total Pesanan Aktif
              </span>
              <div className="font-sans text-xl font-black text-zinc-950 mt-0.5">
                {activeOrdersCount} <span className="text-xs font-normal text-zinc-500">PO Berjalan</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">Dalam Proses Pengiriman</span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-xs">
              <span className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">
                ⏳ Menunggu Dapur SPPG
              </span>
              <div className="font-sans text-xl font-black text-zinc-900 mt-0.5">
                {pesananMbgList.filter((p) => p.statusPesanan === "Diajukan ke SPPG").length} <span className="text-xs font-normal text-zinc-500">PO</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 block mt-0.5">Antrean Masak Dapur</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] uppercase text-amber-800 font-bold block">
                🍳 Sedang Dimasak
              </span>
              <div className="font-sans text-xl font-black text-amber-950 mt-0.5">
                {pesananMbgList.filter((p) => p.statusPesanan === "Diterima Dapur MBG").length} <span className="text-xs font-normal text-amber-700">PO</span>
              </div>
              <span className="font-mono text-[10px] text-amber-600 block mt-0.5">Standar Higiene Kemenkes</span>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 shadow-xs">
              <span className="font-mono text-[10px] uppercase text-sky-800 font-bold block">
                🚚 Dalam Pengiriman
              </span>
              <div className="font-sans text-xl font-black text-sky-950 mt-0.5">
                {pesananMbgList.filter((p) => p.statusPesanan === "Dalam Pengiriman").length} <span className="text-xs font-normal text-sky-700">Armada</span>
              </div>
              <span className="font-mono text-[10px] text-sky-600 block mt-0.5">Thermal Box On the Way</span>
            </div>
          </div>

          {/* List of Active Orders */}
          {activeOrdersCount === 0 ? (
            <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-12 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <h4 className="font-sans text-base font-black text-zinc-900">
                Tidak Ada Pesanan yang Sedang Berjalan
              </h4>
              <p className="font-mono text-xs text-zinc-500 max-w-md mx-auto">
                Seluruh surat pesanan ransum MBG telah tiba dan terverifikasi di Posyandu, atau belum ada pesanan baru yang diajukan.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("pesan_mbg")}
                  className="rounded-2xl bg-[#18140B] text-white px-5 py-2.5 font-sans text-xs font-black shadow-md hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  + Buat Pesanan Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("riwayat_pesanan")}
                  className="rounded-2xl border border-zinc-300 bg-zinc-50 text-zinc-800 px-5 py-2.5 font-sans text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  📜 Buka Riwayat Transaksi
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pesananMbgList
                .filter((p) => p.statusPesanan !== "Tiba di Posyandu")
                .map((po) => {
                  const isShipping = po.statusPesanan === "Dalam Pengiriman";
                  const isCooking = po.statusPesanan === "Diterima Dapur MBG";
                  const isSubmitted = po.statusPesanan === "Diajukan ke SPPG";

                  return (
                    <div
                      key={po.id}
                      className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                    >
                      {/* Top Bar: PO Number + Posyandu + Status Badge + TOMBOL HAPUS */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-zinc-900">
                              {po.nomorPo}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              · Dibuat: {po.tglDibuat}
                            </span>
                          </div>
                          <h5 className="font-sans text-base font-black text-emerald-950 mt-0.5">
                            📍 {po.posyanduTarget}
                          </h5>
                        </div>

                        {/* Status Badge & Tombol Hapus */}
                        <div className="flex items-center gap-2">
                          {isShipping && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 font-mono text-[11px] font-black uppercase text-sky-900 animate-pulse">
                              <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                              Dalam Pengiriman Armada
                            </span>
                          )}
                          {isCooking && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-mono text-[11px] font-black uppercase text-amber-900">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              Diterima & Dimasak Dapur
                            </span>
                          )}
                          {isSubmitted && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 font-mono text-[11px] font-black uppercase text-zinc-800">
                              <span className="h-2 w-2 rounded-full bg-zinc-400" />
                              Diajukan ke SPPG
                            </span>
                          )}

                          {/* TOMBOL HAPUS */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(po.id, po.nomorPo)}
                            className="rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 px-3 py-1.5 font-mono text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Hapus surat pesanan ini"
                          >
                            <span>🗑️</span>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 RAPIH COLUMNS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold uppercase">Dapur Penyedia (SPPG)</span>
                          <strong className="text-zinc-900 text-xs block truncate mt-0.5">{po.sppgDituju}</strong>
                          <span className="text-[10px] text-zinc-500 block">Mitra Faskes Terdekat</span>
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold uppercase">Jadwal & Sesi Distribusi</span>
                          <strong className="text-zinc-900 text-xs block mt-0.5">{po.tglPenyaluran}</strong>
                          <span className="text-[10px] text-zinc-500 block">{po.sesiPenyaluran}</span>
                        </div>
                        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
                          <span className="text-[10px] text-emerald-800 block font-bold uppercase">Total Ransum</span>
                          <strong className="text-emerald-950 font-black text-sm block mt-0.5">{po.totalPorsi} Porsi</strong>
                          <div className="text-[10px] text-emerald-700 flex gap-2 font-bold mt-0.5">
                            <span>A: {po.jumlahPaketA}</span>
                            <span>B: {po.jumlahPaketB}</span>
                            {po.jumlahPaketC > 0 && <span>C: {po.jumlahPaketC}</span>}
                          </div>
                        </div>
                        <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                          <span className="text-[10px] text-zinc-400 block font-bold uppercase">Instruksi Medis Puskesmas</span>
                          <p className="text-[11px] text-zinc-700 truncate block mt-0.5" title={po.catatanKlinis}>
                            {po.catatanKlinis || "Preskripsi pemenuhan gizi Puskesmas."}
                          </p>
                        </div>
                      </div>

                      {/* 4-STAGE STEPPER TIMELINE */}
                      <div className="rounded-2xl bg-zinc-50/80 p-4 border border-zinc-100 space-y-3">
                        <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 block">
                          Tahapan Pemrosesan & Pengiriman Ransum (4 Tahap)
                        </span>

                        <div className="grid grid-cols-4 gap-2 font-mono text-center">
                          {/* Step 1: Diajukan */}
                          <div className={`p-2 rounded-xl border text-[11px] ${
                            isSubmitted || isCooking || isShipping
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-zinc-200 text-zinc-400"
                          }`}>
                            <div className="text-base mb-0.5">📝</div>
                            <div>1. Diajukan</div>
                            <span className="text-[9px] opacity-75 block">Surat Terbit</span>
                          </div>

                          {/* Step 2: Dapur Memasak */}
                          <div className={`p-2 rounded-xl border text-[11px] ${
                            isCooking || isShipping
                              ? "bg-amber-50 border-amber-300 text-amber-950 font-bold"
                              : isSubmitted
                              ? "bg-white border-dashed border-zinc-300 text-zinc-500"
                              : "bg-white border-zinc-200 text-zinc-400"
                          }`}>
                            <div className="text-base mb-0.5">🍳</div>
                            <div>2. Dimasak</div>
                            <span className="text-[9px] opacity-75 block">Standar Higiene</span>
                          </div>

                          {/* Step 3: Armada Pengantaran */}
                          <div className={`p-2 rounded-xl border text-[11px] ${
                            isShipping
                              ? "bg-sky-50 border-sky-300 text-sky-950 font-bold animate-pulse"
                              : "bg-white border-zinc-200 text-zinc-400"
                          }`}>
                            <div className="text-base mb-0.5">🚚</div>
                            <div>3. Pengiriman</div>
                            <span className="text-[9px] opacity-75 block">Mobil Termal</span>
                          </div>

                          {/* Step 4: Tiba & Verifikasi */}
                          <div className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-400 text-[11px]">
                            <div className="text-base mb-0.5">✓</div>
                            <div>4. Serah Terima</div>
                            <span className="text-[9px] opacity-75 block">Kader Posyandu</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulasi Aksi Cepat Perubahan Status untuk Pengujian */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 font-mono text-xs">
                        <span className="text-[11px] text-zinc-400">
                          Aksi Pembaruan Status Alur MBG:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {isSubmitted && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(po.id, "Diterima Dapur MBG")}
                              className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              🍳 Konfirmasi Dimasak di SPPG
                            </button>
                          )}
                          {isCooking && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(po.id, "Dalam Pengiriman")}
                              className="rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 px-3 py-1 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              🚚 Armada Berangkat ke Posyandu
                            </button>
                          )}
                          {isShipping && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(po.id, "Tiba di Posyandu")}
                              className="rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3 py-1 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              ✓ Konfirmasi Tiba & Masuk Riwayat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. FITUR RIWAYAT: ARSIP & HISTORI PEMESANAN RANSUM MBG
          ======================================================== */}
      {activeSubTab === "riwayat_pesanan" && (
        <div className="space-y-6">
          {/* Header Subtab Riwayat */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-zinc-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-800 text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase">
                  Arsip Resmi MBG
                </span>
                <span className="font-mono text-xs text-zinc-500 font-bold">
                  Puskesmas {selectedKecamatan} · {selectedKabupaten}
                </span>
              </div>
              <h3 className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950 mt-1 flex items-center gap-2">
                <span>📜</span>
                <span>Riwayat Surat Pesanan (PO) MBG</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Daftar lengkap seluruh transaksi pesanan ransum MBG, pencatatan serah terima fisik posyandu, dan riwayat distribusi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrintPesananMbg}
                className="rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖨️</span>
                <span>Cetak Rekap Pesanan MBG</span>
              </button>
              <span className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 font-mono text-xs font-bold text-zinc-800 shadow-xs">
                ● {pesananMbgList.length} Total Transaksi ({completedOrdersCount} Selesai)
              </span>
              <button
                type="button"
                onClick={handleClearPesananHistory}
                className="rounded-2xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Hapus seluruh riwayat pesanan"
              >
                <span>🗑️</span>
                <span>Hapus Semua Riwayat</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={riwayatSearch}
                onChange={(e) => setRiwayatSearch(e.target.value)}
                placeholder="🔍 Cari No. PO, Posyandu, Desa..."
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-2 font-sans text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <span className="font-mono text-[11px] text-zinc-400 font-bold">Filter Status:</span>
              <button
                type="button"
                onClick={() => setRiwayatStatusFilter("semua")}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  riwayatStatusFilter === "semua"
                    ? "bg-[#18140B] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Semua ({pesananMbgList.length})
              </button>
              <button
                type="button"
                onClick={() => setRiwayatStatusFilter("selesai")}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  riwayatStatusFilter === "selesai"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Selesai ({completedOrdersCount})
              </button>
              <button
                type="button"
                onClick={() => setRiwayatStatusFilter("aktif")}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                  riwayatStatusFilter === "aktif"
                    ? "bg-sky-600 text-white"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
                }`}
              >
                Sedang Berjalan ({activeOrdersCount})
              </button>
            </div>
          </div>

          {/* TABEL DATA RAPI & TERSTRUKTUR */}
          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h4 className="font-sans text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
                <span>📋</span>
                <span>Tabel Data Riwayat Surat Pesanan Ransum MBG</span>
              </h4>
              <span className="font-mono text-xs text-zinc-400">
                Menampilkan data terverifikasi
              </span>
            </div>

            {/* Filter data */}
            {(() => {
              const filteredList = pesananMbgList.filter((po) => {
                if (riwayatStatusFilter === "selesai" && po.statusPesanan !== "Tiba di Posyandu") return false;
                if (riwayatStatusFilter === "aktif" && po.statusPesanan === "Tiba di Posyandu") return false;
                if (riwayatSearch) {
                  const q = riwayatSearch.toLowerCase();
                  return (
                    po.nomorPo.toLowerCase().includes(q) ||
                    po.posyanduTarget.toLowerCase().includes(q) ||
                    po.desa.toLowerCase().includes(q) ||
                    po.sppgDituju.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                    Tidak ada catatan riwayat pesanan yang sesuai dengan filter pencarian.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 font-mono text-[10px] uppercase tracking-wider bg-zinc-50/70">
                        <th className="py-3 px-3">No. Surat Pesanan (PO)</th>
                        <th className="py-3 px-3">Posyandu Sasaran</th>
                        <th className="py-3 px-3">Dapur Penyedia (SPPG)</th>
                        <th className="py-3 px-3 text-center">Rincian Ransum</th>
                        <th className="py-3 px-3">Jadwal & Sesi</th>
                        <th className="py-3 px-3">Status & Verifikasi</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-800">
                      {filteredList.map((po) => {
                        const isDone = po.statusPesanan === "Tiba di Posyandu";
                        return (
                          <tr key={po.id} className="hover:bg-zinc-50/80 transition-colors">
                            {/* 1. No PO */}
                            <td className="py-3 px-3 font-mono">
                              <span className="font-black text-zinc-950 block text-xs">
                                {po.nomorPo}
                              </span>
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                {po.tglDibuat}
                              </span>
                            </td>

                            {/* 2. Posyandu Target */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-zinc-950">
                                📍 {po.posyanduTarget}
                              </div>
                              <div className="font-mono text-[10px] text-zinc-400 mt-0.5">
                                {po.desa}, Kec. {po.kecamatan}
                              </div>
                            </td>

                            {/* 3. Dapur SPPG */}
                            <td className="py-3 px-3 font-mono">
                              <span className="font-medium text-zinc-900 block text-[11px]">
                                {po.sppgDituju}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                Sentra Dapur Mitra
                              </span>
                            </td>

                            {/* 4. Rincian Ransum */}
                            <td className="py-3 px-3 text-center font-mono">
                              <span className="font-black text-xs text-zinc-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {po.totalPorsi} Porsi
                              </span>
                              <div className="text-[10px] text-zinc-500 mt-1 flex justify-center gap-1.5 font-bold">
                                <span className="text-emerald-700">A:{po.jumlahPaketA}</span>
                                <span className="text-rose-700">B:{po.jumlahPaketB}</span>
                                {po.jumlahPaketC > 0 && <span className="text-amber-700">C:{po.jumlahPaketC}</span>}
                              </div>
                            </td>

                            {/* 5. Jadwal & Sesi */}
                            <td className="py-3 px-3 font-mono text-[11px]">
                              <div className="text-zinc-900 font-bold">{po.tglPenyaluran}</div>
                              <div className="text-zinc-500 text-[10px]">{po.sesiPenyaluran}</div>
                            </td>

                            {/* 6. Status & Verifikasi */}
                            <td className="py-3 px-3">
                              {isDone ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-emerald-900">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Tiba & Terverifikasi
                                  </span>
                                  <div className="font-mono text-[10px] text-zinc-500">
                                    Penerima: <strong className="text-zinc-800">{po.verifikasiPosyandu?.kaderPenerima || "Kader"}</strong>
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase text-sky-900">
                                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                                  {po.statusPesanan}
                                </span>
                              )}
                            </td>

                            {/* 7. TOMBOL HAPUS */}
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(po.id, po.nomorPo)}
                                className="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3 py-1 font-mono text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                title="Hapus surat pesanan ini dari riwayat"
                              >
                                <span>🗑️</span>
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
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
              .flatMap((p) => p.balitaList.map((b) => ({ balita: b, posyandu: p })))
              .filter(({ balita }) => isBalitaStuntingOrFaltering(balita))
              .map(({ balita: b, posyandu: p }) => {
                const existingJadwal = jadwalList.find(
                  (j) =>
                    (j.namaBalita.toLowerCase().trim() === b.nama.toLowerCase().trim() ||
                      (j.nikBalita && b.nik && j.nikBalita === b.nik)) &&
                    j.status !== "Dibatalkan"
                );

                return (
                  <div key={b.id} className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans text-sm font-black text-zinc-950">{b.nama} ({b.usiaBulan} Bulan)</h4>
                          <span className="font-mono text-[10px] text-zinc-500 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                            {p.posyandu}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-zinc-500 mt-0.5">NIK: {b.nik} · Ibu {b.namaIbu}</p>
                        <p className="text-xs text-rose-900 font-bold mt-1">Status: {b.statusGizi} · {b.alokasiPaket}</p>
                      </div>
                      <span className="rounded-lg bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5">
                        TB/U: {b.zTbu} SD
                      </span>
                    </div>
                    <div className="text-xs text-red-900 bg-white p-2.5 rounded-xl border border-red-200 font-medium">
                      <strong>Catatan Klinis:</strong> {b.catatanKlinis}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {existingJadwal ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1.5 font-mono text-xs font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Terjadwal: {existingJadwal.tglPertemuan} ({existingJadwal.waktuPertemuan})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSchedulingChild({ balita: b, posyandu: p });
                              setFormLokasi(existingJadwal.lokasi || `Poli Gizi ${puskesmasName}`);
                              setFormTgl(existingJadwal.tglPertemuan);
                              setFormJam(existingJadwal.waktuPertemuan);
                              setFormDokter(existingJadwal.dokterPemeriksa);
                              setFormAgenda(existingJadwal.agendaIntervensi);
                              setFormCatatan(existingJadwal.catatanKhusus || "");
                            }}
                            className="text-xs font-mono font-bold text-[#5C46D9] hover:underline"
                          >
                            ✏️ Edit Jadwal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSchedulingChild({ balita: b, posyandu: p });
                            setFormLokasi(`Poli Gizi ${puskesmasName}`);
                            setFormAgenda(
                              isBalitaPerluRujukan(b)
                                ? "Rujukan Dokter Spesialis Anak & Terapi Intervensi Klinis F100"
                                : `Pemeriksaan Intervensi Stunting (${b.statusGizi}) & Resep MBG Paket B Protein Ganda Jatim`
                            );
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white py-2 font-sans text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2"
                        >
                          <span>📅</span>
                          <span>Buat Jadwal Intervensi Klinis</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintPosyanduMikro(selectedPosyandu)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 px-3.5 py-2 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>🖨️</span>
                    <span>Cetak Laporan Posyandu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPosyandu(null)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
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
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="font-sans text-2xl font-black text-rose-950">
                      {selectedPosyandu.stuntingCount} <span className="text-xs font-normal text-rose-700">anak</span>
                    </div>
                    {(() => {
                      const stuntingBalitas = selectedPosyandu.balitaList.filter((b) => isBalitaStuntingOrFaltering(b));
                      const unScheduled = stuntingBalitas.filter(
                        (b) =>
                          !jadwalList.some(
                            (j) =>
                              (j.namaBalita.toLowerCase().trim() === b.nama.toLowerCase().trim() ||
                                (j.nikBalita && b.nik && j.nikBalita === b.nik)) &&
                              j.status !== "Dibatalkan"
                          )
                      );
                      if (unScheduled.length > 0) {
                        return (
                          <span className="rounded-full bg-rose-200 text-rose-900 border border-rose-300 px-2 py-0.5 font-mono text-[10px] font-bold">
                            ⚠️ {unScheduled.length} Belum Dijadwal
                          </span>
                        );
                      }
                      return (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-mono text-[10px] font-bold">
                          ✓ Semua Terjadwal
                        </span>
                      );
                    })()}
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
                      const needsIntervention = isBalitaStuntingOrFaltering(balita);
                      const isRujukan = isBalitaPerluRujukan(balita);

                      // Cek otomatis apakah sudah pernah diterbitkan jadwal pertemuan stunting untuk balita ini
                      const existingJadwal = jadwalList.find(
                        (j) =>
                          (j.namaBalita.toLowerCase().trim() === balita.nama.toLowerCase().trim() ||
                            (j.nikBalita && balita.nik && j.nikBalita === balita.nik)) &&
                          j.status !== "Dibatalkan"
                      );

                      return (
                        <tr key={balita.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-3.5">
                            <div className="font-black text-zinc-950 text-sm flex items-center gap-1.5">
                              {needsIntervention && !existingJadwal && (
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Perlu Jadwal Intervensi" />
                              )}
                              <span>{balita.nama}</span>
                            </div>
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
                                  : balita.zTbu < -1.5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {balita.zTbu > 0 ? `+${balita.zTbu}` : balita.zTbu} SD
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                                  isRujukan
                                    ? "bg-amber-100 border border-amber-300 text-amber-900"
                                    : needsIntervention
                                    ? "bg-rose-50 border border-rose-200 text-rose-900"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                                }`}
                              >
                                {needsIntervention && !existingJadwal && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                                )}
                                {balita.statusGizi}
                              </span>
                            </div>
                            <div className="font-bold text-[#5C46D9] text-[11px] mt-1">
                              {balita.alokasiPaket}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            {needsIntervention ? (
                              existingJadwal ? (
                                <div className="inline-flex flex-col items-end gap-1">
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 font-mono text-[10px] font-black text-emerald-800 shadow-xs">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    ✓ Terjadwal: {existingJadwal.tglPertemuan}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (selectedPosyandu) {
                                        setSchedulingChild({ balita, posyandu: selectedPosyandu });
                                        setFormLokasi(existingJadwal.lokasi || `Poli Gizi ${puskesmasName}`);
                                        setFormTgl(existingJadwal.tglPertemuan);
                                        setFormJam(existingJadwal.waktuPertemuan);
                                        setFormDokter(existingJadwal.dokterPemeriksa);
                                        setFormAgenda(existingJadwal.agendaIntervensi);
                                        setFormCatatan(existingJadwal.catatanKhusus || "");
                                      }
                                    }}
                                    className="text-[10px] font-mono font-bold text-[#5C46D9] hover:underline"
                                  >
                                    ✏️ Edit / Lihat Jadwal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedPosyandu) {
                                      setSchedulingChild({ balita, posyandu: selectedPosyandu });
                                      setFormLokasi(`Poli Gizi ${puskesmasName}`);
                                      setFormAgenda(
                                        isRujukan
                                          ? "Rujukan Dokter Spesialis Anak & Terapi Intervensi Klinis F100"
                                          : `Pemeriksaan Intervensi Klinis Stunting (${balita.statusGizi}) & Resep MBG Paket B Protein Ganda Jatim`
                                      );
                                    }
                                  }}
                                  className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 px-3.5 py-2 font-sans text-xs font-black text-white transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                                >
                                  <span>📅</span>
                                  <span>Buat Jadwal Intervensi</span>
                                </button>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <span>✓</span>
                                <span>Terpantau Baik</span>
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

      {/* 3. MODAL BUAT JADWAL PERTEMUAN STUNTING (KIRIM NOTIFIKASI REAL-TIME KE POSYANDU) */}
      <AnimatePresence>
        {schedulingChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSchedulingChild(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-[32px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <span className="rounded-md bg-rose-100 text-rose-800 font-mono text-[10px] font-black uppercase px-2 py-0.5">
                    Intervensi Klinis Stunting
                  </span>
                  <h3 className="font-sans text-xl font-black text-zinc-950 mt-1">
                    Buat Jadwal Pertemuan Dokter
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Otomatis mengirimkan notifikasi ke Akun {schedulingChild.posyandu.posyandu}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSchedulingChild(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                >
                  ✕
                </button>
              </div>

              {/* Rincian Balita Terpilih */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs font-mono space-y-1">
                <div className="font-sans font-black text-sm text-zinc-950">
                  {schedulingChild.balita.nama} ({schedulingChild.balita.usiaBulan} Bulan)
                </div>
                <div className="text-zinc-600">NIK: {schedulingChild.balita.nik} · Ibu: {schedulingChild.balita.namaIbu}</div>
                <div className="text-rose-900 font-bold">
                  Status: {schedulingChild.balita.statusGizi} (TB/U: {schedulingChild.balita.zTbu} SD)
                </div>
                <div className="text-emerald-900">
                  Posyandu: {schedulingChild.posyandu.posyandu} ({schedulingChild.posyandu.desa})
                </div>
              </div>

              {/* Form Input Jadwal */}
              <form onSubmit={handleSaveJadwalPertemuan} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                      Tanggal Pertemuan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTgl}
                      onChange={(e) => setFormTgl(e.target.value)}
                      placeholder="Contoh: 18 Nov 2026"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                      Waktu / Jam *
                    </label>
                    <input
                      type="text"
                      required
                      value={formJam}
                      onChange={(e) => setFormJam(e.target.value)}
                      placeholder="Contoh: 09:00 WIB"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                    Lokasi Pemeriksaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                    Dokter / Tenaga Medis Pemeriksa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDokter}
                    onChange={(e) => setFormDokter(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                    Agenda Tindakan Medis / Intervensi Gizi *
                  </label>
                  <select
                    value={formAgenda}
                    onChange={(e) => setFormAgenda(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-rose-500"
                  >
                    <option value="Pemeriksaan Antropometri Lanjutan & Preskripsi Paket B Ekstra Hewani Jatim">
                      Pemeriksaan Antropometri & Preskripsi Paket B Ekstra Hewani Jatim
                    </option>
                    <option value="Konsultasi Poli Gizi & Terapi F-75 / PKMK Khusus">
                      Konsultasi Poli Gizi & Terapi F-75 / PKMK Khusus
                    </option>
                    <option value="Deteksi Penyakit Infeksi Penyerta (TB Balita / ISPA)">
                      Deteksi Penyakit Infeksi Penyerta (TB Balita / ISPA)
                    </option>
                    <option value="Kunjungan Nakes ke Rumah Balita & Edukasi Pola Asuh">
                      Kunjungan Nakes ke Rumah Balita & Edukasi Pola Asuh
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                    Catatan Khusus untuk Posyandu & Orang Tua
                  </label>
                  <textarea
                    rows={2}
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    placeholder="Contoh: Harap membawa Buku KIA..."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3 font-sans text-xs font-medium text-zinc-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingChild(null)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-sans text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-5 py-2.5 font-sans text-xs font-black text-white hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span>🚀</span>
                    <span>Terbitkan Jadwal & Kirim Notif ke Posyandu</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cetak Dokumen Laporan Resmi Puskesmas & Posyandu */}
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
