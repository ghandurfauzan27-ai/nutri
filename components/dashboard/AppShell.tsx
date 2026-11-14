"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authRoles, jatimRegions, type AuthRole } from "@/lib/auth-data";
import OverviewTab from "./OverviewTab";
import ModulAKmsTab from "./ModulAKmsTab";
import ModulBDapurTab from "./ModulBDapurTab";
import ModulCKonsumsiTab from "./ModulCKonsumsiTab";
import ModulDAnalitikTab from "./ModulDAnalitikTab";
import PuskesmasTab from "./PuskesmasTab";
import CaraKerjaRoleTab from "./CaraKerjaRoleTab";

export type DashboardTab =
  | "ringkasan"
  | "kms"
  | "dapur"
  | "konsumsi"
  | "analitik"
  | "puskesmas"
  | "carakerja";

export default function AppShell() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") as AuthRole | null;

  const [activeRole] = useState<AuthRole>(
    initialRoleParam && authRoles.some((r) => r.key === initialRoleParam)
      ? initialRoleParam
      : "kader"
  );

  // Inisialisasi tab bawaan sesuai peran
  const getDefaultTabForRole = (role: AuthRole): DashboardTab => {
    switch (role) {
      case "kader":
        return "kms";
      case "dapur":
        return "dapur";
      case "puskesmas":
        return "puskesmas";
      case "dinkes":
        return "ringkasan";
      case "orangtua":
        return "konsumsi";
      default:
        return "kms";
    }
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(getDefaultTabForRole(activeRole));
  const [selectedRegion, setSelectedRegion] = useState<string>("Kab. Bangkalan");
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const currentRoleInfo = authRoles.find((r) => r.key === activeRole) || authRoles[0];

  // Modul yang dikhususkan sesuai peran akun yang login (RBAC Terkunci)
  const getNavItemsForRole = (role: AuthRole) => {
    const allItems = [
      {
        key: "ringkasan" as DashboardTab,
        label: "Ringkasan Eksekutif",
        desc: "Dasbor Utama & KPI Jatim",
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
        key: "kms" as DashboardTab,
        label: "Smart KMS & Balita",
        desc: "Input Balita & Timbang Cepat",
        roles: ["kader"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
            <path d="M18 8h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4" />
            <circle cx="8" cy="12" r="2" />
          </svg>
        ),
        badge: "Tugas Utama",
      },
      {
        key: "konsumsi" as DashboardTab,
        label: role === "kader" ? "Verifikasi MBG Posyandu" : "Menu & Konsumsi MBG",
        desc: role === "kader" ? "Presensi & Daya Terima Baduta" : "Jadwal & Riwayat Makan Balita",
        roles: ["kader", "orangtua"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h.01M7 17h.01M17 7h.01M12 12h.01" />
          </svg>
        ),
        badge: role === "kader" ? "Lapangan" : "Balita",
      },
      {
        key: "dapur" as DashboardTab,
        label: "Dapur MBG & Kuota",
        desc: "Resep Paket A/B & Belanja Peternak",
        roles: ["dapur"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        ),
        badge: "Operasional",
      },
      {
        key: "puskesmas" as DashboardTab,
        label: "Verifikasi Kader & Rujukan",
        desc: "Konfirmasi Akun & Pantau Zona Merah",
        roles: ["puskesmas"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
        badge: "Puskesmas",
      },
      {
        key: "analitik" as DashboardTab,
        label: role === "puskesmas" ? "Peta Pantau Wilayah" : "Heatmap Jatim & RoN",
        desc: role === "puskesmas" ? "Sebaran Baduta se-Kecamatan" : "Audit 38 Kab/Kota & BPKP",
        roles: ["puskesmas", "dinkes"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        ),
        badge: "Pengawasan",
      },
      {
        key: "carakerja" as DashboardTab,
        label: `Cara Kerja ${currentRoleInfo.name}`,
        desc: "Panduan SOP & Langkah Praktis",
        roles: ["kader", "dapur", "puskesmas", "dinkes", "orangtua"],
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        badge: "Panduan",
      },
    ];

    return allItems.filter((item) => item.roles.includes(role));
  };

  const navItems = getNavItemsForRole(activeRole);

  const sidebarContent = (
    <div className="flex flex-col min-h-full justify-between gap-6 pb-6" data-lenis-prevent="true">
      {/* Top Part: Logo, Wilayah, Role, Menu */}
      <div className="space-y-6">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-sm transition-transform group-hover:scale-105">
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

        {/* Wilayah Kerja Selector */}
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
            Wilayah Operasional
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 pr-8 font-sans text-xs font-bold text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-[#38E8F5] focus:bg-white"
            >
              {jatimRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Role Identity Card (RBAC Terkunci - Tidak Bisa Berganti Role Sembarangan) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Peran Terotentikasi (RBAC)
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#18140B] text-[#38E8F5] font-mono text-xs font-black shadow-sm">
                {activeRole === "kader" ? "POS" : activeRole.slice(0, 3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-sans text-xs font-black text-zinc-950 truncate">
                  {activeRole === "kader"
                    ? "Posyandu Mawar 01"
                    : activeRole === "puskesmas"
                    ? "Puskesmas Pembina Socah"
                    : currentRoleInfo.name}
                </h5>
                <p className="font-mono text-[10px] text-zinc-500 truncate">
                  {activeRole === "kader"
                    ? "Desa Bilaporah, Kec. Socah"
                    : activeRole === "puskesmas"
                    ? "Kec. Socah, Kab. Bangkalan"
                    : currentRoleInfo.unitLabel}
                </p>
              </div>
            </div>

            {/* Informasi Naungan & Alamat Lengkap */}
            {activeRole === "kader" && (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-2 text-[10px] font-mono space-y-0.5 text-zinc-600">
                <div className="text-zinc-500 truncate">📍 Balai RW 01, Dusun Krajan</div>
                <div className="text-emerald-800 font-bold truncate">🏥 Naungan: Puskesmas Socah</div>
              </div>
            )}

            {activeRole === "puskesmas" && (
              <div className="rounded-xl border border-zinc-200/80 bg-white p-2 text-[10px] font-mono space-y-0.5 text-zinc-600">
                <div className="text-zinc-500 truncate">📍 Jl. Raya Socah No. 45</div>
                <div className="text-emerald-800 font-bold truncate">Binaan: 8 Desa & 14 Posyandu</div>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-200/70 flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-400">Akun Resmi Jatim</span>
              <Link
                href="/login"
                className="font-mono text-[10px] font-bold text-[#032D30] hover:text-[#38E8F5] transition-colors"
                title="Ganti akun petugas resmi"
              >
                Ganti Akun ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Modul: Vertical Stack sesuai Peran Terkunci */}
        <div>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Menu Operasional ({navItems.length} Modul)
          </span>

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
                  className={`group relative flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition-all ${
                    active
                      ? "bg-[#18140B] text-white shadow-md"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  {/* Left Active Glow Bar */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 inset-y-2 w-1.5 rounded-r-full bg-[#38E8F5]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors ${
                      active ? "bg-white/15 text-[#38E8F5]" : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs font-black truncate">
                        {item.label}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                          active ? "bg-white/20 text-[#38E8F5]" : "bg-zinc-200/80 text-zinc-600"
                        }`}
                      >
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

      {/* Bottom Part: User Info Card & Return to Landing */}
      <div className="pt-6 border-t border-zinc-100 space-y-3">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-3.5 flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#7866FF] font-mono text-xs font-black text-white shadow-sm">
            {activeRole.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-sans text-xs font-black text-zinc-950 truncate">
              {currentRoleInfo.name}
            </h5>
            <p className="font-mono text-[10px] text-zinc-500 truncate">
              {currentRoleInfo.unitLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 px-1">
          <span>{currentTime || "Online"}</span>
          <span className="text-emerald-700 font-bold">● SHA-256 Valid</span>
        </div>

        <Link
          href="/"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white font-sans text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-950"
        >
          <span>← Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-zinc-950 font-sans selection:bg-[#38E8F5] selection:text-[#032D30]">
      {/* Background Dot Grid + Glows */}
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

      {/* Mobile Top App Header (<md) */}
      <div className="sticky top-0 z-40 flex md:hidden items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>

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

      {/* Main Container: Left Sidebar + Right Viewport */}
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Left Sidebar (Permanent) */}
        <aside
          data-lenis-prevent="true"
          className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 sticky top-0 h-screen max-h-screen overflow-y-auto overscroll-contain border-r border-zinc-200/90 bg-white p-5 lg:p-6 shadow-sm z-30 custom-scrollbar"
        >
          {sidebarContent}
        </aside>

        {/* Mobile Drawer (Overlay on Mobile) */}
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

        {/* Right Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {/* Top Quick Breadcrumb & Context Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/70 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span>NutriTrack</span>
              <span>/</span>
              <span className="font-bold text-zinc-900">
                {navItems.find((n) => n.key === activeTab)?.label || "Dasbor"}
              </span>
              <span>/</span>
              <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                {selectedRegion}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Mode: {currentRoleInfo.name}</span>
              </span>
            </div>
          </div>

          {/* Active Tab Screen */}
          <AnimatePresence mode="wait">
            {activeTab === "ringkasan" && (
              <motion.div
                key="ringkasan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <OverviewTab onSelectTab={(t) => setActiveTab(t as DashboardTab)} />
              </motion.div>
            )}

            {activeTab === "kms" && (
              <motion.div
                key="kms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <ModulAKmsTab />
              </motion.div>
            )}

            {activeTab === "dapur" && (
              <motion.div
                key="dapur"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <ModulBDapurTab />
              </motion.div>
            )}

            {activeTab === "konsumsi" && (
              <motion.div
                key="konsumsi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <ModulCKonsumsiTab />
              </motion.div>
            )}

            {activeTab === "analitik" && (
              <motion.div
                key="analitik"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <ModulDAnalitikTab />
              </motion.div>
            )}

            {activeTab === "puskesmas" && (
              <motion.div
                key="puskesmas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <PuskesmasTab />
              </motion.div>
            )}

            {activeTab === "carakerja" && (
              <motion.div
                key="carakerja"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <CaraKerjaRoleTab
                  role={activeRole}
                  onNavigateTab={(tab) => setActiveTab(tab as DashboardTab)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer inside viewport */}
          <footer className="mt-16 border-t border-zinc-200/80 pt-6 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-400">
            <div>
              NutriTrack · Sistem Presisi Intervensi MBG & Pemantauan Gizi. Standar Permenkes No. 2/2020.
            </div>
            <div className="flex items-center gap-3">
              <span>Sistem Operasional Terintegrasi</span>
              <span>●</span>
              <Link href="/" className="font-bold text-zinc-700 hover:text-[#38E8F5] transition-colors">
                Landing Page
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
