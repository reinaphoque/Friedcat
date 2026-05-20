const { createJsonResponse, signSession } = require("./lib/netlifyHelpers.cjs");

const handler = async () => {
  const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  if (isConfigured) {
    return createJsonResponse(403, { error: "Bypass mode disabled. Secure Discord credential check is active." });
  }

  const sessionData = {
    id: "000000000000000000",
    username: "Local Dev Bypass Mode",
    avatar: null,
    expiresAt: Date.now() + 1000 * 60 * 60 * 2,
  };
  const token = signSession(sessionData);
  return createJsonResponse(200, { success: true, token, user: sessionData });
};

exports.handler = handler;
