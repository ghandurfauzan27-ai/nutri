import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PanduanWebTab from "@/components/dashboard/PanduanWebTab";

export const metadata: Metadata = {
  title: "Panduan Pengoperasian Web | NutriTrack Jawa Timur",
  description:
    "Panduan praktis pengoperasian web NutriTrack Jawa Timur lengkap dengan gambar tampilan asli dan alur kerja tiap peran faskes.",
};

export default function PanduanPage() {
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

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="NutriTrack Logo"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 block leading-tight">
                NutriTrack
              </span>
              <p className="font-mono text-[10px] text-zinc-500">Panduan Resmi Operasional</p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/landing"
              className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors shadow-xs"
            >
              🌐 Beranda
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-zinc-950 px-4 py-2 font-sans text-xs font-black text-white hover:bg-zinc-800 transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>Buka Dasbor Aplikasi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-8">
        <PanduanWebTab />
      </main>
    </div>
  );
}
