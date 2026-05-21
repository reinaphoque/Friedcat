const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");
const { connectBlobs, uploadBase64Image } = require("./lib/netlifyStorage.cjs");
const { verifySession } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  const startTime = Date.now();
  try {
    console.log("Upload function invoked", {
      method: event.httpMethod,
      bodyLength: event.body?.length || 0,
      timestamp: new Date().toISOString()
    });

    const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    console.log("Auth check", { requiresAuth, discordConfigured: !!process.env.DISCORD_CLIENT_ID });
    if (requiresAuth) {
      const token = event.headers["x-admin-token"] || event.headers["authorization"];
      console.log("Verifying session token:", { tokenPresent: !!token, tokenLength: token?.length || 0 });
      const session = verifySession(token);
      console.log("Session verification result:", { valid: !!session, userId: session?.userId });
      if (!session) {
        console.log("Session invalid, returning 401");
        return createJsonResponse(401, { error: "Unauthorized upload." });
      }
    }

    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (parseErr) {
      console.error("Failed to parse request body:", parseErr.message);
      return createJsonResponse(400, { error: "Invalid request body. Must be valid JSON." });
    }

    const { image, name } = payload;
    if (!image) {
      return createJsonResponse(400, { error: "No image payload present." });
    }

    // Validate that image is a valid data URL
    if (typeof image !== "string" || !image.startsWith("data:")) {
      return createJsonResponse(400, { error: "Invalid image format. Must be a data URL." });
    }

    console.log("Attempting to connect Netlify Blobs...");
    try {
      connectBlobs(event);
      console.log("Netlify Blobs connected, uploading image...");
    } catch (blobConnErr) {
      console.error("Blobs connection failed:", blobConnErr.message);
      throw blobConnErr;
    }
    const asset = await uploadBase64Image(image, name || "upload");
    const elapsed = Date.now() - startTime;
    console.log("Image uploaded successfully", {
      key: asset.key,
      contentType: asset.contentType,
      elapsedMs: elapsed
    });
    return createJsonResponse(200, { url: `/api/blob?key=${encodeURIComponent(asset.key)}` });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error("Upload function error", {
      message: error.message,
      stack: error.stack,
      elapsedMs: elapsed,
      timestamp: new Date().toISOString()
    });
    const errorMsg = error.message || "Could not save uploaded image.";
    return createJsonResponse(500, { error: errorMsg });
  }
};

exports.handler = handler;
