const cloudinary = require('cloudinary').v2;

cloudinary.config();
cloudinary.config({ secure: true });

const uploadBase64Image = async (base64String, publicId, folder = 'portfolio') => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid base64 image payload');
  }
  // Do not pass `folder` in opts — it would be prepended to public_id, causing a double-folder path.
  // The folder is already embedded in public_id (e.g. "portfolio/avatar").
  const opts = {
    public_id: publicId ? `${folder}/${publicId}` : undefined,
    overwrite: true,
    invalidate: true,
  };
  const result = await cloudinary.uploader.upload(base64String, opts);
  return {
    public_id: result.public_id,
    url: result.secure_url,
    format: result.format,
  };
};

const uploadRawJson = async (jsonString, publicId = 'portfolio', folder = 'portfolio') => {
  const dataUri = `data:application/json;base64,${Buffer.from(jsonString, 'utf8').toString('base64')}`;
  // Do not pass `folder` or `format` in opts — they conflict with the folder already in public_id.
  const opts = {
    resource_type: 'raw',
    public_id: `${folder}/${publicId}`,
    overwrite: true,
    invalidate: true,
  };
  const result = await cloudinary.uploader.upload(dataUri, opts);
  return { public_id: result.public_id, url: result.secure_url };
};

const getRawResourceUrl = async (publicId, folder = 'portfolio') => {
  const fullId = `${folder}/${publicId}`;
  try {
    const res = await cloudinary.api.resource(fullId, { resource_type: 'raw' });
    return res.secure_url || res.url;
  } catch (err) {
    if (err.http_code === 404) return null;
    throw err;
  }
};

const getImageUrl = (publicId, folder = 'portfolio', options = {}) => {
  if (!publicId) return null;
  const fullId = `${folder}/${publicId}`;
  return cloudinary.url(fullId, { secure: true, fetch_format: 'auto', ...options });
};

module.exports = {
  uploadBase64Image,
  getImageUrl,
  uploadRawJson,
  getRawResourceUrl,
};
