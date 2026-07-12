# App Ideas Research — What to Build in 2026 (and What to Avoid)

*Research compiled July 2026. Method: 5 parallel search angles → 22 sources fetched → 35 claims extracted → 25 claims adversarially fact-checked (3 independent verification votes each). Only claims that survived verification are presented as fact; weaker signals are labeled as such.*

---

## TL;DR

The app stores are flooded — 557,000 new iOS apps in 2025 alone (+24% YoY, the biggest release year in nearly a decade), driven by AI "vibe coding" tools. **Building an app is no longer the hard part; being found and being kept is.** The data says three things clearly:

1. **Generic AI-wrapper apps are a trap.** They sell well up front but churn 30% faster than non-AI apps (RevenueCat, 115k+ apps analyzed).
2. **Vertical beats horizontal.** Industry-specific software for "boring" trades retains customers dramatically better (ServiceTitan: >95% gross retention for 10 straight quarters, verified in their SEC filing, vs. 78–85% for generic small-business SaaS).
3. **Craft is the differentiator again.** Nielsen Norman Group's State of UX 2026: AI slop is ubiquitous, users are fatigued, and "authentic, human details will set experiences apart."

**Your unfair advantage is that you run a real pressure-washing business.** The strongest opportunities on this list are the ones only someone like you can build credibly — tools for exterior-cleaning and small service crews, dogfooded on sprkwash, sold to peers. Start with #1 or #2 below.

---

## 1. The 2026 market landscape (verified facts)

| Fact | Number | Source |
|---|---|---|
| New iOS app submissions, 2025 | 557,000 (+24% YoY; biggest year since 2017) | Appfigures |
| Q1 2026 submissions | 235,800 (+84% YoY) | Appfigures / The Information |
| Revenue concentration (iOS + Google Play combined) | Top 1% of apps took 92.2% of in-app-purchase revenue in 2025 ($154B vs. $13.1B for everyone else) | Sensor Tower, State of Mobile 2026 |
| How apps get discovered | 70% of App Store visitors discover apps through search | Apple (Apple Ads data) |
| Search rank decay | Rank 1 ≈ 28.4% tap-through, rank 2 ≈ 6.2%, rank 3 ≈ 2.7% — the cliff is after the top 3 | SplitMetrics benchmarks |
| AI apps, 12-month retention | 21.1% vs. 30.7% for non-AI apps (30% faster churn) | RevenueCat 2026 State of Subscription Apps |
| AI apps, upfront conversion | 52% *better* trial-to-paid (8.5% vs 5.6%) | RevenueCat |

**What this means:** the AI label sells the first month and loses the year. The flood of same-looking apps is real, but it's a flood of *low-effort* apps — the bar to stand out on craft and real utility has arguably never been lower relative to the noise.

**Corrections found during fact-checking** (claims that circulate widely but failed verification):
- "2025 was the biggest App Store year since 2016" — false; 2017 had 731K submissions. Correct framing: biggest in nearly a decade.
- "90% of users never scroll past the 10th search result" — untraceable to any real study; the real stat is the top-3 rank cliff above.
- "The Productivity category is an opportunity zone because high removals mean failing incumbents" — refuted. Apple's removals are overwhelmingly spam/abandoned-app purges, and productivity downloads are *declining*. Generic productivity is one of the most oversaturated categories. Avoid.

### Categories to avoid (evidence-backed)
- **Generic AI chat/writing/photo wrappers** — the churn data above.
- **Calorie/health tracking, habit trackers, to-do lists** — deep-moat incumbents (MyFitnessPal etc.); one documented indie spent 5 years on a calorie counter with zero traction.
- **Anything whose only pitch is "like X but with AI."**

---

## 2. What makes an app feel premium vs. slop in 2026

From NN/g's State of UX 2026 (the most authoritative source in this research, all claims verified) plus supporting design sources:

**The core shift:** surface UI is commodified — design systems and AI tooling give everyone the same clean interface. Premium now lives in the *deeper layers*: system behavior, underlying logic, and trust.

**The trust checklist (NN/g, verbatim fundamentals):**
- **Transparency** — show what the app is doing and why (e.g., show the math behind a quote, not just a number).
- **Control** — let users override, undo, adjust.
- **Consistency** — same action, same result, every time.
- **Support when the system fails** — graceful errors, obvious recovery, a human to reach.

**Craft signals that separate premium from slop** (directional, from design-industry sources):
- Pick ~3 interaction patterns and execute them precisely, rather than using every trend. 
- **Speed is design** — a beautiful interface that lags is a failed interface.
- One strong opinion in the visual identity (a distinctive color, bold type, an uncommon layout) instead of the default purple-gradient-on-dark that outs vibe-coded apps. A scored survey of 1,590 Show HN launches found only ~46% avoided recognizable "AI slop" visual patterns — avoiding them is itself differentiation.
- Onboarding: 3–5 screens max, 1–2 personalization questions that *visibly change the experience*, first meaningful action within 60 seconds.
- Real photography/data over stock illustrations. For anything in your world, before/after photos of actual jobs beat any illustration.
- Use AI only where it silently solves a user problem (auto-drafting a quote, cleaning up a photo) — never as the headline.

