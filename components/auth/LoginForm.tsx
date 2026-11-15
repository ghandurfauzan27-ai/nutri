"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  authRoles,
  type AuthRole,
  MASTER_PUSKESMAS_ACCOUNTS,
  MASTER_SPPG_ACCOUNTS,
  MASTER_POSYANDU_ACCOUNTS,
  DEMO_ACCOUNTS,
  getAccountPassword,
} from "@/lib/auth-data";
import { item, stagger } from "./motion";
import { Checkbox, FloatingField, PasswordField, RoleSegmented, SubmitButton, type SubmitStatus } from "./fields";

export default function LoginForm({ delay }: { delay: number }) {
  const [role, setRole] = useState<AuthRole>("posyandu");
  const [id, setId] = useState("posyandu.mawar01@jatim.go.id");
  const [pw, setPw] = useState("Password123!");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const info = authRoles.find((r) => r.key === role) || authRoles[0];

  useEffect(() => {
    // Set default credentials saat peran berganti
    let defaultEmail = "posyandu.mawar01@jatim.go.id";
    if (role === "puskesmas") {
      defaultEmail = "puskesmas.socah@jatim.go.id";
    } else if (role === "posyandu") {
      defaultEmail = "posyandu.mawar01@jatim.go.id";
    } else if (role === "dapur") {
      defaultEmail = "sppg.socah@jatim.go.id";
    } else if (role === "dinkes") {
      defaultEmail = "dinkes.jatim@jatimprov.go.id";
    }
    setId(defaultEmail);
    setPw(getAccountPassword(defaultEmail));
    setErrors({});
    setStatus("idle");
  }, [role]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: { id?: string; pw?: string } = {};
    if (!id.trim()) next.id = "Isi identitas akunmu dulu.";
    if (!pw) next.pw = "Kata sandi belum diisi.";

    // Validasi kata sandi aktif akun
    if (id.trim() && pw) {
      const activePassword = getAccountPassword(id.trim());
      if (pw !== activePassword) {
        next.pw = "Kata sandi salah. Silakan periksa kembali kata sandi akun Anda.";
      }
    }

    setErrors(next);
    if (next.id || next.pw) return;

    setStatus("loading");

    // Tentukan data sesi otentikasi
    let sessionData: {
      role: AuthRole;
      name: string;
      email: string;
      unit: string;
      wilayah: string;
      faskesCode: string;
      puskesmasPembina: string;
      sppgId?: string;
    } = {
      role: role === "kader" ? "posyandu" : role,
      name: "Pengguna NutriTrack",
      email: id,
      unit: "Unit NutriTrack Jatim",
      wilayah: "Jawa Timur",
      faskesCode: "",
      puskesmasPembina: "",
    };

    if (role === "puskesmas") {
      const matched =
        MASTER_PUSKESMAS_ACCOUNTS.find((p) => p.email.toLowerCase() === id.toLowerCase()) ||
        MASTER_PUSKESMAS_ACCOUNTS[0];
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
      const matched =
        MASTER_POSYANDU_ACCOUNTS.find((p) => p.email.toLowerCase() === id.toLowerCase()) ||
        MASTER_POSYANDU_ACCOUNTS[0];
      sessionData = {
        role: "posyandu",
        name: matched.name,
        email: matched.email,
        unit: `${matched.unit} — ${matched.wilayah.split(",")[0].trim()}`,
        wilayah: matched.wilayah,
        faskesCode: "",
        puskesmasPembina: matched.puskesmasPembina || "Puskesmas Socah",
      };
    } else if (role === "dapur") {
      const matched =
        MASTER_SPPG_ACCOUNTS.find((s) => s.email.toLowerCase() === id.toLowerCase()) ||
        MASTER_SPPG_ACCOUNTS[0];
      sessionData = {
        role: "dapur",
        name: matched.name,
        email: matched.email,
        unit: matched.unit,
        wilayah: matched.wilayah,
        faskesCode: "",
        puskesmasPembina: "",
        sppgId: matched.sppgId || "SPPG-BKL-01",
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
        const targetRole = role === "kader" ? "posyandu" : role;
        window.location.href = `/app?role=${targetRole}`;
      }, 500);
    }, 600);
  };

  const fillDemo = () => {
    setStatus("loading");
    const demo = DEMO_ACCOUNTS.find((d) => d.role === role) || DEMO_ACCOUNTS[0];
    setId(demo.email);
    setPw(getAccountPassword(demo.email));
    if (typeof window !== "undefined") {
      localStorage.setItem("nt_current_session", JSON.stringify(demo));
    }
    timer.current = setTimeout(() => {
      setStatus("done");
      setTimeout(() => {
        const targetRole = role === "kader" ? "posyandu" : role;
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
