# Friedcat Portfolio

Commission portfolio for Friedcat — digital art and VTuber (Live2D) design services.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
3. Run the dev server (Express + Vite on port 3000):
   ```bash
   npm run dev
   ```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. Add the following environment variables in your Vercel project settings:
   - `APP_URL` — your Vercel deployment URL (e.g. `https://your-project.vercel.app`)
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_ALLOWED_USERS` — comma-separated Discord usernames/IDs allowed as admins
   - `ADMIN_SESSION_SECRET` — long random string for signing session tokens
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Set your Discord app redirect URI to:
   `https://your-project.vercel.app/api/auth/discord/callback`
5. Deploy — Vercel automatically uses the `vercel-build` script (`vite build`).

Portfolio data and uploaded images are stored via Cloudinary.

## Project Structure

```
api/              # Vercel serverless functions (.cjs)
  auth/           # Discord OAuth endpoints
  lib/            # Shared helpers (Cloudinary, session signing)
  portfolio.cjs   # GET/POST portfolio data
  upload.cjs      # Image upload to Cloudinary
  blob.cjs        # Image redirect via Cloudinary URL
src/              # React frontend (Vite + Tailwind CSS v4)
  components/
    PortfolioView.tsx   # Public portfolio page
    AdminView.tsx       # Admin panel (Discord-auth gated)
data/
  portfolio.json  # Local fallback portfolio data
```
