const { createHtmlResponse, createJsonResponse, getAppUrl, signSession } = require('../../lib/helpers.cjs');

const renderHtml = ({ title, message, body = '' }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7fafc; color: #2d3748; }
    .card { max-width: 520px; margin: 60px auto; padding: 32px; background: white; border-radius: 18px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(15, 23, 42, .08); }
    h1 { margin-top: 0; font-size: 24px; }
    p { line-height: 1.6; color: #4a5568; }
    button { background: #9b2335; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    ${body}
  </div>
</body>
</html>`;

const getAllowedUsers = () => (process.env.DISCORD_ALLOWED_USERS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const postMessageScript = (payload) => `
<script>
  (function () {
    var p = ${JSON.stringify(payload)};
    // Write to localStorage first — fires 'storage' event in the main window
    // even when Discord's COOP header has severed window.opener.
    try {
      localStorage.setItem('friedcat_oauth_result', JSON.stringify(p));
      localStorage.setItem('friedcat_oauth_ts', String(Date.now()));
    } catch (e) {}
    // Also attempt postMessage for environments where opener is still reachable.
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(p, window.location.origin);
      }
    } catch (e) {}
    setTimeout(function () { window.close(); }, 400);
  })();
</script>`;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return createJsonResponse(res, 405, { error: 'Method not allowed' });
  }

  const code = req.query?.code;
  if (!code) {
    return createHtmlResponse(res, 400, renderHtml({
      title: 'Missing authorization code',
      message: 'No active authorization code was returned by Discord.',
      body: '<button onclick="window.close()">Close Window</button>'
    }));
  }

  try {
    const appUrl = getAppUrl(req);
    const redirectUri = `${appUrl}/api/auth/discord/callback`;

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('Discord token response error body:', errBody);
      throw new Error('Token exchange connection failed');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new Error('Failed to load Discord user profile');
    }

    const userData = await userRes.json();
    const { id, username, avatar } = userData;

    const allowedUsers = getAllowedUsers();
    const isAllowed = allowedUsers.length === 0 || allowedUsers.includes(username.toLowerCase()) || allowedUsers.includes(id);

    if (!isAllowed) {
      const errString = `Your Discord account "${username}" (${id}) is not listed in allowed administrators list.`;
      return createHtmlResponse(res, 403, renderHtml({
        title: 'Access Denied',
        message: 'This account is not permitted to manage the site.',
        body: `<button onclick="window.close()">Close Window</button>${postMessageScript({ type: 'OAUTH_AUTH_FAILURE', error: errString })}`
      }));
    }

    const token = signSession({ id, username, avatar });
    return createHtmlResponse(res, 200, renderHtml({
      title: 'Authorized!',
      message: `Successfully connected as ${username}. You may close this window.`,
      body: postMessageScript({
        type: 'OAUTH_AUTH_SUCCESS',
        token,
        user: { id, username, avatar },
      })
    }));
  } catch (err) {
    console.error('Auth callback exception:', err);
    return createHtmlResponse(res, 500, renderHtml({
      title: 'OAuth token connection crashed',
      message: err.message || 'An unresolved network event occurred.',
      body: '<button onclick="window.close()">Close Window</button>'
    }));
  }
};