---

## 3. The opportunity thesis

Verified: vertical (industry-specific) software retains far better than horizontal tools — ServiceTitan's SEC S-1 shows >95% gross retention and >110% net revenue retention for 10 consecutive quarters, versus 78–85% gross retention and 3–7% *monthly* churn typical of generic SMB SaaS. The vertical SaaS market (~$130B in 2025) is growing 16–22%/yr, and embedded payments deepen the moat once customers run money through your product.

Distribution beats build speed: ~72% of successful indie builders cite distribution, not product, as the deciding factor (indie-community data, directional). You already have distribution most builders would kill for: a real business, real customers, peer operators in Facebook groups and r/pressurewashing, and content that's inherently viral (satisfying before/after transformations).

---

## 4. The app opportunities

Ranked in three tiers. Evidence strength marked: ✅ = verified data, 📊 = credible directional signal, 💡 = synthesis from verified principles.

### Tier 1 — Your unfair advantage (B2B, local services)

#### 1. SnapQuote — instant exterior-cleaning quotes from an address ⭐ top pick
- **Problem:** Quoting a driveway/house wash means a site visit or guesswork. Incumbent field-service platforms (Jobber, Housecall Pro) lack satellite property measurement, forcing owners to bolt on separate tools (ResponsiBid, etc.). 📊
- **What it is:** Homeowner or operator enters an address → satellite/parcel data measures driveway, roof, siding area → instant, transparent price range → books the job. Embeddable widget for any cleaner's website (yours first).
- **Target user:** Solo and 2–3-person exterior-cleaning crews (pressure washing, soft wash, windows, gutters). US pressure washing alone: ~$1.2B market, ~32,000 businesses. 📊
- **Monetization:** $29–79/mo SaaS per business; later, payments on booked jobs (embedded payments = higher switching costs ✅).
- **Why you win:** You'll dogfood it on sprkwash, price it from real job data, and sell it in operator communities where a real operator has instant credibility. QuoteIQ's traction proves a vertical quoting wedge can carve share from Jobber. 📊
- **Cool factor:** The "type your address, watch your property get measured and priced in 5 seconds" moment is a genuine wow — and it demos perfectly in a 20-second TikTok.

#### 2. ProofKit — before/after proof, reviews, and content engine for service businesses
- **Problem:** Operators juggle 5–10 disconnected apps; photo documentation (CompanyCam), review requests, and social posting are all separate. 📊 Before/after content is the #1 marketing asset in this trade and it's handled with camera rolls and group texts.
- **What it is:** Crew snaps before/after on site → app auto-builds the composite/slider, attaches it to the job record, texts the customer a review link with their own transformation photo, and queues a branded post. A public "wall of proof" page per business (SEO for their local keywords).
- **Monetization:** $19–49/mo per business. Free tier = watermarked composites (built-in viral loop).
- **Why you win:** Same distribution edge; the output is inherently shareable so the product markets itself. r/powerwashingporn and pressure-washing TikTok prove the content demand.
- **Cool factor:** Highest of any idea here — the product's output *is* satisfying visual content.

#### 3. DayRunner — the one-app workday for 1–3 person crews
- **Problem:** Verified complaint patterns: Jobber's confusing tiers and upsell pressure; Housecall Pro's unreliable payment/refund flows; both are built (and priced) for bigger fleets. 📊 Small crews get bloat and $100+/mo bills.
- **What it is:** The anti-Jobber. One screen per day: jobs in route order, gate codes and notes, chemical-mix calculator, weather-aware rescheduling ("rain Thursday — these 3 jobs auto-propose Friday slots to customers"), invoice on completion. One flat price.
- **Monetization:** $25–40/mo flat. No tiers — that *is* the positioning.
- **Why you win:** Incumbents structurally can't serve this segment cheaply; their cost base needs upsells. A solo builder with near-zero overhead can. Weather-aware rescheduling alone is a killer feature for outdoor trades that generic FSM tools ignore.

#### 4. HomeLog — the "Carfax for your house" 💡
- **Problem:** Homeowners have no record of what's been serviced, when, by whom, or what it cost — painful for maintenance planning and at resale.
- **What it is:** A maintenance timeline per home. Service pros (starting with you) log completed jobs with photos; homeowners get the record plus smart reminders ("driveway sealed 14 months ago — due this spring"). Pros get automatic rebooking demand.
- **Monetization:** Free for homeowners; pros pay for the rebooking/reminder channel. 
- **Why you win:** Two-sided apps are usually chicken-and-egg death — but you already own one side (your customer list seeds it). Every reminder is a warm lead back to the pro who logged the work. Long-term data moat.
- **Risk:** Slower burn than 1–3; build after one of those is earning.

### Tier 2 — Consumer apps backed by complaint mining 📊
*(Demand signals from mining ~1M+ user complaints/reviews across Reddit, app stores, G2/Capterra — credible methodology, but from a source my fact-checking pass rated only moderately reliable. Validate before building — see §6.)*

