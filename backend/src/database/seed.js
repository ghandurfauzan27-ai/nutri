/**
 * Script Seeding Otomatis Database NutriTrack Jatim
 * Mengisi Master Data Awal Sesuai SKPL NutriTrack Jatim v1.0
 */

const bcrypt = require("bcryptjs");
const db = require("./db");
const recipesData = require("../data/recipesJatim.json");
const { JATIM_PRIORITY_REGIONS } = require("../config/jatimLocations");
const { assessChildGrowth } = require("../services/zscoreEngine");
const { generateQrToken } = require("../services/qrService");

async function seedDatabase(force = false) {
  if (!force && db.users.count() > 0 && db.children.count() > 0) {
    console.log("Database sudah terisi, melewati proses seeding.");
    return false;
  }

  console.log("Memulai proses seeding database NutriTrack Jatim...");

  // 1. Bersihkan tabel
  db.users.clear();
  db.children.clear();
  db.growth_records.clear();
  db.recipes.clear();
  db.distributions.clear();
  db.consumption_logs.clear();
  db.supply_logs.clear();
  db.districts.clear();

  // 2. Seed Master Districts / Wilayah Prioritas
  for (const reg of JATIM_PRIORITY_REGIONS) {
    db.districts.create({
      id: reg.id,
      nama: reg.nama,
      pulau: reg.pulau,
      kategori: reg.kategori,
      prevalensiPersen: reg.prevalensiPersen,
      totalBalita: reg.totalBalita,
      balitaFaltering: reg.balitaFaltering,
      statusProgram: reg.statusProgram,
      pusatKoordinat: reg.pusatKoordinat,
      kecamatan: reg.kecamatan
    });
  }

  // 3. Seed Users untuk 4 Role Utama (Password default: 'password123')
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);
  const users = [
    {
      id: "USR-001",
      email: "kader.socah@jatim.go.id",
      password: defaultPasswordHash,
      namaLengkap: "Siti Rahmawati, S.Pd",
      role: "kader",
      roleLabel: "Kader Posyandu Mawar 01",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      desa: "Desa Bilaporah",
      posyandu: "Posyandu Mawar 01",
      noHp: "081234567891"
    },
    {
      id: "USR-002",
      email: "dapur.sppg@jatim.go.id",
      password: defaultPasswordHash,
      namaLengkap: "Bambang Supriyanto",
      role: "dapur",
      roleLabel: "Kepala Dapur Pelayanan MBG (SPPG) Socah",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      desa: "Desa Bilaporah",
      noHp: "081234567892"
    },
    {
      id: "USR-003",
      email: "gizi.puskesmas@jatim.go.id",
      password: defaultPasswordHash,
      namaLengkap: "dr. Nurul Hidayati, M.Gizi",
      role: "puskesmas",
      roleLabel: "Nutrisionis Puskesmas Socah",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      noHp: "081234567893"
    },
    {
      id: "USR-004",
      email: "dinkes.jatim@jatimprov.go.id",
      password: defaultPasswordHash,
      namaLengkap: "Dr. dr. Hendro Wahyono, M.Kes",
      role: "dinkes",
      roleLabel: "Kepala Bidang Kesmas Dinkes Prov. Jatim & TPID",
      kabupaten: "Provinsi Jawa Timur",
      noHp: "081234567894"
    },
    {
      id: "USR-005",
      email: "orangtua.ahmad@gmail.com",
      password: defaultPasswordHash,
      namaLengkap: "Ibu Siti Rahayu",
      role: "orangtua",
      roleLabel: "Ibu Balita Ahmad Fauzi",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      desa: "Desa Bilaporah",
      noHp: "081234567895"
    }
  ];

  for (const user of users) {
    db.users.create(user);
  }

  // 4. Seed Recipes MBG Jawa Timur
  for (const r of recipesData) {
    db.recipes.create(r);
  }

  // 5. Seed Children & Growth Records (Fokus Kantong Stunting Jatim)
  const initialChildren = [
    {
      id: "CHD-BKL-001",
      nik: "3505126804240001",
      nama: "Ahmad Fauzi",
      tglLahir: "2025-08-15",
      jenisKelamin: "L",
      namaIbu: "Siti Rahayu",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      desa: "Desa Bilaporah",
      posyandu: "Posyandu Mawar 01",
      alamat: "Dusun Bilaporah RT 02 / RW 01, Socah, Bangkalan",
      noHpOrtu: "081234567895",
      records: [
        { tgl: "2026-08-10", usia: 12, bb: 8.5, tb: 71.5, lk: 44.8 },
        { tgl: "2026-09-12", usia: 13, bb: 8.4, tb: 72.1, lk: 45.0 },
        { tgl: "2026-10-15", usia: 14, bb: 8.4, tb: 72.8, lk: 45.2 }
      ],
      catatanKhusus: "BB stagnan 2 bulan berurutan. Perlu intervensi Paket B ganda protein hewani (Telur Blitar & Lele Lamongan)."
    },
    {
      id: "CHD-BKL-002",
      nik: "3505124502250002",
      nama: "Siti Nur Aisyah",
      tglLahir: "2025-04-10",
      jenisKelamin: "P",
      namaIbu: "Nurul Chotimah",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      desa: "Desa Bilaporah",
      posyandu: "Posyandu Mawar 01",
      alamat: "Dusun Krajan Kidul RT 01 / RW 03",
      noHpOrtu: "081234567812",
      records: [
        { tgl: "2026-08-10", usia: 16, bb: 9.6, tb: 79.4, lk: 45.8 },
        { tgl: "2026-09-12", usia: 17, bb: 9.9, tb: 80.5, lk: 46.1 },
        { tgl: "2026-10-15", usia: 18, bb: 10.2, tb: 81.5, lk: 46.5 }
      ],
      catatanKhusus: "Pertumbuhan sangat baik di zona hijau KIA."
    },
    {
      id: "CHD-SMP-003",
      nik: "3505141209240003",
      nama: "Budi Santoso",
      tglLahir: "2024-10-20",
      jenisKelamin: "L",
      namaIbu: "Dewi Lestari",
      kabupaten: "Kab. Sampang",
      kecamatan: "Kedungdung",
      desa: "Desa Banjarsari",
      posyandu: "Posyandu Melati 03",
      alamat: "Dusun Banjarsari Timur RT 04 / RW 02",
      noHpOrtu: "081234567813",
      records: [
        { tgl: "2026-08-15", usia: 22, bb: 9.9, tb: 79.2, lk: 46.5 },
        { tgl: "2026-09-18", usia: 23, bb: 9.8, tb: 79.8, lk: 46.8 },
        { tgl: "2026-10-20", usia: 24, bb: 9.8, tb: 80.2, lk: 47.0 }
      ],
      catatanKhusus: "Zona Merah: Rujukan terjadwal ke Dokter Spesialis Anak Puskesmas Kedungdung."
    },
    {
      id: "CHD-JBR-004",
      nik: "3509192408250004",
      nama: "Muhammad Dimas",
      tglLahir: "2025-08-24",
      jenisKelamin: "L",
      namaIbu: "Sri Wahyuni",
      kabupaten: "Kab. Jember",
      kecamatan: "Kaliwates",
      desa: "Kelurahan Mangli",
      posyandu: "Posyandu Balita Sehat",
      alamat: "Jl. Hayam Wuruk No. 42 Mangli",
      noHpOrtu: "081234567814",
      records: [
        { tgl: "2026-08-20", usia: 12, bb: 8.6, tb: 72.0, lk: 45.0 },
        { tgl: "2026-09-22", usia: 13, bb: 8.5, tb: 72.6, lk: 45.2 },
        { tgl: "2026-10-24", usia: 14, bb: 8.6, tb: 73.1, lk: 45.4 }
      ],
      catatanKhusus: "Pernah mengalami diare, butuh pemulihan BB dengan telur kukus Blitar."
    },
    {
      id: "CHD-PRO-005",
      nik: "3505147007250005",
      nama: "Zahra Cantika",
      tglLahir: "2025-11-05",
      jenisKelamin: "P",
      namaIbu: "Fitria Andini",
      kabupaten: "Kab. Probolinggo",
      kecamatan: "Krucil",
      desa: "Desa Bermi",
      posyandu: "Posyandu Teratai 01",
      alamat: "Dusun Bermi RT 02 / RW 01, Krucil",
      noHpOrtu: "081234567815",
      records: [
        { tgl: "2026-08-05", usia: 9, bb: 7.3, tb: 67.2, lk: 43.1 },
        { tgl: "2026-09-08", usia: 10, bb: 7.2, tb: 67.8, lk: 43.4 },
        { tgl: "2026-10-10", usia: 11, bb: 7.2, tb: 68.4, lk: 43.6 }
      ],
      catatanKhusus: "Growth faltering terdeteksi, porsi ekstra protein lele & telur Blitar."
    },
    {
      id: "CHD-BLT-006",
      nik: "3505145501250004",
      nama: "Kevin Pratama",
      tglLahir: "2025-02-12",
      jenisKelamin: "L",
      namaIbu: "Endang Susilowati",
      kabupaten: "Kab. Blitar",
      kecamatan: "Sutojayan",
      desa: "Desa Pandanarum",
      posyandu: "Posyandu Anggrek 02",
      alamat: "Dusun Pandanarum Barat",
      noHpOrtu: "081234567816",
      records: [
        { tgl: "2026-08-11", usia: 18, bb: 10.8, tb: 82.5, lk: 47.2 },
        { tgl: "2026-09-14", usia: 19, bb: 11.1, tb: 83.6, lk: 47.5 },
        { tgl: "2026-10-18", usia: 20, bb: 11.4, tb: 84.6, lk: 47.8 }
      ],
      catatanKhusus: "Gizi normal, mengonsumsi menu reguler sehat."
    }
  ];

  for (const item of initialChildren) {
    const rawRecords = item.records;
    let lastAssessment = null;

    // Masukkan riwayat pengukuran antropometri
    for (let i = 0; i < rawRecords.length; i++) {
      const rec = rawRecords[i];
      const prevSlice = rawRecords.slice(0, i);

      const assessment = assessChildGrowth({
        ageMonths: rec.usia,
        gender: item.jenisKelamin,
        weightKg: rec.bb,
        heightCm: rec.tb,
        headCircumferenceCm: rec.lk,
        previousRecords: prevSlice
      });

      lastAssessment = assessment;

      db.growth_records.create({
        childId: item.id,
        recordDate: rec.tgl,
        ageMonths: rec.usia,
        weightKg: rec.bb,
        heightCm: rec.tb,
        headCircumferenceCm: rec.lk,
        zBBU: assessment.zScores.zBBU,
        zTBU: assessment.zScores.zTBU,
        zBBTB: assessment.zScores.zBBTB,
        kurvaKIA: assessment.kurvaKIA.warna,
        statusNutrisi: assessment.status.statusNutrisi,
        isFaltering: assessment.status.isFaltering,
        paketMBG: assessment.preskripsiMBG.paketMBG
      });
    }

    const latestRec = rawRecords[rawRecords.length - 1];

    db.children.create({
      id: item.id,
      nik: item.nik,
      nama: item.nama,
      tglLahir: item.tglLahir,
      usiaBulan: latestRec.usia,
      jenisKelamin: item.jenisKelamin,
      namaIbu: item.namaIbu,
      kabupaten: item.kabupaten,
      kecamatan: item.kecamatan,
      desa: item.desa,
      posyandu: item.posyandu,
      alamat: item.alamat,
      noHpOrtu: item.noHpOrtu,
      bbKg: latestRec.bb,
      tbCm: latestRec.tb,
      lingkarKepalaCm: latestRec.lk,
      zBBU: lastAssessment.zScores.zBBU,
      zTBU: lastAssessment.zScores.zTBU,
      zBBTB: lastAssessment.zScores.zBBTB,
      kurvaKIA: lastAssessment.kurvaKIA.warna,
      statusNutrisi: lastAssessment.status.statusNutrisi,
      paketMBG: lastAssessment.preskripsiMBG.paketMBG,
      isFaltering: lastAssessment.status.isFaltering,
      catatan: item.catatanKhusus
    });
  }

  // 6. Seed MBG Distributions & Token QR (SKPL-F08 & F10)
  const distributions = [
    {
      childId: "CHD-BKL-001",
      namaAnak: "Ahmad Fauzi",
      tipePaket: "Paket B (Intervensi Protein Hewani Ganda)",
      posyandu: "Posyandu Mawar 01",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      waktuKirim: "07:30 WIB",
      status: "Diterima",
      dayaTerima: "Habis (100%)",
      verifiedAt: "2026-11-13T08:15:00+07:00",
      verifiedBy: "Kader Siti (Posyandu Mawar 01)",
      menuId: "RCP-JTM-001",
      menuNama: "Nasi Tim Hati Ayam & Lele Asap Lamongan + Porsi Dobel Telur Blitar"
    },
    {
      childId: "CHD-BKL-002",
      namaAnak: "Siti Nur Aisyah",
      tipePaket: "Paket A (Gizi Seimbang Reguler)",
      posyandu: "Posyandu Mawar 01",
      kabupaten: "Kab. Bangkalan",
      kecamatan: "Socah",
      waktuKirim: "07:30 WIB",
      status: "Diterima",
      dayaTerima: "Habis (100%)",
      verifiedAt: "2026-11-13T08:22:00+07:00",
      verifiedBy: "Ibu Nurul Chotimah (Orang Tua)",
      menuId: "RCP-JTM-003",
      menuNama: "Nasi Tim Beras Lokal Jatim + Kuah Bayam + Tempe Mendoan + Suwir Ayam"
    },
    {
      childId: "CHD-SMP-003",
      namaAnak: "Budi Santoso",
      tipePaket: "Paket B (Intervensi Protein Hewani Ganda)",
      posyandu: "Posyandu Melati 03",
      kabupaten: "Kab. Sampang",
      kecamatan: "Kedungdung",
      waktuKirim: "07:45 WIB",
      status: "Diterima",
      dayaTerima: "Tersisa Sebagian (50%)",
      verifiedAt: "2026-11-13T08:40:00+07:00",
      verifiedBy: "Kader Dewi (Posyandu Melati 03)",
      menuId: "RCP-JTM-001",
      menuNama: "Nasi Tim Hati Ayam & Lele Asap Lamongan + Porsi Dobel Telur Blitar"
    },
    {
      childId: "CHD-JBR-004",
      namaAnak: "Muhammad Dimas",
      tipePaket: "Paket B (Intervensi Protein Hewani Ganda)",
      posyandu: "Posyandu Balita Sehat",
      kabupaten: "Kab. Jember",
      kecamatan: "Kaliwates",
      waktuKirim: "08:00 WIB",
      status: "Dikirim",
      dayaTerima: null,
      menuId: "RCP-JTM-002",
      menuNama: "Puree Lembut Ikan Kembung Tulungagung & Telur Kukus Blitar Sayur Kelor"
    },
    {
      childId: "CHD-PRO-005",
      namaAnak: "Zahra Cantika",
      tipePaket: "Paket B (Intervensi Protein Hewani Ganda)",
      posyandu: "Posyandu Teratai 01",
      kabupaten: "Kab. Probolinggo",
      kecamatan: "Krucil",
      waktuKirim: "07:50 WIB",
      status: "Diterima",
      dayaTerima: "Habis (100%)",
      verifiedAt: "2026-11-13T08:35:00+07:00",
      verifiedBy: "Kader Fitria (Posyandu Teratai 01)",
      menuId: "RCP-JTM-001",
      menuNama: "Nasi Tim Hati Ayam & Lele Asap Lamongan + Porsi Dobel Telur Blitar"
    },
    {
      childId: "CHD-BLT-006",
      namaAnak: "Kevin Pratama",
      tipePaket: "Paket A (Gizi Seimbang Reguler)",
      posyandu: "Posyandu Anggrek 02",
      kabupaten: "Kab. Blitar",
      kecamatan: "Sutojayan",
      waktuKirim: "08:00 WIB",
      status: "Dikirim",
      dayaTerima: null,
      menuId: "RCP-JTM-003",
      menuNama: "Nasi Tim Beras Lokal Jatim + Kuah Bayam + Tempe Mendoan + Suwir Ayam"
    }
  ];

  for (const dist of distributions) {
    const qrToken = generateQrToken({
      childId: dist.childId,
      packageType: dist.tipePaket,
      kitchenCode: "SPPG-JTM-01"
    });

    const distRecord = db.distributions.create({
      ...dist,
      qrToken,
      tanggal: new Date().toISOString().split("T")[0]
    });

    if (dist.dayaTerima) {
      db.consumption_logs.create({
        distributionId: distRecord.id,
        qrToken,
        childId: dist.childId,
        namaAnak: dist.namaAnak,
        dayaTerima: dist.dayaTerima,
        verifiedAt: dist.verifiedAt,
        verifiedBy: dist.verifiedBy,
        catatan: "Asupan terpantau baik di tingkat posyandu."
      });
    }
  }

  // 7. Seed Supply Logs (Log Belanja Bahan Baku Lokal Jawa Timur)
  const supplyLogs = [
    {
      id: "SP-001",
      tanggal: "2026-11-10",
      pemasok: "Koperasi Peternak Unggas Blitar Jaya",
      lokasi: "Kab. Blitar, Jawa Timur",
      komoditas: "Telur Ayam Ras Segar Grade A Omega-3",
      volumeKg: 350,
      hargaTotalRp: 9450000,
      statusMutu: "Tersertifikasi Segar",
      catatan: "Pengiriman langsung ke Dapur SPPG Socah & Kedungdung."
    },
    {
      id: "SP-002",
      tanggal: "2026-11-10",
      pemasok: "Gapoktan Mina Makmur Lamongan",
      lokasi: "Kab. Lamongan, Jawa Timur",
      komoditas: "Ikan Lele Segar Fillet Bersih",
      volumeKg: 220,
      hargaTotalRp: 6160000,
      statusMutu: "Tersertifikasi Segar",
      catatan: "Pasokan protein hewani lokal kaya kalsium dan fosfor."
    },
    {
      id: "SP-003",
      tanggal: "2026-11-11",
      pemasok: "Kelompok Tani Organik Sumber Makmur",
      lokasi: "Kota Batu & Malang, Jawa Timur",
      komoditas: "Daun Kelor Organik & Labu Madu",
      volumeKg: 120,
      hargaTotalRp: 2160000,
      statusMutu: "Lolos Uji BPOM/Dinkes",
      catatan: "Superfood kaya zat besi dan beta-karoten."
    },
    {
      id: "SP-004",
      tanggal: "2026-11-12",
      pemasok: "Sentra Perajin Tempe Sejahtera Kediri",
      lokasi: "Kab. Kediri, Jawa Timur",
      komoditas: "Tempe Tradisional Kedelai Lokal Non-GMO",
      volumeKg: 180,
      hargaTotalRp: 2700000,
      statusMutu: "Tersertifikasi Segar",
      catatan: "Protein nabati probiotik alami untuk kesehatan usus anak."
    },
    {
      id: "SP-005",
      tanggal: "2026-11-12",
      pemasok: "Kelompok Nelayan Samudera Makmur",
      lokasi: "Kab. Tulungagung, Jawa Timur",
      komoditas: "Ikan Kembung Segar Omega-3",
      volumeKg: 150,
      hargaTotalRp: 5250000,
      statusMutu: "Tersertifikasi Segar",
      catatan: "Kandungan DHA setara salmon dengan harga lokal terjangkau."
    }
  ];

  for (const s of supplyLogs) {
    db.supply_logs.create(s);
  }

  console.log("Seeding database NutriTrack Jatim selesai dengan sukses!");
  return true;
}

if (require.main === module) {
  seedDatabase(true).then(() => {
    process.exit(0);
  });
}

module.exports = {
  seedDatabase
};
