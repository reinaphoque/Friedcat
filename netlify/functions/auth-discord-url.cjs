const { createJsonResponse, getAppUrl } = require("./lib/netlifyHelpers.cjs");

const handler = async (event) => {
  const clientId = process.env.DISCORD_CLIENT_ID || "";
  const appUrl = getAppUrl(event);
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
  });

  const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
  return createJsonResponse(200, { url });
};

exports.handler = handler;
