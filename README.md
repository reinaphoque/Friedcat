<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d0fbf5b4-3e7b-4e95-a51f-1254e89d0d6a

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your environment values.
3. Run the app locally:
   `npm run dev`

## Deploy on Netlify

This project is now configured to run on Netlify using Netlify Functions for backend storage.

1. Add the following environment variables in your Netlify site settings:
   - `APP_URL`: `https://<your-netlify-site>.netlify.app`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_ALLOWED_USERS`
   - `ADMIN_SESSION_SECRET`
   - `NETLIFY_AUTH_TOKEN`
2. Set your Discord app redirect URI to:
   `https://<your-netlify-site>.netlify.app/api/auth/discord/callback`
3. Deploy the repo to Netlify.

The site now stores portfolio JSON and upload images through Netlify asset storage, so admin edits are visible globally.
