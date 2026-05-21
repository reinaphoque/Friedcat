const path = require("path");
const fs = require("fs");
const { connectLambda, getStore } = require("@netlify/blobs");
const { ensureAuth, ensureSiteId, urlBase } = require("./netlifyHelpers.cjs");

const STORE_NAME = "portfolio-store";
const DEFAULT_PORTFOLIO_PATH = path.join(__dirname, "defaultPortfolio.json");
let DEFAULT_PORTFOLIO = {};
try {
  DEFAULT_PORTFOLIO = JSON.parse(fs.readFileSync(DEFAULT_PORTFOLIO_PATH, "utf8"));
} catch (err) {
  console.error("Failed to load default portfolio fallback:", err);
  DEFAULT_PORTFOLIO = {};
}

const connectBlobs = (event) => {
  if (event && typeof connectLambda === "function") {
    connectLambda(event);
  }
};

const getBlobStore = () => {
  const siteID = ensureSiteId();
  const token = ensureAuth();
  return getStore({
    name: STORE_NAME,
    siteID,
    token,
    apiURL: urlBase,
  });
};

const mergePortfolioData = (defaults, payload) => {
  if (payload === null || payload === undefined) {
    return defaults;
  }
  if (Array.isArray(defaults)) {
    return Array.isArray(payload) ? payload : defaults;
  }
  if (typeof defaults === "object" && defaults !== null) {
    const merged = { ...defaults, ...payload };
    for (const key of Object.keys(defaults)) {
      merged[key] = mergePortfolioData(defaults[key], payload[key]);
    }
    return merged;
  }
  return payload === undefined ? defaults : payload;
};

const getPortfolioData = async () => {
  const store = getBlobStore();
  const data = await store.get("portfolio.json", { type: "json" });
  if (data === null) {
    return DEFAULT_PORTFOLIO;
  }
  return mergePortfolioData(DEFAULT_PORTFOLIO, data);
};

const savePortfolioData = async (payload) => {
  const store = getBlobStore();
  await store.setJSON("portfolio.json", payload);
};

const uploadBase64Image = async (base64String, namePrefix = "upload") => {
  const match = base64String.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 image payload.");
  }

  const contentType = match[1];
  const data = match[2];
  const buffer = Buffer.from(data, "base64");
  const extension = contentType.split("/")[1] || "png";
  const cleaned = String(namePrefix).replace(/[^a-zA-Z0-9_-]/g, "_");
  const key = `uploads/${cleaned}_${Date.now()}.${extension}`;
  const store = getBlobStore();
  
  // Store the buffer directly - Node.js Buffer is a Uint8Array subclass
  // and Netlify Blobs accepts both Uint8Array and ArrayBuffer
  await store.set(key, new Uint8Array(buffer), { metadata: { contentType } });
  return { key, contentType };
};

module.exports = {
  connectBlobs,
  getPortfolioData,
  savePortfolioData,
  uploadBase64Image,
};
