/**
 * Controller Katalog Resep MBG Komoditas Lokal Jawa Timur (SKPL-F07)
 * Fitur 2: Rekomendasi Menu Berbasis Komoditas Lokal Jatim (Telur Blitar, Lele Lamongan, dll.)
 */

const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { JATIM_LOCAL_COMMODITIES } = require("../config/jatimLocations");

exports.getAllRecipes = (req, res) => {
  try {
    const { kategori, komoditas } = req.query;

    const recipes = db.recipes.find((r) => {
      if (kategori) {
        const kat = kategori.toLowerCase();
        if (kat.includes("b") || kat.includes("intervensi")) {
          if (!r.kategori.includes("Paket B")) return false;
        } else if (kat.includes("a") || kat.includes("reguler")) {
          if (!r.kategori.includes("Paket A")) return false;
        }
      }
      if (komoditas && !r.komoditasUtama.toLowerCase().includes(komoditas.toLowerCase())) {
        return false;
      }
      return true;
    });

    return res.json({
      success: true,
      count: recipes.length,
      data: recipes,
      komoditasLokalJatim: JATIM_LOCAL_COMMODITIES
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil katalog resep.", error: error.message });
  }
};

exports.getRecipeById = (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.recipes.findById(id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Resep tidak ditemukan." });
    }
    return res.json({ success: true, data: recipe });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil detail resep.", error: error.message });
  }
};

exports.createRecipe = (req, res) => {
  try {
    const {
      nama,
      kategori,
      komoditasUtama,
      sentraPemasok,
      energiKkal,
      proteinGram,
      lemakGram,
      karboGram,
      tekstur,
      gramasiBahan,
      langkahMasak,
      keunggulanKlinis
    } = req.body;

    if (!nama || !kategori || !komoditasUtama) {
      return res.status(400).json({ success: false, message: "Field wajib: nama, kategori, komoditasUtama." });
    }

    const newRecipe = db.recipes.create({
      id: `RCP-JTM-${uuidv4().slice(0, 6).toUpperCase()}`,
      nama,
      kategori,
      targetStatus: kategori.includes("B") ? ["Kuning", "Merah", "Waspada", "Stunting"] : ["Hijau", "Normal"],
      warnaLabel: kategori.includes("B") ? "#EF4444" : "#10B981",
      komoditasUtama,
      sentraPemasok: sentraPemasok || "Jawa Timur",
      energiKkal: parseInt(energiKkal) || 320,
      proteinGram: parseFloat(proteinGram) || 15.0,
      lemakGram: parseFloat(lemakGram) || 10.0,
      karboGram: parseFloat(karboGram) || 40.0,
      tekstur: tekstur || "Lembek Cincang Halus",
      gramasiBahan: gramasiBahan || [],
      langkahMasak: langkahMasak || [],
      keunggulanKlinis: keunggulanKlinis || ""
    });

    return res.status(201).json({ success: true, message: "Resep lokal baru berhasil ditambahkan.", data: newRecipe });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal membuat resep.", error: error.message });
  }
};
