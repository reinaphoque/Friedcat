const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");
const { connectBlobs, getPortfolioData, savePortfolioData } = require("./lib/netlifyStorage.cjs");
const { verifySession } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      console.log("Portfolio GET request");
      connectBlobs(event);
      const data = await getPortfolioData();
      console.log("Portfolio data retrieved successfully");
      return createJsonResponse(200, data);
    }

    if (event.httpMethod === "POST") {
      console.log("Portfolio POST request");
      const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      if (requiresAuth) {
        const token = event.headers["x-admin-token"] || event.headers["authorization"];
        const session = verifySession(token);
        if (!session) {
          return createJsonResponse(401, { error: "Unauthorized: Missing or invalid administrator token." });
        }
      }

      connectBlobs(event);
      let payload;
      try {
        payload = JSON.parse(event.body || "{}");
      } catch (parseErr) {
        console.error("Failed to parse portfolio data:", parseErr.message);
        return createJsonResponse(400, { error: "Invalid request body." });
      }
      await savePortfolioData(payload);
      console.log("Portfolio data saved successfully");
      return createJsonResponse(200, {
        success: true,
        message: "Portfolio config successfully persisted to Netlify Blobs storage!",
      });
    }

    return createJsonResponse(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Portfolio function error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return createJsonResponse(500, { error: error.message || "Failed to access portfolio data." });
  }
};

exports.handler = handler;
