const crypto = require('crypto');
const auth = require('../middlewares/adminAuth');

function loginPage(req, res) {
  res.locals.loginError = req.query.error ? 'Username atau password salah.' : '';
  res.render('login', { appName: require('../config/config').appName });
}

function login(req, res) {
  const username = String(req.body.username || '');
  const password = String(req.body.password || '');
  const expectedUser = process.env.ADMIN_USERNAME || '';
  const expectedHash = process.env.ADMIN_PASSWORD_HASH || '';
  const userBuffer = Buffer.from(username);
  const expectedBuffer = Buffer.from(expectedUser);
  const userMatches = expectedBuffer.length > 0 && userBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(userBuffer, expectedBuffer);
  const passwordMatches = password.length > 0 && auth.verifyPassword(password, expectedHash);

  if (!userMatches || !passwordMatches) return res.redirect('/admin/login?error=1');
  auth.createSession(res);
  res.redirect('/');
}

function logout(req, res) {
  auth.destroySession(req, res);
  res.redirect('/');
}

module.exports = { loginPage, login, logout };
