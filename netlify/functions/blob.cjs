const { connectLambda, getStore } = require("@netlify/blobs");
const { ensureAuth, ensureSiteId, urlBase, createJsonResponse } = require("./lib/netlifyHelpers.cjs");

const STORE_NAME = "portfolio-store";

const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return createJsonResponse(405, { error: "Method not allowed" });
    }

    const key = event.queryStringParameters?.key ? decodeURIComponent(event.queryStringParameters.key) : null;
    if (!key) {
      return createJsonResponse(400, { error: "Missing blob key." });
    }

    connectLambda(event);
    const store = getStore({
      name: STORE_NAME,
      siteID: ensureSiteId(),
      token: ensureAuth(),
      apiURL: urlBase,
    });

    const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!blob || blob.data == null) {
      return createJsonResponse(404, { error: "Blob not found." });
    }

    const buffer = Buffer.from(blob.data);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": blob.metadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=60",
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Blob function error:", error);
    return createJsonResponse(500, { error: error.message || "Failed to load blob." });
  }
};

exports.handler = handler;
