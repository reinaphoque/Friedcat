const { uploadBase64Image } = require('./lib/cloudinary.cjs');
const { createJsonResponse, verifySession } = require('./lib/helpers.cjs');

const collectBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

const cleanName = (name) => String(name || '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '').slice(0, 200) || null;

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return createJsonResponse(res, 405, { error: 'Method not allowed' });
    }

    const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    if (requiresAuth) {
      const token = req.headers['x-admin-token'] || req.headers['authorization'];
      const session = verifySession(token);
      if (!session) return createJsonResponse(res, 401, { error: 'Unauthorized upload.' });
    }

    const rawBody = req.body || await collectBody(req);
    let payload;
    try {
      payload = typeof rawBody === 'object' ? rawBody : JSON.parse(rawBody || '{}');
    } catch (err) {
      return createJsonResponse(res, 400, { error: 'Invalid JSON body.' });
    }

    const { image, name } = payload;
    if (!image) return createJsonResponse(res, 400, { error: 'No image payload present.' });

    const cleaned = cleanName(name) || null;
    const publicId = cleaned || `upload_${Date.now()}`;

    const asset = await uploadBase64Image(image, publicId);
    return createJsonResponse(res, 200, { url: `/api/blob?key=${encodeURIComponent(asset.public_id)}`, cloudinary: asset });
  } catch (err) {
    console.error('upload error', err);
    return createJsonResponse(res, 500, { error: err.message || 'Upload failed' });
  }
};
