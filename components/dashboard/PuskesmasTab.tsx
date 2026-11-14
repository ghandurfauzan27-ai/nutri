"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  KECAMATAN_PER_KABUPATEN,
  DESA_PER_KECAMATAN,
  MASTER_PUSKESMAS_INFO,
  POSYANDU_MIKRO_DATA,
  getPuskesmasNameByKecamatan,
  getPuskesmasAddressByKecamatan,
  type PosyanduMikro,
  type BalitaMikro,
  type JadwalPertemuanStunting,
  INITIAL_JADWAL_PERTEMUAN,
} from "@/lib/puskesmas-data";

interface PendingKader {
  id: string;
  nama: string;
  email: string;
  posyandu: string;
  desa: string;
  alamatPosyandu?: string;
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
    email: "posyandu.mawar02@jatim.go.id",
    posyandu: "Posyandu Mawar 02",
    desa: "Desa Bilaporah",
    alamatPosyandu: "Balai Dusun Jedingan RT 03 / RW 04",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567801",
    tglDaftar: "Hari ini, 08:30 WIB",
    status: "Menunggu Verifikasi",
  },
  {
    id: "KDR-REG-02",
    nama: "Nur Aini",
    email: "posyandu.dakiring@jatim.go.id",
    posyandu: "Posyandu Melati 01",
    desa: "Desa Dakiring",
    alamatPosyandu: "Balai Desa Dakiring Timur RT 01 / RW 01",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567802",
    tglDaftar: "Kemarin, 14:15 WIB",
    status: "Menunggu Verifikasi",
  },
  {
    id: "KDR-REG-03",
    nama: "Siti Rahmawati, S.Pd",
    email: "posyandu.mawar01@jatim.go.id",
    posyandu: "Posyandu Mawar 01",
    desa: "Desa Bilaporah",
    alamatPosyandu: "Balai RW 01, Dusun Krajan Barat",
    kecamatan: "Socah",
    kabupaten: "Kab. Bangkalan",
    noHp: "081234567891",
    tglDaftar: "2 Nov 2026",
    status: "Disetujui",
  },
];

