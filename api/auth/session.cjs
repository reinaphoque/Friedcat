const { createJsonResponse, verifySession } = require('../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const session = verifySession(token);
  return createJsonResponse(res, 200, { valid: !!session });
};
