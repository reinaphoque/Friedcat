const { getRawResourceUrl, uploadRawJson } = require('./lib/cloudinary');
const { createJsonResponse, verifySession } = require('./lib/helpers');

const collectBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const url = await getRawResourceUrl('portfolio');
      if (!url) return createJsonResponse(res, 404, { error: 'Portfolio data not found' });
      const fetched = await fetch(url);
      if (!fetched.ok) return createJsonResponse(res, fetched.status, { error: 'Failed to fetch portfolio data' });
      const data = await fetched.json();
      return createJsonResponse(res, 200, data);
    }

    if (req.method === 'POST') {
      const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      if (requiresAuth) {
        const token = req.headers['x-admin-token'] || req.headers['authorization'];
        const session = verifySession(token);
        if (!session) return createJsonResponse(res, 401, { error: 'Unauthorized: Missing or invalid administrator token.' });
      }

      const rawBody = req.body || await collectBody(req);
      let payload;
      try {
        payload = typeof rawBody === 'object' ? rawBody : JSON.parse(rawBody || '{}');
      } catch (err) {
        return createJsonResponse(res, 400, { error: 'Invalid request body.' });
      }

      await uploadRawJson(JSON.stringify(payload), 'portfolio');
      return createJsonResponse(res, 200, { success: true, message: 'Portfolio config persisted to Cloudinary.' });
    }

    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('portfolio error', err);
    return createJsonResponse(res, 500, { error: err.message || 'Failed to access portfolio data.' });
  }
};
