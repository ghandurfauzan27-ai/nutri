"use client";

export default function OverviewTab({
  onSelectTab,
}: {
  onSelectTab?: (tab: "kms" | "dapur" | "konsumsi" | "analitik") => void;
}) {
  return (
    <div className="space-y-8 font-sans">
      {/* 4 Key Executive Metric Tiles */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[26px] border border-zinc-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
              Total Balita Terpantau
            </span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
              Aktif
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-3xl font-black text-zinc-950 tracking-tight">
              14.250
            </span>
            <span className="font-mono text-xs text-zinc-500 font-bold">anak</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-mono">
            38 Kab/Kota Jawa Timur
          </p>
        </div>

        <div className="rounded-[26px] border-2 border-amber-300 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-black text-amber-800">
              Balita Faltering / Waspada
            </span>
            <span className="rounded-md bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-black text-white">
              WASPADA
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-3xl font-black text-amber-950 tracking-tight">
              3.480
            </span>
            <span className="font-mono text-xs text-amber-800 font-bold">anak (24.4%)</span>
          </div>
          <p className="mt-2 text-xs text-amber-700 font-mono">
            Otomatis masuk antrean Paket B
          </p>
        </div>

        <div className="rounded-[26px] border border-zinc-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
              Porsi MBG Terdistribusi
            </span>
            <span className="rounded-md bg-[#7866FF] px-2 py-0.5 font-mono text-[9px] font-bold text-white">
              Hari Ini
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-3xl font-black text-zinc-950 tracking-tight">
              11.890
            </span>
            <span className="font-mono text-xs text-zinc-500 font-bold">porsi MBG</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-mono">
            94.8% serah terima terkonfirmasi
          </p>
        </div>

        <div className="rounded-[26px] border border-zinc-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
              Tingkat Pemulihan (RoN 90h)
            </span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
              Sukses
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-sans text-3xl font-black text-emerald-600 tracking-tight">
              81.6%
            </span>
            <span className="font-mono text-xs text-emerald-800 font-bold">keluar faltering</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-mono">
            ΔZ TB/U rata-rata +0.92 SD
          </p>
        </div>
      </div>
    </div>
  );
}

