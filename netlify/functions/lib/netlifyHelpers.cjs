const crypto = require("crypto");

const getNetlifyToken = () => {
  return (
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    process.env.NETLIFY_API_TOKEN ||
    process.env.NETLIFY_ACCESS_TOKEN ||
    ""
  );
};

const getSiteId = () => {
  return process.env.NETLIFY_SITE_ID || process.env.SITE_ID || "";
};

const getAppUrl = (event) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  const host = event.headers?.host || "localhost:8888";
  const proto = event.headers?.["x-forwarded-proto"] || event.headers?.["x-forwarded-protocol"] || "https";
  return `${proto}://${host}`.replace(/\/+$/, "");
};

const ensureAuth = () => {
  const token = getNetlifyToken();
  if (!token) {
    throw new Error("Missing Netlify API token. Set NETLIFY_AUTH_TOKEN or NETLIFY_API_TOKEN in Netlify environment variables.");
  }
  return token;
};

const ensureSiteId = () => {
  const siteId = getSiteId();
  if (!siteId) {
    throw new Error("Missing Netlify site ID. Set NETLIFY_SITE_ID in Netlify environment variables.");
  }
  return siteId;
};

const urlBase = "https://api.netlify.com";

const createJsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token, Authorization",
  },
  body: JSON.stringify(body),
});

const createHtmlResponse = (statusCode, html) => ({
  statusCode,
  headers: {
    "Content-Type": "text/html",
    "Access-Control-Allow-Origin": "*",
  },
  body: html,
});

const signSession = (payload) => {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || "netlify-blob-secret";
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
};

const verifySession = (token) => {
  if (!token || typeof token !== "string") return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || "netlify-blob-secret";
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch (err) {
    return null;
  }
};

module.exports = {
  getAppUrl,
  getNetlifyToken,
  getSiteId,
  ensureAuth,
  ensureSiteId,
  urlBase,
  signSession,
  verifySession,
  createJsonResponse,
  createHtmlResponse,
};
