const config = require('../config/config');
const { getAllMakanan, createMakanan } = require('../models/makananModel');

function getStatus(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Server berjalan dengan baik',
    app: config.appName,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} detik`,
  });
}

async function getProduk(req, res) {
  const produk = await getAllMakanan();
  res.status(200).json(produk);
}

async function createProduk(req, res) {
  const { makanan, harga, stok, deskripsi } = req.body || {};
  const wajib = { makanan, harga, stok, deskripsi };
  const kosong = Object.keys(wajib).filter((key) => !String(wajib[key] ?? '').trim());

  if (kosong.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: `Field wajib belum diisi: ${kosong.join(', ')}`,
    });
  }

  if (String(makanan).length > 50 || String(deskripsi).length > 256) {
    return res.status(400).json({
      status: 'error',
      message: 'makanan maksimal 50 karakter, deskripsi maksimal 256 karakter',
    });
  }

  const hargaAngka = String(harga).replace(/[^0-9]/g, '');
  const stokAngka = String(stok).replace(/[^0-9]/g, '');

  if (!hargaAngka || !stokAngka) {
    return res.status(400).json({
      status: 'error',
      message: 'harga dan stok harus berupa angka',
    });
  }

  const produk = await createMakanan({
    makanan: String(makanan).trim(),
    harga: hargaAngka,
    stok: stokAngka,
    deskripsi: String(deskripsi).trim(),
  });

  res.status(201).json(produk);
}

module.exports = { getStatus, getProduk, createProduk };
