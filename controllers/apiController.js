const config = require('../config/config');
const { searchMakananForChat } = require('../models/makananModel');
const { jawabTentangMakanan } = require('../services/gemini.service');
const crypto = require('crypto');
const pesananModel = require('../models/pesananModel');
const { formatRupiah } = require('../utils/format');
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
  const greetingOnly = /^(halo|hai|hi|hello|hei|pagi|selamat pagi|siang|selamat siang|sore|selamat sore|malam|selamat malam|apa kabar|assalamualaikum|assalamu alaikum|permisi|bang|bro|bg)( semua)?( bang| bro| kak| mas| mbak| gan| min)?$/i.test(normalized);
  if (greetingOnly) {
    return res.status(200).json({
      status: 'success',
      reply: 'Halo, bro! 👋 Mau lihat menu, pesan makanan, atau tanya harga, stok, dan deskripsi menu? Kamu bisa pilih tombol yang tersedia di chat ini.',
    });
  }

  const tanyaJamBuka = /\b(jam buka|jam operasional|operasional|buka jam berapa|jam berapa buka|tutup jam berapa|jam berapa tutup|sampai jam berapa|buka setiap hari|setiap hari buka|buka hari apa|hari apa buka)\b/i.test(normalized);
  if (tanyaJamBuka) {
    return res.status(200).json({
      status: 'success',
      reply: 'Kami buka setiap hari pukul 08.00 sampai 20.00 WITA.',
    });
  }

  const tanyaDaftarMenu = /^(lihat\s+)?(menu|daftar menu|daftar makanan|daftar produk|menu apa saja|menu apa aja|makanan apa saja|makanan apa aja|produk apa saja|produk apa aja|semua makanan|semua produk)$/i.test(normalized);
  if (tanyaDaftarMenu) {
    const produk = await getAllMakanan();
    const daftar = produk.map((item) => `${item.makanan} — ${formatRupiah(item.harga)}`);
    return res.status(200).json({
      status: 'success',
      reply: daftar.length ? `Menu yang tersedia:\n${daftar.join('\n')}` : 'Belum ada menu yang tersedia saat ini.',
    });
  }

  const produk = await searchMakananForChat(pertanyaan);
  if (produk.length === 0) {
    const faqBelumTersedia = /\b(area antar|wilayah antar|jangkauan antar|bisa antar|ongkir|pengantaran)\b/i.test(pertanyaan);
    const topikKatalog = /\b(makanan|menu|produk|harga|stok|deskripsi|berapa|ada|jual|jualan|katalog)\b/i.test(pertanyaan);
    return res.status(200).json({
      status: 'success',
      reply: faqBelumTersedia
        ? 'Pengantaran saat ini hanya tersedia di daerah Manado.'
        : topikKatalog
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

async function createPesanan(req, res) {
  const nama = String(req.body?.nama || '').trim();
  const idMakanan = String(req.body?.id_makanan || '').trim();
  const jumlah = Number(req.body?.jumlah);
  const tanggal = String(req.body?.tanggal_acara || '').trim();
  const alamat = String(req.body?.alamat || '').trim();
  const latitudeRaw = req.body?.latitude;
  const longitudeRaw = req.body?.longitude;
  const lokasiManual = req.body?.lokasi_manual === true;
  const hasLatitude = latitudeRaw !== undefined && latitudeRaw !== null && latitudeRaw !== '';
  const hasLongitude = longitudeRaw !== undefined && longitudeRaw !== null && longitudeRaw !== '';
  const latitude = !lokasiManual && hasLatitude ? Number(latitudeRaw) : null;
  const longitude = !lokasiManual && hasLongitude ? Number(longitudeRaw) : null;
  if (!nama || nama.length > 100 || !idValid(idMakanan) || !Number.isInteger(jumlah) || jumlah < 1 || jumlah > 10000 || !alamat || alamat.length > 500 || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || (!lokasiManual && (!hasLatitude || !hasLongitude)) || (!lokasiManual && (hasLatitude !== hasLongitude || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180))) {
    return res.status(400).json({ status: 'error', message: 'Nama, menu, jumlah porsi, tanggal, dan alamat harus diisi dengan benar.' });
  }
  if (lokasiManual && !/\bmanado\b/i.test(alamat)) {
    return res.status(400).json({ status: 'error', message: 'Untuk alamat manual, cantumkan kata "Manado" pada alamat.' });
  }
  if (hasLatitude && jarakMeter(latitude, longitude, 1.482384, 124.840379) > 15000) {
    return res.status(400).json({ status: 'error', message: 'Lokasi pengantaran harus berada di sekitar Manado.' });
  }
  const tanggalValid = new Date(`${tanggal}T00:00:00Z`);
  if (Number.isNaN(tanggalValid.getTime()) || tanggalValid.toISOString().slice(0, 10) !== tanggal) {
    return res.status(400).json({ status: 'error', message: 'Tanggal acara tidak valid.' });
  }
  const makanan = await getMakananById(idMakanan);
  if (!makanan) return res.status(404).json({ status: 'error', message: 'Menu tidak ditemukan.' });

  const kode = `MAN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const pesanan = await pesananModel.buatPesanan({
    kode, nama, makanan: makanan.makanan, jumlah, tanggal, alamat, latitude, longitude,
    total: Number(makanan.harga) * jumlah,
  });
  res.status(201).json({ status: 'success', message: 'Pesanan berhasil dicatat.', data: pesanan });
}

function jarakMeter(lat1, lon1, lat2, lon2) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getStatusPesanan(req, res) {
  const kode = String(req.params.kode || '').trim().toUpperCase();
  const pesanan = await pesananModel.getPesananByKode(kode);
  if (!pesanan) return res.status(404).json({ status: 'error', message: 'Kode pesanan tidak ditemukan.' });
  res.status(200).json({ status: 'success', data: pesanan });
}

async function getPesanan(req, res) {
  res.status(200).json(await pesananModel.getAllPesanan());
}

async function updateStatusPesanan(req, res) {
  if (!idValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'ID pesanan tidak valid.' });
  const status = String(req.body?.status || '');
  if (!['Baru', 'Diproses', 'Selesai'].includes(status)) {
    return res.status(400).json({ status: 'error', message: 'Status harus Baru, Diproses, atau Selesai.' });
  }
  const pesanan = await pesananModel.updateStatusPesanan(req.params.id, status);
  if (!pesanan) return res.status(404).json({ status: 'error', message: 'Pesanan tidak ditemukan.' });
  res.status(200).json({ status: 'success', data: pesanan });
}

module.exports = {
  getStatus,
  postChat,
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  createPesanan,
  getStatusPesanan,
  getPesanan,
  updateStatusPesanan,
};
