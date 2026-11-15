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
  title?: string;
  email: string;
  unit: string;
  wilayah: string;
  phone?: string;
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

  // Tab mode di kolom kanan: "profil" (Edit Semua Data) vs "sandi" (Ubah Kata Sandi)
  const [editMode, setEditMode] = useState<"profil" | "sandi">("profil");

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
      session?.name && !isGeneric(session.name) && (session.role === effectiveRole || (effectiveRole === "posyandu" && session.role === "kader"))
        ? session.name
        : effectiveRole === "posyandu"
        ? "Siti Rahmawati, S.Pd"
        : defaultAccount.name,
    title:
      session?.title ||
      (effectiveRole === "posyandu"
        ? "Penanggung Jawab Operasional Posyandu"
        : effectiveRole === "puskesmas"
        ? "Kepala Puskesmas & Pembina Klinis"
        : effectiveRole === "dapur"
        ? "Koordinator Dapur & Logistik SPPG"
        : "Kepala Dinas Kesehatan Provinsi Jawa Timur"),
    unit:
      session?.unit && !isGeneric(session.unit) && (session.role === effectiveRole || (effectiveRole === "posyandu" && session.role === "kader"))
        ? session.unit
        : effectiveRole === "posyandu"
        ? "Posyandu Mawar 01 (Desa Bilaporah)"
        : defaultAccount.unit,
    email:
      session?.email && !isGeneric(session.email) && (session.role === effectiveRole || (effectiveRole === "posyandu" && session.role === "kader"))
        ? session.email
        : defaultAccount.email,
    wilayah:
      session?.wilayah && !isGeneric(session.wilayah) && (session.role === effectiveRole || (effectiveRole === "posyandu" && session.role === "kader"))
        ? session.wilayah
        : defaultAccount.wilayah,
    phone: session?.phone || defaultAccount.noHp || "081234567890",
    faskesCode:
      session?.faskesCode || defaultAccount.faskesCode || "P3526010101",
    puskesmasPembina:
      session?.puskesmasPembina || defaultAccount.puskesmasPembina || "Puskesmas Socah",
    sppgId:
      session?.sppgId || defaultAccount.sppgId || "SPPG-BKL-01",
  };

  const roleInfo =
    authRoles.find((r) => r.key === effectiveRole) || authRoles[0];

  // State untuk Form Edit Profil Lengkap
  const [editName, setEditName] = useState(profile.name);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editUnit, setEditUnit] = useState(profile.unit);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editWilayah, setEditWilayah] = useState(profile.wilayah);
  const [editFaskesCode, setEditFaskesCode] = useState(profile.faskesCode);
  const [editPuskesmasPembina, setEditPuskesmasPembina] = useState(profile.puskesmasPembina);
  const [editSppgMitra, setEditSppgMitra] = useState(profile.sppgId);

  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [profileFormSuccess, setProfileFormSuccess] = useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Re-sync nilai form edit saat session atau profile berganti
  useEffect(() => {
    setEditName(profile.name);
    setEditTitle(profile.title);
    setEditUnit(profile.unit);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditWilayah(profile.wilayah);
    setEditFaskesCode(profile.faskesCode);
    setEditPuskesmasPembina(profile.puskesmasPembina);
    setEditSppgMitra(profile.sppgId);
  }, [profile.name, profile.unit, profile.email, profile.wilayah, profile.phone]);

  // Handler Submit Pembaruan Semua Data Profil & Faskes
  const handleSubmitProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfileFormError(null);
    setProfileFormSuccess(null);

    if (!editName.trim()) {
      setProfileFormError("Nama Petugas / Pimpinan tidak boleh kosong.");
      return;
    }
    if (!editUnit.trim()) {
      setProfileFormError("Nama Unit Faskes / Pos Pelayanan tidak boleh kosong.");
      return;
    }
    if (!editEmail.trim()) {
      setProfileFormError("Email resmi akun tidak boleh kosong.");
      return;
    }

    setIsSubmittingProfile(true);

    setTimeout(() => {
      const oldEmail = profile.email;
      const newEmail = editEmail.trim();

      // Jika email berganti, salin password lama ke kunci email baru
      if (newEmail && newEmail !== oldEmail) {
        const curPw = getAccountPassword(oldEmail);
        setAccountPassword(newEmail, curPw);
      }

      const updatedSession: ActiveSession = {
        role: profile.role,
        name: editName.trim(),
        title: editTitle.trim(),
        unit: editUnit.trim(),
        email: newEmail,
        wilayah: editWilayah.trim(),
        phone: editPhone.trim(),
        faskesCode: editFaskesCode.trim(),
        puskesmasPembina: editPuskesmasPembina.trim(),
        sppgId: editSppgMitra.trim(),
      };

      try {
        localStorage.setItem("nt_current_session", JSON.stringify(updatedSession));
        window.dispatchEvent(new Event("nt_session_updated"));
        setSession(updatedSession);
      } catch (err) {}

      setIsSubmittingProfile(false);
      setProfileFormSuccess("✓ Data profil akun & identitas faskes berhasil diperbarui di seluruh sistem!");
      setTimeout(() => setProfileFormSuccess(null), 5000);
    }, 450);
  };

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
          title: profile.title,
          email: profile.email,
          unit: profile.unit,
          wilayah: profile.wilayah,
          phone: profile.phone,
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
    }, 500);
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
              Sistem Manajemen Akun & Identitas Faskes Terpadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Profil Akun & Pengaturan Faskes
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Kelola dan perbarui identitas resmi petugas, unit pos/faskes, email operasional, nomor kontak WhatsApp, wilayah penugasan, serta kata sandi akun Anda.
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
                Sinkronisasi Cloud Real-Time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Kolom Kiri Informasi Identitas Akun, Kolom Kanan Form Edit Lengkap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (7 Kolom): TAMPILAN RINCIAN IDENTITAS AKUN & WILAYAH */}
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode("profil")}
                  className="rounded-full bg-sky-50 border border-sky-300 px-3 py-1 font-mono text-[11px] font-bold text-sky-800 hover:bg-sky-100 transition-colors shadow-2xs flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>Edit Profil</span>
                </button>
                <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-[11px] font-bold text-zinc-700 border border-zinc-200">
                  {roleInfo.name}
                </span>
              </div>
            </div>

            {/* Field Grid Tampilan Akun */}
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
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Wilayah Kerja & Koordinasi Teritorial
                </span>
                <span className="text-sm font-bold text-zinc-900 block mt-1">
                  📍 {profile.wilayah}
                </span>
              </div>

              {/* Nomor Kontak WhatsApp */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4">
                <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 block">
                  Nomor Kontak / WhatsApp
                </span>
                <span className="text-sm font-bold font-mono text-zinc-900 block mt-1">
                  📞 {profile.phone}
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

            {/* Info Pengelolaan Identitas Akun Faskes */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 flex items-start gap-3">
              <span className="text-lg">⚙️</span>
              <div className="text-xs text-sky-950 space-y-1">
                <p className="font-bold">Pengelolaan Data Profil & Keamanan Terpadu</p>
                <p className="text-sky-900/80 leading-relaxed">
                  Anda dapat mengubah data nama pimpinan, unit faskes, email resmi, nomor kontak, serta kata sandi kapan saja melalui formulir di sebelah kanan. Data akan otomatis disinkronkan ke seluruh modul dasbor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (5 Kolom): FORM EDIT IDENTITAS SEMUA FIELD & UBAH KATA SANDI */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[26px] border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header & Mode Switcher */}
            <div className="space-y-4 border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 font-mono text-base font-black shadow-xs">
                  {editMode === "profil" ? "✏️" : "🔑"}
                </div>
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-950">
                    {editMode === "profil" ? "Edit Profil & Faskes" : "Ubah Kata Sandi"}
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    {editMode === "profil"
                      ? "Perbarui Rincian Akun & Identitas Faskes"
                      : "Perbarui Kata Sandi Akun Faskes"}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1.5 font-sans text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditMode("profil")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    editMode === "profil"
                      ? "bg-[#18140B] text-white shadow-sm font-black"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <span>👤 Edit Semua Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode("sandi")}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    editMode === "sandi"
                      ? "bg-[#18140B] text-white shadow-sm font-black"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  <span>🔑 Ubah Sandi</span>
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* TAB 1: FORM EDIT IDENTITAS SEMUA DATA */}
            {/* =================================================================== */}
            {editMode === "profil" && (
              <form onSubmit={handleSubmitProfile} className="space-y-4">
                {profileFormError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 font-medium flex items-start gap-2">
                    <span className="shrink-0 text-base">⚠️</span>
                    <span>{profileFormError}</span>
                  </div>
                )}

                {profileFormSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 font-medium flex items-start gap-2">
                    <span className="shrink-0 text-base">✅</span>
                    <span>{profileFormSuccess}</span>
                  </div>
                )}

                {/* 1. Nama Petugas / Pimpinan */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Nama Petugas / Pimpinan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Contoh: dr. H. Achmad Syafi'i"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* 2. Jabatan Operasional */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Jabatan Operasional
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Contoh: Kepala Puskesmas & Pembina Klinis"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* 3. Nama Unit Faskes / Pos Pelayanan */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Nama Unit Faskes / Pos Pelayanan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="Contoh: Puskesmas Socah"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* 4. Email / ID Login Resmi */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Email / ID Login Resmi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Contoh: puskesmas.socah@jatim.go.id"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20 font-mono"
                  />
                </div>

                {/* 5. Wilayah Kerja & Koordinasi */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Wilayah Kerja & Koordinasi Teritorial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editWilayah}
                    onChange={(e) => setEditWilayah(e.target.value)}
                    placeholder="Contoh: Kecamatan Socah, Kab. Bangkalan"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* 6. Nomor Kontak / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                    Nomor Kontak / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                  />
                </div>

                {/* 7. Field Khusus Sesuai Role Faskes */}
                {profile.role === "puskesmas" && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                      Kode Faskes Kemenkes
                    </label>
                    <input
                      type="text"
                      value={editFaskesCode}
                      onChange={(e) => setEditFaskesCode(e.target.value)}
                      placeholder="Contoh: P3526010101"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                )}

                {profile.role === "posyandu" && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                      Puskesmas Pembina Terdekat
                    </label>
                    <input
                      type="text"
                      value={editPuskesmasPembina}
                      onChange={(e) => setEditPuskesmasPembina(e.target.value)}
                      placeholder="Contoh: Puskesmas Socah"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-sans text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                )}

                {profile.role === "dapur" && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 font-mono uppercase tracking-wider">
                      ID Unit SPPG Dapur MBG
                    </label>
                    <input
                      type="text"
                      value={editSppgMitra}
                      onChange={(e) => setEditSppgMitra(e.target.value)}
                      placeholder="Contoh: SPPG-BKL-01"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-[#38E8F5] focus:outline-none focus:ring-2 focus:ring-[#38E8F5]/20"
                    />
                  </div>
                )}

                {/* Tombol Simpan Perubahan Profil */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingProfile}
                    className="w-full py-3 px-4 rounded-xl bg-[#18140B] text-white hover:bg-zinc-800 font-sans text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingProfile ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>Menyimpan Perubahan Data...</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Simpan Perubahan Profil</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* TAB 2: FORM UBAH KATA SANDI */}
            {/* =================================================================== */}
            {editMode === "sandi" && (
              <div className="space-y-4">
                {/* Riwayat Pembaruan */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Terakhir Diperbarui:</span>
                  <span className="font-bold text-zinc-800">
                    {lastUpdated || "Bawaan Sistem (Password123!)"}
                  </span>
                </div>

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

                  {/* Tombol Simpan Sandi */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-[#18140B] text-white hover:bg-zinc-800 font-sans text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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
              </div>
            )}

            <div className="border-t border-zinc-100 pt-4">
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                💡 <strong>Catatan:</strong> Seluruh pembaruan data profil dan kata sandi baru akan otomatis tersimpan pada perangkat faskes ini dan disinkronkan langsung ke seluruh modul dasbor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}