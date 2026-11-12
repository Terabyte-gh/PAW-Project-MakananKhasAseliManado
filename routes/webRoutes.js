const express = require('express');
const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', homeController.index);
router.get('/admin/login', authController.loginPage);
router.post('/admin/login', authController.login);
router.post('/admin/logout', authController.logout);

module.exports = router;
