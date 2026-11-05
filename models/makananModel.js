const pool = require('../config/database');

async function getAllMakanan() {
  const result = await pool.query(
    'SELECT id_makanan, makanan, harga, stok, deskripsi FROM makanan ORDER BY id_makanan'
  );
  return result.rows;
}

async function getMakananById(id) {
  const result = await pool.query(
    'SELECT id_makanan, makanan, harga, stok, deskripsi FROM makanan WHERE id_makanan = $1',
    [id]
  );
  return result.rows[0];
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

async function updateMakanan(id, { makanan, harga, stok, deskripsi }) {
  const result = await pool.query(
    `UPDATE makanan
     SET makanan = $1, harga = $2, stok = $3, deskripsi = $4
     WHERE id_makanan = $5
     RETURNING id_makanan, makanan, harga, stok, deskripsi`,
    [makanan, String(harga), String(stok), deskripsi, id]
  );
  return result.rows[0];
}

async function deleteMakanan(id) {
  const result = await pool.query(
    'DELETE FROM makanan WHERE id_makanan = $1 RETURNING id_makanan, makanan, harga, stok, deskripsi',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllMakanan,
  getMakananById,
  createMakanan,
  updateMakanan,
  deleteMakanan,
};
