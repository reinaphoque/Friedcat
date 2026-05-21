const { createJsonResponse } = require('../lib/helpers.cjs');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }
  return createJsonResponse(res, 200, { success: true });
};
