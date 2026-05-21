const { getImageUrl } = require('./lib/cloudinary');
const { createJsonResponse } = require('./lib/helpers');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') return createJsonResponse(res, 405, { error: 'Method not allowed' });

    const key = req.query?.key || (req.url && new URL(req.url, `http://${req.headers.host}`).searchParams.get('key'));
    if (!key) return createJsonResponse(res, 400, { error: 'Missing key parameter' });

    // key is expected to be the Cloudinary public_id (without folder) or full public_id
    const publicId = String(key).replace(/^uploads\//, '');
    const url = getImageUrl(publicId);
    if (!url) return createJsonResponse(res, 404, { error: 'Image not found' });

    // Redirect to Cloudinary direct URL so browsers can cache and fetch efficiently
    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    console.error('blob error', err);
    return createJsonResponse(res, 500, { error: err.message || 'Failed to load image' });
  }
};
