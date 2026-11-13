/**
 * Master Data Wilayah Prioritas Kantong Stunting & Sentra Komoditas Jawa Timur
 * Berdasarkan SKPL NutriTrack Jatim v1.0 & Data Dinkes Jatim / SSGI
 */

const JATIM_PRIORITY_REGIONS = [
  {
    id: "KAB-BKL",
    nama: "Kab. Bangkalan",
    pulau: "Madura",
    kategori: "Prioritas Merah (>20%)",
    prevalensiPersen: 24.8,
    totalBalita: 14250,
    balitaFaltering: 3480,
    porsiPaketB: 3480,
    statusProgram: "Intervensi Aktif (12 Dapur SPPG)",
    pusatKoordinat: { lat: -7.0455, lng: 112.7423 },
    kecamatan: [
      {
        nama: "Socah",
        desa: [
          { nama: "Desa Bilaporah", lat: -7.0621, lng: 112.7215, posyandu: "Posyandu Mawar 01", balitaTarget: 142, stuntingCount: 35 },
          { nama: "Desa Dakiring", lat: -7.0712, lng: 112.7301, posyandu: "Posyandu Melati 02", balitaTarget: 120, stuntingCount: 28 },
          { nama: "Desa Junganyar", lat: -7.0805, lng: 112.7154, posyandu: "Posyandu Anggrek 01", balitaTarget: 98, stuntingCount: 22 }
        ]
      },
      {
        nama: "Burneh",
        desa: [
          { nama: "Desa Burneh", lat: -7.0411, lng: 112.7612, posyandu: "Posyandu Kasih Ibu", balitaTarget: 165, stuntingCount: 38 },
          { nama: "Desa Benangkah", lat: -7.0322, lng: 112.7801, posyandu: "Posyandu Dahlia 03", balitaTarget: 110, stuntingCount: 25 }
        ]
      },
      {
        nama: "Blega",
        desa: [
          { nama: "Desa Blega", lat: -7.1432, lng: 113.0891, posyandu: "Posyandu Kenanga 01", balitaTarget: 180, stuntingCount: 46 },
          { nama: "Desa Lomaer", lat: -7.1355, lng: 113.1023, posyandu: "Posyandu Nusa Indah", balitaTarget: 130, stuntingCount: 32 }
        ]
      },
      {
        nama: "Arosbaya",
        desa: [
          { nama: "Desa Tengket", lat: -6.9542, lng: 112.8341, posyandu: "Posyandu Cempaka 02", balitaTarget: 145, stuntingCount: 34 },
          { nama: "Desa Plakaran", lat: -6.9621, lng: 112.8512, posyandu: "Posyandu Melati 01", balitaTarget: 115, stuntingCount: 26 }
        ]
      }
    ]
  },
  {
    id: "KAB-SMP",
    nama: "Kab. Sampang",
    pulau: "Madura",
    kategori: "Prioritas Merah (>20%)",
    prevalensiPersen: 25.4,
    totalBalita: 13800,
    balitaFaltering: 3510,
    porsiPaketB: 3510,
    statusProgram: "Intervensi Aktif (11 Dapur SPPG)",
    pusatKoordinat: { lat: -7.1872, lng: 113.2394 },
    kecamatan: [
      {
        nama: "Kedungdung",
        desa: [
          { nama: "Desa Banjarsari", lat: -7.1124, lng: 113.2501, posyandu: "Posyandu Melati 03", balitaTarget: 155, stuntingCount: 42 },
          { nama: "Desa Moktesareh", lat: -7.1051, lng: 113.2682, posyandu: "Posyandu Teratai 02", balitaTarget: 138, stuntingCount: 36 }
        ]
      },
      {
        nama: "Camplong",
        desa: [
          { nama: "Desa Dharma Tanjung", lat: -7.2145, lng: 113.3102, posyandu: "Posyandu Mawar Biru", balitaTarget: 160, stuntingCount: 39 },
          { nama: "Desa Sejati", lat: -7.2023, lng: 113.3285, posyandu: "Posyandu Sejahtera", balitaTarget: 125, stuntingCount: 29 }
        ]
      },
      {
        nama: "Robatal",
        desa: [
          { nama: "Desa Jelgung", lat: -7.0654, lng: 113.2841, posyandu: "Posyandu Harapan Kita", balitaTarget: 140, stuntingCount: 37 }
        ]
      }
    ]
  },
  {
    id: "KAB-JBR",
    nama: "Kab. Jember",
    pulau: "Jawa",
    kategori: "Prioritas Merah (>20%)",
    prevalensiPersen: 23.2,
    totalBalita: 28500,
    balitaFaltering: 6610,
    porsiPaketB: 6610,
    statusProgram: "Intervensi Terpadu (22 Dapur SPPG)",
    pusatKoordinat: { lat: -8.1724, lng: 113.7007 },
    kecamatan: [
      {
        nama: "Kaliwates",
        desa: [
          { nama: "Kelurahan Mangli", lat: -8.1882, lng: 113.6542, posyandu: "Posyandu Balita Sehat", balitaTarget: 210, stuntingCount: 45 },
          { nama: "Kelurahan Sempusari", lat: -8.1951, lng: 113.6710, posyandu: "Posyandu Kasih Bunda", balitaTarget: 185, stuntingCount: 38 }
        ]
      },
      {
        nama: "Tanggul",
        desa: [
          { nama: "Desa Tanggul Kulon", lat: -8.1581, lng: 113.4472, posyandu: "Posyandu Kenanga 04", balitaTarget: 195, stuntingCount: 48 },
          { nama: "Desa Klatakan", lat: -8.1450, lng: 113.4621, posyandu: "Posyandu Mawar Indah", balitaTarget: 150, stuntingCount: 34 }
        ]
      },
      {
        nama: "Silo",
        desa: [
          { nama: "Desa Sempolan", lat: -8.2412, lng: 113.8821, posyandu: "Posyandu Tunas Harapan", balitaTarget: 175, stuntingCount: 41 }
        ]
      }
    ]
  },
  {
    id: "KAB-BWS",
    nama: "Kab. Bondowoso",
    pulau: "Jawa",
    kategori: "Prioritas Merah (>20%)",
    prevalensiPersen: 22.8,
    totalBalita: 11900,
    balitaFaltering: 2710,
    porsiPaketB: 2710,
    statusProgram: "Intervensi Aktif (10 Dapur SPPG)",
    pusatKoordinat: { lat: -7.9135, lng: 113.8214 },
    kecamatan: [
      {
        nama: "Maesan",
        desa: [
          { nama: "Desa Suger Lor", lat: -8.0215, lng: 113.7842, posyandu: "Posyandu Bougenville 01", balitaTarget: 135, stuntingCount: 33 },
          { nama: "Desa Gambangan", lat: -8.0124, lng: 113.7951, posyandu: "Posyandu Ceria", balitaTarget: 118, stuntingCount: 27 }
        ]
      },
      {
        nama: "Tamanan",
        desa: [
          { nama: "Desa Kalianyar", lat: -8.0142, lng: 113.8321, posyandu: "Posyandu Tunas Bangsa", balitaTarget: 142, stuntingCount: 31 }
        ]
      }
    ]
  },
  {
    id: "KAB-PRO",
    nama: "Kab. Probolinggo",
    pulau: "Jawa",
    kategori: "Prioritas Merah (>20%)",
    prevalensiPersen: 21.1,
    totalBalita: 15400,
    balitaFaltering: 3250,
    porsiPaketB: 3250,
    statusProgram: "Intervensi Aktif (12 Dapur SPPG)",
    pusatKoordinat: { lat: -7.7543, lng: 113.2159 },
    kecamatan: [
      {
        nama: "Krucil",
        desa: [
          { nama: "Desa Bermi", lat: -7.9542, lng: 113.5211, posyandu: "Posyandu Teratai 01", balitaTarget: 148, stuntingCount: 36 },
          { nama: "Desa Guyangan", lat: -7.9411, lng: 113.5105, posyandu: "Posyandu Anggrek Putih", balitaTarget: 125, stuntingCount: 29 }
        ]
      },
      {
        nama: "Tiris",
        desa: [
          { nama: "Desa Ranuagung", lat: -7.9621, lng: 113.4124, posyandu: "Posyandu Sumber Waras", balitaTarget: 130, stuntingCount: 30 }
        ]
      }
    ]
  },
  {
    id: "KAB-BLT",
    nama: "Kab. Blitar",
    pulau: "Jawa",
    kategori: "Waspada Kuning (14-20%)",
    prevalensiPersen: 14.5,
    totalBalita: 14600,
    balitaFaltering: 2120,
    porsiPaketB: 2120,
    statusProgram: "Sentra Pasok Telur (8 Dapur SPPG)",
    pusatKoordinat: { lat: -8.0983, lng: 112.1681 },
    kecamatan: [
      {
        nama: "Sutojayan",
        desa: [
          { nama: "Desa Pandanarum", lat: -8.1812, lng: 112.2154, posyandu: "Posyandu Anggrek 02", balitaTarget: 110, stuntingCount: 16 }
        ]
      },
      {
        nama: "Ponggok",
        desa: [
          { nama: "Desa Ponggok", lat: -8.0321, lng: 112.1154, posyandu: "Posyandu Unggas Makmur", balitaTarget: 128, stuntingCount: 18 }
        ]
      }
    ]
  },
  {
    id: "KAB-LMG",
    nama: "Kab. Lamongan",
    pulau: "Jawa",
    kategori: "Waspada Kuning (14-20%)",
    prevalensiPersen: 15.2,
    totalBalita: 17800,
    balitaFaltering: 2710,
    porsiPaketB: 2710,
    statusProgram: "Sentra Pasok Ikan Lele (12 Dapur SPPG)",
    pusatKoordinat: { lat: -7.1205, lng: 112.4158 },
    kecamatan: [
      {
        nama: "Deket",
        desa: [
          { nama: "Desa Babatagung", lat: -7.1145, lng: 112.4512, posyandu: "Posyandu Mina Sejahtera", balitaTarget: 135, stuntingCount: 21 }
        ]
      },
      {
        nama: "Glagah",
        desa: [
          { nama: "Desa Morocalan", lat: -7.0541, lng: 112.4821, posyandu: "Posyandu Tambak Asri", balitaTarget: 120, stuntingCount: 19 }
        ]
      }
    ]
  }
];

