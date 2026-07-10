/* TripRanked — on-device persistence, scoring, ranks and achievements. */
'use strict';

const Store = (() => {
  const KEY = 'tripranked.v1';

  const EMOJIS = ['🏎️', '🚗', '🚙', '🛻', '🚘', '🏁', '⚡', '🛞', '🚕', '🚓'];

  const defaults = () => ({
    profile: {
      name: 'Driver',
      tag: 'TR-' + String(1000 + Math.floor(Math.random() * 9000)),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      hue: Math.floor(Math.random() * 360),
      createdAt: Date.now()
    },
    settings: {
      // mph only for the US/UK-style locales; everyone else (Germany!) gets km/h
      units: (() => {
        try {
          const l = (navigator.language || 'en-US').toLowerCase();
          return (l === 'en' || l.endsWith('-us') || l.endsWith('-gb')) ? 'mph' : 'kmh';
        } catch (_) { return 'kmh'; }
      })(),
      keepAwake: true,
      demoSeen: false
    },
    trips: []              // newest first
  });

  let state = null;

  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
      // deep-merge the two nested objects so new fields get defaults
      state.profile = Object.assign(defaults().profile, state.profile);
      state.settings = Object.assign(defaults().settings, state.settings);
      if (!Array.isArray(state.trips)) state.trips = [];
    } catch (_) {
      state = defaults();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Storage full — drop the heaviest payload (old trip paths) and retry once.
      state.trips.slice(20).forEach(t => { t.path = []; t.speeds = []; });
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* give up quietly */ }
    }
  }

  /* ---- trips ---- */

  function addTrip(trip) {
    load();
    state.trips.unshift(trip);
    if (state.trips.length > 200) state.trips.length = 200;
    save();
    return trip;
  }

  function deleteTrip(id) {
    load();
    state.trips = state.trips.filter(t => t.id !== id);
    save();
  }

  function getTrip(id) {
    return load().trips.find(t => t.id === id) || null;
  }

  /* ---- scoring ----
   * 100-point smoothness score, penalties normalized per 10 km so short
   * hops aren't graded more harshly than long drives.
   */
  function scoreTrip(t) {
    // floor at 3 km so a couple of events on a short hop doesn't nuke the grade
    const km = Math.max(3, t.distanceM / 1000);
    const per10 = n => (n / km) * 10;
    const penalty =
      per10(t.events.hardBrakes) * 2.5 +
      per10(t.events.hardAccels) * 2.0 +
      per10(t.events.hardCorners) * 1.5;
    return Math.round(U.clamp(100 - penalty, 0, 100));
  }

  function grade(score) {
    if (score >= 97) return 'A+';
    if (score >= 92) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 78) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /* ---- aggregates ---- */

  function totals(sinceTs) {
    const trips = load().trips.filter(t => !sinceTs || t.startedAt >= sinceTs);
    const agg = {
      trips: trips.length,
      distanceM: 0,
      timeMs: 0,
      movingMs: 0,
      maxSpeedMs: 0,
      bestScore: 0,
      avgScore: 0,
      longestM: 0,
      events: { hardAccels: 0, hardBrakes: 0, hardCorners: 0, stops: 0 },
      maxG: 0
    };
    let wSum = 0, wScore = 0;
    for (const t of trips) {
      agg.distanceM += t.distanceM;
      agg.timeMs += t.durationMs;
      agg.movingMs += t.movingMs || t.durationMs;
      agg.maxSpeedMs = Math.max(agg.maxSpeedMs, t.maxSpeedMs);
      agg.bestScore = Math.max(agg.bestScore, t.score);
      agg.longestM = Math.max(agg.longestM, t.distanceM);
      agg.maxG = Math.max(agg.maxG, t.maxG || 0);
      for (const k in agg.events) agg.events[k] += (t.events && t.events[k]) || 0;
      const w = Math.max(0.5, t.distanceM / 1000);
      wSum += w; wScore += w * t.score;
    }
    agg.avgScore = wSum ? Math.round(wScore / wSum) : 0;
    return agg;
  }

  function streakDays() {
    const days = new Set(load().trips.map(t => new Date(t.startedAt).toDateString()));
    let streak = 0;
    const d = new Date();
    // allow the streak to count if today has no trip yet but yesterday does
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  /* ---- rank tiers (progression by lifetime distance) ---- */

  const TIERS = [
    { name: 'Rookie',   icon: '🔰', atKm: 0 },
    { name: 'Bronze',   icon: '🥉', atKm: 50 },
    { name: 'Silver',   icon: '🥈', atKm: 200 },
    { name: 'Gold',     icon: '🥇', atKm: 500 },
    { name: 'Platinum', icon: '💠', atKm: 1500 },
    { name: 'Apex',     icon: '👑', atKm: 5000 }
  ];

  function tier(distanceM) {
    const km = distanceM / 1000;
    let cur = TIERS[0], next = null;
    for (let i = 0; i < TIERS.length; i++) {
      if (km >= TIERS[i].atKm) cur = TIERS[i];
      else { next = TIERS[i]; break; }
    }
    const base = cur.atKm, ceil = next ? next.atKm : cur.atKm;
    const progress = next ? U.clamp((km - base) / (ceil - base), 0, 1) : 1;
    return { ...cur, next, progress, km };
  }

  /* ---- achievements ---- */

  function achievements() {
    const t = totals();
    const trips = load().trips;
    const hasNight = trips.some(x => {
      const h = new Date(x.startedAt).getHours();
      return h >= 22 || h < 4;
    });
    const fast = (ms) => trips.some(x => x.maxSpeedMs >= ms);
    const smoothLong = trips.some(x => x.score >= 95 && x.distanceM >= 5000);
    return [
      { id: 'first',    icon: '🎉', name: 'First Trip',      desc: 'Complete your first drive',              earned: t.trips >= 1 },
      { id: 'ten',      icon: '🔟', name: 'Regular',          desc: 'Complete 10 trips',                      earned: t.trips >= 10 },
      { id: 'fifty',    icon: '🏋️', name: 'Road Warrior',     desc: 'Complete 50 trips',                      earned: t.trips >= 50 },
      { id: 'highway',  icon: '🛣️', name: 'Highway Legal',    desc: 'Reach highway speed (60+ mph)',          earned: fast(26.8) },
      { id: 'century',  icon: '💯', name: 'Century Club',     desc: '100 km lifetime distance',               earned: t.distanceM >= 100000 },
      { id: 'grand',    icon: '🌍', name: 'Globetrotter',     desc: '1,000 km lifetime distance',             earned: t.distanceM >= 1000000 },
      { id: 'marathon', icon: '🏜️', name: 'Long Hauler',      desc: 'A single trip of 100+ km',               earned: t.longestM >= 100000 },
      { id: 'smooth',   icon: '🧈', name: 'Smooth Operator',  desc: 'Score 95+ on a 5 km+ trip',              earned: smoothLong },
      { id: 'night',    icon: '🦉', name: 'Night Owl',        desc: 'Drive between 10 PM and 4 AM',           earned: hasNight },
      { id: 'streak3',  icon: '🔥', name: 'On a Streak',      desc: 'Drive 3 days in a row',                  earned: streakDays() >= 3 },
      { id: 'hour',     icon: '⏱️', name: 'Endurance',        desc: '10 hours total drive time',              earned: t.timeMs >= 36e6 },
      { id: 'clean',    icon: '✨', name: 'Flawless',         desc: 'A perfect 100 score trip',               earned: t.bestScore >= 100 }
    ];
  }

  /* ---- misc ---- */

  function tripName(startedAt) {
    const h = new Date(startedAt).getHours();
    if (h >= 5 && h < 12) return { name: 'Morning Drive', icon: '🌅' };
    if (h >= 12 && h < 17) return { name: 'Afternoon Drive', icon: '☀️' };
    if (h >= 17 && h < 21) return { name: 'Evening Drive', icon: '🌆' };
    return { name: 'Night Drive', icon: '🌙' };
  }

  function exportJSON() {
    return JSON.stringify(load(), null, 2);
  }

  function resetAll() {
    state = defaults();
    save();
  }

  return {
    load, save, addTrip, deleteTrip, getTrip,
    scoreTrip, grade, totals, streakDays, tier, achievements,
    tripName, exportJSON, resetAll,
    get profile() { return load().profile; },
    get settings() { return load().settings; },
    get trips() { return load().trips; }
  };
})();
