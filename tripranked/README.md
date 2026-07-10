# ⚡ TripRanked — Drive. Track. Rank.

A fully functional driving tracker web app (PWA). Record your drives with real GPS,
watch a live speedometer, collect detailed driving stats, build a trip history with
shareable stat cards, and climb the leaderboards.

No build step, no accounts, no API keys — plain HTML/CSS/JS that runs anywhere.

---

## Features

- **Live drive tracking** — GPS speedometer with gauge, time, distance, average & top speed
- **Real live map** — a dark-styled OpenStreetMap view (Leaflet, no API key needed) that
  follows you while driving with a heading arrow, GPS-accuracy ring and the growing route
  trail; expandable, with a 📍 locate button when idle. Trip summary & detail views draw
  the recorded route on real streets, colored by speed.
- **Driving events** — hard accelerations, hard brakes, hard corners and stops detected
  in real time, plus a live G-force bubble (lateral & longitudinal g estimated from motion)
- **Trip score** — every trip gets a 0–100 smoothness score and a letter grade
- **Trip history** — every saved trip with its route drawing (speed-colored), speed graph,
  stats and events; tap any trip for details
- **Share cards** — a generated 1080×1350 PNG stat card for any trip (native share sheet
  on phones, download on desktop)
- **Leaderboards** — Top Speed · Distance · Trips, weekly and all-time. Out of the box you
  race TripRanked's simulated **Global Grid** (48 drivers whose form shifts every week).
  Connect Supabase (below) and it becomes a real live multi-player board.
- **Profile & progression** — rank tiers (Rookie → Bronze → Silver → Gold → Platinum → Apex),
  12 achievements, lifetime stats, day streaks
- **Demo drive** — a realistic scripted 2½-minute city + highway drive so you can try
  everything without leaving your chair (demo trips are marked 🧪)
- **PWA** — installable on your phone's home screen, works fully offline
- **Units** — mph or km/h, switchable anytime; data export & full reset included

## Run it

- **Locally:** serve the folder (GPS needs a *secure* context):
  `python3 -m http.server 8080` → http://localhost:8080
  (`localhost` counts as secure, so GPS & demo both work)
- **Netlify:** drag-and-drop this `tripranked` folder at netlify.com, or point a new
  Netlify site at this repo with base directory `tripranked`. The included `netlify.toml`
  sets the right headers.
- **Anywhere else:** any static host works — GitHub Pages, Vercel, S3… it just needs HTTPS
  (browsers only allow GPS on HTTPS).

Open it on your phone, tap **START DRIVE**, put the phone in a mount or pocket, drive,
then **END TRIP** → save → share.

> 💡 On desktop (or with location denied) use **Try a demo drive** — it feeds a realistic
> simulated route through the exact same tracking engine.

## Optional: make the leaderboard live (multi-player)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open its **SQL Editor** and run everything in [`supabase/schema.sql`](supabase/schema.sql)
3. In [`js/config.js`](js/config.js), fill in `supabaseUrl` and `supabaseAnonKey`
   (Project Settings → API)
4. Redeploy. Everyone using your deployment now shares one live leaderboard —
   the "GLOBAL GRID" pill switches to "● LIVE".

## Project layout

```
tripranked/
├── index.html            app shell (4 screens + modals)
├── css/app.css           dark cockpit theme
├── js/
│   ├── config.js         optional Supabase config + event thresholds
│   ├── util.js           units, geo math, formatting, route drawing
│   ├── store.js          on-device persistence, scoring, tiers, achievements
│   ├── tracker.js        GPS engine: smoothing, distance, events, g-force
│   ├── simulator.js      the scripted demo drive
│   ├── leaderboard.js    global grid + Supabase adapter
│   ├── sharecard.js      canvas share-card generator
│   ├── map.js            live map + trip route maps (Leaflet/OSM)
│   └── app.js            screens, drive lifecycle, rendering
├── vendor/leaflet/       Leaflet 1.9.4 (vendored — no CDN dependency)
├── sw.js                 offline service worker (network-first)
├── manifest.webmanifest  PWA manifest
├── icons/                app icons
├── supabase/schema.sql   optional live leaderboard schema
└── netlify.toml          headers (geolocation allowed, sw.js no-cache)
```

## Notes

- Map tiles come from [OpenStreetMap](https://www.openstreetmap.org/copyright) — free, no
  API key, excellent coverage in Europe. Google/Apple maps require paid developer keys; if
  you have a Google Maps key, swapping the tile URL in `js/map.js` is a one-liner. Without
  a network the map pane degrades gracefully (route lines still draw on the dark base).
- All data lives in your browser's localStorage (export it from **You → Data**).
- Trips shorter than ~40 m / 20 s are discarded as noise.
- GPS accuracy varies; fixes worse than 40 m are ignored, so distance/top speed stay honest.

**🛡️ Drive responsibly.** Start the trip, put the phone down, obey speed limits.
The leaderboard isn't worth it.

---
*TripRanked is an original web tribute inspired by GPS drive-tracker apps like TripRank.*
