const express = require('express');
const apiController = require('../controllers/apiController');
const { requireAdmin } = require('../middlewares/adminAuth');

const router = express.Router();

router.get('/status', apiController.getStatus);
router.post('/chat', apiController.postChat);
router.get('/produk', apiController.getProduk);
router.get('/produk/:id', apiController.getProdukById);
router.post('/produk', requireAdmin, apiController.createProduk);
router.put('/produk/:id', requireAdmin, apiController.updateProduk);
router.delete('/produk/:id', requireAdmin, apiController.deleteProduk);

module.exports = router;
