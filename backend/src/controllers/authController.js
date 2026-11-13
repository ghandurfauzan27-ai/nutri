/**
 * Controller Autentikasi & RBAC (Role-Based Access Control)
 * Sesuai BAB 2 SKPL NutriTrack Jatim v1.0
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "nutritrack_jatim_super_secret_key_2026_sdgs";

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
    }

    const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: "Akun dengan email tersebut tidak ditemukan." });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password salah." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        kabupaten: user.kabupaten,
        kecamatan: user.kecamatan,
        posyandu: user.posyandu
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userSafe } = user;
    return res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: userSafe
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat login.", error: error.message });
  }
};

exports.register = (req, res) => {
  try {
    const { email, password, namaLengkap, role, kabupaten, kecamatan, desa, posyandu, noHp } = req.body;

    if (!email || !password || !namaLengkap || !role) {
      return res.status(400).json({ success: false, message: "Field wajib: email, password, namaLengkap, role." });
    }

    const existing = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
    }

    const validRoles = ["kader", "dapur", "puskesmas", "dinkes", "orangtua"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Pilihan role: ${validRoles.join(", ")}`
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.users.create({
      id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      email: email.toLowerCase(),
      password: passwordHash,
      namaLengkap,
      role,
      roleLabel: getRoleLabel(role, posyandu, kecamatan),
      kabupaten: kabupaten || "Kab. Bangkalan",
      kecamatan: kecamatan || "",
      desa: desa || "",
      posyandu: posyandu || "",
      noHp: noHp || ""
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        kabupaten: newUser.kabupaten,
        kecamatan: newUser.kecamatan
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({
      success: true,
      message: "Pendaftaran akun berhasil.",
      token,
      user: userSafe
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat registrasi.", error: error.message });
  }
};

exports.getMe = (req, res) => {
  try {
    const user = db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }
    const { password: _, ...userSafe } = user;
    return res.json({ success: true, user: userSafe });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil data user.", error: error.message });
  }
};

exports.getDemoAccounts = (req, res) => {
  try {
    const users = db.users.find();
    const demoAccounts = users.map((u) => ({
      email: u.email,
      role: u.role,
      roleLabel: u.roleLabel,
      namaLengkap: u.namaLengkap,
      kabupaten: u.kabupaten,
      posyandu: u.posyandu || null,
      passwordDefault: "password123"
    }));
    return res.json({ success: true, count: demoAccounts.length, demoAccounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal memuat akun demo.", error: error.message });
  }
};

function getRoleLabel(role, posyandu, kecamatan) {
  switch (role) {
    case "kader":
      return `Kader Posyandu ${posyandu || "Desa"}`;
    case "dapur":
      return `Pengelola Dapur MBG (SPPG) Kec. ${kecamatan || "Socah"}`;
    case "puskesmas":
      return `Petugas Gizi Puskesmas Kec. ${kecamatan || "Socah"}`;
    case "dinkes":
      return "Dinas Kesehatan / TPID Jawa Timur";
    case "orangtua":
      return "Keluarga Sasaran Balita";
    default:
      return role;
  }
}
