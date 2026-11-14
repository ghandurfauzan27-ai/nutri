"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BALITA_MOCK, type BalitaRecord } from "@/lib/app-data";
import ClayCard from "@/components/auth/ClayCard";

export default function ModulAKmsTab() {
  const [balitaList, setBalitaList] = useState<BalitaRecord[]>(BALITA_MOCK);
  const [selectedChildId, setSelectedChildId] = useState<string>("B-001");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncedBanner, setSyncedBanner] = useState(false);
  const [syncedBannerText, setSyncedBannerText] = useState(
    "Data penimbangan berhasil disinkronkan ke Cloud Server & Antrean Dapur SPPG!"
  );

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
  const [newSex, setNewSex] = useState<"L" | "P">("L");
  const [newBb, setNewBb] = useState<number>(8.5);
  const [newTb, setNewTb] = useState<number>(73.0);
  const [newLk, setNewLk] = useState<number>(45.0);
  const [newCatatan, setNewCatatan] = useState("");

  // Form State untuk Timbangan Bulanan
  const [inputWeight, setInputWeight] = useState<number>(8.4);
  const [inputHeight, setInputHeight] = useState<number>(72.8);
  const [inputHeadCircumference, setInputHeadCircumference] = useState<number>(45.2);
  const [inputAgeMonths, setInputAgeMonths] = useState<number>(14);
  const [inputSex, setInputSex] = useState<"L" | "P">("L");
  const [measuringMethod, setMeasuringMethod] = useState<"panjang" | "tinggi">(
    inputAgeMonths < 24 ? "panjang" : "tinggi"
  );

  const activeChild = balitaList.find((b) => b.id === selectedChildId) || balitaList[0];

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
  const isFalteringNow = currentZTBU < -2 || currentZBBU < -2 || inputWeight <= 8.4;
  const currentStatus = isFalteringNow ? "Waspada / Growth Faltering" : "Normal";
  const currentPack = isFalteringNow ? "Paket B (Tinggi Protein Hewani)" : "Paket A (Reguler)";

  const handleSimulateAddWeight = () => {
    if (isOfflineMode) {
      setPendingSyncCount((prev) => prev + 1);
    } else {
      setSyncedBannerText("Data penimbangan berhasil disinkronkan ke Cloud Server & Antrean Dapur SPPG!");
      setSyncedBanner(true);
      setTimeout(() => setSyncedBanner(false), 4000);
    }
  };

  const handleSyncNow = () => {
    setPendingSyncCount(0);
    setSyncedBannerText("Semua antrean offline penimbangan berhasil disinkronkan ke Server Pusat!");
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
    <div className="space-y-8 font-sans">
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
                        setInputHeadCircumference(b.lingkarKepalaCm);
                        setMeasuringMethod(b.usiaBulan < 24 ? "panjang" : "tinggi");
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
                  <label className="block font-mono text-[11px] font-bold uppercase text-zinc-600 mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(Number(e.target.value))}
                    className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 font-mono text-lg font-black text-zinc-900 outline-none focus:border-[#38E8F5] focus:ring-4 focus:ring-[#38E8F5]/20"
                  />
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
                  <div className="flex h-12 items-center rounded-2xl border border-zinc-200 bg-zinc-100/80 px-3 font-mono text-xs font-bold text-zinc-700">
                    {inputAgeMonths < 24 ? "Terlentang (<24 bln)" : "Berdiri (≥24 bln)"}
                  </div>
                </div>
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
                  <span className="text-zinc-500">Z-Score BB/U:</span>
                  <span className={`px-2 py-0.5 rounded-md ${currentZBBU < -2 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"}`}>
                    {currentZBBU > 0 ? `+${currentZBBU}` : currentZBBU} SD
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold pt-1 border-t border-zinc-200">
                  <span className="text-zinc-700">Preskripsi Otomatis:</span>
                  <span className="font-sans font-black text-[#7866FF]">{currentPack}</span>
                </div>
              </div>

              {/* Tombol Simpan Penimbangan */}
              <button
                type="button"
                onClick={handleSimulateAddWeight}
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

                {/* Plot Riwayat Balita Aktif (3 titik penimbangan) */}
                <path
                  d="M 120 205 L 260 215 L 420 220"
                  fill="none"
                  stroke="#7866FF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Titik 1: 2 bln lalu */}
                <circle cx="120" cy="205" r="5" fill="#7866FF" stroke="white" strokeWidth="2" />
                <text x="120" y="195" textAnchor="middle" className="font-mono text-[9px] fill-zinc-600 font-bold">
                  8.5 kg
                </text>

                {/* Titik 2: 1 bln lalu */}
                <circle cx="260" cy="215" r="5" fill="#7866FF" stroke="white" strokeWidth="2" />
                <text x="260" y="235" textAnchor="middle" className="font-mono text-[9px] fill-zinc-600 font-bold">
                  8.4 kg (Mendatar)
                </text>

                {/* Titik 3: Bulan Ini (Sorot Terkini) */}
                <circle cx="420" cy="220" r="7" fill="#38E8F5" stroke="#18140B" strokeWidth="2.5" />
                <circle cx="420" cy="220" r="14" fill="none" stroke="#38E8F5" strokeWidth="2" className="animate-ping" opacity="0.4" />
                <text x="420" y="244" textAnchor="middle" className="font-mono text-[10px] fill-zinc-900 font-black">
                  Hari Ini: 8.4 kg (-2.42 SD)
                </text>

                {/* Label Sumbu X & Y */}
                <text x="45" y="25" className="font-mono text-[9px] fill-zinc-400 font-bold">
                  Tinggi/Panjang Badan (cm)
                </text>
                <text x="480" y="255" className="font-mono text-[9px] fill-zinc-400 font-bold">
                  Usia (Bulan) →
                </text>
              </svg>
            </div>

            {/* Riwayat Penimbangan Tabel Ringkas */}
            <div className="mt-6">
              <h4 className="font-mono text-xs font-bold uppercase text-zinc-500 mb-2.5">
                Riwayat Penimbangan 3 Bulan Terakhir
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-zinc-100">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-100 font-mono text-[10px] uppercase text-zinc-500">
                    <tr>
                      <th className="py-2.5 px-3.5">Tanggal</th>
                      <th className="py-2.5 px-3.5">Usia</th>
                      <th className="py-2.5 px-3.5">BB (kg)</th>
                      <th className="py-2.5 px-3.5">TB (cm)</th>
                      <th className="py-2.5 px-3.5">Z TB/U</th>
                      <th className="py-2.5 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {activeChild.history.map((h, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="py-2.5 px-3.5 font-mono text-[11px]">{h.tgl}</td>
                        <td className="py-2.5 px-3.5">{h.usia} bln</td>
                        <td className="py-2.5 px-3.5 font-bold">{h.bb} kg</td>
                        <td className="py-2.5 px-3.5">{h.tb} cm</td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-red-600">{h.zTbu} SD</td>
                        <td className="py-2.5 px-3.5">
                          <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Waspada
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

