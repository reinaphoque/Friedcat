const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");
const { connectBlobs, uploadBase64Image } = require("./lib/netlifyStorage.cjs");
const { verifySession } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  try {
    const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    if (requiresAuth) {
      const token = event.headers["x-admin-token"] || event.headers["authorization"];
      const session = verifySession(token);
      if (!session) {
        return createJsonResponse(401, { error: "Unauthorized upload." });
      }
    }

    const payload = JSON.parse(event.body || "{}");
    const { image, name } = payload;
    if (!image) {
      return createJsonResponse(400, { error: "No image payload present." });
    }

    // Validate that image is a valid data URL
    if (typeof image !== "string" || !image.startsWith("data:")) {
      return createJsonResponse(400, { error: "Invalid image format. Must be a data URL." });
    }

    connectBlobs(event);
    const asset = await uploadBase64Image(image, name || "upload");
    console.log("Image uploaded successfully:", { key: asset.key, contentType: asset.contentType });
    return createJsonResponse(200, { url: `/api/blob?key=${encodeURIComponent(asset.key)}` });
  } catch (error) {
    console.error("Upload function error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    const errorMsg = error.message || "Could not save uploaded image.";
    return createJsonResponse(500, { error: errorMsg });
  }
};

exports.handler = handler;
