import 'dotenv/config';
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Standard default initial portfolio state matching the user's templates
const DEFAULT_PORTFOLIO = {
  name: "Friedcat",
  avatarImg: "/src/assets/images/friedcat_avatar_1779292726832.png",
  statusIllust: "open",
  statusLive2d: "open",
  svcIllustThumb: "/src/assets/images/illustration_art_1779292750345.png",
  svcYchThumb: "/src/assets/images/vtuber_art_1779292768987.png",
  socials: [
    { t: "twitter", u: "https://x.com/" },
    { t: "bluesky", u: "https://bsky.app/" },
    { t: "facebook", u: "https://facebook.com/" },
    { t: "instagram", u: "https://instagram.com/" }
  ],
  doList: [
    "Woman / Girl Only",
    "Fanart",
    "Humanoids / Fantasy Humanoid",
    "Soft NSFW (sexy/suggestive/revealing characters)"
  ],
  dontList: [
    "Furries / Anthros and ponies",
    "Mecha & Realism",
    "overly complicated weapons and armours",
    "Hard NSFW (sexual activity)"
  ],
  illustNote: "The prices listed here are not the final quote and might shift slightly because of the currency exchange rate changes.",
  illustStatus: "open",
  illustSlides: [
    "/src/assets/images/illustration_art_1779292750345.png"
  ],
  illustRows: [
    { type: "BUST", rough: "$9+ / ฿300+", color: "$19+ / ฿600+" },
    { type: "HALF BODY", rough: "$19+ / ฿600+", color: "$28+ / ฿900+" },
    { type: "FULL BODY", rough: "$25+ / ฿800+", color: "$37+ / ฿1,200+" }
  ],
  illustExamples: [
    "/src/assets/images/illustration_art_1779292750345.png",
    "/src/assets/images/vtuber_art_1779292768987.png"
  ],
  ychStatus: "open",
  ychNote: "The prices listed here are not the final quote and might shift slightly because of the currency exchange rate changes.",
  ychItems: [
    { name: "Chibi Sitting YCH", image: "", desc: "Adorable custom chibi sit template", price: "$20" },
    { name: "Coffee Mug YCH", image: "", desc: "Cute custom cat-ear peek template on coffee mug props", price: "$25" }
  ],
  ychExamples: [
    "/src/assets/images/friedcat_avatar_1779292726832.png"
  ],
  vtuberText: "🌟 High-quality customized Live2D structural modeling and rigging. \n\nOur models feature:\n- Complete physical dynamic tracking for hair, garments, and ears\n- Symmetrical high-resolution layer files (.PSD)\n- Ready-made key actions mapped for Twitch, YouTube, and VTube Studio stream environments.",
  tos: [
    "Personal use only unless Commercial license premium (X2 base value) is paid.",
    "Artist retains full intellectual citation rights of drawings for portfolios.",
    "Refunding is only acceptable before the sketch rendering phase has finalized.",
    "Deadline shifts depending on active listing queues and client response delays."
  ]
};

