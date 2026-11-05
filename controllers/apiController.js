const config = require('../config/config');
const {
  getAllMakanan,
  getMakananById,
  createMakanan,
  updateMakanan,
  deleteMakanan,
} = require('../models/makananModel');

function getStatus(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Server berjalan dengan baik',
    app: config.appName,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} detik`,
  });
}

function idValid(id) {
  return /^\d+$/.test(String(id));
}

function validasiProduk(body) {
  const { makanan, harga, stok, deskripsi } = body || {};
  const wajib = { makanan, harga, stok, deskripsi };
  const kosong = Object.keys(wajib).filter((key) => !String(wajib[key] ?? '').trim());

  if (kosong.length > 0) {
    return { error: `Field wajib belum diisi: ${kosong.join(', ')}` };
  }

  if (String(makanan).length > 50 || String(deskripsi).length > 256) {
    return { error: 'makanan maksimal 50 karakter, deskripsi maksimal 256 karakter' };
  }

  const hargaAngka = String(harga).replace(/[^0-9]/g, '');
  const stokAngka = String(stok).replace(/[^0-9]/g, '');

  if (!hargaAngka || !stokAngka) {
    return { error: 'harga dan stok harus berupa angka' };
  }

  return {
    data: {
      makanan: String(makanan).trim(),
      harga: hargaAngka,
      stok: stokAngka,
      deskripsi: String(deskripsi).trim(),
    },
  };
}

async function getProduk(req, res) {
  const produk = await getAllMakanan();
  res.status(200).json(produk);
}

async function getProdukById(req, res) {
  if (!idValid(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID produk tidak valid' });
  }

  const produk = await getMakananById(req.params.id);

  if (!produk) {
    return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });
  }

  res.status(200).json(produk);
}

async function createProduk(req, res) {
  const { error, data } = validasiProduk(req.body);

  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  const produk = await createMakanan(data);
  res.status(201).json(produk);
}

async function updateProduk(req, res) {
  if (!idValid(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID produk tidak valid' });
  }

  const { error, data } = validasiProduk(req.body);

  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  const produk = await updateMakanan(req.params.id, data);

  if (!produk) {
    return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });
  }

  res.status(200).json(produk);
}

async function deleteProduk(req, res) {
  if (!idValid(req.params.id)) {
    return res.status(400).json({ status: 'error', message: 'ID produk tidak valid' });
  }

  const produk = await deleteMakanan(req.params.id);

  if (!produk) {
    return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Produk berhasil dihapus',
    data: produk,
  });
}

module.exports = {
  getStatus,
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
};
