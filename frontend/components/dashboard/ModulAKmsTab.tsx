"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BALITA_MOCK, type BalitaRecord } from "@/lib/app-data";
import ClayCard from "@/components/auth/ClayCard";
import CetakLaporanModal, {
  type LaporanColumn,
  type LaporanSummaryItem,
} from "./CetakLaporanModal";

export default function ModulAKmsTab({
  onNavigateToMbg,
}: {
  onNavigateToMbg?: () => void;
} = {}) {
  const [balitaList, setBalitaList] = useState<BalitaRecord[]>(BALITA_MOCK);
  const [selectedChildId, setSelectedChildId] = useState<string>("B-001");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncedBanner, setSyncedBanner] = useState(false);
  const [syncedBannerText, setSyncedBannerText] = useState(
    "Data penimbangan berhasil disinkronkan ke Cloud Server & Antrean Dapur SPPG!"
  );

  // Notifikasi Jadwal Pertemuan Penanganan Stunting dari Puskesmas Pembina (Khusus Balita Waspada / Faltering)
  const [notifList, setNotifList] = useState<any[]>([
    {
      id: "NOTIF-01",
      puskesmas: "Puskesmas Socah",
      posyanduTarget: "Posyandu Mawar 01",
      namaBalita: "Dimas Aditya Pratama",
      nikBalita: "3505121108250007",
      tglPertemuan: "18 Nov 2026",
      waktuPertemuan: "09:00 WIB",
      lokasi: "Poli Gizi Puskesmas Socah",
      dokterPemeriksa: "dr. Nurul Hidayati, M.Gizi",
      agenda: "Pemeriksaan Antropometri Lanjutan & Preskripsi Paket B Ekstra Hewani Jatim",
      catatan: "Mohon Ibu balita membawa Buku KIA dan catatan makan 3 hari terakhir.",
      statusTerkirim: "Belum Dikonfirmasi ke Ibu Balita",
    },
    {
      id: "NOTIF-02",
      puskesmas: "Puskesmas Socah",
      posyanduTarget: "Posyandu Mawar 01",
      namaBalita: "Nur Haliza",
      nikBalita: "3505125109250008",
      tglPertemuan: "19 Nov 2026",
      waktuPertemuan: "10:30 WIB",
      lokasi: "Poli Anak Puskesmas Socah",
      dokterPemeriksa: "dr. H. Achmad Syafi'i",
      agenda: "Konsultasi Infeksi Penyerta & Evaluasi Asupan Protein Baduta Faltering",
      catatan: "Balita terindikasi nafsu makan menurun, perlu evaluasi klinis dokter faskes.",
      statusTerkirim: "Belum Dikonfirmasi ke Ibu Balita",
    },
  ]);

  // Muat data balita baru, hasil timbangan tersimpan, notifikasi jadwal
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // 1. Muat balita & riwayat penimbangan tersimpan dari localStorage (dibatasi maksimal 10 balita)
        const raw = localStorage.getItem("nt_custom_balita");
        if (raw) {
          const customList = JSON.parse(raw);
          if (Array.isArray(customList) && customList.length > 0) {
            setBalitaList((prev) => {
              const customMap = new Map(customList.map((item: any) => [item.id, item]));
              const updatedPrev = prev.map((b) => customMap.get(b.id) || b);
              const prevIds = new Set(prev.map((b) => b.id));
              const brandNew = customList.filter((item: any) => !prevIds.has(item.id));
              return [...brandNew, ...updatedPrev].slice(0, 10);
            });
          }
        }

        // 2. Muat antrean data offline penimbangan jika ada
        const rawQueue = localStorage.getItem("nt_offline_queue");
        if (rawQueue) {
          try {
            const q = JSON.parse(rawQueue);
            if (Array.isArray(q)) setPendingSyncCount(q.length);
          } catch (e) {}
        }

        // 3. Muat notifikasi jadwal pertemuan dari Puskesmas
        const rawNotif = localStorage.getItem("nt_posyandu_notif");
        if (rawNotif) {
          const parsedNotif = JSON.parse(rawNotif);
          if (Array.isArray(parsedNotif) && parsedNotif.length > 0) {
            setNotifList((prev) => {
              const ids = new Set(prev.map((n) => n.id));
              const fresh = parsedNotif.filter((n: any) => !ids.has(n.id));
              return [...fresh, ...prev];
            });
          }
        }
        const rawJadwalPuskesmas = localStorage.getItem("nt_jadwal_pertemuan_puskesmas");
        if (rawJadwalPuskesmas) {
          try {
            const parsedJ = JSON.parse(rawJadwalPuskesmas);
            if (Array.isArray(parsedJ) && parsedJ.length > 0) {
              setNotifList((prev) => {
                const ids = new Set(prev.map((n) => n.id));
                const converted = parsedJ.map((j: any) => ({
                  id: j.id,
                  puskesmas: j.puskesmas || "Puskesmas Socah",
                  posyanduTarget: j.posyanduTarget || "Posyandu Mawar 01",
                  namaBalita: j.namaBalita,
                  nikBalita: j.nikBalita,
                  tglPertemuan: j.tglPertemuan,
                  waktuPertemuan: j.waktuPertemuan,
                  lokasi: j.lokasi || "Poli Gizi Puskesmas Socah",
                  dokterPemeriksa: j.dokterPemeriksa,
                  agenda: j.agendaIntervensi,
                  catatan: j.catatanKhusus,
                  statusTerkirim: j.status === "Selesai" ? "Telah Disampaikan ke Orang Tua" : "Belum Dikonfirmasi ke Ibu Balita",
                }));
                const fresh = converted.filter((c: any) => !ids.has(c.id));
                return [...fresh, ...prev];
              });
            }
          } catch (e) {}
        }

        // 4. Muat identitas akun posyandu aktif
        const syncSession = () => {
          const rawSession = localStorage.getItem("nt_current_session");
          if (rawSession) {
            try {
              const parsed = JSON.parse(rawSession);
              if (parsed.unit) {
                setPosyanduUnit(parsed.unit);
                setNewPosyandu(parsed.unit.split("—")[0].trim());
              }
              if (parsed.wilayah) setPosyanduWilayah(parsed.wilayah);
              if (parsed.puskesmasPembina) setPuskesmasPembina(parsed.puskesmasPembina);
              if (parsed.alamatPuskesmas) setAlamatPuskesmas(parsed.alamatPuskesmas);
              if (parsed.statusVerifikasi) setPosyanduStatusVerifikasi(parsed.statusVerifikasi);

              // Periksa juga status dari nt_registered_posyandu
              const rawReg = localStorage.getItem("nt_registered_posyandu");
              if (rawReg) {
                const regList = JSON.parse(rawReg);
                const matched = regList.find(
                  (r: any) =>
                    r.emailAkun === parsed.email ||
                    (parsed.unit && r.posyandu && parsed.unit.includes(r.posyandu)) ||
                    r.id === parsed.posyanduId
                );
                if (matched) {
                  setPosyanduStatusVerifikasi(matched.statusAkun || "Disetujui");
                  if (matched.alamatPuskesmas) setAlamatPuskesmas(matched.alamatPuskesmas);
                  if (matched.puskesmas) setPuskesmasPembina(matched.puskesmas);
                }
              }
            } catch (e) {}
          }
        };
        syncSession();
        window.addEventListener("nt_session_updated", syncSession);
        window.addEventListener("nt_posyandu_verified", syncSession);
        return () => {
          window.removeEventListener("nt_session_updated", syncSession);
          window.removeEventListener("nt_posyandu_verified", syncSession);
        };
      }
    } catch (e) {}
  }, []);

  const handleAcknowledgeNotif = (id: string, namaBalita: string) => {
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, statusTerkirim: "Telah Disampaikan ke Orang Tua" } : n))
    );
    setSyncedBannerText(`✓ Informasi jadwal intervensi dokter untuk ${namaBalita} telah berhasil dikonfirmasi!`);
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4500);
  };

  // Mode Input: Timbang Rutin vs Pendaftaran Balita Baru Manual
  const [inputMode, setInputMode] = useState<"timbang" | "daftar_baru">("timbang");

  // Form State untuk Pendaftaran Baru Manual (SKPL-F01)
  const [newNama, setNewNama] = useState("");
  const [newNik, setNewNik] = useState("");
  const [newTglLahir, setNewTglLahir] = useState("2025-09-10");
  const [newNamaIbu, setNewNamaIbu] = useState("");
  const [newAlamat, setNewAlamat] = useState("");
  const [newDesa, setNewDesa] = useState("Desa Bilaporah");
  const [newKecamatan, setNewKecamatan] = useState("Socah");
  const [newKabupaten, setNewKabupaten] = useState("Kab. Bangkalan");
  const [newPosyandu, setNewPosyandu] = useState("Posyandu Mawar 01");
  const [posyanduUnit, setPosyanduUnit] = useState("Posyandu Mawar 01 — Desa Bilaporah");
  const [posyanduWilayah, setPosyanduWilayah] = useState("Kecamatan Socah, Kab. Bangkalan · Alamat: Balai RW 01, Dusun Krajan");
  const [puskesmasPembina, setPuskesmasPembina] = useState("Puskesmas Socah");
  const [alamatPuskesmas, setAlamatPuskesmas] = useState("Jl. Raya Socah No. 45, Socah, Bangkalan 69161");
  const [posyanduStatusVerifikasi, setPosyanduStatusVerifikasi] = useState<string>("Disetujui");
  const [isModalPuskesmasOpen, setIsModalPuskesmasOpen] = useState(false);
  const [newSex, setNewSex] = useState<"L" | "P">("L");
  const [newBb, setNewBb] = useState<number>(8.5);
  const [newTb, setNewTb] = useState<number>(73.0);
  const [newLk, setNewLk] = useState<number>(45.0);
  const [newCatatan, setNewCatatan] = useState("");

  // Form State untuk Timbangan Bulanan
  const [inputRecordDate, setInputRecordDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [inputWeight, setInputWeight] = useState<number>(8.4);
  const [inputHeight, setInputHeight] = useState<number>(72.8);
  const [inputHeadCircumference, setInputHeadCircumference] = useState<number>(45.2);
  const [inputAgeMonths, setInputAgeMonths] = useState<number>(14);
  const [inputSex, setInputSex] = useState<"L" | "P">("L");
  const [measuringMethod, setMeasuringMethod] = useState<"panjang" | "tinggi">(
    inputAgeMonths < 24 ? "panjang" : "tinggi"
  );
  const [inputCatatan, setInputCatatan] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
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

  const handlePrintMonthlyReport = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const total = balitaList.length;
    const faltering = balitaList.filter((b) => b.isFaltering).length;
    const normal = total - faltering;
    const posName = activeChild?.posyandu || "Posyandu Mawar 01";
    const desaName = activeChild?.desa || "Desa Bilaporah";
    const kecName = activeChild?.kecamatan || "Socah";

    setPrintReportData({
      instansi: "PEMERINTAH KABUPATEN BANGKALAN",
      subInstansi: `DINAS KESEHATAN · PUSKESMAS ${kecName.toUpperCase()} · ${posName.toUpperCase()}`,
      alamatInstansi: `Balai Pertemuan Warga ${desaName}, Kecamatan ${kecName} · Wilayah Binaan Puskesmas ${kecName}`,
      judulLaporan: "REKAPITULASI PENIMBANGAN BULANAN & INTERVENSI MBG POSYANDU",
      nomorSurat: `440/LAP-BUL/${posName.replace(/\s+/g, "-")}/${new Date().getFullYear()}`,
      wilayah: `${posName}, ${desaName}, Kec. ${kecName}, Kab. Bangkalan`,
      tanggalLaporan: formattedDate,
      penanggungJawab: {
        nama: "Siti Rahmawati, S.Pd",
        jabatan: `Kader Utama ${posName}`,
      },
      summaryItems: [
        { label: "Total Balita Terdaftar", value: `${total} Anak` },
        { label: "Balita Sehat / Normal", value: `${normal} Anak`, subtext: `${Math.round((normal / total) * 100)}% Paket A Reguler` },
        { label: "Balita Waspada / Faltering", value: `${faltering} Anak`, subtext: `${Math.round((faltering / total) * 100)}% Paket B Intervensi` },
        { label: "Puskesmas Pembina", value: `Puskesmas ${kecName}` },
      ],
      columns: [
        { header: "Nama Balita & NIK", key: "namaNik" },
        { header: "Usia & JK", key: "usiaJk" },
        { header: "Nama Orang Tua", key: "namaIbu" },
        { header: "Berat (kg)", key: "bbKg", align: "center" },
        { header: "Tinggi (cm)", key: "tbCm", align: "center" },
        { header: "Z-Score TB/U", key: "zTbu", align: "center" },
        { header: "Status Gizi", key: "statusNutrisi" },
        { header: "Alokasi Paket MBG", key: "paketMBG" },
      ],
      data: balitaList.map((b) => ({
        namaNik: `${b.nama} (NIK: ${b.nik})`,
        usiaJk: `${b.usiaBulan} Bln (${b.jenisKelamin === "L" ? "Laki-Laki" : "Perempuan"})`,
        namaIbu: b.namaIbu,
        bbKg: `${b.bbKg} kg`,
        tbCm: `${b.tbCm} cm`,
        zTbu: `${b.zTBU > 0 ? "+" : ""}${b.zTBU} SD`,
        statusNutrisi: b.statusNutrisi,
        paketMBG: b.paketMBG,
      })),
      catatanKhusus: `Laporan penimbangan posyandu ini wajib diserahkan kepada Petugas Gizi Puskesmas Pembina untuk evaluasi pertumbuhan bulanan dan dasar pemesanan ransum MBG ke Dapur SPPG.`,
      filenameCsv: `laporan-bulanan-posyandu-${posName.toLowerCase().replace(/\s+/g, "-")}.csv`,
    });
  };

  const activeChild = balitaList.find((b) => b.id === selectedChildId) || balitaList[0];

  // Re-sync nilai input form saat balita yang dipilih berganti
  useEffect(() => {
    const child = balitaList.find((b) => b.id === selectedChildId);
    if (child) {
      setInputWeight(child.bbKg);
      setInputHeight(child.tbCm);
      setInputAgeMonths(child.usiaBulan);
      setInputSex(child.jenisKelamin);
      setInputHeadCircumference(child.lingkarKepalaCm || 45.0);
      setMeasuringMethod(child.usiaBulan < 24 ? "panjang" : "tinggi");
      setInputRecordDate(new Date().toISOString().split("T")[0]);
      setInputCatatan("");
    }
  }, [selectedChildId]);

  // Riwayat penimbangan terurut kronologis
  const sortedHistory = [...(activeChild?.history || [])].sort((a, b) => a.usia - b.usia);
  const lastHistoryEntry = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null;

  // Komparasi Kenaikan Berat Badan Terhadap Penimbangan Terakhir (Growth Monitoring)
  const deltaWeight = lastHistoryEntry
    ? Math.round((Number(inputWeight) - Number(lastHistoryEntry.bb)) * 100) / 100
    : null;

  // Kalkulasi WHO Z-Score sederhana untuk live interactive preview (SKPL-F02)
  const calcZTBU = () => {
    const medianHeight = inputSex === "L" ? 64 + inputAgeMonths * 0.95 : 62 + inputAgeMonths * 0.93;
    const z = (inputHeight - medianHeight) / (medianHeight * 0.038);
    return Math.round(z * 100) / 100;
  };

  const calcZBBU = () => {
    const medianWeight = inputSex === "L" ? 7.5 + inputAgeMonths * 0.28 : 7.0 + inputAgeMonths * 0.27;
    const z = (inputWeight - medianWeight) / (medianWeight * 0.12);
    return Math.round(z * 100) / 100;
  };

  const currentZTBU = calcZTBU();
  const currentZBBU = calcZBBU();

  // Evaluasi Risiko Growth Faltering:
  // 1. Z-Score TB/U < -2 SD (Stunting)
  // 2. Z-Score BB/U < -2 SD (Underweight)
  // 3. Selisih BB mendatar (0.0) atau turun (< 0) dari penimbangan sebelumnya
  const isFalteringNow =
    currentZTBU < -2 ||
    currentZBBU < -2 ||
    (deltaWeight !== null && deltaWeight <= 0) ||
    inputWeight <= 8.4;

  // Deteksi apakah balita terpilih berstatus WASPADA / FALTERING / STUNTING
  const isChildWaspada =
    activeChild.isFaltering ||
    isFalteringNow ||
    (activeChild.statusNutrisi && (
      activeChild.statusNutrisi.toLowerCase().includes("waspada") ||
      activeChild.statusNutrisi.toLowerCase().includes("faltering") ||
      activeChild.statusNutrisi.toLowerCase().includes("stunting") ||
      activeChild.statusNutrisi.toLowerCase().includes("gizi kurang") ||
      activeChild.statusNutrisi.toLowerCase().includes("merah")
    )) ||
    activeChild.zTBU < -2 ||
    (activeChild.zBBU !== undefined && activeChild.zBBU < -2) ||
    currentZTBU < -2 ||
    currentZBBU < -2;

  // Jadwal pertemuan klinis dokter dari Puskesmas (HANYA dibuat/diambil jika balita berstatus WASPADA)
  const activeChildJadwal = (() => {
    if (!isChildWaspada) return null;

    // 1. Cari apakah sudah ada jadwal spesifik di notifList (termasuk buatan Puskesmas)
    const found = notifList.find(
      (n) =>
        (n.namaBalita && activeChild.nama && n.namaBalita.toLowerCase().trim() === activeChild.nama.toLowerCase().trim()) ||
        (n.nikBalita && activeChild.nik && n.nikBalita === activeChild.nik)
    );
    if (found) return found;

    // 2. Jika anak berstatus WASPADA tetapi belum ada jadwal tersimpan, buatkan jadwal rujukan resmi otomatis dari Puskesmas Pembina
    return {
      id: `JADWAL-${activeChild.id}`,
      puskesmas: puskesmasPembina || `Puskesmas ${activeChild.kecamatan || "Socah"}`,
      posyanduTarget: activeChild.posyandu || "Posyandu Mawar 01",
      desa: activeChild.desa || "Desa Bilaporah",
      namaBalita: activeChild.nama,
      nikBalita: activeChild.nik,
      tglPertemuan: "18 Nov 2026",
      waktuPertemuan: "09:00 WIB",
      lokasi: `Poli Gizi & Anak ${puskesmasPembina || `Puskesmas ${activeChild.kecamatan || "Socah"}`}`,
      dokterPemeriksa: "dr. Nurul Hidayati, M.Gizi",
      agenda: "Pemeriksaan Antropometri Lanjutan & Preskripsi Paket B Ekstra Hewani Jatim",
      catatan: "Mohon Ibu balita membawa Buku KIA dan catatan makan 3 hari terakhir.",
      statusTerkirim: "Belum Dikonfirmasi ke Ibu Balita",
    };
  })();

  // Filter notifikasi di atas dashboard: Hanya tampilkan balita berstatus WASPADA / FALTERING / STUNTING
  const waspadaNotifList = notifList.filter((n) => {
    const matched = balitaList.find(
      (b) =>
        (n.namaBalita && b.nama && b.nama.toLowerCase().trim() === n.namaBalita.toLowerCase().trim()) ||
        (n.nikBalita && b.nik && b.nik === n.nikBalita)
    );
    if (!matched) return true;
    return (
      matched.isFaltering ||
      matched.statusNutrisi.toLowerCase().includes("waspada") ||
      matched.statusNutrisi.toLowerCase().includes("faltering") ||
      matched.statusNutrisi.toLowerCase().includes("stunting") ||
      matched.statusNutrisi.toLowerCase().includes("gizi kurang") ||
      matched.zTBU < -2
    );
  });
  const currentStatus = isFalteringNow ? "Waspada / Growth Faltering" : "Normal";
  const currentPack = isFalteringNow ? "Paket B (Tinggi Protein Hewani)" : "Paket A (Reguler)";

  // Simpan Penimbangan Hari Ini (Fungsionalitas Penyimpanan Timbangan Lengkap)
  const handleSaveWeighing = () => {
    if (!inputWeight || inputWeight <= 1 || inputWeight > 40) {
      alert("Masukkan berat badan balita yang valid (1 - 40 kg).");
      return;
    }
    if (!inputHeight || inputHeight <= 30 || inputHeight > 150) {
      alert("Masukkan tinggi/panjang badan balita yang valid (30 - 150 cm).");
      return;
    }

    const tgl = inputRecordDate || new Date().toISOString().split("T")[0];
    const ztbu = currentZTBU;
    const zbbu = currentZBBU;
    const isFalter = isFalteringNow;
    const statusNutr: BalitaRecord["statusNutrisi"] = isFalter ? "Waspada / Faltering" : "Normal";
    const pack: BalitaRecord["paketMBG"] = isFalter ? "Paket B (Intervensi Protein Hewani)" : "Paket A (Reguler)";

    const newHistoryEntry = {
      tgl,
      usia: inputAgeMonths,
      bb: Number(inputWeight),
      tb: Number(inputHeight),
      lingkarKepala: Number(inputHeadCircumference),
      caraUkur: measuringMethod,
      zTbu: ztbu,
      zBbu: zbbu,
      catatan: inputCatatan.trim() || (isFalter ? "Perlu pemantauan intensif MBG Paket B" : "Pertumbuhan sesuai standar WHO"),
    };

    // 1. Update balitaList & activeChild secara reaktif
    const updatedBalitaList = balitaList.map((child) => {
      if (child.id === activeChild.id) {
        // Hapus jika sudah ada entry pada tanggal yang sama, lalu tambahkan entry terbaru
        const otherHistory = (child.history || []).filter((h) => h.tgl !== tgl);
        const newHistory = [...otherHistory, newHistoryEntry].sort((a, b) => a.usia - b.usia);
        return {
          ...child,
          bbKg: Number(inputWeight),
          tbCm: Number(inputHeight),
          lingkarKepalaCm: Number(inputHeadCircumference),
          usiaBulan: inputAgeMonths,
          zBBU: zbbu,
          zTBU: ztbu,
          statusNutrisi: statusNutr,
          paketMBG: pack,
          isFaltering: isFalter,
          history: newHistory,
        };
      }
      return child;
    });

    setBalitaList(updatedBalitaList);

    // 2. Simpan permanen ke localStorage (nt_custom_balita)
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("nt_custom_balita", JSON.stringify(updatedBalitaList));

        // Simpan log audit penimbangan posyandu (nt_posyandu_weighing_log)
        const logEntry = {
          id: `LOG-${Date.now()}`,
          childId: activeChild.id,
          childName: activeChild.nama,
          nik: activeChild.nik,
          posyandu: activeChild.posyandu,
          desa: activeChild.desa,
          tgl,
          usiaBulan: inputAgeMonths,
          bbKg: Number(inputWeight),
          tbCm: Number(inputHeight),
          lingkarKepalaCm: Number(inputHeadCircumference),
          deltaWeight,
          zTbu: ztbu,
          zBbu: zbbu,
          statusNutrisi: statusNutr,
          paketMBG: pack,
          catatan: inputCatatan.trim(),
          recordedAt: new Date().toISOString(),
        };
        const rawLogs = localStorage.getItem("nt_posyandu_weighing_log");
        const parsedLogs = rawLogs ? JSON.parse(rawLogs) : [];
        localStorage.setItem("nt_posyandu_weighing_log", JSON.stringify([logEntry, ...parsedLogs]));
      }
    } catch (e) {}

    // 3. Tangani Offline Queue vs Direct Cloud API
    if (isOfflineMode) {
      try {
        const rawQ = localStorage.getItem("nt_offline_queue");
        const parsedQ = rawQ ? JSON.parse(rawQ) : [];
        const newQueueItem = {
          childId: activeChild.id,
          recordDate: tgl,
          ageMonths: inputAgeMonths,
          weightKg: Number(inputWeight),
          heightCm: Number(inputHeight),
          headCircumferenceCm: Number(inputHeadCircumference),
          measuringMethod,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem("nt_offline_queue", JSON.stringify([...parsedQ, newQueueItem]));
        setPendingSyncCount((prev) => prev + 1);
      } catch (err) {}
    } else {
      try {
        fetch("http://localhost:5000/api/growth-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId: activeChild.id,
            recordDate: tgl,
            weightKg: Number(inputWeight),
            heightCm: Number(inputHeight),
            headCircumferenceCm: Number(inputHeadCircumference),
            ageMonths: inputAgeMonths,
            measuringMethod,
            gender: activeChild.jenisKelamin,
            catatan: inputCatatan.trim(),
          }),
        }).catch(() => {});
      } catch (err) {}
    }

    // 4. Tampilkan konfirmasi sukses
    const falterNote = isFalter
      ? "🚨 Terdeteksi Waspada/Faltering — Otomatis Diteruskan ke Puskesmas & Dapur MBG (Paket B)!"
      : "✅ Status Gizi Normal (Paket A Reguler).";
    setSyncedBannerText(
      `✓ Berhasil! Penimbangan "${activeChild.nama}" tersimpan (BB: ${inputWeight} kg, TB: ${inputHeight} cm, Z-Score: ${ztbu > 0 ? `+${ztbu}` : ztbu} SD). ${falterNote}`
    );
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 6000);
  };

  // Hapus Baris Catatan Penimbangan Salah
  const handleDeleteHistory = (indexToDelete: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan penimbangan ini?")) return;

    const child = activeChild;
    const history = [...(child.history || [])];
    if (history.length <= 1) {
      alert("Minimal 1 catatan penimbangan harus tersisa pada kartu balita.");
      return;
    }

    history.splice(indexToDelete, 1);
    const sorted = [...history].sort((a, b) => a.usia - b.usia);
    const latest = sorted[sorted.length - 1];

    const updatedBalitaList = balitaList.map((c) => {
      if (c.id === child.id) {
        return {
          ...c,
          bbKg: latest.bb,
          tbCm: latest.tb,
          lingkarKepalaCm: latest.lingkarKepala || c.lingkarKepalaCm,
          usiaBulan: latest.usia,
          zBBU: latest.zBbu,
          zTBU: latest.zTbu,
          statusNutrisi: (latest.zTbu < -2 || latest.zBbu < -2) ? ("Waspada / Faltering" as const) : ("Normal" as const),
          paketMBG: (latest.zTbu < -2 || latest.zBbu < -2) ? ("Paket B (Intervensi Protein Hewani)" as const) : ("Paket A (Reguler)" as const),
          isFaltering: latest.zTbu < -2 || latest.zBbu < -2,
          history: sorted,
        };
      }
      return c;
    });

    setBalitaList(updatedBalitaList);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("nt_custom_balita", JSON.stringify(updatedBalitaList.slice(0, 10)));
      }
    } catch (e) {}

    setSyncedBannerText("✓ Catatan penimbangan berhasil dihapus dari riwayat balita.");
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4000);
  };

  // Hapus Seluruh Riwayat Penimbangan Balita Terpilih
  const handleResetBalitaHistory = (childId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus seluruh riwayat pengukuran penimbangan balita ini?")) return;
    const updated = balitaList.map((b) => {
      if (b.id === childId) {
        return {
          ...b,
          history: b.history && b.history.length > 0 ? [b.history[0]] : [],
        };
      }
      return b;
    });
    setBalitaList(updated);
    try {
      localStorage.setItem("nt_custom_balita", JSON.stringify(updated.slice(0, 10)));
    } catch (e) {}
    setSyncedBannerText("✓ Riwayat penimbangan balita berhasil dibersihkan.");
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4000);
  };

  // Reset Daftar Balita ke 10 Balita Standar
  const handleResetAllCustomBalita = () => {
    if (!confirm("Kembalikan data ke 10 balita master standar dan hapus seluruh riwayat tambahan?")) return;
    try {
      localStorage.removeItem("nt_custom_balita");
      localStorage.removeItem("nt_offline_queue");
    } catch (e) {}
    setBalitaList(BALITA_MOCK.slice(0, 10));
    setSelectedChildId(BALITA_MOCK[0].id);
    setPendingSyncCount(0);
    setSyncedBannerText("✓ Data balita berhasil direset ke 10 balita master standar.");
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4000);
  };

  // Hapus Riwayat Notifikasi Puskesmas
  const handleClearNotifications = () => {
    if (!confirm("Hapus seluruh riwayat notifikasi jadwal pemeriksaan stunting?")) return;
    setNotifList([]);
    try {
      localStorage.removeItem("nt_posyandu_notif");
    } catch (e) {}
    setSyncedBannerText("✓ Riwayat notifikasi berhasil dibersihkan.");
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4000);
  };

  // Ekspor Data Riwayat ke CSV
  const handleExportCsv = () => {
    const rows = [
      ["Tanggal", "Nama Balita", "NIK", "Usia (Bulan)", "BB (kg)", "TB (cm)", "LK (cm)", "Cara Ukur", "Z-Score TB/U", "Z-Score BB/U", "Status", "Catatan"],
      ...(activeChild.history || []).map((h) => [
        h.tgl,
        `"${activeChild.nama}"`,
        `'${activeChild.nik}`,
        h.usia,
        h.bb,
        h.tb,
        h.lingkarKepala || "-",
        h.caraUkur || (h.usia < 24 ? "Terlentang" : "Berdiri"),
        h.zTbu,
        h.zBbu || "-",
        h.zTbu < -2 ? "Waspada / Faltering" : "Normal",
        `"${h.catatan || "-"}"`,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Riwayat_Timbang_${activeChild.nama.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncNow = () => {
    try {
      localStorage.removeItem("nt_offline_queue");
    } catch (e) {}
    setPendingSyncCount(0);
    setSyncedBannerText("✓ Semua antrean offline penimbangan berhasil disinkronkan ke Server Pusat & Dapur MBG!");
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 4000);
  };

  // Simpan Balita Baru Hasil Ketikan Manual Kader (SKPL-F01)
  const handleSaveNewChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) {
      alert("Nama lengkap balita wajib diisi!");
      return;
    }

    // Hitung usia dalam bulan dari tanggal lahir
    const bDate = new Date(newTglLahir);
    const today = new Date();
    const ageMonths = Math.max(
      1,
      (today.getFullYear() - bDate.getFullYear()) * 12 + (today.getMonth() - bDate.getMonth())
    );

    const medianH = newSex === "L" ? 64 + ageMonths * 0.95 : 62 + ageMonths * 0.93;
    const ztbu = Math.round(((newTb - medianH) / (medianH * 0.038)) * 100) / 100;
    const medianW = newSex === "L" ? 7.5 + ageMonths * 0.28 : 7.0 + ageMonths * 0.27;
    const zbbu = Math.round(((newBb - medianW) / (medianW * 0.12)) * 100) / 100;

    const isFalter = ztbu < -2 || zbbu < -2;
    const statusNutr = isFalter ? "Waspada / Faltering" : "Normal";
    const pack = isFalter ? "Paket B (Intervensi Protein Hewani)" : "Paket A (Reguler)";

    const newId = `B-${Date.now().toString().slice(-4)}`;
    const newRecord: BalitaRecord = {
      id: newId,
      nik: newNik.trim() || `3505${Date.now().toString().slice(-12)}`,
      nama: newNama.trim(),
      tglLahir: newTglLahir,
      usiaBulan: ageMonths,
      jenisKelamin: newSex,
      namaIbu: newNamaIbu.trim() || "Ibu Balita",
      kabupaten: newKabupaten,
      kecamatan: newKecamatan,
      desa: newDesa,
      posyandu: newPosyandu,
      bbKg: newBb,
      tbCm: newTb,
      lingkarKepalaCm: newLk,
      zBBU: zbbu,
      zTBU: ztbu,
      zBBTB: 0.1,
      statusNutrisi: statusNutr,
      paketMBG: pack,
      isFaltering: isFalter,
      history: [
        {
          tgl: new Date().toISOString().split("T")[0],
          usia: ageMonths,
          bb: newBb,
          tb: newTb,
          zTbu: ztbu,
          zBbu: zbbu
        }
      ],
      catatan: newCatatan.trim() || "Pendaftaran balita baru oleh kader posyandu."
    };

    // Update state balita di frontend
    setBalitaList([newRecord, ...balitaList]);
    setSelectedChildId(newId);
    setInputWeight(newBb);
    setInputHeight(newTb);
    setInputAgeMonths(ageMonths);
    setInputSex(newSex);
    setInputHeadCircumference(newLk);
    setMeasuringMethod(ageMonths < 24 ? "panjang" : "tinggi");

    // Simpan ke localStorage agar permanen & otomatis tersinkron ke Puskesmas
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("nt_custom_balita");
        const arr = raw ? JSON.parse(raw) : [];
        localStorage.setItem("nt_custom_balita", JSON.stringify([newRecord, ...arr]));
      }
    } catch (e) {}

    // Simpan juga ke database backend jika terhubung
    try {
      fetch("http://localhost:5000/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik: newRecord.nik,
          nama: newRecord.nama,
          tglLahir: newRecord.tglLahir,
          jenisKelamin: newRecord.jenisKelamin,
          namaIbu: newRecord.namaIbu,
          kabupaten: newRecord.kabupaten,
          kecamatan: newRecord.kecamatan,
          desa: newRecord.desa,
          posyandu: newRecord.posyandu,
          bbKg: newRecord.bbKg,
          tbCm: newRecord.tbCm,
          lingkarKepalaCm: newRecord.lingkarKepalaCm,
          catatan: newRecord.catatan
        })
      }).catch(() => {});
    } catch (err) {}

    // Reset form ketikan
    setNewNama("");
    setNewNik("");
    setNewNamaIbu("");
    setNewAlamat("");
    setNewCatatan("");

    // Pindah ke mode timbang & tampilkan notifikasi sukses
    setInputMode("timbang");
    setSyncedBannerText(`🎉 Balita baru "${newRecord.nama}" (${ageMonths} Bulan) BERHASIL DIDAFTARKAN MANUAL oleh Kader Posyandu!`);
    setSyncedBanner(true);
    setTimeout(() => setSyncedBanner(false), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Status Pendaftaran Baru Menunggu Konfirmasi Puskesmas */}
      {posyanduStatusVerifikasi.toLowerCase().includes("menunggu") && (
        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/70 to-yellow-50/90 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white font-mono text-base font-black shadow-sm animate-pulse">
                ⏳
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-sans text-sm font-black text-amber-950 uppercase tracking-tight">
                    Pendaftaran Posyandu Baru · Menunggu Konfirmasi Puskesmas Pembina
                  </h4>
                  <span className="rounded-full bg-amber-200 text-amber-950 font-mono text-[9px] font-black px-2 py-0.5">
                    Pending Verifikasi
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Akun <strong>{posyanduUnit}</strong> telah otomatis terhubung ke <strong>{puskesmasPembina}</strong>. Pimpinan Puskesmas dapat memvalidasi dan mengesahkan naungan faskes melalui halaman pantau binaan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalPuskesmasOpen(true)}
              className="shrink-0 flex items-center gap-2 rounded-2xl bg-amber-900 text-amber-50 px-4 py-2.5 font-sans text-xs font-black shadow hover:bg-black transition-all"
            >
              <span>📍 Lihat Alamat & Info Puskesmas</span>
            </button>
          </div>
        </div>
      )}

      {/* Banner Identitas Posyandu Desa & Naungan Puskesmas Pembina */}
      <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-emerald-50/70 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#18140B] text-[#38E8F5] font-mono text-xs font-black shadow-md">
            POS
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-base font-black text-zinc-950">
                {posyanduUnit}
              </h3>
              {posyanduStatusVerifikasi.toLowerCase().includes("menunggu") ? (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 font-mono text-[10px] font-black text-amber-900 animate-pulse">
                  ⏳ Menunggu Konfirmasi Puskesmas
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 font-mono text-[10px] font-black text-emerald-900">
                  ● Resmi Dinaungi & Terverifikasi
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-zinc-600 mt-0.5">
              {posyanduWilayah}
            </p>
          </div>
        </div>

        {/* Kartu Puskesmas Pembina Terdekat & Navigasi Alamat */}
        <div className="rounded-2xl border border-emerald-300 bg-white/95 px-4 py-2.5 font-mono text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏥</span>
            <div>
              <span className="text-zinc-400 text-[10px] block font-bold uppercase">Puskesmas Pembina Terdekat:</span>
              <strong className="text-emerald-900 font-sans font-black text-sm">{puskesmasPembina}</strong>
              <span className="text-[11px] text-zinc-600 block line-clamp-1 max-w-[260px] font-sans">
                {alamatPuskesmas}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalPuskesmasOpen(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[11px] font-black px-3 py-2 flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-center"
          >
            <span>📍 Arahkan ke Puskesmas</span>
          </button>
        </div>
      </div>

      {/* 1. NOTIFIKASI JADWAL PERTEMUAN STUNTING DARI PUSKESMAS PEMBINA (HANYA UNTUK BALITA WASPADA) */}
      {waspadaNotifList.length > 0 && (
        <div className="rounded-3xl border border-rose-300 bg-rose-50/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-rose-600 text-white text-xs animate-bounce">
                🔔
              </span>
              <h4 className="font-sans text-sm font-black text-rose-950 uppercase tracking-tight">
                Notifikasi Jadwal Intervensi dari Puskesmas Pembina ({waspadaNotifList.length} Balita Waspada)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-600 text-white font-mono text-[10px] font-black px-2.5 py-0.5">
                Perlu Disampaikan ke Ibu Balita
              </span>
              <button
                type="button"
                onClick={handleClearNotifications}
                className="rounded-xl border border-rose-300 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
              >
                🗑️ Hapus Riwayat Notifikasi
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {waspadaNotifList.map((n) => (
              <div key={n.id} className="rounded-2xl border border-rose-200 bg-white p-4 space-y-2 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-sans text-base font-black text-zinc-950">{n.namaBalita}</h5>
                    <p className="font-mono text-xs text-zinc-500">NIK: {n.nikBalita}</p>
                  </div>
                  <span className="rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[10px] font-bold px-2 py-0.5">
                    {n.waktuKirim || "Baru Masuk"}
                  </span>
                </div>

                <div className="rounded-xl bg-zinc-50 p-2.5 font-mono text-xs text-zinc-700 space-y-1">
                  <div>📅 <strong>{n.tglPertemuan}</strong> pukul <strong>{n.waktuPertemuan}</strong></div>
                  <div>🏥 Lokasi: <strong>{n.lokasi}</strong></div>
                  <div>👨‍⚕️ Dokter: <strong>{n.dokterPemeriksa}</strong></div>
                </div>

                <div className="text-xs text-rose-950 font-sans font-medium">
                  <strong>Agenda:</strong> {n.agenda}
                  {n.catatan && <p className="text-[11px] text-zinc-500 mt-0.5">Catatan: {n.catatan}</p>}
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">
                    Status: <strong className="text-rose-700">{n.statusTerkirim || "Belum Konfirmasi"}</strong>
                  </span>
                  {n.statusTerkirim !== "Telah Disampaikan ke Orang Tua" && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledgeNotif(n.id, n.namaBalita)}
                      className="rounded-xl bg-[#18140B] text-white px-3 py-1.5 font-sans text-xs font-black hover:bg-emerald-600 transition-colors"
                    >
                      ✓ Tandai Telah Disampaikan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNER NAVIGASI CEPAT KE MENU VERIFIKASI MBG (DIPISAHKAN DARI MEJA PENIMBANGAN) */}
      <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white text-lg shadow-xs">
            🍱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[9px] font-black uppercase text-white tracking-wider">
                Alur Menu Terpisah
              </span>
              <span className="font-mono text-xs font-bold text-zinc-600">
                Verifikasi Kedatangan Ransum MBG SPPG
              </span>
            </div>
            <p className="font-sans text-xs text-zinc-600 mt-0.5">
              Ruang timbang & KMS ini dikhususkan untuk <strong>Penimbangan Balita</strong>. Proses pemeriksaan fisik & konfirmasi kedatangan paket MBG dari SPPG dipusatkan di tab <strong>&quot;Verifikasi MBG&quot;</strong>.
            </p>
          </div>
        </div>

        {onNavigateToMbg && (
          <button
            type="button"
            onClick={onNavigateToMbg}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 font-sans text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95 shrink-0"
          >
            <span>Buka Verifikasi MBG</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Header Info & Offline Banner (SKPL-F05) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#38E8F5] animate-pulse" />
            <h2 className="font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
              Modul A: Smart KMS & Deteksi Dini Posyandu
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Standar Antropometri Permenkes No. 2/2020 · Algoritma WHO Z-Score Real-Time
          </p>
        </div>

        {/* Offline Queue Badge & Simulation Toggle */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 border font-mono text-xs font-bold transition-colors ${
              isOfflineMode
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOfflineMode ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span>
              {isOfflineMode
                ? `Mode Offline (${pendingSyncCount} antrean IndexedDB)`
                : "Tersambung Real-Time"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetAllCustomBalita}
            className="rounded-2xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 font-mono text-xs font-bold text-zinc-700 transition-colors shadow-2xs"
            title="Kembalikan data ke 10 balita standar dan bersihkan data tersimpan"
          >
            🔄 Reset Master (10 Balita)
          </button>

          <button
            type="button"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            {isOfflineMode ? "Beralih Online" : "Simulasi Sinyal Mati"}
          </button>

          {pendingSyncCount > 0 && !isOfflineMode && (
            <button
              type="button"
              onClick={handleSyncNow}
              className="rounded-xl bg-[#18140B] px-3.5 py-2 text-xs font-black text-white shadow-sm hover:scale-105 transition-transform"
            >
              Sinkronkan Sekarang ({pendingSyncCount})
            </button>
          )}
        </div>
      </div>

      {syncedBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 font-mono text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
              ✓
            </span>
            <span>
              {syncedBannerText}
            </span>
          </div>
          <span className="text-[11px] opacity-75">Hash SHA-256 Valid</span>
        </motion.div>
      )}

      {/* Early Warning Banner if Faltering (SKPL-F04) */}
      <AnimatePresence>
        {isFalteringNow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[24px] border-2 border-[#FF764C] bg-gradient-to-r from-[#FFF2EE] via-white to-[#FFF2EE] p-5 shadow-md"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#FF764C] text-white shadow-sm font-black text-lg">
                  !
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#FF764C] px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white tracking-wider">
                    EARLY WARNING GROWTH FALTERING (WASPADA)
                  </div>
                  <h3 className="mt-1 font-sans text-lg font-black uppercase tracking-tight text-zinc-950">
                    Kenaikan Berat Badan Tidak Memadai 2 Bulan Berturut-Turut
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-600 max-w-2xl font-medium">
                    Sistem mendeteksi tren mendatar pada balita <span className="font-bold text-zinc-900">{activeChild.nama}</span> ({inputAgeMonths} Bulan). Secara otomatis dimasukkan ke antrean prioritas <strong>Paket B (Protein Hewani Tinggi)</strong> dapur SPPG hari ini.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2.5">
                <span className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 font-mono text-xs font-black text-amber-900">
                  +1 Butir Telur Blitar
                </span>
                <span className="rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 font-mono text-xs font-black text-[#032D30]">
                  +35g Lele Lamongan
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Input Form Cepat & Digital KMS Curve */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Form Input Cepat Antropometri / Pendaftaran Manual */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
                  {inputMode === "timbang" ? "Input Timbangan Bulanan" : "Daftarkan Balita Baru (Manual)"}
                </h3>
                <p className="font-mono text-[11px] text-zinc-500">
                  {inputMode === "timbang" ? "SKPL-F01 · Balita Terdaftar Posyandu" : "Ketik mandiri data balita baru desa"}
                </p>
              </div>
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-700">
                Posyandu Mawar 01
              </span>
            </div>

            {/* Mode Switcher: Timbang Rutin vs Daftar Baru Manual */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1.5 font-sans text-xs font-bold">
              <button
                type="button"
                onClick={() => setInputMode("timbang")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "timbang"
                    ? "bg-[#18140B] text-white shadow-sm font-black"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span>⚖️ Timbang Rutin</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("daftar_baru")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "daftar_baru"
                    ? "bg-[#38E8F5] text-zinc-950 shadow-sm font-black"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <span>➕ Balita Baru (Ketik)</span>
              </button>
            </div>

            {inputMode === "daftar_baru" ? (
              /* FORM PENDAFTARAN MANUAL BALITA BARU LEWAT KETIKAN KADER */
              <form onSubmit={handleSaveNewChild} className="mt-5 space-y-4">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-3 text-xs text-[#032D30] font-medium leading-relaxed">
                  💡 <strong>Input Manual Kader:</strong> Ketikkan identitas balita baru dari Buku KIA / Kartu Keluarga. Data akan langsung tersimpan dan otomatis muncul di daftar posyandu Anda.
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Nama Lengkap Balita *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rian Pratama"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-sans text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white focus:ring-4 focus:ring-[#38E8F5]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      NIK Balita (16 digit)
                    </label>
                    <input
                      type="text"
                      placeholder="350512..."
                      maxLength={16}
                      value={newNik}
                      onChange={(e) => setNewNik(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={newSex}
                      onChange={(e) => setNewSex(e.target.value as "L" | "P")}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-sans text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white"
                    >
                      <option value="L">Laki-Laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      required
                      value={newTglLahir}
                      onChange={(e) => setNewTglLahir(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 font-mono text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Nama Ibu Kandung
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Ibu"
                      value={newNamaIbu}
                      onChange={(e) => setNewNamaIbu(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-sans text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-zinc-700 mb-1">
                      BB Awal (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newBb}
                      onChange={(e) => setNewBb(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 font-mono text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-zinc-700 mb-1">
                      TB Awal (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newTb}
                      onChange={(e) => setNewTb(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 font-mono text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-zinc-700 mb-1">
                      LK (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newLk}
                      onChange={(e) => setNewLk(Number(e.target.value))}
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 font-mono text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-zinc-700 mb-1">
                    Alamat Dusun / RT / RW
                  </label>
                  <input
                    type="text"
                    placeholder="Dusun Krajan RT 01 / RW 02, Bilaporah"
                    value={newAlamat}
                    onChange={(e) => setNewAlamat(e.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-sans text-xs font-medium text-zinc-900 outline-none focus:border-[#38E8F5]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-[#18140B] text-white py-3.5 font-sans text-xs font-black hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>💾 Simpan & Daftarkan Balita</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("timbang")}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 font-sans text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              /* FORM TIMBANGAN RUTIN BULANAN */
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600">
                      Pilih Balita Terdaftar ({balitaList.length} Anak)
                    </label>
                    <button
                      type="button"
                      onClick={() => setInputMode("daftar_baru")}
                      className="font-mono text-[11px] font-bold text-[#5C46D9] hover:underline"
                    >
                      + Ketik Balita Baru
                    </button>
                  </div>
                  <select
                    value={selectedChildId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedChildId(id);
                      const b = balitaList.find((item) => item.id === id);
                      if (b) {
                        setInputWeight(b.bbKg);
                        setInputHeight(b.tbCm);
                        setInputAgeMonths(b.usiaBulan);
                        setInputSex(b.jenisKelamin);
                        setInputHeadCircumference(b.lingkarKepalaCm || 45.0);
                        setMeasuringMethod(b.usiaBulan < 24 ? "panjang" : "tinggi");
                        setInputRecordDate(new Date().toISOString().split("T")[0]);
                        setInputCatatan("");
                      }
                    }}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-sans text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                  >
                    {balitaList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} ({b.usiaBulan} bln) — {b.nik} [{b.statusNutrisi}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Penimbangan */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Tanggal Penimbangan (Posyandu)
                  </label>
                  <input
                    type="date"
                    value={inputRecordDate}
                    onChange={(e) => setInputRecordDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white focus:ring-4 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* Usia & Jenis Kelamin */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Usia (Bulan)
                    </label>
                    <input
                      type="number"
                      value={inputAgeMonths}
                      min={1}
                      max={60}
                      onChange={(e) => {
                        const age = Number(e.target.value);
                        setInputAgeMonths(age);
                        setMeasuringMethod(age < 24 ? "panjang" : "tinggi");
                      }}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="flex h-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
                      <button
                        type="button"
                        onClick={() => setInputSex("L")}
                        className={`flex-1 rounded-xl text-xs font-black transition-colors ${
                          inputSex === "L" ? "bg-[#18140B] text-white" : "text-zinc-600"
                        }`}
                      >
                        Laki-Laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputSex("P")}
                        className={`flex-1 rounded-xl text-xs font-black transition-colors ${
                          inputSex === "P" ? "bg-[#18140B] text-white" : "text-zinc-600"
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Berat Badan & Tinggi Badan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600">
                        Berat Badan (kg)
                      </label>
                      {lastHistoryEntry && (
                        <span className="font-mono text-[10px] text-zinc-400">
                          Lalu: {lastHistoryEntry.bb} kg
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.05"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(Number(e.target.value))}
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-lg font-black text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                    />
                    {deltaWeight !== null && (
                      <div className="mt-1 flex items-center gap-1 font-mono text-[10px] font-bold">
                        {deltaWeight > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            ▲ +{deltaWeight} kg (Naik)
                          </span>
                        ) : deltaWeight === 0 ? (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            ▶ 0.0 kg (Stagnan / 2T)
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            ▼ {deltaWeight} kg (Turun / Faltering!)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      {measuringMethod === "panjang" ? "Panjang Badan (cm)" : "Tinggi Badan (cm)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputHeight}
                      onChange={(e) => setInputHeight(Number(e.target.value))}
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-lg font-black text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                </div>

                {/* Lingkar Kepala & Cara Ukur */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Lingkar Kepala (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputHeadCircumference}
                      onChange={(e) => setInputHeadCircumference(Number(e.target.value))}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                      Cara Ukur (WHO)
                    </label>
                    <div className="flex h-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 font-mono text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setMeasuringMethod("panjang")}
                        className={`flex-1 rounded-xl transition-all ${
                          measuringMethod === "panjang"
                            ? "bg-[#18140B] text-white shadow-xs font-black"
                            : "text-zinc-600 hover:text-zinc-950"
                        }`}
                      >
                        Terlentang
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeasuringMethod("tinggi")}
                        className={`flex-1 rounded-xl transition-all ${
                          measuringMethod === "tinggi"
                            ? "bg-[#18140B] text-white shadow-xs font-black"
                            : "text-zinc-600 hover:text-zinc-950"
                        }`}
                      >
                        Berdiri
                      </button>
                    </div>
                  </div>
                </div>

                {/* Catatan Penimbangan / Kondisi Balita */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Catatan Kondisi Balita (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Balita sehat, ASI lancar / nafsu makan menurun saat tumbuh gigi"
                    value={inputCatatan}
                    onChange={(e) => setInputCatatan(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-sans text-xs font-medium text-zinc-900 outline-none focus:border-[#38E8F5] focus:bg-white"
                  />
                </div>

                {/* Live Status Calculation Box (SKPL-F02) */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-zinc-500">Z-Score TB/U (Stunting):</span>
                    <span className={`px-2 py-0.5 rounded-md ${currentZTBU < -2 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                      {currentZTBU > 0 ? `+${currentZTBU}` : currentZTBU} SD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-zinc-500">Z-Score BB/U (Underweight):</span>
                    <span className={`px-2 py-0.5 rounded-md ${currentZBBU < -2 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                      {currentZBBU > 0 ? `+${currentZBBU}` : currentZBBU} SD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold pt-1 border-t border-zinc-200">
                    <span className="text-zinc-700">Preskripsi MBG Otomatis:</span>
                    <span className="font-sans font-black text-[#7866FF]">{currentPack}</span>
                  </div>
                </div>

                {/* Tombol Simpan Penimbangan */}
                <button
                  type="button"
                  onClick={handleSaveWeighing}
                  className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#18140B] font-sans text-sm font-black text-white shadow-lg transition-transform hover:scale-[1.015] active:scale-95"
                >
                  <span>Simpan Penimbangan Hari Ini</span>
                  <span className="text-[#38E8F5] transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
            )}
        </div>
      </div>

        {/* Kolom Kanan: Kurva KMS Digital Interaktif (SKPL-F03) & Riwayat */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
                  Kurva KMS Digital Interaktif
                </h3>
                <p className="font-mono text-[11px] text-zinc-500">
                  WHO Growth Standards · {activeChild.nama} ({activeChild.jenisKelamin === "L" ? "Laki-Laki" : "Perempuan"})
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Normal
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> -2 SD
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-rose-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600" /> -3 SD
                </span>
              </div>
            </div>

            {/* KARTU JANJI TEMU DOKTER PUSKESMAS: HANYA KELUAR JIKA BALITA BERSTATUS WASPADA / FALTERING / STUNTING */}
            {isChildWaspada && activeChildJadwal ? (
              <div className="mt-5 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-amber-50/40 to-white p-4.5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-600 text-white text-sm shadow-xs shrink-0">
                      🏥
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans text-sm font-black text-rose-950 uppercase tracking-tight">
                          Janji Temu Intervensi Dokter Puskesmas
                        </h4>
                        <span className="rounded-md bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5">
                          Status Waspada
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-rose-800 mt-0.5">
                        Rujukan klinis stunting & evaluasi nutrisi untuk <strong>{activeChild.nama}</strong> ({activeChild.statusNutrisi})
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-800 self-start sm:self-auto">
                    ● {activeChildJadwal.statusTerkirim || "Terjadwal"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="rounded-xl bg-white/90 border border-rose-100 p-2.5">
                    <span className="block font-mono text-[10px] text-zinc-400 uppercase font-bold">Waktu & Tanggal</span>
                    <strong className="text-zinc-950 block mt-0.5">📅 {activeChildJadwal.tglPertemuan}</strong>
                    <span className="font-mono text-[11px] text-zinc-600">pukul {activeChildJadwal.waktuPertemuan}</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-rose-100 p-2.5">
                    <span className="block font-mono text-[10px] text-zinc-400 uppercase font-bold">Lokasi Faskes</span>
                    <strong className="text-zinc-950 block mt-0.5">🏥 {activeChildJadwal.lokasi}</strong>
                    <span className="font-mono text-[10px] text-zinc-500">{activeChildJadwal.puskesmas}</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-rose-100 p-2.5">
                    <span className="block font-mono text-[10px] text-zinc-400 uppercase font-bold">Dokter Pemeriksa</span>
                    <strong className="text-zinc-950 block mt-0.5">👨‍⚕️ {activeChildJadwal.dokterPemeriksa}</strong>
                    <span className="font-mono text-[10px] text-zinc-500">Poli Gizi / Spesialis Anak</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white/95 border border-rose-100 p-3 text-xs space-y-1">
                  <div>
                    <strong className="text-zinc-800 font-mono text-[11px] uppercase">Agenda Klinis:</strong>{" "}
                    <span className="text-zinc-700 font-medium">{activeChildJadwal.agenda}</span>
                  </div>
                  {activeChildJadwal.catatan && (
                    <div className="text-[11px] text-zinc-500 font-mono pt-1 border-t border-rose-100/60">
                      💡 <strong>Catatan Ibu Balita:</strong> {activeChildJadwal.catatan}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 font-mono text-[11px]">
                  <span className="text-zinc-500 text-[10px]">
                    Instruksi: Sampaikan jadwal konsultasi dokter ini kepada Ibu {activeChild.namaIbu}.
                  </span>
                  {activeChildJadwal.statusTerkirim !== "Telah Disampaikan ke Orang Tua" ? (
                    <button
                      type="button"
                      onClick={() => handleAcknowledgeNotif(activeChildJadwal.id, activeChild.nama)}
                      className="rounded-xl bg-[#18140B] text-white px-3 py-1.5 font-sans text-xs font-bold hover:bg-emerald-600 transition-colors shadow-2xs shrink-0 self-end sm:self-auto"
                    >
                      ✓ Tandai Telah Disampaikan ke Ibu
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      ✓ Telah Disampaikan ke Orang Tua
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-emerald-950 font-bold">
                    Status Nutrisi: {activeChild.statusNutrisi} ({activeChild.zTBU > 0 ? `+${activeChild.zTBU}` : activeChild.zTBU} SD) · Tumbuh kembang optimal di pita hijau. Belum memerlukan janji temu rujukan dokter Puskesmas.
                  </span>
                </div>
                <span className="rounded-lg bg-emerald-100 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 shrink-0">
                  Normal & Sehat
                </span>
              </div>
            )}

            {/* Interactive SVG KMS Chart Canvas */}
            <div className="mt-6 relative h-[320px] w-full rounded-2xl bg-zinc-50/80 border border-zinc-200/70 p-4 overflow-hidden">
              <svg viewBox="0 0 540 260" className="h-full w-full select-none">
                <defs>
                  <linearGradient id="kmsZoneGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#91EB4C" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#91EB4C" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="kmsZoneYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFCA38" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFCA38" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[50, 100, 150, 200].map((y) => (
                  <line key={y} x1="40" y1={y} x2="520" y2={y} stroke="#E4E4E7" strokeDasharray="3 3" />
                ))}

                {/* WHO Envelope Ribbons */}
                {/* Zona Hijau Normal (antara -2 SD hingga +2 SD) */}
                <path
                  d="M 40 180 Q 200 120, 360 80 T 520 40 L 520 120 Q 360 160, 200 190 T 40 220 Z"
                  fill="url(#kmsZoneGreen)"
                />

                {/* Zona Kuning Waspada (-2 SD s/d -3 SD) */}
                <path
                  d="M 40 220 Q 200 190, 360 160 T 520 120 L 520 160 Q 360 200, 200 225 T 40 250 Z"
                  fill="url(#kmsZoneYellow)"
                />

                {/* Garis Median 0 SD (WHO) */}
                <path
                  d="M 40 160 Q 200 100, 360 65 T 520 30"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Garis Batas -2 SD (Garis Merah Stunting) */}
                <path
                  d="M 40 220 Q 200 190, 360 160 T 520 120"
                  fill="none"
                  stroke="#FF764C"
                  strokeWidth="2"
                />

                {/* Dynamic Plot Riwayat Balita Aktif */}
                {activeChild.history && activeChild.history.length > 0 && (() => {
                  const sorted = [...activeChild.history].sort((a, b) => a.usia - b.usia);
                  const minAge = Math.min(...sorted.map((x) => x.usia), 6);
                  const maxAge = Math.max(...sorted.map((x) => x.usia), minAge + 12);
                  const pts = sorted.map((h) => {
                    const x = sorted.length === 1
                      ? 280
                      : 80 + ((h.usia - minAge) / Math.max(1, maxAge - minAge)) * 380;
                    const y = Math.max(45, Math.min(235, 235 - ((h.bb - 6) / 8) * 165));
                    return { ...h, x, y };
                  });

                  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                  return (
                    <g>
                      {pts.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#7866FF"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      {pts.map((p, idx) => {
                        const isLatest = idx === pts.length - 1;
                        return (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isLatest ? 7 : 5}
                              fill={isLatest ? "#38E8F5" : "#7866FF"}
                              stroke={isLatest ? "#18140B" : "white"}
                              strokeWidth={isLatest ? 2.5 : 2}
                            />
                            {isLatest && (
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={14}
                                fill="none"
                                stroke="#38E8F5"
                                strokeWidth={2}
                                className="animate-ping"
                                opacity="0.5"
                              />
                            )}
                            <text
                              x={p.x}
                              y={isLatest ? Math.min(250, p.y + 22) : p.y - 10}
                              textAnchor="middle"
                              className={`font-mono ${isLatest ? "text-[10px] fill-zinc-950 font-black" : "text-[9px] fill-zinc-600 font-bold"}`}
                            >
                              {isLatest ? `Hari Ini: ${p.bb} kg (${p.zTbu > 0 ? `+${p.zTbu}` : p.zTbu} SD)` : `${p.bb} kg (${p.usia} bln)`}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}

                {/* Label Sumbu X & Y */}
                <text x="45" y="25" className="font-mono text-[9px] fill-zinc-400 font-bold">
                  Tinggi/Panjang Badan (cm)
                </text>
                <text x="480" y="255" className="font-mono text-[9px] fill-zinc-400 font-bold">
                  Usia (Bulan) →
                </text>
              </svg>
            </div>

            {/* Riwayat Penimbangan Tabel Interaktif & Kartu KMS */}
            <div className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-zinc-800">
                    Buku Catatan Penimbangan Posyandu (KMS)
                  </h4>
                  <p className="font-mono text-[10px] text-zinc-500">
                    Histori pemantauan berkala balita {activeChild.nama} · {activeChild.history?.length || 0} catatan
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintMonthlyReport}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 font-sans text-xs font-black text-emerald-950 hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    <span>📋</span>
                    <span>Cetak Laporan Bulanan Posyandu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <span>📥 Ekspor CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#18140B] px-3.5 py-1.5 font-sans text-xs font-black text-white hover:bg-[#38E8F5] hover:text-zinc-950 transition-colors shadow-xs"
                  >
                    <span>🖨️ Cetak Kartu KMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetBalitaHistory(activeChild.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 font-mono text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                    title="Hapus riwayat penimbangan balita ini"
                  >
                    <span>🗑️ Hapus Riwayat</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 font-mono text-[10px] uppercase text-zinc-500">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Usia</th>
                      <th className="py-2.5 px-3">BB (kg)</th>
                      <th className="py-2.5 px-3">TB (cm)</th>
                      <th className="py-2.5 px-3">LK (cm)</th>
                      <th className="py-2.5 px-3">Cara Ukur</th>
                      <th className="py-2.5 px-3">Z TB/U</th>
                      <th className="py-2.5 px-3">Status Gizi</th>
                      <th className="py-2.5 px-3">Catatan</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {sortedHistory.map((h, i) => {
                      const prevH = i > 0 ? sortedHistory[i - 1] : null;
                      const delta = prevH ? Math.round((h.bb - prevH.bb) * 100) / 100 : null;
                      return (
                        <tr key={i} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-zinc-800 whitespace-nowrap">
                            {h.tgl}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{h.usia} bln</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-zinc-950">{h.bb} kg</span>
                            {delta !== null && (
                              <span
                                className={`ml-1.5 inline-block text-[9px] font-mono font-bold px-1 py-0.5 rounded ${
                                  delta > 0
                                    ? "text-emerald-700 bg-emerald-50"
                                    : delta === 0
                                    ? "text-amber-800 bg-amber-50"
                                    : "text-rose-700 bg-rose-50"
                                }`}
                              >
                                {delta > 0 ? `▲ +${delta}` : delta === 0 ? `▶ 0.0` : `▼ ${delta}`}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{h.tb} cm</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600 whitespace-nowrap">
                            {h.lingkarKepala ? `${h.lingkarKepala} cm` : "-"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-600 capitalize whitespace-nowrap">
                            {h.caraUkur || (h.usia < 24 ? "Terlentang" : "Berdiri")}
                          </td>
                          <td
                            className={`py-2.5 px-3 font-mono font-bold whitespace-nowrap ${
                              h.zTbu < -2 ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {h.zTbu > 0 ? `+${h.zTbu}` : h.zTbu} SD
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {h.zTbu < -2 || (h.zBbu !== undefined && h.zBbu < -2) ? (
                              <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Waspada / Faltering
                              </span>
                            ) : (
                              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 text-[11px] max-w-[140px] truncate">
                            {h.catatan || "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteHistory(i)}
                              title="Hapus baris data salah"
                              className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cetak Kartu KMS Digital Interaktif */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#38E8F5]/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#032D30]">
                  KEMENTERIAN KESEHATAN RI · PEMPROV JATIM
                </div>
                <h3 className="mt-1 font-sans text-xl font-black uppercase tracking-tight text-zinc-950">
                  Kartu Menuju Sehat (KMS) Digital
                </h3>
                <p className="font-mono text-xs text-zinc-500">
                  Standar Antropometri Permenkes No. 2/2020 · Terintegrasi Dapur MBG
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Balita Identity Box */}
            <div className="mt-5 rounded-2xl bg-zinc-50 border border-zinc-200 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">Nama Balita</span>
                <strong className="text-zinc-950 text-sm">{activeChild.nama}</strong>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">NIK Balita</span>
                <span className="font-mono font-bold text-zinc-800">{activeChild.nik}</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">Jenis Kelamin</span>
                <span className="font-bold text-zinc-800">
                  {activeChild.jenisKelamin === "L" ? "Laki-Laki (L)" : "Perempuan (P)"}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">Nama Ibu</span>
                <span className="font-bold text-zinc-800">{activeChild.namaIbu}</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">Posyandu / Desa</span>
                <span className="font-bold text-zinc-800">{activeChild.posyandu}, {activeChild.desa}</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-zinc-500 uppercase">Status Nutrisi Saat Ini</span>
                <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  activeChild.isFaltering ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                }`}>
                  {activeChild.statusNutrisi}
                </span>
              </div>
            </div>

            {/* Status MBG Alokasi & Janji Temu Puskesmas (Hanya Jika Waspada) */}
            <div className="mt-4 rounded-2xl border border-zinc-200 p-3.5 space-y-2.5 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-zinc-500 uppercase font-bold">Preskripsi Menu MBG Harian:</div>
                  <div className="font-sans text-sm font-black text-[#5C46D9]">{activeChild.paketMBG}</div>
                </div>
                <span className="rounded-xl bg-zinc-100 px-3 py-1 font-mono text-xs font-bold text-zinc-700">
                  Puskesmas {activeChild.kecamatan}
                </span>
              </div>

              {isChildWaspada && activeChildJadwal ? (
                <div className="pt-2.5 border-t border-rose-100 rounded-xl bg-rose-50/70 p-3 text-xs text-rose-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-black uppercase text-[11px] text-rose-900 flex items-center gap-1.5">
                      <span>🏥 Janji Temu Intervensi Puskesmas (Status Waspada)</span>
                    </span>
                    <span className="font-mono text-[10px] font-bold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded">
                      📅 {activeChildJadwal.tglPertemuan} ({activeChildJadwal.waktuPertemuan})
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-700 mt-1">
                    Dokter: <strong>{activeChildJadwal.dokterPemeriksa}</strong> · Lokasi: <strong>{activeChildJadwal.lokasi}</strong>
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    Agenda: <strong>{activeChildJadwal.agenda}</strong>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-100 text-[11px] font-mono text-emerald-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Status Normal · Tumbuh kembang baik di pita hijau, belum memerlukan janji temu rujukan faskes.</span>
                </div>
              )}
            </div>

            {/* Riwayat Penimbangan Table */}
            <div className="mt-5">
              <h5 className="font-mono text-xs font-bold uppercase text-zinc-600 mb-2">
                Riwayat Penimbangan Balita
              </h5>
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-100/70 border-b border-zinc-200 font-mono text-[10px] uppercase text-zinc-600">
                    <tr>
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Usia</th>
                      <th className="py-2 px-3">BB</th>
                      <th className="py-2 px-3">TB</th>
                      <th className="py-2 px-3">LK</th>
                      <th className="py-2 px-3">Z TB/U</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {sortedHistory.map((h, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono text-[11px]">{h.tgl}</td>
                        <td className="py-2 px-3">{h.usia} bln</td>
                        <td className="py-2 px-3 font-bold">{h.bb} kg</td>
                        <td className="py-2 px-3">{h.tb} cm</td>
                        <td className="py-2 px-3 font-mono">{h.lingkarKepala ? `${h.lingkarKepala} cm` : "-"}</td>
                        <td className="py-2 px-3 font-mono font-bold">{h.zTbu > 0 ? `+${h.zTbu}` : h.zTbu} SD</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            h.zTbu < -2 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {h.zTbu < -2 ? "Waspada" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-200 grid grid-cols-2 gap-4 text-center font-mono text-xs text-zinc-600">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Kader Posyandu Pelaksana</p>
                <div className="h-12 flex items-center justify-center font-bold text-zinc-800 italic">
                  ( Terverifikasi Digital )
                </div>
                <p className="font-bold text-zinc-900">{activeChild.posyandu}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase">Petugas Gizi / Bidan Pembina</p>
                <div className="h-12 flex items-center justify-center font-bold text-zinc-800 italic">
                  ( SIP.35.05.2026.GZ )
                </div>
                <p className="font-bold text-zinc-900">Puskesmas {activeChild.kecamatan}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-sans text-xs font-bold text-zinc-700 hover:bg-zinc-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="rounded-2xl bg-[#18140B] text-white px-5 py-2.5 font-sans text-xs font-black hover:bg-emerald-600 transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>🖨️ Cetak Dokumen Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Laporan Bulanan Posyandu */}
      {printReportData && (
        <CetakLaporanModal
          {...printReportData}
          isOpen={!!printReportData}
          onClose={() => setPrintReportData(null)}
        />
      )}

      {/* Modal Arah & Detail Puskesmas Pembina Terdekat */}
      {isModalPuskesmasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white text-lg">
                  🏥
                </span>
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-950">
                    Puskesmas Pembina Terdekat
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Pusat Rujukan Medis & Pembina Wilayah Kerja Desa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalPuskesmasOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Nama Faskes & Yurisdiksi
                </span>
                <h4 className="font-sans text-lg font-black text-emerald-950">
                  {puskesmasPembina}
                </h4>
                <div className="flex items-start gap-2 text-xs text-emerald-900">
                  <span className="mt-0.5">📍</span>
                  <span className="font-medium leading-relaxed">{alamatPuskesmas}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Jam Buka Pelayanan</span>
                  <p className="font-black text-zinc-900">Senin – Sabtu</p>
                  <p className="text-[11px] text-zinc-600">08:00 – 14:00 WIB</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Poli Spesifik</span>
                  <p className="font-black text-zinc-900">Poli Gizi & KIA</p>
                  <p className="text-[11px] text-zinc-600">Konseling & Terapi F100</p>
                </div>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 text-xs text-sky-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>Alur Pengarahan Balita dari Posyandu:</span>
                </div>
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Balita yang mengalami <em>growth faltering</em> atau Z-score TB/U &lt; -2 SD wajib diarahkan ke poli gizi {puskesmasPembina} membawa Buku KIA untuk evaluasi medis dan preskripsi Paket B protein ganda Jawa Timur.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(puskesmasPembina + " " + alamatPuskesmas)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 h-11 rounded-2xl bg-[#18140B] text-white hover:bg-zinc-800 font-sans text-xs font-black flex items-center justify-center gap-2 transition shadow-md"
              >
                <span>🗺️ Buka Rute di Google Maps</span>
              </a>
              <button
                type="button"
                onClick={() => setIsModalPuskesmasOpen(false)}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-100 font-sans text-xs font-bold text-zinc-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