#### 5. Refund Radar — return windows & refund tracking
Forward receipts / connect email → tracks every purchase's return window, warranty, and pending refund; nags before windows close; drafts the refund request. Real money recovered = retention. Freemium + $3–5/mo. Crowded adjacent space (Rocket Money is bill-focused), but nobody owns "returns & refunds."

#### 6. GigTax — real-time tax set-aside for gig workers
Connects to gig income; shows live "this is yours / this is the IRS's" split, auto-computes quarterly estimates, catches mileage deductions. Recurring complaint theme among Uber/DoorDash/freelance workers hit with surprise tax bills. $8–12/mo, seasonal spike marketing. Genuinely *helps people* who are financially stretched.

#### 7. SplitHome — money-splitting for messy real households
Splitwise handles even splits; real complaints center on the hard cases — unequal incomes, one person on the lease, subletters, couples+roommate hybrids. Handle the awkward 20% Splitwise won't. Small but passionate market; premium one-time purchase or low subscription.

### Tier 3 — Wildcard
#### 8. Species-aware plant care 📊
Complaint mining shows plant apps are generic, ad-cluttered, or paywalled; people want care schedules that actually adapt to species + their home's light/humidity. Cool, wholesome, photogenic. But it's a crowded consumer category with weak monetization — only build as a passion project.

---

## 5. Build it: stack and go-to-market for your setup

**Stack (extends what you already know — HTML/Supabase/Netlify):**
- **Web-first PWA**: your existing stack ships an installable, offline-capable app at 50–70% lower cost than native, and web/SEO is the right acquisition channel for B2B tools sold to business owners who Google their problems. 📊
- Add a lightweight framework as apps grow beyond static pages (SvelteKit or Next.js — both deploy to Netlify; Supabase handles auth, Postgres, storage, realtime as you already use it).
- **Go native later, only if** App Store search becomes the acquisition channel (Tier 2 consumer ideas). Then: one cross-platform codebase (Flutter or React Native + your same Supabase backend). If native, ASO is the channel: organic search ≈ 65% of installs; pick keywords with high popularity / low difficulty *before* building, and put them in title + subtitle. 📊
- Payments: Stripe (web) avoids the 15–30% store cut entirely for B2B SaaS.

**Go-to-market (in order):**
1. **Dogfood on sprkwash** — the product's first case study is your own business's numbers.
2. **Sell where operators already gather** — pressure-washing/exterior-cleaning Facebook groups, r/pressurewashing, trade Discords. As a real operator you're a peer, not a spammer.
3. **Content flywheel** — before/after content + "how I quoted this $600 job in 10 seconds" clips. The trade's content is inherently viral.
4. **Long-tail SEO** — "pressure washing quote calculator", "software for solo pressure washing business" — low competition, high intent. 📊
5. Expect a real timeline: successful bootstrapped products take ~12–18 months to meaningful revenue (median indie data, directional). Charge from day one.

---

## 6. The validation playbook (do this before writing code)

1. **Review-mine the incumbents**: read the 1–3★ reviews of Jobber, Housecall Pro, QuoteIQ, Splitwise, etc. Two-star reviews carry the richest product signal — users who cared enough to explain. 📊
2. **Landing page first**: one page (your existing skills), one promise, one "get early access" form. Post it in two operator groups. 10+ signups from strangers = build; silence = next idea.
3. **Ask 5 operators one question**: "what did you do the last time you needed to quote a job you couldn't drive to?" Listen for workarounds — workarounds are demand.
4. **Charge early**: a $10 pre-order filters compliment-givers from customers.

---

## Sources

**Verified primary/high-quality:**
- Nielsen Norman Group, *State of UX 2026: Design Deeper to Differentiate* — nngroup.com/articles/state-of-ux-2026
- RevenueCat, *2026 State of Subscription Apps* (115k+ apps, $16B revenue) — revenuecat.com/state-of-subscription-apps; via TechCrunch 2026-03-10
- Appfigures release-volume data — appfigures.com/resources/insights/20251205
- Sensor Tower, *State of Mobile 2026* (revenue concentration)
- ServiceTitan S-1, SEC filing (vertical SaaS retention) — sec.gov
- Apple Ads (70% search discovery); SplitMetrics (rank tap-through benchmarks)

**Directional (credible but unverified or vendor/forum sources):**
- SaaS Mag on vertical SaaS 2026; Bessemer *Building Vertical AI* (as cited)
- QuoteIQ / Fieldified / OneCrew on pressure-washing software gaps and Jobber/Housecall Pro complaints
- BigIdeasDB complaint-mining idea lists (Tier 2 ideas)
- Indie Hackers case studies (30-app portfolio, $22k/mo; ASO-first validation)
- Muzli, UXCam, Developer's Digest (design/onboarding/slop-pattern specifics)

**Claims explicitly refuted during fact-checking** (do not repeat): "biggest year since 2016"; "90% never scroll past 10th result"; "productivity category removals = opportunity."
