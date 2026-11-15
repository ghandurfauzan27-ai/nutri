/**
 * Database Storage Adapter untuk NutriTrack Jatim
 * Mendukung 2 Mode Otomatis:
 * 1. Cloud PostgreSQL (via DATABASE_URL dari Railway / Supabase / Neon)
 * 2. File-Based JSON Storage (untuk offline / localhost development)
 * 
 * Sesuai SKPL NutriTrack Jatim v1.0
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DB_DIR = path.resolve(__dirname, "../../data/db");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let pgPool = null;
let pgInitialized = false;

if (process.env.DATABASE_URL) {
  try {
    const isLocalhost = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalhost ? false : { rejectUnauthorized: false }
    });
    console.log("Terhubung ke Cloud PostgreSQL (DATABASE_URL terdeteksi).");
  } catch (err) {
    console.warn("Gagal inisialisasi koneksi PostgreSQL, menggunakan fallback JSON:", err.message);
    pgPool = null;
  }
}

// Inisialisasi Tabel PostgreSQL jika tersedia
async function initPgTable() {
  if (!pgPool || pgInitialized) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS app_collections (
        name VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    pgInitialized = true;
    console.log("Tabel PostgreSQL 'app_collections' siap digunakan.");
  } catch (err) {
    console.error("Gagal inisialisasi tabel PostgreSQL:", err.message);
  }
}

// Jalankan inisialisasi di background
if (pgPool) {
  initPgTable();
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DB_DIR, `${name}.json`);
    this.memoryCache = null;

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf8");
    }

    // Jika PostgreSQL aktif, load data dari PG
    if (pgPool) {
      this._loadFromPg();
    }
  }

  async _loadFromPg() {
    if (!pgPool) return;
    try {
      await initPgTable();
      const res = await pgPool.query("SELECT data FROM app_collections WHERE name = $1", [this.name]);
      if (res.rows.length > 0 && Array.isArray(res.rows[0].data)) {
        this.memoryCache = res.rows[0].data;
        // Backup ke file lokal
        fs.writeFileSync(this.filePath, JSON.stringify(this.memoryCache, null, 2), "utf8");
      } else {
        // Jika di PG belum ada, upload data lokal awal ke PG
        const localData = this._readFromFile();
        await pgPool.query(
          "INSERT INTO app_collections (name, data) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP",
          [this.name, JSON.stringify(localData)]
        );
        this.memoryCache = localData;
      }
    } catch (err) {
      console.warn(`[PG Load ${this.name}] Menggunakan fallback lokal:`, err.message);
    }
  }

  _readFromFile() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(raw || "[]");
    } catch (err) {
      console.error(`Gagal membaca koleksi ${this.name}:`, err);
      return [];
    }
  }

  _read() {
    if (this.memoryCache !== null) {
      return this.memoryCache;
    }
    this.memoryCache = this._readFromFile();
    return this.memoryCache;
  }

  _write(data) {
    this.memoryCache = data;

    // 1. Tulis ke file lokal
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`Gagal menulis file koleksi ${this.name}:`, err);
    }

    // 2. Sinkronkan ke PostgreSQL jika aktif
    if (pgPool) {
      pgPool.query(
        "INSERT INTO app_collections (name, data) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP",
        [this.name, JSON.stringify(data)]
      ).catch((err) => {
        console.error(`Gagal sinkronisasi ${this.name} ke PostgreSQL:`, err.message);
      });
    }

    return true;
  }

  find(filterFn = null) {
    const items = this._read();
    if (!filterFn) return items;
    return items.filter(filterFn);
  }

  findOne(filterFn) {
    const items = this._read();
    return items.find(filterFn) || null;
  }

  findById(id) {
    const items = this._read();
    return items.find((item) => item.id === id || item._id === id || item.child_id === id || item.user_id === id) || null;
  }

  create(record) {
    const items = this._read();
    const newRecord = {
      ...record,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newRecord);
    this._write(items);
    return newRecord;
  }

  createMany(records) {
    const items = this._read();
    const created = records.map((record) => ({
      ...record,
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    items.unshift(...created);
    this._write(items);
    return created;
  }

  update(id, updates) {
    const items = this._read();
    const index = items.findIndex(
      (item) => item.id === id || item._id === id || item.child_id === id || item.user_id === id || item.qrToken === id
    );
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._write(items);
    return items[index];
  }

  delete(id) {
    const items = this._read();
    const index = items.findIndex(
      (item) => item.id === id || item._id === id || item.child_id === id || item.user_id === id
    );
    if (index === -1) return false;
    items.splice(index, 1);
    this._write(items);
    return true;
  }

  count(filterFn = null) {
    const items = this.find(filterFn);
    return items.length;
  }

  clear() {
    this._write([]);
    return true;
  }
}

// Inisialisasi koleksi tabel sesuai SKPL NutriTrack Jatim v1.0
const db = {
  users: new Collection("users"),
  children: new Collection("children"),
  growth_records: new Collection("growth_records"),
  recipes: new Collection("recipes"),
  distributions: new Collection("distributions"),
  consumption_logs: new Collection("consumption_logs"),
  supply_logs: new Collection("supply_logs"),
  districts: new Collection("districts"),
  pgPool
};

module.exports = db;
