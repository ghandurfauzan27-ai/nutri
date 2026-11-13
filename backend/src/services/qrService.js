/**
 * Service Pembuat dan Validasi Token QR MBG Presisi (SKPL-F08 & SKPL-F10)
 */

const { v4: uuidv4 } = require("uuid");

function generateQrToken({ childId, packageType, kitchenCode = "SPPG-SOCAH-01", date = null }) {
  const dateStr = (date || new Date().toISOString().split("T")[0]).replace(/-/g, "");
  const suffix = uuidv4().slice(0, 6).toUpperCase();
  const pkgCode = packageType.includes("B") ? "B" : "A";
  return `NT-JTM-${dateStr}-${kitchenCode}-${pkgCode}-${childId}-${suffix}`;
}

function parseQrToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split("-");
  if (parts.length < 5 || parts[0] !== "NT" || parts[1] !== "JTM") {
    return null;
  }
  return {
    valid: true,
    token,
    dateString: parts[2],
    kitchenCode: `${parts[3]}-${parts[4]}-${parts[5] || ""}`,
    packageType: parts[6] === "B" ? "Paket B (Intervensi)" : "Paket A (Reguler)"
  };
}

module.exports = {
  generateQrToken,
  parseQrToken
};
