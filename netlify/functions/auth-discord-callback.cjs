const { createHtmlResponse, getAppUrl, signSession } = require("./lib/netlifyHelpers.cjs");

const getAllowedUsers = () => {
  return (process.env.DISCORD_ALLOWED_USERS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const renderPage = (title, message, payload = "") => {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family: system-ui, -apple-system, sans-serif; background: #f7fafc; padding: 40px; text-align: center; color: #2d3748;"><div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 30px; box-shadow: 0 10px 20px rgba(0,0,0,0.08);"><h2 style="margin-top:0;">${title}</h2><p style="font-size:14px; color:#4a5568;">${message}</p>${payload}</div></body></html>`;
};

const handler = async (event) => {
  const code = event.queryStringParameters?.code;
  if (!code) {
    return createHtmlResponse(400, renderPage("Missing authorization code", "Discord did not return an authorization code."));
  }

  try {
    const appUrl = getAppUrl(event);
    const redirectUri = `${appUrl}/api/auth/discord/callback`;

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Discord token exchange failed: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      throw new Error("Failed to load Discord user profile.");
    }

    const userData = await userRes.json();
    const { id, username, avatar } = userData;
    const allowedUsers = getAllowedUsers();
    const isAllowed =
      allowedUsers.length === 0 ||
      allowedUsers.includes(username.toLowerCase()) ||
      allowedUsers.includes(id);

    if (!isAllowed) {
      const errorText = `Your Discord account ${username} (${id}) is not permitted.`;
      return createHtmlResponse(
        403,
        renderPage(
          "Access Denied",
          `Authenticated as ${username}, but your account is not allowed to edit this site.`,
          `<button onclick="window.close()" style="padding: 10px 22px; border:none; background:#9b2335; color:white; border-radius:10px; cursor:pointer;">Close Window</button>`
        )
      );
    }

    const sessionData = {
      id,
      username,
      avatar,
      expiresAt: Date.now() + 1000 * 60 * 60 * 2,
    };
    const token = signSession(sessionData);

    return createHtmlResponse(
      200,
      renderPage(
        "Authorized!",
        `Successfully connected as ${username}. This window will close automatically.`,
        `<script>if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: ${JSON.stringify(token)}, user: ${JSON.stringify(sessionData)} }, '*'); window.close(); } else { window.location.href = '/admin'; }</script>`
      )
    );
  } catch (error) {
    console.error("Auth callback failure:", error);
    return createHtmlResponse(
      500,
      renderPage(
        "Authentication error",
        error.message || "Unable to connect with Discord.",
        `<button onclick="window.close()" style="padding: 10px 22px; border:none; background:#9b2335; color:white; border-radius:10px; cursor:pointer;">Close Window</button>`
      )
    );
  }
};

exports.handler = handler;
