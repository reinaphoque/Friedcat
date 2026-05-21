const { createJsonResponse, getAppUrl } = require('../../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
  });

  return createJsonResponse(res, 200, {
    url: `https://discord.com/oauth2/authorize?${params.toString()}`,
  });
};
