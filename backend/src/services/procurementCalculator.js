/**
 * Kalkulator Belanja Bahan Baku MBG Berbasis Komoditas Lokal Jawa Timur
 * Fitur 3: Dasbor Dapur SPPG & Penyerapan Rantai Pasok Peternak/Petani Lokal
 */

const { JATIM_LOCAL_COMMODITIES } = require("../config/jatimLocations");

function calculateProcurement({ portionA = 0, portionB = 0, targetDate = new Date().toISOString().split("T")[0] }) {
  const countA = Math.max(0, parseInt(portionA) || 0);
  const countB = Math.max(0, parseInt(portionB) || 0);
  const totalPortions = countA + countB;

  // 1. Perhitungan Kebutuhan Komoditas Lokal (Gram -> Kilogram)
  // Telur Ayam Ras Blitar: 55g per porsi Paket B (Porsi Dobel Telur Utuh)
  const kgTelurBlitar = Math.round(((countB * 55) / 1000) * 10) / 10;
  const butirTelurBlitar = Math.round(countB * 1.0); // 1 butir per paket B

  // Ikan Lele Segar Lamongan: 35g per porsi Paket B
  const kgLeleLamongan = Math.round(((countB * 35) / 1000) * 10) / 10;

  // Ikan Kembung Tulungagung: 40g per porsi Paket A (Omega-3 lokal murah)
  const kgIkanKembung = Math.round(((countA * 40) / 1000) * 10) / 10;

  // Hati Ayam Kampung Segar: 25g per porsi Paket B (Zat besi tinggi)
  const kgHatiAyam = Math.round(((countB * 25) / 1000) * 10) / 10;

  // Daun Kelor Organik: 15g per porsi Paket B + 10g per porsi Paket A
  const kgDaunKelor = Math.round((((countB * 15) + (countA * 10)) / 1000) * 10) / 10;
  const ikatKelor = Math.ceil((kgDaunKelor * 1000) / 250); // 1 ikat ~ 250 gram

  // Tempe Kediri: 25g per porsi Paket A
  const kgTempeKediri = Math.round(((countA * 25) / 1000) * 10) / 10;

  // Beras Pulen Lokal Jatim: 50g (Paket A) + 45g (Paket B)
  const kgBerasJatim = Math.round((((countA * 50) + (countB * 45)) / 1000) * 10) / 10;

  // Ayam Ras Suwir Jatim: 40g per porsi Paket A
  const kgAyamRas = Math.round(((countA * 40) / 1000) * 10) / 10;

  // 2. Daftar Belanja Detail Komoditas Lokal & Peternak/Gapoktan
  const belanjaDetail = [
    {
      bahan: "Telur Ayam Ras Segar Blitar",
      kategori: "Protein Hewani Unggulan (Paket B Dobel)",
      jumlahKg: kgTelurBlitar,
      keterangan: `${butirTelurBlitar} butir (${kgTelurBlitar} kg)`,
      hargaSatuanKg: 27000,
      subtotalRp: Math.round(kgTelurBlitar * 27000),
      sentraKabupaten: "Kab. Blitar",
      mitraPemasok: "Koperasi Peternak Unggas Blitar Jaya",
      narasiSerapan: "Menyerap pasokan telur peternak rakyat Blitar untuk intervensi stunting baduta."
    },
    {
      bahan: "Ikan Lele Segar Fillet Lamongan",
      kategori: "Protein Hewani & Kalsium (Paket B)",
      jumlahKg: kgLeleLamongan,
      keterangan: `${kgLeleLamongan} kg fillet bersih`,
      hargaSatuanKg: 28000,
      subtotalRp: Math.round(kgLeleLamongan * 28000),
      sentraKabupaten: "Kab. Lamongan",
      mitraPemasok: "Gapoktan Mina Makmur Lamongan",
      narasiSerapan: "Alternatif omega & protein hewani murah meriah dari pembudidaya tambak Lamongan."
    },
    {
      bahan: "Hati Ayam Kampung Segar",
      kategori: "Zat Besi Heme Booster BB (Paket B)",
      jumlahKg: kgHatiAyam,
      keterangan: `${kgHatiAyam} kg`,
      hargaSatuanKg: 32000,
      subtotalRp: Math.round(kgHatiAyam * 32000),
      sentraKabupaten: "Kab. Jombang & Kediri",
      mitraPemasok: "Sentra Unggas Pedesaan Jombang",
      narasiSerapan: "Mendongkrak kadar hemoglobin anak dan mempercepat lepas dari faltering."
    },
    {
      bahan: "Ikan Kembung Segar Tulungagung",
      kategori: "Omega-3 Tinggi Lokal (Paket A)",
      jumlahKg: kgIkanKembung,
      keterangan: `${kgIkanKembung} kg`,
      hargaSatuanKg: 35000,
      subtotalRp: Math.round(kgIkanKembung * 35000),
      sentraKabupaten: "Kab. Tulungagung / TPI Pacitan",
      mitraPemasok: "Kelompok Nelayan Samudera Makmur",
      narasiSerapan: "Pemberdayaan nelayan pesisir selatan Jawa Timur untuk MBG reguler balita."
    },
    {
      bahan: "Daun Kelor Organik Cincang",
      kategori: "Superfood Nabati Mikronutrien",
      jumlahKg: kgDaunKelor,
      keterangan: `${kgDaunKelor} kg (${ikatKelor} ikat segar)`,
      hargaSatuanKg: 18000,
      subtotalRp: Math.round(kgDaunKelor * 18000),
      sentraKabupaten: "Kota Batu & Kab. Malang",
      mitraPemasok: "Kelompok Tani Organik Sumber Makmur",
      narasiSerapan: "Sayuran pencegah defisiensi mikronutrien dari petani lereng pegunungan Jatim."
    },
    {
      bahan: "Tempe Tradisional Kediri",
      kategori: "Protein Nabati Terfermentasi (Paket A)",
      jumlahKg: kgTempeKediri,
      keterangan: `${kgTempeKediri} kg`,
      hargaSatuanKg: 15000,
      subtotalRp: Math.round(kgTempeKediri * 15000),
      sentraKabupaten: "Kab. Kediri",
      mitraPemasok: "Sentra Perajin Tempe Sejahtera Kediri",
      narasiSerapan: "Menyerap produksi kedelai dan perajin tempe rumahan Jawa Timur."
    },
    {
      bahan: "Beras Pulen Lokal Jatim",
      kategori: "Karbohidrat Pokok Nasi Tim",
      jumlahKg: kgBerasJatim,
      keterangan: `${kgBerasJatim} kg`,
      hargaSatuanKg: 14000,
      subtotalRp: Math.round(kgBerasJatim * 14000),
      sentraKabupaten: "Kab. Ngawi & Jember",
      mitraPemasok: "Gapoktan Lumbung Padi Jatim",
      narasiSerapan: "Beras lokal berkualitas tanpa pemutih dari lumbung pangan padi Jawa Timur."
    },
    {
      bahan: "Daging Ayam Ras Suwir",
      kategori: "Protein Hewani Reguler (Paket A)",
      jumlahKg: kgAyamRas,
      keterangan: `${kgAyamRas} kg`,
      hargaSatuanKg: 34000,
      subtotalRp: Math.round(kgAyamRas * 34000),
      sentraKabupaten: "Kab. Blitar & Pasuruan",
      mitraPemasok: "Peternak Ayam Pedaging Jatim",
      narasiSerapan: "Pasokan ayam segar peternak rakyat Jatim."
    }
  ];

  // 3. Ringkasan Total Belanja & Dampak Ekonomi Lokal
  const totalBiayaBahanRp = belanjaDetail.reduce((acc, item) => acc + item.subtotalRp, 0);
  const totalVolumeBahanKg = Math.round(belanjaDetail.reduce((acc, item) => acc + item.jumlahKg, 0) * 10) / 10;

  // Narasi Perputaran Uang Jawa Timur (100% lokal)
  const ringkasanEkonomiLokal = {
    totalAnggaranBelanjaRp: totalBiayaBahanRp,
    totalVolumeBahanKg,
    persentaseBahanLokalJatim: 100,
    perputaranUangJatimText: `100% belanja bahan MBG senilai Rp ${totalBiayaBahanRp.toLocaleString("id-ID")} terserap langsung di kantong peternak dan petani lokal Jawa Timur (Blitar, Lamongan, Tulungagung, Kediri, Jember, Batu).`,
    sorotanUtama: [
      `Telur Blitar terserap: ${kgTelurBlitar} kg (${butirTelurBlitar} butir)`,
      `Lele Lamongan terserap: ${kgLeleLamongan} kg fillet segar`,
      `Ikan Kembung Tulungagung terserap: ${kgIkanKembung} kg`,
      `Hati Ayam Heme terserap: ${kgHatiAyam} kg`
    ]
  };

  return {
    targetDate,
    porsi: {
      paketAReguler: countA,
      paketBIntervensi: countB,
      totalPorsi: totalPortions
    },
    daftarBelanja: belanjaDetail,
    ringkasanEkonomiLokal
  };
}

module.exports = {
  calculateProcurement
};
