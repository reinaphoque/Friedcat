const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");
const { uploadBase64Image } = require("./lib/netlifyStorage.cjs");
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

    const asset = await uploadBase64Image(image, name || "upload");
    return createJsonResponse(200, { url: asset.url });
  } catch (error) {
    console.error("Upload function error:", error);
    return createJsonResponse(500, { error: error.message || "Could not save uploaded image." });
  }
};

exports.handler = handler;
