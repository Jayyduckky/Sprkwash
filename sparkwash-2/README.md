# sprkwash Website 🚲💧

Professional pressure washing website — ready to deploy on Netlify.

---

## Files
- `index.html` — The full website (Home, Services & Pricing, Contact/Book)
- `netlify.toml` — Netlify config (routing + security headers)
- `README.md` — This file

---

## How to Deploy on Netlify (Free!)

### Option 1 — Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up for free
2. From the dashboard, find the **"Deploy manually"** section
3. Drag and drop your entire **sprkwash** folder onto the page
4. Done! Netlify gives you a live URL like `sprkwash-abc123.netlify.app`

### Option 2 — GitHub (Recommended for updates)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `sprkwash`
3. Upload all your files to it
4. Go to [netlify.com](https://netlify.com) → **"Add new site"** → **"Import from Git"**
5. Connect your GitHub and select the `sprkwash` repo
6. Click **Deploy** — done!
7. Every time you update a file on GitHub, the site auto-updates ✨

### Custom Domain (Optional)
- You can connect a custom domain like `sprkwash.com` in Netlify → Site Settings → Domain Management
- Domains cost ~$10–15/year from Namecheap or Google Domains

---

## Setting Up the Contact Form

The booking form uses **Netlify Forms** — it's free and works automatically.

After your first deploy:
1. Go to your Netlify dashboard
2. Click your site → **Forms** tab
3. You'll see form submissions appear there automatically
4. To get email notifications: **Forms** → **Form notifications** → add your email

No backend code needed — Netlify handles it all for free! 🎉

---

## Customizing the Site

### Change your business name or city
Search the HTML for `sprkwash` or `Austin, TX` and replace with your details.

### Change prices
Search the HTML for `$100` etc. and update to match your pricing.

### Add your real crew names
Find the "Meet the Crew" section and replace `OP`, `DT`, `CO` with your initials.

### Change phone/email contact info
Add a phone number or email in the Contact section if you want customers to reach you directly.

---

## Tech Stack
- **Frontend:** Pure HTML, CSS, JavaScript (no frameworks needed)
- **Backend / Forms:** Netlify Forms (free, serverless)
- **Hosting:** Netlify (free tier)
- **Font:** Plus Jakarta Sans (Google Fonts)

---

Built for sprkwash · Austin, TX 🚲