export default function PuskesmasTab() {
  const searchParams = useSearchParams();
  const faskesParam = searchParams.get("faskes")?.toLowerCase();

  // YURISDIKSI RESMI TERKUNCI (Sesuai UU PDP No. 27/2022 & Permenkes No. 2/2020)
  // Puskesmas beroperasi per kecamatan dan DILARANG mengakses/memilih wilayah puskesmas/kabupaten lain.
  const selectedKabupaten =
    faskesParam === "kedungdung" ? "Kab. Sampang" : "Kab. Bangkalan";
  const selectedKecamatan =
    faskesParam === "kedungdung" ? "Kedungdung" : faskesParam === "burneh" ? "Burneh" : "Socah";
  
  const puskesmasName = getPuskesmasNameByKecamatan(selectedKecamatan);
  const puskesmasAddress = getPuskesmasAddressByKecamatan(selectedKecamatan);
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
    "posyandu_desa" | "jadwal_pertemuan" | "verifikasi_kader" | "rujukan_merah"
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
  const [kaderList, setKaderList] = useState<PendingKader[]>(INITIAL_PENDING_KADERS);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Sinkronkan data pendaftaran Posyandu & Balita baru dari localStorage saat mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
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

            // Tambahkan juga ke daftar verifikasi jika belum ada
            setKaderList((prev) => {
              const existingKaderIds = new Set(prev.map((k) => k.id));
              const newKaders: PendingKader[] = registered
                .filter((r: any) => !existingKaderIds.has(r.id))
                .map((r: any) => ({
                  id: r.id,
                  nama: r.kaderPenanggungJawab || "Kader Posyandu",
                  email: r.emailAkun || "posyandu@jatim.go.id",
                  posyandu: r.posyandu,
                  desa: r.desa,
                  alamatPosyandu: r.alamatPosyandu,
                  kecamatan: r.kecamatan,
                  kabupaten: r.kabupaten,
                  noHp: r.noHpKader || "-",
                  tglDaftar: r.tglDaftar || "Baru Daftar",
                  status: (r.statusAkun as any) || "Menunggu Verifikasi",
                }));
              return [...newKaders, ...prev];
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

                const existingIds = new Set(p.balitaList.map((b) => b.id));
                const fresh = converted.filter((b) => !existingIds.has(b.id));
                if (fresh.length === 0) return p;

                const mergedBalitas = [...fresh, ...p.balitaList];
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
      }
    } catch (e) {}
  }, []);

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

  const handleApproveKader = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Disetujui" as const } : k))
    );
    setToastMessage(`Akun Posyandu ${nama} BERHASIL DISETUJUI & DIAKTIFKAN oleh Puskesmas!`);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleRejectKader = (id: string, nama: string) => {
    setKaderList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "Ditolak" as const } : k))
    );
    setToastMessage(`Pendaftaran Akun Posyandu ${nama} ditolak.`);
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

  const pendingCount = kaderList.filter((k) => k.status === "Menunggu Verifikasi").length;

  // Filter balita di dalam modal rincian
  const getFilteredBalitaInModal = () => {
    if (!selectedPosyandu) return [];
    if (filterBalitaStatus === "stunting") {
      return selectedPosyandu.balitaList.filter(
        (b) => b.statusGizi === "Stunting Garis Merah" || b.statusGizi === "Waspada (Faltering)"
      );
    }
    if (filterBalitaStatus === "sehat") {
      return selectedPosyandu.balitaList.filter((b) => b.statusGizi === "Sehat / Normal");
    }
    if (filterBalitaStatus === "rujukan") {
      return selectedPosyandu.balitaList.filter(
        (b) => b.statusGizi === "Gizi Buruk / Rujukan Faskes" || b.statusRujukan.includes("Rujukan")
      );
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

          {/* Unit Puskesmas Tag */}
          <div className="flex items-center gap-2">
            <span className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 font-mono text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-xs">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                🏥
              </span>
              <span>{puskesmasName} ({selectedKabupaten})</span>
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
              Alamat Faskes: {puskesmasAddress} · Kepala Faskes: dr. H. Achmad Syafi'i · Nutrisionis: dr. Nurul Hidayati, M.Gizi
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
          onClick={() => setActiveSubTab("verifikasi_kader")}
          className={`rounded-2xl px-4 py-2.5 font-sans text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === "verifikasi_kader"
              ? "bg-[#18140B] text-white shadow-md"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
          }`}
        >
          <span>🛡️</span>
          <span>Verifikasi Pendaftaran Posyandu Baru</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-400 px-2 py-0.2 font-mono text-[10px] font-black text-zinc-950">
              {pendingCount}
            </span>
          )}
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
            <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 font-mono text-xs font-bold text-rose-800">
              ● {jadwalList.filter((j) => j.status === "Dijadwalkan").length} Pertemuan Menunggu
            </span>
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

                  {/* Tombol Klik Rincian */}
                  <div className="mt-4 pt-2 flex items-center justify-between text-xs font-sans font-bold text-[#032D30] group-hover:text-[#38E8F5] transition-colors">
                    <span className="font-mono text-[11px] text-zinc-500">Kader: {pos.kaderPenanggungJawab}</span>
                    <span className="flex items-center gap-1 font-black">
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

      {/* SUB-TAB 2: VERIFIKASI PENDAFTARAN KADER */}
      {activeSubTab === "verifikasi_kader" && (
        <div className="rounded-[28px] border border-zinc-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
                <span>🛡️</span>
                <span>Persetujuan & Verifikasi Pendaftaran Kader Posyandu Baru</span>
              </h3>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Setiap kader posyandu di wilayah Kec. {selectedKecamatan} wajib disetujui Puskesmas sebelum dapat menginput balita.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-300 px-3 py-1 font-mono text-xs font-bold text-amber-900">
              {pendingCount} Permohonan Menunggu
            </span>
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
                            onClick={() => handleApproveKader(kader.id, kader.nama)}
                            className="rounded-xl bg-[#18140B] px-3 py-1.5 font-sans text-xs font-black text-white hover:bg-emerald-600 transition-colors shadow-xs"
                          >
                            ✓ Setujui Akun
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectKader(kader.id, kader.nama)}
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
              .flatMap((p) => p.balitaList)
              .filter((b) => b.statusGizi === "Stunting Garis Merah" || b.statusGizi === "Gizi Buruk / Rujukan Faskes")
              .map((b) => (
                <div key={b.id} className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans text-sm font-black text-zinc-950">{b.nama} ({b.usiaBulan} Bulan)</h4>
                      <p className="font-mono text-xs text-zinc-500">NIK: {b.nik} · Ibu {b.namaIbu}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-1">Status: {b.statusGizi}</p>
                    </div>
                    <span className="rounded-lg bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5">
                      TB/U: {b.zTbu} SD
                    </span>
                  </div>
                  <div className="text-xs text-red-900 bg-white p-2.5 rounded-xl border border-red-200 font-medium">
                    <strong>Catatan Klinis:</strong> {b.catatanKlinis}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTindakLanjutBalita(b.nama)}
                      className="flex-1 rounded-xl bg-red-600 text-white py-2 font-sans text-xs font-black hover:bg-red-700 transition-colors shadow-xs"
                    >
                      Jadwalkan Konseling Dokter Puskesmas
                    </button>
                  </div>
                </div>
              ))}
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

                <button
                  type="button"
                  onClick={() => setSelectedPosyandu(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  ✕
                </button>
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
                  <div className="mt-2 font-sans text-2xl font-black text-rose-950">
                    {selectedPosyandu.stuntingCount} <span className="text-xs font-normal text-rose-700">anak</span>
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
                      const isBalitaStunting =
                        balita.statusGizi === "Stunting Garis Merah" ||
                        balita.statusGizi === "Gizi Buruk / Rujukan Faskes";
                      return (
                        <tr key={balita.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-3.5">
                            <div className="font-black text-zinc-950 text-sm">{balita.nama}</div>
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
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {balita.zTbu > 0 ? `+${balita.zTbu}` : balita.zTbu} SD
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div>
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                                  isBalitaStunting
                                    ? "bg-rose-50 border border-rose-200 text-rose-900"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                                }`}
                              >
                                {balita.statusGizi}
                              </span>
                            </div>
                            <div className="font-bold text-[#5C46D9] text-[11px] mt-1">
                              {balita.alokasiPaket}
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            {isBalitaStunting ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedPosyandu) {
                                    setSchedulingChild({ balita, posyandu: selectedPosyandu });
                                    setFormLokasi(`Poli Gizi ${puskesmasName}`);
                                  }
                                }}
                                className="rounded-xl bg-[#18140B] px-3.5 py-2 font-sans text-xs font-black text-white hover:bg-rose-600 transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                              >
                                <span>📅</span>
                                <span>Buat Jadwal Intervensi</span>
                              </button>
                            ) : (
                              <span className="font-mono text-[11px] text-emerald-700 font-bold">
                                ✓ Terpantau Baik
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
    </div>
  );
}
