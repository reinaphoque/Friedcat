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
  
  // Validate file size (limit to 50MB for safety)
  const MAX_SIZE_MB = 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error(`Image file too large (${(buffer.length / 1024 / 1024).toFixed(2)}MB). Maximum is ${MAX_SIZE_MB}MB.`);
  }
  
  const extension = contentType.split("/")[1] || "png";
  const cleaned = String(namePrefix).replace(/[^a-zA-Z0-9_-]/g, "_");
  const key = `uploads/${cleaned}_${Date.now()}.${extension}`;
  const store = getBlobStore();
  
  // Convert to Uint8Array for Netlify Blobs API compatibility
  const uint8Array = new Uint8Array(buffer);
  
  try {
    await store.set(key, uint8Array, { metadata: { contentType } });
  } catch (blobError) {
    console.error("Netlify Blobs store.set() failed:", {
      key,
      bufferSize: buffer.length,
      uint8ArraySize: uint8Array.byteLength,
      error: blobError.message
    });
    throw new Error(`Failed to store image in Netlify Blobs: ${blobError.message}`);
  }
  
  return { key, contentType };
};

module.exports = {
  connectBlobs,
  getPortfolioData,
  savePortfolioData,
  uploadBase64Image,
};
