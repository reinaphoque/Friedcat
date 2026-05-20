const path = require("path");
const fs = require("fs");
const { ensureAuth, ensureSiteId, urlBase } = require("./netlifyHelpers.cjs");

const DEFAULT_PORTFOLIO = require(path.join(__dirname, "..", "..", "..", "data", "portfolio.json"));

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = json?.message || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return json;
};

const getSiteId = () => {
  return ensureSiteId();
};

const getHeaders = () => ({
  Authorization: `Bearer ${ensureAuth()}`,
  Accept: "application/json",
});

const listAssets = async () => {
  const siteId = getSiteId();
  const url = `${urlBase}/sites/${siteId}/assets`;
  return await fetchJson(url, { headers: getHeaders() });
};

const findAssetByName = async (name) => {
  const assets = await listAssets();
  const matches = assets.filter((asset) => asset.name === name);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0];
};

const createSiteAsset = async (name, buffer, contentType, visibility = "public") => {
  const siteId = getSiteId();
  const params = new URLSearchParams({
    name,
    size: String(buffer.length),
    content_type: contentType,
    visibility,
  });

  const createUrl = `${urlBase}/sites/${siteId}/assets?${params.toString()}`;
  const createResponse = await fetchJson(createUrl, {
    method: "POST",
    headers: getHeaders(),
  });

  const form = createResponse.form;
  if (!form || !form.url || !form.fields) {
    throw new Error("Invalid asset upload form from Netlify API.");
  }

  const formData = new FormData();
  Object.entries(form.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", buffer, {
    filename: name,
    contentType,
  });

  const uploadRes = await fetch(form.url, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Netlify asset upload failed: ${err}`);
  }
  const result = await uploadRes.json();
  return result.asset || result;
};

const getPortfolioData = async () => {
  const asset = await findAssetByName("portfolio.json");
  if (!asset) {
    return DEFAULT_PORTFOLIO;
  }

  const res = await fetch(asset.url);
  if (!res.ok) {
    return DEFAULT_PORTFOLIO;
  }
  return await res.json();
};

const savePortfolioData = async (payload) => {
  const body = JSON.stringify(payload, null, 2);
  const buffer = Buffer.from(body, "utf8");
  return await createSiteAsset("portfolio.json", buffer, "application/json", "public");
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
  const filename = `uploads/${cleaned}_${Date.now()}.${extension}`;
  const asset = await createSiteAsset(filename, buffer, contentType, "public");
  return asset;
};

module.exports = {
  getPortfolioData,
  savePortfolioData,
  uploadBase64Image,
  findAssetByName,
};
