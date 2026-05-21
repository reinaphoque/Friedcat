const { createJsonResponse } = require('../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }
  const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  const allowed = (process.env.DISCORD_ALLOWED_USERS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return createJsonResponse(res, 200, {
    isConfigured,
    allowedUsers: allowed,
  });
};
