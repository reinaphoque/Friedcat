const { uploadBase64Image } = require('./lib/cloudinary.cjs');
const { createJsonResponse, verifySession, extractToken, collectBinaryBody } = require('./lib/helpers.cjs');

const cleanName = (name) => String(name || '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '').slice(0, 200) || null;

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return createJsonResponse(res, 405, { error: 'Method not allowed' });
    }

    const requiresAuth = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    if (requiresAuth) {
      const session = verifySession(extractToken(req));
      if (!session) return createJsonResponse(res, 401, { error: 'Unauthorized upload.' });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      return createJsonResponse(res, 400, { error: 'Expected image content type (image/*).' });
    }

    const buffer = await collectBinaryBody(req);
    if (!buffer.length) return createJsonResponse(res, 400, { error: 'No file data received.' });

    const rawName = req.headers['x-file-name'] ? decodeURIComponent(req.headers['x-file-name']) : '';
    const publicId = cleanName(rawName) || `upload_${Date.now()}`;

    const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
    const asset = await uploadBase64Image(dataUrl, publicId);

    return createJsonResponse(res, 200, { url: asset.url });
  } catch (err) {
    console.error('upload error', err);
    return createJsonResponse(res, 500, { error: err.message || 'Upload failed' });
  }
};
