const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");
const { getPortfolioData, savePortfolioData } = require("./lib/netlifyStorage.cjs");
const { verifySession } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const data = await getPortfolioData();
      return createJsonResponse(200, data);
    }

    if (event.httpMethod === "POST") {
      const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      if (requiresAuth) {
        const token = event.headers["x-admin-token"] || event.headers["authorization"];
        const session = verifySession(token);
        if (!session) {
          return createJsonResponse(401, { error: "Unauthorized: Missing or invalid administrator token." });
        }
      }

      const payload = JSON.parse(event.body || "{}");
      await savePortfolioData(payload);
      return createJsonResponse(200, {
        success: true,
        message: "Portfolio config successfully persisted to Netlify storage!",
      });
    }

    return createJsonResponse(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Portfolio function error:", error);
    return createJsonResponse(500, { error: error.message || "Failed to access portfolio data." });
  }
};

exports.handler = handler;
