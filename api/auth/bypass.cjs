const { createJsonResponse, signSession } = require('../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  if (isConfigured) {
    return createJsonResponse(res, 403, { error: 'Bypass mode disabled. Secure Discord credential check is active.' });
  }

  const token = signSession({ id: '000000000000000000', username: 'Local Dev Bypass Mode', avatar: null, bypass: true });
  return createJsonResponse(res, 200, {
    success: true,
    token,
    user: {
      id: '000000000000000000',
      username: 'Local Dev Bypass Mode',
      avatar: null,
    },
  });
};
