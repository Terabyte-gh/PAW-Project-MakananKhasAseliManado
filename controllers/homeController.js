const config = require('../config/config');
const { getAllProduk } = require('../models/produkModel');
const { formatRupiah } = require('../utils/format');

function index(req, res) {
  res.render('index', {
    appName: config.appName,
    produk: getAllProduk(),
    formatRupiah,
  });
}

module.exports = { index };
