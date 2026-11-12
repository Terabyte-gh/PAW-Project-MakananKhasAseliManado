const crypto = require('crypto');

const sessions = new Map();
const cookieName = 'manado_admin';
const maxAgeMs = 8 * 60 * 60 * 1000;
const secureCookie = process.env.NODE_ENV === 'production';

function cookieOptions() {
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(maxAgeMs / 1000)}${secureCookie ? '; Secure' : ''}`;
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  const entry = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  return entry ? entry.slice(cookieName.length + 1) : '';
}

function sessionFor(req) {
  const token = readCookie(req);
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session;
}

function requireAdmin(req, res, next) {
  const session = sessionFor(req);
  if (!session) {
    return res.status(401).json({ status: 'error', message: 'Login admin diperlukan.' });
  }
  const csrf = req.get('x-csrf-token') || req.body?._csrf;
  const csrfBuffer = Buffer.from(String(csrf || ''));
  const expectedCsrfBuffer = Buffer.from(session.csrf);
  if (csrfBuffer.length !== expectedCsrfBuffer.length || !crypto.timingSafeEqual(csrfBuffer, expectedCsrfBuffer)) {
    return res.status(403).json({ status: 'error', message: 'Token keamanan tidak valid.' });
  }
  req.admin = true;
  next();
}

function viewAdmin(req, res, next) {
  const session = sessionFor(req);
  res.locals.isAdmin = Boolean(session);
  res.locals.csrfToken = session?.csrf || '';
  next();
}

function createSession(res) {
  for (const [token, session] of sessions) {
    if (session.expiresAt < Date.now()) sessions.delete(token);
  }
  const token = crypto.randomBytes(32).toString('base64url');
  const csrf = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { csrf, expiresAt: Date.now() + maxAgeMs });
  res.setHeader('Set-Cookie', `${cookieName}=${token}; ${cookieOptions()}`);
  return csrf;
}

function destroySession(req, res) {
  const token = readCookie(req);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookie ? '; Secure' : ''}`);
}

function verifyPassword(password, encoded) {
  const [algorithm, salt, expected] = String(encoded || '').split('$');
  if (algorithm !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(expected || '')) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

module.exports = { requireAdmin, viewAdmin, createSession, destroySession, verifyPassword };
