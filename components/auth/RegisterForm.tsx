"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { authRoles, jatimRegions, type AuthRole } from "@/lib/auth-data";
import {
  KECAMATAN_PER_KABUPATEN,
  DESA_PER_KECAMATAN,
  getPuskesmasNameByKecamatan,
  getPuskesmasAddressByKecamatan,
} from "@/lib/puskesmas-data";
import { EASE_OUT, item, stagger } from "./motion";
import {
  Checkbox,
  FloatingField,
  PasswordField,
  RoleSegmented,
  SelectField,
  StrengthMeter,
  SubmitButton,
  strengthOf,
  type SubmitStatus,
} from "./fields";

type Errors = Partial<
  Record<
    | "name"
    | "contact"
    | "pw"
    | "region"
    | "kecamatan"
    | "desa"
    | "posyanduName"
    | "alamatPosyandu"
    | "unit"
    | "consent",
    string
  >
>;

export default function RegisterForm({ delay }: { delay: number }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AuthRole>("kader");
  const [contact, setContact] = useState("");
  const [pw, setPw] = useState("");

  // Hierarki Wilayah Lengkap (Kabupaten -> Kecamatan -> Puskesmas -> Desa -> Posyandu)
  const [region, setRegion] = useState("Kab. Bangkalan");
  const [kecamatan, setKecamatan] = useState("Socah");
  const [desa, setDesa] = useState("Desa Bilaporah");
  const [posyanduName, setPosyanduName] = useState("Posyandu Mawar 01");
  const [alamatPosyandu, setAlamatPosyandu] = useState("Balai RW 01, Dusun Krajan Barat");
  const [unit, setUnit] = useState("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const info = authRoles.find((r) => r.key === role)!;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Sinkronkan daftar kecamatan ketika kabupaten berganti
  const handleRegionChange = (newReg: string) => {
    setRegion(newReg);
    const availableKec = KECAMATAN_PER_KABUPATEN[newReg] || ["Pusat"];
    setKecamatan(availableKec[0]);
    const availableDesa = DESA_PER_KECAMATAN[availableKec[0]] || [`Desa ${availableKec[0]} 01`];
    setDesa(availableDesa[0]);
  };

  // Sinkronkan daftar desa ketika kecamatan berganti
  const handleKecamatanChange = (newKec: string) => {
    setKecamatan(newKec);
    const availableDesa = DESA_PER_KECAMATAN[newKec] || [`Desa ${newKec} 01`];
    setDesa(availableDesa[0]);
  };

  const next = () => {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = "Tulis nama lengkap petugas penanggung jawab.";
    if (!contact.trim()) e.contact = `${info.contactLabel} wajib diisi.`;
    if (strengthOf(pw) < 2 || pw.length < 8) e.pw = "Kata sandi minimal 8 karakter dan tidak terlalu lemah.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setDir(1);
    setStep(1);
  };

  const back = () => {
    setDir(-1);
    setStep(0);
    setErrors({});
  };

  const puskesmasPembina = getPuskesmasNameByKecamatan(kecamatan);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (step === 0) return next();
    const e: Errors = {};
    if (!region) e.region = "Pilih kabupaten/kota wilayah kerja.";

    if (role === "kader") {
      if (!desa.trim()) e.desa = "Pilih atau tulis nama desa tempat posyandu berada.";
      if (!posyanduName.trim()) e.posyanduName = "Nama posyandu wajib diisi (misal: Posyandu Mawar 01).";
      if (!alamatPosyandu.trim()) e.alamatPosyandu = "Alamat lengkap lokasi posyandu / balai RW wajib diisi.";
    } else {
      if (!unit.trim()) e.unit = `${info.unitLabel} wajib diisi.`;
    }

    if (!consent) e.consent = "Persetujuan diperlukan untuk melanjutkan.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("loading");

    // Simpan pendaftaran akun Posyandu Desa ke localStorage agar langsung masuk ke Puskesmas Pembina
    try {
      if (typeof window !== "undefined") {
        const existingRaw = localStorage.getItem("nt_registered_posyandu");
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newPosyanduEntry = {
          id: `POS-REG-${Date.now().toString().slice(-4)}`,
          posyandu: posyanduName,
          desa: desa,
          alamatPosyandu: alamatPosyandu,
          kecamatan: kecamatan,
          kabupaten: region,
          puskesmas: puskesmasPembina,
          alamatPuskesmas: getPuskesmasAddressByKecamatan(kecamatan),
          kaderPenanggungJawab: name,
          noHpKader: contact,
          emailAkun: `${posyanduName.toLowerCase().replace(/[^a-z0-9]/g, "")}@posyandu.id`,
          statusAkun: "Menunggu Verifikasi",
          tglDaftar: "Hari ini (Baru Daftar)",
          totalBalita: 0,
          sehatCount: 0,
          sehatPersen: 0,
          stuntingCount: 0,
          stuntingPersen: 0,
          falteringCount: 0,
          rujukanCount: 0,
          paketA: 0,
          paketB: 0,
          paketC: 0,
          balitaList: [],
        };
        existing.push(newPosyanduEntry);
        localStorage.setItem("nt_registered_posyandu", JSON.stringify(existing));
      }
    } catch (err) {}

    timer.current = setTimeout(() => setStatus("done"), 1200);
  };

  return (
    <motion.div variants={stagger(delay)} initial="hidden" animate="show" className="font-sans">
      <motion.p variants={item} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFCA38]" /> Daftar Akun · Langkah {step + 1} dari 2
      </motion.p>
      <motion.h1 variants={item} className="mt-5 font-sans text-4xl font-black uppercase leading-[1.02] tracking-tightest sm:text-[2.7rem]">
        Registrasi<br />NutriTrack Jatim.
      </motion.h1>

      {/* Stepper */}
      <motion.div variants={item} className="mt-5 flex items-center gap-3" aria-hidden>
        {["Identitas Petugas", "Wilayah & Naungan Faskes"].map((l, i) => (
          <div key={l} className="flex flex-1 flex-col gap-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <motion.div className="h-full rounded-full bg-[#18140B]" initial={false} animate={{ width: step >= i ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE_OUT }} />
            </div>
            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${step >= i ? "text-zinc-900" : "text-zinc-400"}`}>{l}</span>
          </div>
        ))}
      </motion.div>

      <form onSubmit={submit} noValidate className="mt-6">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={{ enter: (d: number) => ({ opacity: 0, x: 28 * d }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: -28 * d }) }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="space-y-4"
          >
            {step === 0 ? (
              <>
                <FloatingField id="reg-name" label={role === "kader" ? "Nama Ketua / Kader Posyandu" : "Nama Lengkap Penanggung Jawab"} value={name} onChange={setName} error={errors.name} autoComplete="name" />
                <div>
                  <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">Pilih Jenis Akun</p>
                  <RoleSegmented value={role} onChange={setRole} roles={authRoles} layoutId="reg-role" />
                </div>
                <FloatingField id="reg-contact" label={info.contactLabel} value={contact} onChange={setContact} error={errors.contact} autoComplete="username" />
                <div className="space-y-2">
                  <PasswordField id="reg-pw" label="Kata sandi" value={pw} onChange={setPw} error={errors.pw} autoComplete="new-password" />
                  <StrengthMeter password={pw} />
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="group flex h-14 min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full bg-[#18140B] font-sans text-sm font-black text-white shadow-lg transition-transform duration-300 hover:scale-[1.015] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38E8F5]/40 focus-visible:ring-offset-2"
                >
                  Lanjut ke Pemetaan Wilayah
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="#38E8F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* 1. Pemilihan Kabupaten & Kecamatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectField id="reg-region" label="Kabupaten / Kota" value={region} onChange={handleRegionChange} options={jatimRegions} error={errors.region} />
                  
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={kecamatan}
                      onChange={(e) => handleKecamatanChange(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 font-sans text-sm font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                    >
                      {(KECAMATAN_PER_KABUPATEN[region] || ["Pusat"]).map((kec) => (
                        <option key={kec} value={kec}>
                          Kecamatan {kec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Informasi Otomatis Naungan Puskesmas Pembina */}
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 font-mono text-xs text-emerald-950 flex items-start gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white text-xs">
                    🏥
                  </span>
                  <div>
                    <div className="font-bold">Naungan Puskesmas Pembina:</div>
                    <div className="text-emerald-900 font-sans font-black text-sm">{puskesmasPembina}</div>
                    <div className="text-[11px] text-emerald-800/80">{getPuskesmasAddressByKecamatan(kecamatan)}</div>
                  </div>
                </div>

                {/* 3. Khusus Akun Posyandu Desa */}
                {role === "kader" ? (
                  <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Rincian Identitas Posyandu di Desa
                    </p>

                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                        Pilih / Masukkan Nama Desa
                      </label>
                      <input
                        list="desa-list"
                        type="text"
                        placeholder="Contoh: Desa Bilaporah"
                        value={desa}
                        onChange={(e) => setDesa(e.target.value)}
                        className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                      />
                      <datalist id="desa-list">
                        {(DESA_PER_KECAMATAN[kecamatan] || []).map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                          Nama Posyandu
                        </label>
                        <input
                          type="text"
                          placeholder="Posyandu Mawar 01"
                          value={posyanduName}
                          onChange={(e) => setPosyanduName(e.target.value)}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-[#38E8F5]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase text-zinc-600 mb-1">
                          Alamat Lengkap Posyandu
                        </label>
                        <input
                          type="text"
                          placeholder="Balai RW 02, Dusun Krajan Barat"
                          value={alamatPosyandu}
                          onChange={(e) => setAlamatPosyandu(e.target.value)}
                          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 font-sans text-xs font-medium text-zinc-900 outline-none focus:border-[#38E8F5]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <FloatingField id="reg-unit" label={info.unitLabel} value={unit} onChange={setUnit} error={errors.unit} />
                )}

                <Checkbox id="reg-consent" checked={consent} onChange={setConsent} error={errors.consent}>
                  Saya menyetujui pengolahan data posyandu desa sesuai standar pelindungan data kesehatan dan integrasi faskes Jawa Timur.
                </Checkbox>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={back}
                    aria-label="Kembali ke langkah 1"
                    className="grid h-14 w-14 min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#38E8F5]/40 focus-visible:ring-offset-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M19 12H5M11 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <SubmitButton status={status} doneLabel="Akun Berhasil Didaftarkan">
                      {role === "kader" ? "Daftarkan Posyandu Desa" : "Buat Akun Resmi"}
                    </SubmitButton>
                  </div>
                </div>

                {status === "done" && (
                  <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 font-mono text-[11px] leading-relaxed text-emerald-950">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white text-[10px]">✓</span>
                      <span>
                        {role === "kader"
                          ? `Akun ${posyanduName} (${desa}, Kec. ${kecamatan}) Terdaftar!`
                          : "Akun resmi berhasil didaftarkan!"}
                      </span>
                    </div>

                    {role === "kader" ? (
                      <div className="text-zinc-600 space-y-1">
                        <p>
                          Data posyandu Anda <strong>langsung terhubung ke {puskesmasPembina}</strong>.
                        </p>
                        <p className="text-[10px]">
                          Alamat Akun: <strong>{posyanduName} — {desa}, Kec. {kecamatan}, {region}</strong> ({alamatPosyandu})
                        </p>
                      </div>
                    ) : null}

                    <Link
                      href={`/app?role=${role}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18140B] px-6 py-3 font-sans text-xs font-black text-white shadow-md hover:scale-105 active:scale-95 transition-all w-full"
                    >
                      <span>Masuk ke Dasbor Operasional ({role === "kader" ? posyanduName : info.name})</span>
                      <span className="text-[#FFCA38]">→</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </form>

      <motion.p variants={item} className="mt-5 border-t border-zinc-100 pt-5 text-sm font-medium text-zinc-600">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          scroll={false}
          className="inline-flex min-h-[44px] items-center font-black text-zinc-950 underline decoration-[#FFCA38] decoration-2 underline-offset-4 hover:decoration-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38E8F5] rounded-md"
        >
          Masuk di sini
        </Link>
      </motion.p>
    </motion.div>
  );
}
