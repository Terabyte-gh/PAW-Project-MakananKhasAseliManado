const config = require('../config/config');
const { getAllMakanan } = require('../models/makananModel');
const { getAllPesanan } = require('../models/pesananModel');
const { formatRupiah } = require('../utils/format');

async function index(req, res) {
  const produk = await getAllMakanan();
  const pesanan = res.locals.isAdmin ? await getAllPesanan() : [];

  res.render('index', {
    appName: config.appName,
    produk,
    pesanan,
    formatRupiah,
  });
}

module.exports = { index };
