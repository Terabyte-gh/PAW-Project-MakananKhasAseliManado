const config = require('../config/config');
const { getAllMakanan } = require('../models/makananModel');
const { formatRupiah } = require('../utils/format');

async function index(req, res) {
  const produk = await getAllMakanan();

  res.render('index', {
    appName: config.appName,
    produk,
    formatRupiah,
  });
}

module.exports = { index };
