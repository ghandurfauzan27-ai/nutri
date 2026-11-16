"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authRoles, jatimRegions, DEMO_ACCOUNTS, type AuthRole } from "@/lib/auth-data";
import OverviewTab from "./OverviewTab";
import ModulAKmsTab from "./ModulAKmsTab";
import ModulBDapurTab from "./ModulBDapurTab";
import ModulCKonsumsiTab from "./ModulCKonsumsiTab";
import ModulDAnalitikTab from "./ModulDAnalitikTab";
import PuskesmasTab from "./PuskesmasTab";
import CaraKerjaRoleTab from "./CaraKerjaRoleTab";
import PanduanWebTab from "./PanduanWebTab";
import DinkesKelolaFaskesTab from "./DinkesKelolaFaskesTab";
import ProfilAkunTab from "./ProfilAkunTab";

export type DashboardTab =
  | "ringkasan"
  | "kms"
  | "dapur"
  | "konsumsi"
  | "analitik"
  | "puskesmas"
  | "posyandu_binaan"
  | "kelola_faskes"
  | "carakerja"
  | "panduan"
  | "profil";

interface ActiveSession {
  role: AuthRole;
  name: string;
  email: string;
  unit: string;
  wilayah: string;
  faskesCode?: string;
  puskesmasPembina?: string;
}

