"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  type AuthRole,
  authRoles,
  getAccountPassword,
  setAccountPassword,
  getPasswordLastUpdated,
  DEFAULT_UNIVERSAL_PASSWORD,
  DEMO_ACCOUNTS,
  MASTER_PUSKESMAS_ACCOUNTS,
  MASTER_SPPG_ACCOUNTS,
} from "@/lib/auth-data";
import {
  getPuskesmasNameByKecamatan,
  getClosestSppgForWilayah,
} from "@/lib/puskesmas-data";

interface ActiveSession {
  role: AuthRole;
  name: string;
  email: string;
  unit: string;
  wilayah: string;
  faskesCode?: string;
  puskesmasPembina?: string;
  sppgId?: string;
}

interface ProfilAkunTabProps {
  role?: AuthRole;
}

export default function ProfilAkunTab({ role }: ProfilAkunTabProps) {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [activePassword, setActivePassword] = useState<string>(DEFAULT_UNIVERSAL_PASSWORD);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Form ubah password state
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Load session dari localStorage
  useEffect(() => {
    const loadSession = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("nt_current_session");
        if (raw) {
          const parsed: ActiveSession = JSON.parse(raw);
          setSession(parsed);
          const currentPw = getAccountPassword(parsed.email);
          setActivePassword(currentPw);
          setLastUpdated(getPasswordLastUpdated(parsed.email));
        }
      } catch (e) {}
    };

    loadSession();

    const handlePwChange = () => {
      loadSession();
    };

    window.addEventListener("nt_password_changed", handlePwChange);
    window.addEventListener("nt_session_updated", handlePwChange);
    return () => {
      window.removeEventListener("nt_password_changed", handlePwChange);
      window.removeEventListener("nt_session_updated", handlePwChange);
    };
  }, []);

  const effectiveRole: AuthRole =
    role ||
    (session?.role === "kader" ? "posyandu" : session?.role) ||
    "posyandu";

  const defaultAccount =
    DEMO_ACCOUNTS.find((d) => d.role === effectiveRole) || DEMO_ACCOUNTS[0];

  // Helper cek apakah nilai masih template generic bawaan
  const isGeneric = (val?: string) =>
    !val ||
    val.includes("Petugas Terdaftar") ||
    val.includes("Unit Faskes NutriTrack") ||
    val.includes("email@jatim.go.id") ||
    val.trim() === "Jawa Timur";

  // Data profil faskes terperinci & langsung
  const profile = {
    role: effectiveRole,
    name:
      !isGeneric(session?.name) && session?.role === effectiveRole
        ? session!.name
        : effectiveRole === "posyandu"
        ? "Siti Rahmawati, S.Pd"
        : defaultAccount.name,
    title:
      effectiveRole === "posyandu"
        ? "Penanggung Jawab Operasional Posyandu"
        : effectiveRole === "puskesmas"
        ? "Kepala Puskesmas & Pembina Klinis"
        : effectiveRole === "dapur"
        ? "Koordinator Dapur & Logistik SPPG"
        : "Kepala Dinas Kesehatan Provinsi Jawa Timur",
    unit:
      !isGeneric(session?.unit) && session?.role === effectiveRole
        ? session!.unit
        : effectiveRole === "posyandu"
        ? "Posyandu Mawar 01 (Desa Bilaporah)"
        : defaultAccount.unit,
    email:
      !isGeneric(session?.email) && session?.role === effectiveRole
        ? session!.email
        : defaultAccount.email,
    wilayah:
      !isGeneric(session?.wilayah) && session?.role === effectiveRole
        ? session!.wilayah
        : defaultAccount.wilayah,
    faskesCode:
      session?.faskesCode || defaultAccount.faskesCode || "P3526010101",
    puskesmasPembina:
      session?.puskesmasPembina || defaultAccount.puskesmasPembina || "Puskesmas Socah",
    sppgId:
      session?.sppgId || defaultAccount.sppgId || "SPPG-BKL-01",
  };

  const roleInfo =
    authRoles.find((r) => r.key === effectiveRole) || authRoles[0];

  // Hitung perkiraan kekuatan password baru
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "Kosong", color: "bg-zinc-200" };
    if (pw.length < 6) return { score: 1, label: "Terlalu Pendek (< 6 karakter)", color: "bg-rose-500" };
    const hasNum = /\d/.test(pw);
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

    if (pw.length >= 8 && hasNum && hasLetter && hasSpecial) {
      return { score: 3, label: "Sangat Kuat (Kombinasi Sempurna)", color: "bg-emerald-500" };
    }
    if (hasNum && hasLetter) {
      return { score: 2, label: "Sedang (Kombinasi Huruf & Angka)", color: "bg-amber-500" };
    }
    return { score: 1, label: "Lemah (Hanya 1 tipe karakter)", color: "bg-rose-500" };
  };

  const strength = getPasswordStrength(newPw);

  const handleCopyEmail = () => {
    if (profile.email) {
      navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSubmitPassword = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const targetEmail = profile.email;

    if (!oldPw) {
      setFormError("Harap masukkan Kata Sandi Saat Ini.");
      return;
    }

    // Verifikasi kata sandi lama
    const realPw = getAccountPassword(targetEmail);
    if (oldPw !== realPw) {
      setFormError("Kata Sandi Saat Ini salah. Periksa kembali kata sandi akun Anda (kata sandi awal: Password123!).");
      return;
    }

    if (!newPw) {
      setFormError("Harap masukkan Kata Sandi Baru.");
      return;
    }

    if (newPw.length < 6) {
      setFormError("Kata Sandi Baru minimal harus 6 karakter.");
      return;
    }

    if (newPw === oldPw) {
      setFormError("Kata Sandi Baru tidak boleh sama dengan Kata Sandi Saat Ini.");
      return;
    }

    if (newPw !== confirmPw) {
      setFormError("Konfirmasi Kata Sandi Baru tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const ok = setAccountPassword(targetEmail, newPw);
      setIsSubmitting(false);

      if (ok) {
        setActivePassword(newPw);
        setLastUpdated(getPasswordLastUpdated(targetEmail));
        setFormSuccess(
          "Kata sandi akun Anda berhasil diperbarui! Gunakan kata sandi baru ini saat Anda login kembali."
        );
        // Sinkronisasi sesi aktif
        const updatedSession: ActiveSession = {
          role: profile.role,
          name: profile.name,
          email: profile.email,
          unit: profile.unit,
          wilayah: profile.wilayah,
          faskesCode: profile.faskesCode,
          puskesmasPembina: profile.puskesmasPembina,
          sppgId: profile.sppgId,
        };
        try {
          localStorage.setItem("nt_current_session", JSON.stringify(updatedSession));
          window.dispatchEvent(new Event("nt_session_updated"));
        } catch (e) {}

        setOldPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setFormError("Gagal menyimpan kata sandi. Silakan coba kembali.");
      }
    }, 600);
  };

  // Cari faskes dan dapur terkait berdasarkan wilayah
  const wilayahStr = profile.wilayah || "";
  const autoPuskesmas = profile.puskesmasPembina || getPuskesmasNameByKecamatan(wilayahStr);
  const sppgObj = getClosestSppgForWilayah("Kab. Bangkalan", wilayahStr);
  const autoSppgName = sppgObj?.namaDapur || "SPPG Dapur Sehat Socah Mandiri";

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-[11px] font-bold text-sky-800 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              Sistem Manajemen Akun & Keamanan Terpadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Profil Akun & Keamanan Sandi
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Lihat rincian identitas faskes resmi, wilayah operasional binaan, serta kelola kata sandi akun untuk menjamin integritas data intervensi stunting Jawa Timur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-right">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 block">
                Status Akun Faskes
              </span>
              <span className="text-sm font-black text-emerald-950 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Terverifikasi Aktif
              </span>
              <span className="font-mono text-[10px] text-zinc-500 block mt-1">
                Terkunci Sesi Resmi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Kolom Kiri Profil Akun, Kolom Kanan Ubah Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (7 Kolom): DETAIL IDENTITAS AKUN & WILAYAH */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[26px] border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#18140B] text-[#38E8F5] font-mono text-base font-black shadow-md">
                  {profile.role === "puskesmas"
                    ? "PUS"
                    : profile.role === "dapur"
                    ? "MBG"
                    : profile.role === "dinkes"
                    ? "DNK"
                    : "POS"}
                </div>
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-950">
                    Informasi Identitas Akun
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    ID Faskes & Rincian Penugasan Teritorial
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-[11px] font-bold text-zinc-700 border border-zinc-200">
                {roleInfo.name}
              </span>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Akun */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Nama Petugas / Pimpinan
                </span>
                <span className="text-sm font-black text-zinc-950 block mt-1">
                  {profile.name}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono block mt-0.5">
                  {profile.title}
                </span>
              </div>

              {/* Peran Sistem */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Tingkat Otoritas Sistem
                </span>
                <span className="text-sm font-black text-sky-950 block mt-1">
                  {roleInfo.name}
                </span>
                <span className="text-[11px] text-sky-700 font-mono block mt-0.5">
                  {profile.role === "dinkes"
                    ? "Otoritas Pengawasan 38 Kab/Kota"
                    : profile.role === "puskesmas"
                    ? "Pembina Klinis Kecamatan"
                    : profile.role === "dapur"
                    ? "Unit Rantai Pasok MBG"
                    : "Pencatat & Pengukur Lapangan"}
                </span>
              </div>

              {/* Unit / Faskes */}
              <div className="sm:col-span-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Nama Unit Faskes / Pos Pelayanan
                </span>
                <span className="text-sm font-black text-zinc-950 block mt-1">
                  {profile.unit}
                </span>
              </div>

              {/* Email / Username Login */}
              <div className="sm:col-span-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                    Email / ID Login Resmi
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="font-mono text-[11px] font-bold text-[#5C46D9] hover:underline flex items-center gap-1"
                  >
                    {copiedEmail ? "✓ Tersalin ke Clipboard" : "Salin Email"}
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-zinc-900 break-all">
                    {profile.email}
                  </span>
                  <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 shrink-0">
                    Terenkripsi
                  </span>
                </div>
              </div>

              {/* Wilayah Kerja */}
              <div className="sm:col-span-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Wilayah Kerja & Koordinasi Teritorial
                </span>
                <span className="text-sm font-bold text-zinc-900 block mt-1">
                  📍 {profile.wilayah}
                </span>
              </div>

              {/* Faskes Terdekat / Pembina / Dapur MBG */}
              {profile.role === "posyandu" && (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 block">
                      Puskesmas Pembina Terdekat
                    </span>
                    <span className="text-xs font-black text-emerald-950 block mt-1">
                      🏥 {profile.puskesmasPembina || autoPuskesmas}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                      Rujukan medis & verifikasi stunting
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-800 block">
                      Dapur MBG (SPPG) Penyuplai
                    </span>
                    <span className="text-xs font-black text-amber-950 block mt-1">
                      🍱 {autoSppgName}
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 block mt-0.5">
                      Distribusi harian Paket A & Paket B
                    </span>
                  </div>
                </>
              )}

              {profile.role === "puskesmas" && (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 block">
                      Kode Faskes Kemenkes
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-950 block mt-1">
                      {profile.faskesCode}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                      Registrasi resmi Kementerian Kesehatan
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-800 block">
                      Dapur MBG Mitra Wilayah
                    </span>
                    <span className="text-xs font-black text-amber-950 block mt-1">
                      🍱 {autoSppgName}
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 block mt-0.5">
                      Koordinasi alokasi resep nutrisi anak
                    </span>
                  </div>
                </>
              )}

              {profile.role === "dapur" && (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 block">
                      ID Unit SPPG
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-950 block mt-1">
                      {profile.sppgId}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                      Sentra Dapur Mandiri Jatim
                    </span>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-800 block">
                      Kapasitas Produksi Ransum
                    </span>
                    <span className="text-xs font-black text-amber-950 block mt-1">
                      🔥 1.500 Porsi / Hari
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 block mt-0.5">
                      Paket A (Reguler) & Paket B (Faltering)
                    </span>
                  </div>
                </>
              )}

              {profile.role === "dinkes" && (
                <div className="sm:col-span-2 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-indigo-800 block">
                    Cakupan Pengawasan & Audit Data
                  </span>
                  <span className="text-xs font-black text-indigo-950 block mt-1">
                    🌐 38 Kabupaten / Kota Provinsi Jawa Timur (960+ Puskesmas, 20+ SPPG)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 block mt-0.5">
                    Integrasi analitik stunting lintas faskes & intervensi pangan bergizi
                  </span>
                </div>
              )}
            </div>

            {/* Info Keamanan Akun Terkunci */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
              <span className="text-lg">🔒</span>
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold">Keamanan Identitas & Batas Faskes Terkunci</p>
                <p className="text-amber-900/80 leading-relaxed">
                  Sesuai kebijakan integritas data, akun ini telah dikunci pada identitas faskes di atas. Anda tidak dapat beralih faskes di dalam dasbor tanpa melakukan proses keluar (logout) terlebih dahulu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (5 Kolom): UBAH KATA SANDI AKUN */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[26px] border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 font-mono text-base font-black shadow-xs">
                  🔑
                </div>
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-950">
                    Ubah Kata Sandi
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Perbarui Kata Sandi Akun Faskes
                  </p>
                </div>
              </div>
            </div>

            {/* Riwayat Pembaruan */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Terakhir Diperbarui:</span>
              <span className="font-bold text-zinc-800">
                {lastUpdated || "Bawaan Sistem (Password123!)"}
              </span>
            </div>

            {/* Form Ubah Password */}
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              {/* Notifikasi Error */}
              {formError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-medium flex items-start gap-2">
                  <span className="shrink-0 text-base">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Notifikasi Sukses */}
              {formSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 font-medium flex items-start gap-2">
                  <span className="shrink-0 text-base">✅</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* 1. Kata Sandi Saat Ini */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                  Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPw ? "text" : "password"}
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    placeholder="Masukkan kata sandi lama akun"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw(!showOldPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-mono"
                  >
                    {showOldPw ? "Tutup" : "Lihat"}
                  </button>
                </div>
                <p className="mt-1 font-mono text-[10px] text-zinc-400">
                  *Kata sandi awal seluruh faskes: <code>Password123!</code>
                </p>
              </div>

              {/* 2. Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-mono"
                  >
                    {showNewPw ? "Tutup" : "Lihat"}
                  </button>
                </div>

                {/* Indikator Kekuatan Password */}
                {newPw.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-zinc-500">Kekuatan Sandi:</span>
                      <span className="font-bold text-zinc-700">{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-mono"
                  >
                    {showConfirmPw ? "Tutup" : "Lihat"}
                  </button>
                </div>
                {confirmPw && newPw && confirmPw !== newPw && (
                  <p className="mt-1 font-mono text-[10px] text-rose-600">
                    ✗ Konfirmasi kata sandi belum sama
                  </p>
                )}
                {confirmPw && newPw && confirmPw === newPw && (
                  <p className="mt-1 font-mono text-[10px] text-emerald-600 font-bold">
                    ✓ Kata sandi cocok
                  </p>
                )}
              </div>

              {/* Tombol Simpan */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#18140B] text-white hover:bg-zinc-800 font-sans text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Menyimpan Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Perubahan Kata Sandi</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="border-t border-zinc-100 pt-4">
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                💡 <strong>Catatan:</strong> Kata sandi baru akan otomatis tersimpan pada perangkat faskes ini dan digunakan untuk setiap proses otentikasi login selanjutnya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}