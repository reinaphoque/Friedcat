const crypto = require('crypto');

const getAppUrl = (req) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$, '');
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
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
};

const verifySession = (token) => {
  if (!token || typeof token !== 'string') return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || 'vercel-session-secret';
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch (e) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch (err) {
    return null;
  }
};

module.exports = {
  getAppUrl,
  createJsonResponse,
  createHtmlResponse,
  signSession,
  verifySession,
};
