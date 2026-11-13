/**
 * Middleware Autentikasi JWT & Otorisasi Berbasis Peran (RBAC)
 */

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "nutritrack_jatim_super_secret_key_2026_sdgs";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token autentikasi JWT tidak ditemukan."
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak valid atau sudah kedaluwarsa.",
      error: err.message
    });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Hak akses terbatas. Peran yang diizinkan: ${roles.join(", ")}.`
      });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  requireRoles
};
