/**
 * Database Storage Adapter untuk NutriTrack Jatim
 * Menggunakan JSON File-Based Document Engine yang ringan, cepat, mandiri,
 * tanpa membutuhkan server eksternal atau dependensi C++ native.
 * Sangat mudah dijalankan di localhost dengan 1 klik!
 */

const fs = require("fs");
const path = require("path");

const DB_DIR = path.resolve(__dirname, "../../data/db");

// Pastikan direktori database ada
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DB_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf8");
    }
  }

  _read() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(raw || "[]");
    } catch (err) {
      console.error(`Gagal membaca koleksi ${this.name}:`, err);
      return [];
    }
  }

  _write(data) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error(`Gagal menulis koleksi ${this.name}:`, err);
      return false;
    }
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
  districts: new Collection("districts")
};

module.exports = db;
