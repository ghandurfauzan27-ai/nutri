"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  authRoles,
  type AuthRole,
  MASTER_PUSKESMAS_ACCOUNTS,
  DEMO_ACCOUNTS,
} from "@/lib/auth-data";
import { item, stagger } from "./motion";
import { Checkbox, FloatingField, PasswordField, RoleSegmented, SubmitButton, type SubmitStatus } from "./fields";

export default function LoginForm({ delay }: { delay: number }) {
  const [role, setRole] = useState<AuthRole>("posyandu");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [selectedPuskesmasIndex, setSelectedPuskesmasIndex] = useState<number>(0);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const info = authRoles.find((r) => r.key === role) || authRoles[0];

  useEffect(() => {
    // Set default credentials saat peran berganti
    if (role === "puskesmas") {
      const p = MASTER_PUSKESMAS_ACCOUNTS[selectedPuskesmasIndex];
      setId(p.email);
      setPw("Password123!");
    } else if (role === "posyandu") {
      setId("posyandu.bilaporah@jatim.go.id");
      setPw("Password123!");
    } else if (role === "dapur") {
      setId("dapur.sppg@jatim.go.id");
      setPw("Password123!");
    } else if (role === "dinkes") {
      setId("dinkes.jatim@jatimprov.go.id");
      setPw("Password123!");
    }
    setErrors({});
    setStatus("idle");
  }, [role, selectedPuskesmasIndex]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handlePuskesmasSelect = (idx: number) => {
    setSelectedPuskesmasIndex(idx);
    const p = MASTER_PUSKESMAS_ACCOUNTS[idx];
    setId(p.email);
    setPw("Password123!");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: { id?: string; pw?: string } = {};
    if (!id.trim()) next.id = "Isi identitas akunmu dulu.";
    if (!pw) next.pw = "Kata sandi belum diisi.";
    setErrors(next);
    if (next.id || next.pw) return;

    setStatus("loading");

    // Tentukan data sesi otentikasi
    let sessionData = {
      role: role === "kader" ? "posyandu" : role,
      name: "Pengguna NutriTrack",
      email: id,
      unit: "Unit NutriTrack Jatim",
      wilayah: "Jawa Timur",
      faskesCode: "",
      puskesmasPembina: "",
    };

    if (role === "puskesmas") {
      const matched = MASTER_PUSKESMAS_ACCOUNTS.find((p) => p.email.toLowerCase() === id.toLowerCase()) ||
        MASTER_PUSKESMAS_ACCOUNTS[selectedPuskesmasIndex];
      sessionData = {
        role: "puskesmas",
        name: matched.name,
        email: matched.email,
        unit: matched.unit,
        wilayah: matched.wilayah,
        faskesCode: matched.faskesCode || "P3526010101",
        puskesmasPembina: matched.unit,
      };
    } else if (role === "posyandu" || (role as string) === "kader") {
      sessionData = {
        role: "posyandu",
        name: "Siti Rahmawati, S.Pd (Petugas Posyandu)",
        email: id,
        unit: "Posyandu Mawar 01 — Desa Bilaporah",
        wilayah: "Kecamatan Socah, Kab. Bangkalan",
        faskesCode: "",
        puskesmasPembina: "Puskesmas Socah",
      };
    } else if (role === "dapur") {
      sessionData = {
        role: "dapur",
        name: "H. Mustofa Kamal (Kepala Dapur)",
        email: id,
        unit: "SPPG Dapur Sehat Socah Mandiri",
        wilayah: "Wilayah Layanan: 9 Posyandu Kec. Socah, Bangkalan",
        faskesCode: "",
        puskesmasPembina: "",
      };
    } else if (role === "dinkes") {
      sessionData = {
        role: "dinkes",
        name: "dr. Erwin Astha Triyono, Sp.PD (Kadinkes Jatim)",
        email: id,
        unit: "Dinas Kesehatan Provinsi Jawa Timur",
        wilayah: "Wilayah Pengawasan: 38 Kabupaten / Kota se-Jatim",
        faskesCode: "",
        puskesmasPembina: "",
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("nt_current_session", JSON.stringify(sessionData));
    }

    timer.current = setTimeout(() => {
      setStatus("done");
      setTimeout(() => {
        const targetRole = role === "posyandu" || (role as string) === "kader" ? "kader" : role;
        window.location.href = `/app?role=${targetRole}`;
      }, 500);
    }, 600);
  };

  const fillDemo = () => {
    setStatus("loading");
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0];
    if (typeof window !== "undefined") {
      localStorage.setItem("nt_current_session", JSON.stringify(demo));
    }
    timer.current = setTimeout(() => {
      setStatus("done");
      setTimeout(() => {
        const targetRole = role === "posyandu" || (role as string) === "kader" ? "kader" : role;
        window.location.href = `/app?role=${targetRole}`;
      }, 400);
    }, 500);
  };

  return (
    <motion.div variants={stagger(delay)} initial="hidden" animate="show" className="font-sans">
      <motion.p variants={item} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#38E8F5]" /> Masuk · Portal Terpadu Jatim
      </motion.p>
      <motion.h1 variants={item} className="mt-5 font-sans text-4xl font-black uppercase leading-[1.02] tracking-tightest sm:text-[2.7rem]">
        Selamat datang<br />kembali.
      </motion.h1>
      <motion.p variants={item} className="mt-3 max-w-sm font-sans text-sm font-medium leading-relaxed text-zinc-600">
        Masuk sesuai peran operasional faskes dan wilayah kerja binaan Anda.
      </motion.p>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        {/* Pilihan Peran Akun */}
        <motion.div variants={item}>
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Pilih Peran Akun
          </p>
          <RoleSegmented
            value={role}
            onChange={(r) => {
              setRole(r);
              setStatus("idle");
            }}
            roles={authRoles}
            layoutId="login-role"
          />
        </motion.div>

        {/* Deskripsi Peran */}
        <motion.div variants={item} className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3.5 text-xs text-sky-950 font-medium leading-relaxed">
          💡 <strong>{info.name}:</strong> {info.deskripsi}
        </motion.div>

        {/* KHUSUS PUSKESMAS: Selector Puskesmas se-Jatim (Akun Sudah Dibuatkan Semua Langsung!) */}
        {role === "puskesmas" && (
          <motion.div variants={item} className="space-y-2 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-950">
                🏥 Pilih Puskesmas Pembina (se-Jawa Timur)
              </label>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[9px] font-black text-white">
                Tersedia Otomatis
              </span>
            </div>
            <select
              value={selectedPuskesmasIndex}
              onChange={(e) => handlePuskesmasSelect(Number(e.target.value))}
              className="h-12 w-full rounded-xl border border-emerald-300 bg-white px-3 font-sans text-xs font-bold text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              {MASTER_PUSKESMAS_ACCOUNTS.map((p, idx) => (
                <option key={p.email} value={idx}>
                  {p.unit} — {p.wilayah} ({p.name})
                </option>
              ))}
            </select>
            <p className="font-mono text-[10px] text-emerald-900">
              *Seluruh Puskesmas di Jawa Timur sudah dibuatkan akunnya langsung oleh Dinas Kesehatan Provinsi. Password default: <code className="bg-emerald-200/70 px-1 py-0.5 rounded font-black">Password123!</code>
            </p>
          </motion.div>
        )}

        <motion.div variants={item}>
          <FloatingField id="login-id" label={info.loginIdLabel} value={id} onChange={setId} error={errors.id} autoComplete="username" />
        </motion.div>
        <motion.div variants={item}>
          <PasswordField id="login-pw" label="Kata sandi" value={pw} onChange={setPw} error={errors.pw} autoComplete="current-password" />
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
          <Checkbox id="login-remember" checked={remember} onChange={setRemember}>Ingat perangkat ini</Checkbox>
          {role === "posyandu" && (
            <Link
              href="/register"
              className="min-h-[44px] inline-flex items-center text-[13px] font-bold text-[#5C46D9] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38E8F5] rounded-md"
            >
              Belum punya akun? Daftar Posyandu
            </Link>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-2">
          <SubmitButton status={status} doneLabel="Mengalihkan ke Dasbor...">Masuk sebagai {info.name}</SubmitButton>
          <button
            type="button"
            onClick={fillDemo}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-sans text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>⚡ Masuk Cepat / Demo Akun {info.name}</span>
          </button>
        </motion.div>

        {/* Link Registrasi Posyandu */}
        {role === "posyandu" && (
          <div className="pt-2 text-center">
            <p className="font-sans text-xs text-zinc-500">
              Setiap Posyandu desa wajib memiliki 1 akun terverifikasi.{" "}
              <Link href="/register" className="font-bold text-[#032D30] hover:underline">
                Daftarkan Posyandu Anda di sini →
              </Link>
            </p>
          </div>
        )}
      </form>
    </motion.div>
  );
}