// Initialize file store layout
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PORTFOLIO, null, 2), "utf8");
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  
  const normalizeUrl = (url: string) => url.trim().replace(/\/+$|^\s+|\s+$/g, "");
  const getAppUrl = (req?: express.Request) => {
    if (process.env.APP_URL) {
      return normalizeUrl(process.env.APP_URL);
    }
    if (req) {
      return `${req.protocol}://${req.get("host")}`;
    }
    return "http://localhost:3000";
  };
  
  const configuredAppUrl = getAppUrl();
  console.log(`[Server] Using APP_URL=${configuredAppUrl}`);
  console.log(`[Server] Discord redirect URI=${configuredAppUrl}/api/auth/discord/callback`);
  
  // Set json parser payload limit to allow Base64 direct image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve upload files statically
  app.use("/uploads", express.static(UPLOADS_DIR));
  
  // Ensure we can reference any pre-bundled asset styles statically too
  app.use("/src/assets", express.static(path.join(process.cwd(), "src", "assets")));

  // In-memory set for active administrator tokens
  const adminSessions = new Set<string>();

  // API: Get discord auth state configuration to determine if bypass or secure mode is active
  app.get("/api/auth/config", (req, res) => {
    const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    const allowed = (process.env.DISCORD_ALLOWED_USERS || "")
      .split(",")
      .map(u => u.trim())
      .filter(Boolean);
    return res.json({
      isConfigured,
      allowedUsers: allowed
    });
  });

  // API: Generate official Discord Authorization URL
  app.get("/api/auth/discord/url", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID || "";
    const appUrl = getAppUrl(req);
    const redirectUri = `${appUrl}/api/auth/discord/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify",
    });

    const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
    return res.json({ url });
  });

  // API: Callback exchange endpoints for discord authorization code
  const callbackHandler = async (req: express.Request, res: express.Response) => {
    const { code } = req.query;
    if (!code) {
      return res.send(`
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; background: #fdf3f3; color: #9b2335; padding: 40px; text-align: center;">
            <div style="max-width: 450px; margin: 0 auto; background: white; border: 2px solid #e66a75; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="margin-top: 0;">Missing authorization code</h2>
              <p style="color: #6a2a2a; font-size: 14px; line-height: 1.5;">No active authorization code was response-returned by Discord.</p>
              <button onclick="window.close()" style="background: #9b2335; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const appUrl = getAppUrl(req);
      const redirectUri = `${appUrl}/api/auth/discord/callback`;

      // 1. Exchange OAuth code for Access Token
      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID || "",
          client_secret: process.env.DISCORD_CLIENT_SECRET || "",
          grant_type: "authorization_code",
          code: String(code),
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("Discord token response error body:", errBody);
        throw new Error("Token exchange connection failed");
      }

      const tokenData = (await tokenRes.json()) as any;
      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile
      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userRes.ok) {
        throw new Error("Failed to load user profile");
      }

      const userData = (await userRes.json()) as any;
      const { id, username, avatar } = userData;

      // 3. Match against Allowed User whitelist
      const allowedString = process.env.DISCORD_ALLOWED_USERS || "";
      const allowedUsers = allowedString
        .split(",")
        .map(u => u.trim().toLowerCase())
        .filter(Boolean);

      // If empty in env, allow anyone for safety, else require match
      const isAllowed =
        allowedUsers.length === 0 ||
        allowedUsers.includes(username.toLowerCase()) ||
        allowedUsers.includes(id);

      if (!isAllowed) {
        const errString = `Your Discord account "${username}" (${id}) is not listed in allowed administrators list.`;
        return res.send(`
          <html>
            <body style="font-family: system-ui, -apple-system, sans-serif; background: #faf4f4; color: #333; padding: 40px; text-align: center;">
              <div style="max-width: 480px; margin: 40px auto; background: white; border: 2px solid #e66a75; border-radius: 16px; padding: 32px; box-shadow: 0 10px 15px rgba(0,0,0,0.05);">
                <div style="font-size: 48px; margin-bottom: 16px;">🛑</div>
                <h2 style="color: #9b2335; margin-top: 0; font-size: 20px;">Access Denied</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #666; margin: 16px 0;">
                  You successfully authenticated with Discord as <strong>${username}</strong>, but this account is not registered to manage this site.
                </p>
                <div style="font-family: monospace; font-size: 11px; background: #fdf3f3; color: #9b2335; border: 1px solid rgba(230,106,117,0.2); p-3 rounded-lg text-left word-wrap: break-word; word-break: break-all; margin-bottom: 24px; padding: 12px; border-radius: 8px;">
                  User ID: ${id}<br/>Username: ${username}
                </div>
                <button onclick="window.close()" style="background: #9b2335; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                  Close Window
                </button>
              </div>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: "OAUTH_AUTH_FAILURE", 
                    error: ${JSON.stringify(errString)} 
                  }, "*");
                }
              </script>
            </body>
          </html>
        `);
      }

      // 4. Record validated session
      const randToken = "auth_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      adminSessions.add(randToken);

      // 5. Send message and self-close popup
      return res.send(`
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; background: #f7fafc; padding: 40px; text-align: center; color: #2d3748;">
            <div style="max-width: 400px; margin: 40px auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 2px solid #48bb78;">
              <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
              <h2 style="color: #276749; margin-top: 0;">Authorized!</h2>
              <p style="font-size: 14px; color: #4a5568; margin-bottom: 24px;">Successfully connected as <strong>${username}</strong>. You are being redirected and this window will close...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: "OAUTH_AUTH_SUCCESS", 
                    token: ${JSON.stringify(randToken)},
                    user: {
                      id: ${JSON.stringify(id)},
                      username: ${JSON.stringify(username)},
                      avatar: ${JSON.stringify(avatar)}
                    }
                  }, "*");
                  window.close();
                } else {
                  window.location.href = "/admin";
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Auth callback exception:", err);
      return res.status(500).send(`
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; background: #fdf3f3; text-align: center; padding: 40px;">
            <div style="max-width: 450px; margin: 0 auto; background: white; border: 2px solid #e66a75; padding: 20px; border-radius: 12px;">
              <h2 style="color: #9b2335;">OAuth token connection crashed</h2>
              <p style="color: #6a2a2a; font-size: 13px;">${err.message || "An unresolved network event occurred."}</p>
              <button onclick="window.close()" style="background: #9b2335; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  };

  app.get("/api/auth/discord/callback", callbackHandler);
  app.get("/api/auth/discord/callback/", callbackHandler);

  // API: Get current session legitimacy
  app.get("/api/auth/session", (req, res) => {
    const token = req.headers["x-admin-token"] || req.headers["authorization"];
    if (token && adminSessions.has(String(token))) {
      return res.json({ valid: true });
    }
    return res.json({ valid: false });
  });

  // API: Log out session
  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers["x-admin-token"] || req.headers["authorization"];
    if (token) {
      adminSessions.delete(String(token));
    }
    return res.json({ success: true });
  });

  // API: Bypass developer authentication if Discord secrets are unconfigured
  app.post("/api/auth/bypass", (req, res) => {
    // ONLY allow bypass login when Discord is not configured
    const isConfigured = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    if (isConfigured) {
      return res.status(403).json({ error: "Bypass mode disabled. Secure Discord credential check is active." });
    }
    const randToken = "bypass_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    adminSessions.add(randToken);
    return res.json({
      success: true,
      token: randToken,
      user: {
        id: "000000000000000000",
        username: "Local Dev Bypass Mode",
        avatar: null
      }
    });
  });

  // API: GET portfolio database
  app.get("/api/portfolio", (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, "utf8");
        return res.json(JSON.parse(fileContent));
      }
      return res.json(DEFAULT_PORTFOLIO);
    } catch (err) {
      console.error("Failed to read portfolio data:", err);
      res.status(500).json({ error: "Failed to read database configurations" });
    }
  });

  // API: POST update portfolio database
  app.post("/api/portfolio", (req, res) => {
    try {
      // Secure check if Discord credentials are set up
      if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        const token = req.headers["x-admin-token"] || req.headers["authorization"];
        if (!token || !adminSessions.has(String(token))) {
          return res.status(401).json({ error: "Unauthorized: Missing or invalid administrator security token." });
        }
      }
      const updatedData = req.body;
      fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2), "utf8");
      return res.json({ success: true, message: "Portfolio config successfully persisted to backend!" });
    } catch (err) {
      console.error("Failed to persist portfolio data:", err);
      res.status(500).json({ error: "Failed to save portfolio configurations" });
    }
  });

  // API: POST handle image Base64 uploads
  app.post("/api/upload", (req, res) => {
    try {
      // Secure check if Discord credentials are set up
      if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
        const token = req.headers["x-admin-token"] || req.headers["authorization"];
        if (!token || !adminSessions.has(String(token))) {
          return res.status(401).json({ error: "Unauthorized upload." });
        }
      }
      const { image, name } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image payload present" });
      }

      // Detect Base64 meta prefix and clean it
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      
      // Determine correct mime/file extension
      const mimeMatch = image.match(/^data:image\/(\w+);base64,/);
      const extension = (mimeMatch && mimeMatch[1]) || "png";
      const cleanedName = (name || "upload").replace(/[^a-zA-Z0-9_\-]/g, "_");
      const filename = `${cleanedName}_${Date.now()}.${extension}`;
      
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
      
      console.log(`Successfully stored upload to: ${filepath}`);
      return res.json({ url: `/uploads/${filename}` });
    } catch (err) {
      console.error("Upload handler failed:", err);
      res.status(500).json({ error: "Could not save uploaded image to local storage folder" });
    }
  });

  // Serve static UI and manage Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer();
