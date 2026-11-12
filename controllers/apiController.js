const config = require('../config/config');
const { searchMakananForChat } = require('../models/makananModel');
const { jawabTentangMakanan } = require('../services/gemini.service');
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

async function postChat(req, res) {
  const pertanyaan = String(req.body?.message || '').trim();
  if (!pertanyaan || pertanyaan.length > 500) {
    return res.status(400).json({
      status: 'error',
      message: 'Pertanyaan wajib diisi dan maksimal 500 karakter.',
    });
  }

  const normalized = pertanyaan.toLocaleLowerCase('id-ID').replace(/[!?.,]+/g, ' ').trim();
  const greetingOnly = /^(halo|hai|hi|hello|hei|pagi|selamat pagi|siang|selamat siang|sore|selamat sore|malam|selamat malam|apa kabar|assalamualaikum|assalamu alaikum|permisi|bang|bro|bg)( semua)?$/i.test(normalized);
  if (greetingOnly) {
    return res.status(200).json({
      status: 'success',
      reply: 'Halo, bro! 👋 Mau tanya nama makanan, harga, stok, atau deskripsi yang ada di katalog?',
    });
  }

  const produk = await searchMakananForChat(pertanyaan);
  if (produk.length === 0) {
    const topikKatalog = /\b(makanan|menu|produk|harga|stok|deskripsi|berapa|ada|jual|jualan|katalog)\b/i.test(pertanyaan);
    return res.status(200).json({
      status: 'success',
      reply: topikKatalog
        ? 'Maaf, bro. Informasi itu tidak ada di data makanan kami.'
        : 'Waduh bro! Itu di luar kemampuan saya. Saya cuma bisa bantu soal makanan yang ada di katalog.',
    });
  }

  try {
    const reply = await jawabTentangMakanan(pertanyaan, produk);
    res.status(200).json({ status: 'success', reply });
  } catch (error) {
    if (!error.status) throw error;
    res.status(error.status).json({ status: 'error', message: error.message });
  }
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
  postChat,
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
};
