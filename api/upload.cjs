const { uploadBase64Image } = require('./lib/cloudinary.cjs');
const { createJsonResponse, verifySession } = require('./lib/helpers.cjs');

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

    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      return createJsonResponse(res, 400, { error: 'Expected image content type (image/*).' });
    }

    // Collect raw binary body (no base64 conversion on the client side)
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) return createJsonResponse(res, 400, { error: 'No file data received.' });

    const rawName = req.headers['x-file-name'] ? decodeURIComponent(req.headers['x-file-name']) : '';
    const cleaned = cleanName(rawName) || null;
    const publicId = cleaned || `upload_${Date.now()}`;

    // Convert buffer to data URL for Cloudinary uploader
    const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
    const asset = await uploadBase64Image(dataUrl, publicId);

    // Return the actual Cloudinary CDN URL — no proxy needed
    return createJsonResponse(res, 200, { url: asset.url });
  } catch (err) {
    console.error('upload error', err);
    return createJsonResponse(res, 500, { error: err.message || 'Upload failed' });
  }
};
