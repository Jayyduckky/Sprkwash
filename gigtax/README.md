# GigTax 🟩🟧

**Know what's actually yours.** A real-time tax set-aside app for gig workers and freelancers — log a payout, instantly see what's safe to spend and what to set aside for the IRS.

Built from the opportunities identified in [`../research/app-ideas-2026.md`](../research/app-ideas-2026.md) (Tier 2, idea #6). Completely standalone — no connection to the sprkwash site. Deploy it as its own Netlify site (drag the `gigtax` folder into Netlify, or point a new site at this folder).

## What it does

- **60-second onboarding** — 3 questions (gig type, filing status + state, expected income) that end with *your* personalized set-aside percentage, with the full math shown.
- **Home** — the money screen: big "safe to spend" number, animated yours-vs-IRS split bar, quick-add payouts and expenses.
- **Miles** — one-tap mileage logging; every mile shows its dollar value as a deduction.
- **Quarters** — the four IRS estimated-tax deadlines with countdowns, your estimated tax so far vs. what you've set aside ("on track" / "short"), full calculation breakdown, mark-paid tracking.
- **Settings** — every rate is visible and editable (set-aside override, state rate, mileage rate). CSV export. Full data erase.

## Design decisions (from the research)

- **Trust over gloss** (NN/g State of UX 2026): the math is never hidden — "How we got this" is one tap away everywhere a number appears. Estimates are labeled as estimates.
- **One strong visual opinion**: warm paper + ink, money-green for "yours," burnt-orange for "set aside." Space Grotesk / IBM Plex Mono. No purple gradients, no AI anything.
- **Speed is design**: single file, no framework, local-first (localStorage) — first meaningful action well under 60 seconds, works offline as an installable PWA.
- **Retention through utility**: useful every single time the user gets paid — the verified antidote to the churn that kills gimmick apps.

## Tax math (v1 scope)

Federal self-employment tax (15.3% with the 92.35% factor and SS wage-base cap), federal income tax via 2026 bracket estimates with standard deduction and the ½-SE-tax adjustment, plus a flat editable state rate. **Planning estimates only — not tax advice.** All constants live in one `TAX` object in `index.html` and the user-facing rates are editable in Settings.

## Roadmap

1. Supabase auth + sync (same backend pattern as the main site) so data follows the user across devices
2. Bank/gig-platform import (Plaid or CSV from Uber/DoorDash/Stripe)
3. Push reminders before quarterly deadlines
4. W-2 + gig hybrid income support
5. Native wrapper (Capacitor) if App Store search proves to be a real acquisition channel — keyword: "gig worker tax calculator"