export default function AppShell() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") as AuthRole | null;

  // Normalisasi role: 'kader' diarahkan ke 'posyandu'
  const normalizedRole: AuthRole =
    initialRoleParam === "kader" || initialRoleParam === "posyandu"
      ? "posyandu"
      : initialRoleParam && authRoles.some((r) => r.key === initialRoleParam)
      ? initialRoleParam
      : "posyandu";

  const [activeRole] = useState<AuthRole>(normalizedRole);
  const [session, setSession] = useState<ActiveSession | null>(null);

  // Inisialisasi tab bawaan sesuai peran
  const getDefaultTabForRole = (role: AuthRole): DashboardTab => {
    switch (role) {
      case "posyandu":
      case "kader":
        return "kms";
      case "dapur":
        return "dapur";
      case "puskesmas":
        return "puskesmas";
      case "dinkes":
        return "analitik"; // Dinkes fokus ke Peta Sebaran Stunting 38 Kab/Kota
      default:
        return "kms";
    }
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(getDefaultTabForRole(activeRole));
  const [selectedRegion, setSelectedRegion] = useState<string>("Kab. Bangkalan");
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingPosCount, setPendingPosCount] = useState<number>(0);

  // Pantau jumlah registrasi Posyandu Baru yang butuh konfirmasi Puskesmas
  useEffect(() => {
    const checkPending = () => {
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("nt_registered_posyandu");
          if (raw) {
            const list = JSON.parse(raw);
            const count = list.filter(
              (p: any) => p.statusAkun === "Menunggu Verifikasi" || p.statusAkun === "Menunggu Konfirmasi"
            ).length;
            setPendingPosCount(count);
          }
        }
      } catch (e) {}
    };
    checkPending();
    window.addEventListener("nt_posyandu_registered", checkPending);
    window.addEventListener("nt_posyandu_verified", checkPending);
    return () => {
      window.removeEventListener("nt_posyandu_registered", checkPending);
      window.removeEventListener("nt_posyandu_verified", checkPending);
    };
  }, []);

  // Baca sesi otentikasi login dari localStorage
  useEffect(() => {
    const loadSession = () => {
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("nt_current_session");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.role === activeRole || (activeRole === "posyandu" && parsed.role === "kader"))) {
              setSession(parsed);
              if (parsed.wilayah && parsed.wilayah.includes("Kab.")) {
                const matchedKab = jatimRegions.find((k) => parsed.wilayah.includes(k));
                if (matchedKab) setSelectedRegion(matchedKab);
              }
              return;
            }
          }
          // Fallback otomatis ke akun resmi peran yang sedang aktif
          const demo = DEMO_ACCOUNTS.find((d) => d.role === activeRole) || DEMO_ACCOUNTS[0];
          const defaultSession = {
            role: activeRole,
            name: demo.name,
            email: demo.email,
            unit: demo.unit,
            wilayah: demo.wilayah,
            puskesmasPembina: demo.puskesmasPembina || "Puskesmas Socah",
            faskesCode: demo.faskesCode || "P3526010101",
            sppgId: demo.sppgId || "SPPG-BKL-01",
          };
          setSession(defaultSession);
          localStorage.setItem("nt_current_session", JSON.stringify(defaultSession));
          if (defaultSession.wilayah.includes("Kab.")) {
            const matchedKab = jatimRegions.find((k) => defaultSession.wilayah.includes(k));
            if (matchedKab) setSelectedRegion(matchedKab);
          }
        }
      } catch (e) {}
    };

    loadSession();
    window.addEventListener("nt_session_updated", loadSession);
    return () => window.removeEventListener("nt_session_updated", loadSession);
  }, [activeRole]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nt_current_session");
      window.location.href = "/login";
    }
  };

  const currentRoleInfo =
    authRoles.find((r) => r.key === activeRole || (activeRole === "kader" && r.key === "posyandu")) ||
    authRoles[0];

  // Navigasi menu yang dikhususkan sesuai peran akun
  const getNavItemsForRole = (role: AuthRole) => {
    const allItems = [
      // 1. DINKES PROVINSI JATIM (FOKUS PETA & SEBARAN 38 KAB/KOTA)
      {
        key: "analitik" as DashboardTab,
        label: "Peta Sebaran Stunting Jatim",
        desc: "Maps 38 Kab/Kota & Prevalensi",
        roles: ["dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" x2="9" y1="3" y2="18" />
            <line x1="15" x2="15" y1="6" y2="21" />
          </svg>
        ),
        badge: "Peta Wilayah",
      },
      {
        key: "ringkasan" as DashboardTab,
        label: "Ringkasan Eksekutif KPI",
        desc: "Audit Data & Alokasi MBG",
        roles: ["dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        ),
        badge: "Eksekutif",
      },
      {
        key: "kelola_faskes" as DashboardTab,
        label: "Registrasi Puskesmas & Dapur MBG",
        desc: "Otorisasi Faskes & Sentra SPPG",
        roles: ["dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
          </svg>
        ),
        badge: "Otoritas Dinkes",
      },

      // 2. POSYANDU DESA (TERPISAH TEGAS: MEJA PENIMBANGAN vs VERIFIKASI MBG)
      {
        key: "kms" as DashboardTab,
        label: "Penimbangan & KMS Balita",
        desc: "Pendaftaran Anak, Timbang BB/TB & Grafik WHO",
        roles: ["posyandu", "kader"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
            <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
            <circle cx="8" cy="12" r="2" />
          </svg>
        ),
        badge: "Meja Timbang",
      },
      {
        key: "konsumsi" as DashboardTab,
        label: "Verifikasi & Penerimaan MBG",
        desc: "Terima Paket SPPG & Checklist Ransum Anak",
        roles: ["posyandu", "kader"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        ),
        badge: "Verifikasi MBG",
      },

      // 3. PUSKESMAS PEMBINA (WILAYAH BINAAN, JADWAL PERTEMUAN STUNTING & VERIFIKASI)
      {
        key: "posyandu_binaan" as DashboardTab,
        label: "Posyandu Binaan & Verifikasi",
        desc: "Pantau Jejaring & Konfirmasi Akun Baru",
        roles: ["puskesmas"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        badge: pendingPosCount > 0 ? `${pendingPosCount} Konfirmasi` : "Jejaring",
      },
      {
        key: "puskesmas" as DashboardTab,
        label: "Wilayah Binaan & Jadwal",
        desc: "Pantau Desa, Jadwalkan Pertemuan & Notif",
        roles: ["puskesmas"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
        badge: "Puskesmas",
      },

      // 4. DAPUR MBG (SPPG)
      {
        key: "dapur" as DashboardTab,
        label: "Dapur MBG & Wilayah Layanan",
        desc: "Resep Paket A/B & Posyandu Sasaran",
        roles: ["dapur"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        ),
        badge: "Operasional",
      },

      // PANDUAN CARA KERJA & PENGOPERASIAN WEB LENGKAP DENGAN GAMBAR
      {
        key: "panduan" as DashboardTab,
        label: "Buku Panduan Web",
        desc: "Tutorial Visual Pengoperasian & Alur Kerja",
        roles: ["posyandu", "kader", "dapur", "puskesmas", "dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        ),
        badge: "Panduan",
      },

      // LIHAT DETAIL AKUN & UBAH KATA SANDI (UNTUK SEMUA PERAN)
      {
        key: "profil" as DashboardTab,
        label: "Profil & Keamanan Akun",
        desc: "Detail Identitas & Ubah Kata Sandi",
        roles: ["posyandu", "kader", "dapur", "puskesmas", "dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
        badge: "Akun & Sandi",
      },
    ];

    return allItems.filter((item) =>
      item.roles.includes(role) || (role === "kader" && item.roles.includes("posyandu"))
    );
  };

  const navItems = getNavItemsForRole(activeRole);

  const isPosyanduRole = activeRole === "posyandu" || activeRole === "kader";

  const displayName = isPosyanduRole
    ? (session?.name && !session.name.includes("Siti Rahmawati") && session.name.toLowerCase().includes("posyandu")
        ? session.name
        : "Posyandu Mawar 01 (Desa Bilaporah)")
    : (session?.name || (
        activeRole === "puskesmas"
          ? "dr. H. Achmad Syafi'i (Kepala Faskes)"
          : activeRole === "dapur"
          ? "SPPG Dapur Sehat Socah Mandiri"
          : "Dinas Kesehatan Provinsi Jawa Timur"
      ));

  const displayUnit = isPosyanduRole
    ? (session?.unit && !session.unit.includes("Siti Rahmawati") ? session.unit : "Posyandu Mawar 01 — Desa Bilaporah")
    : (session?.unit || (
        activeRole === "puskesmas"
          ? "Puskesmas Socah"
          : activeRole === "dapur"
          ? "SPPG Dapur Sehat Socah Mandiri"
          : "Dinas Kesehatan Provinsi Jawa Timur"
      ));

  const displayWilayah = session?.wilayah || (
    activeRole === "puskesmas"
      ? "Kecamatan Socah, Kab. Bangkalan"
      : isPosyanduRole
      ? "Kec. Socah, Kab. Bangkalan (Naungan: Puskesmas Socah)"
      : activeRole === "dapur"
      ? "Wilayah Layanan: 9 Posyandu Kec. Socah, Bangkalan"
      : "Wilayah Pengawasan: 38 Kabupaten / Kota se-Jatim"
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between space-y-6">
      {/* Top Part: Logo & User Identity */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-md transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="NutriTrack Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-sans text-lg font-black uppercase tracking-tight text-zinc-950">
                NutriTrack
              </span>
              <p className="font-mono text-[10px] text-zinc-400">Portal Presisi Intervensi MBG</p>
            </div>
          </Link>
        </div>

        {/* Profil Akun Terotentikasi (Sesuai Permintaan: Tiap Akun Punya Identitas Jelas) */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Akun Terverifikasi
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#18140B] text-[#38E8F5] font-mono text-xs font-black shadow-sm">
              {activeRole === "puskesmas" ? "PUS" : activeRole === "dapur" ? "MBG" : activeRole === "dinkes" ? "DNK" : "POS"}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-sans text-xs font-black text-zinc-950 truncate" title={displayName}>
                {displayName}
              </h5>
              <p className="font-mono text-[11px] font-bold text-emerald-800 truncate" title={displayUnit}>
                {displayUnit}
              </p>
              <p className="font-sans text-[10px] text-zinc-500 truncate" title={displayWilayah}>
                📍 {displayWilayah}
              </p>
            </div>
          </div>

          {/* Tombol Cepat Buka Profil & Ubah Sandi */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("profil");
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 py-1.5 px-3 rounded-xl border border-zinc-200/90 bg-white hover:bg-zinc-100 text-zinc-700 font-sans text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>🔑</span>
            <span>Lihat Akun & Ubah Sandi</span>
          </button>
        </div>

        {/* Navigasi Sub-Modul */}
        <div>
          <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Menu Operasional {currentRoleInfo.name}
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left font-sans text-xs font-bold transition-all ${
                    active
                      ? "bg-[#18140B] text-white shadow-md"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  <span className={`shrink-0 transition-transform ${active ? "text-[#38E8F5] scale-110" : "text-zinc-400 group-hover:text-zinc-700"}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      <span className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold ${active ? "bg-white/20 text-[#38E8F5]" : "bg-zinc-100 text-zinc-400"}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className={`font-mono text-[10px] truncate ${active ? "text-white/70" : "text-zinc-400"}`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bagian Bawah: Tombol Navigasi Landing Web & Logout */}
      <div className="pt-4 border-t border-zinc-100 space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 px-1">
          <span>{currentTime || "Online"}</span>
          <span className="text-emerald-700 font-bold">● Sesi Terenkripsi</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab("panduan");
            setMobileMenuOpen(false);
          }}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 font-sans text-xs font-bold text-blue-900 shadow-xs transition-all hover:bg-blue-100"
        >
          <span>📖</span>
          <span>Buku Panduan Web Bergambar</span>
        </button>

        <Link
          href="/landing"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white font-sans text-xs font-bold text-zinc-700 shadow-xs transition-all hover:bg-zinc-100"
        >
          <span>🌐</span>
          <span>Halaman Awal Web (Landing)</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 font-sans text-xs font-bold text-rose-700 shadow-xs transition-all hover:bg-rose-100 hover:text-rose-900"
        >
          <span>🚪</span>
          <span>Keluar dari Akun (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-zinc-950 font-sans selection:bg-[#38E8F5] selection:text-[#032D30]">
      {/* Background Dot Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-60 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(24,20,11,0.08) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none fixed -top-32 left-1/4 h-96 w-96 rounded-full bg-[#38E8F5]/15 blur-[140px] z-0" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-96 w-96 rounded-full bg-[#FFCA38]/15 blur-[140px] z-0" />

      {/* Mobile Top App Header */}
      <div className="sticky top-0 z-40 flex md:hidden items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-sm">
            <Image
              src="/logo.png"
              alt="NutriTrack Logo"
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="font-sans text-base font-black uppercase tracking-tight text-zinc-950">
            NutriTrack
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/landing"
            className="rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1.5 font-mono text-[10px] font-bold text-zinc-700 hover:bg-zinc-200 transition"
          >
            🌐 Web
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1.5 font-mono text-[10px] font-bold text-rose-700"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Container: Left Sidebar + Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Left Sidebar */}
        <aside
          data-lenis-prevent="true"
          className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 sticky top-0 h-screen max-h-screen overflow-y-auto overscroll-contain border-r border-zinc-200/90 bg-white p-5 lg:p-6 shadow-sm z-30 custom-scrollbar"
        >
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                data-lenis-prevent="true"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative flex flex-col w-4/5 max-w-xs h-full max-h-screen bg-white p-5 shadow-2xl z-10 overflow-y-auto overscroll-contain custom-scrollbar"
              >
                {sidebarContent}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {/* Top Quick Profile & Logout Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/70 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span>NutriTrack</span>
              <span>/</span>
              <span className="font-bold text-zinc-900">
                {navItems.find((n) => n.key === activeTab)?.label || "Dasbor"}
              </span>
              <span>/</span>
              <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950">
                {currentRoleInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <span className="text-xs font-black text-zinc-900 block">{displayName}</span>
                <span className="text-[10px] font-mono text-zinc-500">{displayUnit}</span>
              </div>
              <Link
                href="/landing"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 shadow-xs"
                title="Buka Halaman Awal Web / Landing Publik"
              >
                <span>🌐</span>
                <span className="hidden lg:inline">Beranda Web</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab("panduan")}
                className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs ${
                  activeTab === "panduan" || activeTab === "carakerja"
                    ? "bg-[#38E8F5] text-[#032D30] border-[#38E8F5]"
                    : "border-blue-200 bg-blue-50/80 text-blue-900 hover:bg-blue-100"
                }`}
                title="Buka Buku Panduan Pengoperasian Web Bergambar"
              >
                <span>📖</span>
                <span>Panduan Web</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs ${
                  activeTab === "profil"
                    ? "bg-[#18140B] text-white border-[#18140B]"
                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                <span>👤</span>
                <span>Profil & Sandi</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-mono text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>🚪</span>
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Active Tab Screen */}
          <AnimatePresence mode="wait">
            {activeTab === "ringkasan" && (
              <motion.div
                key="ringkasan"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewTab onSelectTab={(tab) => setActiveTab(tab)} />
              </motion.div>
            )}

            {activeTab === "kms" && (
              <motion.div
                key="kms"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ModulAKmsTab onNavigateToMbg={() => setActiveTab("konsumsi")} />
              </motion.div>
            )}

            {activeTab === "konsumsi" && (
              <motion.div
                key="konsumsi"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ModulCKonsumsiTab />
              </motion.div>
            )}

            {activeTab === "dapur" && (
              <motion.div
                key="dapur"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ModulBDapurTab />
              </motion.div>
            )}

            {(activeTab === "puskesmas" || activeTab === "posyandu_binaan") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <PuskesmasTab initialSubTab={activeTab === "posyandu_binaan" ? "posyandu_binaan" : "posyandu_desa"} />
              </motion.div>
            )}

            {activeTab === "analitik" && (
              <motion.div
                key="analitik"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ModulDAnalitikTab />
              </motion.div>
            )}

            {activeTab === "kelola_faskes" && (
              <motion.div
                key="kelola_faskes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <DinkesKelolaFaskesTab />
              </motion.div>
            )}

            {(activeTab === "panduan" || activeTab === "carakerja") && (
              <motion.div
                key="panduan"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <PanduanWebTab onNavigateTab={(t) => setActiveTab(t as DashboardTab)} />
              </motion.div>
            )}

            {activeTab === "profil" && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ProfilAkunTab role={activeRole} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
