const config = require('../config/config');
const { getAllProduk } = require('../models/produkModel');

function getStatus(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Server berjalan dengan baik',
    app: config.appName,
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} detik`,
  });
}

function getProduk(req, res) {
  res.status(200).json(getAllProduk());
}

module.exports = { getStatus, getProduk };
