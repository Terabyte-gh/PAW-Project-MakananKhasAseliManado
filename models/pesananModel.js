const pool = require('../config/database');

async function buatPesanan({ kode, nama, makanan, jumlah, tanggal, alamat, total }) {
  const result = await pool.query(
    `INSERT INTO pesanan
      (kode_pesanan, nama_pelanggan, makanan, jumlah_porsi, tanggal_acara, alamat, total_harga)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_pesanan, kode_pesanan, nama_pelanggan, makanan, jumlah_porsi,
       tanggal_acara, alamat, total_harga, status, dibuat_pada`,
    [kode, nama, makanan, jumlah, tanggal, alamat, total]
  );
  return result.rows[0];
}

async function getPesananByKode(kode) {
  const result = await pool.query(
    `SELECT kode_pesanan, status, dibuat_pada
     FROM pesanan WHERE kode_pesanan = $1`,
    [kode]
  );
  return result.rows[0];
}

async function getAllPesanan() {
  const result = await pool.query(
    `SELECT id_pesanan, kode_pesanan, nama_pelanggan, makanan, jumlah_porsi,
       tanggal_acara, alamat, total_harga, status, dibuat_pada
     FROM pesanan ORDER BY dibuat_pada DESC`
  );
  return result.rows;
}

async function updateStatusPesanan(id, status) {
  const result = await pool.query(
    `UPDATE pesanan SET status = $1 WHERE id_pesanan = $2
     RETURNING id_pesanan, kode_pesanan, status`,
    [status, id]
  );
  return result.rows[0];
}

module.exports = { buatPesanan, getPesananByKode, getAllPesanan, updateStatusPesanan };
