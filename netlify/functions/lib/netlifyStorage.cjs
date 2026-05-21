const path = require("path");
const fs = require("fs");
const { connectLambda, getStore } = require("@netlify/blobs");

const { ensureAuth, ensureSiteId, urlBase, getNetlifyToken, getSiteId } = require("./netlifyHelpers.cjs");
const STORE_NAME = "portfolio-store";
let DEFAULT_PORTFOLIO = {};

try {
  // Try to require the JSON file directly (works better in Lambda runtime)
  DEFAULT_PORTFOLIO = require("./defaultPortfolio.json");
} catch (err) {
  console.error("Failed to load default portfolio fallback via require:", err.message);
  try {
    // Fallback: try reading the file directly
    const DEFAULT_PORTFOLIO_PATH = path.join(__dirname, "defaultPortfolio.json");
    DEFAULT_PORTFOLIO = JSON.parse(fs.readFileSync(DEFAULT_PORTFOLIO_PATH, "utf8"));
    console.log("Loaded default portfolio via fs.readFileSync from:", DEFAULT_PORTFOLIO_PATH);
  } catch (fsErr) {
    console.error("Failed to load default portfolio via fs.readFileSync:", fsErr.message);
    // Last resort: empty object, will rely on Netlify Blobs
    DEFAULT_PORTFOLIO = {};
  }
}

const connectBlobs = (event) => {
  try {
    if (!event) {
      throw new Error("Event object is required for Netlify Blobs connection");
    }
    if (typeof connectLambda !== "function") {
      throw new Error("connectLambda function not available from @netlify/blobs");
    }
    // Verify required env vars BEFORE attempting connection
    const token = getNetlifyToken();
    const siteId = getSiteId();
    if (!token) {
      throw new Error("NETLIFY_AUTH_TOKEN not set - cannot connect to Blobs API");
    }
    if (!siteId) {
      throw new Error("NETLIFY_SITE_ID not set - cannot connect to Blobs API");
    }
    connectLambda(event);
    console.log("✅ Netlify Blobs connection established (Lambda context initialized)");
  } catch (err) {
    console.error("❌ Failed to connect Netlify Blobs:", {
      message: err.message,
      hasToken: !!getNetlifyToken(),
      hasSiteId: !!getSiteId()
    });
    throw err;
  }
};

const getBlobStore = () => {
  try {
    const siteID = ensureSiteId();
    const token = ensureAuth();
    console.log("Creating Netlify Blobs store with siteID:", siteID?.slice(0, 8) + "...");
    return getStore({
      name: STORE_NAME,
      siteID,
      token,
      apiURL: urlBase,
    });
  } catch (err) {
    console.error("Failed to get Netlify Blobs store:", err.message);
    throw err;
  }
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
  // Strict validation of data URL format
  const match = base64String.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid base64 image payload. Must match: data:image/type;base64,<data>");
  }

  const contentType = match[1];
  const data = match[2];
  
  // Validate base64 data is not empty
  if (!data || data.trim().length === 0) {
    throw new Error("Base64 image data is empty.");
  }
  
  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch (decodeErr) {
    throw new Error(`Failed to decode base64 image data: ${decodeErr.message}`);
  }
  
  // Validate file size (limit to 50MB for safety)
  const MAX_SIZE_MB = 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  if (buffer.length > MAX_SIZE_BYTES) {
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    throw new Error(`Image file too large: ${sizeMB}MB exceeds ${MAX_SIZE_MB}MB limit.`);
  }
  
  console.log("📦 Image validation passed", {
    size: `${(buffer.length / 1024).toFixed(2)}KB`,
    contentType,
    maxSize: `${MAX_SIZE_MB}MB`
  });
  
  // Extract file extension from MIME type
  const mimeType = contentType.split("/");
  if (mimeType.length !== 2 || !mimeType[1]) {
    throw new Error(`Invalid MIME type format: ${contentType}`);
  }
  const extension = mimeType[1].split("+")[0].split(";")[0] || "bin";
  
  const cleaned = String(namePrefix).replace(/[^a-zA-Z0-9_-]/g, "_");
  const key = `uploads/${cleaned}_${Date.now()}.${extension}`;
  
  let store;
  try {
    store = getBlobStore();
  } catch (storeErr) {
    console.error("❌ Failed to get Netlify Blobs store:", {
      message: storeErr.message,
      envCheck: {
        hasAuth: !!getNetlifyToken(),
        hasSiteId: !!getSiteId()
      }
    });
    throw storeErr;
  }
  
  // Convert to Uint8Array for Netlify Blobs API compatibility
  const uint8Array = new Uint8Array(buffer);
  
  try {
    console.log("🚀 Uploading to Netlify Blobs:", { key, size: buffer.length, contentType });
    await store.set(key, uint8Array, { metadata: { contentType } });
    console.log("✅ Image stored successfully in Netlify Blobs");
  } catch (blobError) {
    console.error("❌ Netlify Blobs store.set() failed:", {
      key,
      bufferSize: buffer.length,
      uint8ArraySize: uint8Array.byteLength,
      errorMessage: blobError.message,
      errorCode: blobError.code
    });
    throw new Error(`Failed to store image in Netlify Blobs: ${blobError.message}`);
  }
  
  return { key, contentType };
};
const deleteImage = async (key) => {
  const store = getBlobStore();
  await store.delete(key);
};
module.exports = {
  connectBlobs,
  getPortfolioData,
  savePortfolioData,
  uploadBase64Image,
};
