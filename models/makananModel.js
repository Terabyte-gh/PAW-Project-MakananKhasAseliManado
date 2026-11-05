const pool = require('../config/database');

async function getAllMakanan() {
  const result = await pool.query(
    'SELECT id_makanan, makanan, harga, stok, deskripsi FROM makanan ORDER BY id_makanan'
  );
  return result.rows;
}

async function createMakanan({ makanan, harga, stok, deskripsi }) {
  const result = await pool.query(
    `INSERT INTO makanan (makanan, harga, stok, deskripsi)
     VALUES ($1, $2, $3, $4)
     RETURNING id_makanan, makanan, harga, stok, deskripsi`,
    [makanan, String(harga), String(stok), deskripsi]
  );
  return result.rows[0];
}

module.exports = { getAllMakanan, createMakanan };