const JATIM_LOCAL_COMMODITIES = [
  {
    komoditas: "Telur Ayam Ras Segar",
    sentra: "Kab. Blitar",
    produsenUtama: "Koperasi Peternak Unggas Blitar Jaya",
    kapasitasProduksi: "350 Ton/Hari (Sentra Terbesar Jawa Timur)",
    keunggulanGizi: "Sumber Protein Lengkap, Asam Amino Esensial & Kolin untuk Perkembangan Otak Baduta",
    rekomendasiMenu: "Telur Kukus Lembut & Porsi Dobel Intervensi MBG Paket B",
    hargaPerKgEst: 27000
  },
  {
    komoditas: "Ikan Lele Segar & Fillet",
    sentra: "Kab. Lamongan & Kab. Tulungagung",
    produsenUtama: "Gapoktan Mina Makmur Lamongan",
    kapasitasProduksi: "120 Ton/Bulan",
    keunggulanGizi: "Protein Hewani Tinggi, Lemak Tak Jenuh, Fosfor & Kalsium untuk Tulang; Alternatif Terjangkau dibanding Salmon",
    rekomendasiMenu: "Puree Lele Kukus Asap & Tim Lele Sayur Kuning",
    hargaPerKgEst: 28000
  },
  {
    komoditas: "Ikan Kembung Segar",
    sentra: "Kab. Tulungagung & TPI Tamperan Pacitan",
    produsenUtama: "Kelompok Nelayan Samudera Makmur",
    kapasitasProduksi: "45 Ton/Bulan",
    keunggulanGizi: "Kandungan Omega-3 (DHA/EPA) setara atau lebih tinggi dari Ikan Salmon dengan harga 5x lebih hemat",
    rekomendasiMenu: "Nasi Tim Ikan Kembung Kuah Kuning (Paket A & B)",
    hargaPerKgEst: 35000
  },
  {
    komoditas: "Hati Ayam Kampung Segar",
    sentra: "Kab. Jombang & Kab. Kediri",
    produsenUtama: "Sentra Unggas Pedesaan Jombang",
    kapasitasProduksi: "15 Ton/Bulan",
    keunggulanGizi: "Zat Besi Heme (Bioavailabilitas Tinggi) & Vitamin A untuk Mencegah Anemia dan Kejar Tumbuh Baduta Faltering",
    rekomendasiMenu: "Puree Hati Ayam & Tim Campur Kelor",
    hargaPerKgEst: 32000
  },
  {
    komoditas: "Daun Kelor Organik",
    sentra: "Kota Batu & Kab. Sumenep",
    produsenUtama: "Kelompok Tani Organik Sumber Makmur",
    kapasitasProduksi: "8 Ton/Bulan",
    keunggulanGizi: "Superfood Lokal Kaya Mikronutrien (Zat Besi, Kalsium, Antioksidan & Vitamin C) Pelengkap Protein Hewani",
    rekomendasiMenu: "Kuah Sayur Bening Kelor & Puree Halus MPASI",
    hargaPerKgEst: 18000
  },
  {
    komoditas: "Tempe Tradisional Kedelai Lokal",
    sentra: "Kab. Kediri & Kab. Malang",
    produsenUtama: "Sentra Perajin Tempe Sejahtera Kediri",
    kapasitasProduksi: "60 Ton/Bulan",
    keunggulanGizi: "Protein Nabati Terfermentasi, Probiotik Alami Baik untuk Penyerapan Usus Anak",
    rekomendasiMenu: "Tempe Mendoan Kukus & Lodeh Manis Balita",
    hargaPerKgEst: 15000
  },
  {
    komoditas: "Beras Pulen Lokal Jatim",
    sentra: "Kab. Ngawi & Kab. Jember",
    produsenUtama: "Gapoktan Lumbung Padi Jatim",
    kapasitasProduksi: "500 Ton/Bulan",
    keunggulanGizi: "Karbohidrat Bersih Bebas Pemutih, Mudah Dicerna untuk Basis Nasi Tim dan Bubur",
    rekomendasiMenu: "Nasi Tim Lembut Kaldu & Bubur Beras Wangi",
    hargaPerKgEst: 14000
  }
];

module.exports = {
  JATIM_PRIORITY_REGIONS,
  JATIM_LOCAL_COMMODITIES
};
