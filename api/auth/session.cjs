const { createJsonResponse, verifySession, extractToken } = require('../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }
  const session = verifySession(extractToken(req));
  return createJsonResponse(res, 200, { valid: !!session });
};
