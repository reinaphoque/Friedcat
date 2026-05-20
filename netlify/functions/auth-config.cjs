const { createJsonResponse } = require("./lib/netlifyHelpers.cjs");

const handler = async () => {
  const allowed = (process.env.DISCORD_ALLOWED_USERS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  return createJsonResponse(200, { isConfigured, allowedUsers: allowed });
};

exports.handler = handler;
