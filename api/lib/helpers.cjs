const crypto = require('crypto');

const getAppUrl = (req) => {
  if (process.env.APP_URL) {
    return String(process.env.APP_URL).replace(/\/+$/, '');
  }
  const host = req.headers?.host || 'localhost:3000';
  const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'https';
  return `${proto}://${host}`.replace(/\/+$/, '');
};

const createJsonResponse = (res, statusCode, body) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token, Authorization');
  res.statusCode = statusCode;
  res.end(JSON.stringify(body));
};

const createHtmlResponse = (res, statusCode, html) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = statusCode;
  res.end(html);
};

const signSession = (payload) => {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || 'vercel-session-secret';
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
};

const verifySession = (token) => {
  if (!token || typeof token !== 'string') return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || 'vercel-session-secret';
  const expected = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch (err) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch (err) {
    return null;
  }
  if (!data.exp || Date.now() > data.exp) return null;
  return data;
};

/** Reads the admin token from either the X-Admin-Token or Authorization header. */
const extractToken = (req) => req.headers['x-admin-token'] || req.headers['authorization'] || null;

/** Collects a text body from a Node.js IncomingMessage stream. */
const collectBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

/** Collects a binary body from a Node.js IncomingMessage stream. */
const collectBinaryBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});

module.exports = {
  getAppUrl,
  createJsonResponse,
  createHtmlResponse,
  signSession,
  verifySession,
  extractToken,
  collectBody,
  collectBinaryBody,
};
