/* TripRanked — leaderboards.
 *
 * Boards: top speed · distance · trips, each over "this week" or "all time".
 *
 * Out of the box the global field is a deterministic simulated grid of 48
 * drivers (stable identities, weekly-varying form) with YOUR real stats
 * ranked among them. If Supabase is configured in js/config.js, the board
 * switches to the real shared table instead and your stats are published
 * to it after every saved trip.
 */
'use strict';

const LB = (() => {
  const FIRST = ['Aria', 'Mason', 'Keiko', 'Diego', 'Lena', 'Marco', 'Priya', 'Jonas', 'Zara',
    'Felix', 'Nadia', 'Omar', 'Ivy', 'Hugo', 'Mila', 'Ravi', 'Sofia', 'Dmitri', 'Elif', 'Kwame',
    'Hana', 'Lucas', 'Ingrid', 'Tomas', 'Amara'];
  const HANDLE_A = ['Turbo', 'Apex', 'Nitro', 'Drift', 'Midnight', 'Redline', 'Ghost', 'Vortex',
    'Torque', 'Slipstream', 'Octane', 'Boost'];
  const HANDLE_B = ['Wolf', 'Falcon', 'Kid', 'Baron', 'Queen', 'Runner', 'Fox', 'Nomad',
    'Pilot', 'Viper', 'Hawk', 'Rex'];
  const FLAGS = ['🇺🇸', '🇩🇪', '🇯🇵', '🇬🇧', '🇮🇹', '🇫🇷', '🇧🇷', '🇨🇦', '🇦🇺', '🇪🇸', '🇲🇽', '🇰🇷',
    '🇳🇱', '🇸🇪', '🇵🇱', '🇮🇳', '🇿🇦', '🇦🇷', '🇳🇴', '🇨🇭'];
  const AVATARS = ['🏎️', '🚗', '🚙', '🛻', '🚘', '🚕', '🏍️', '🚓'];

  let botCache = null;

  function bots() {
    if (botCache && botCache.week === U.isoWeek()) return botCache.list;
    const week = U.isoWeek();
    const list = [];
    for (let i = 0; i < 48; i++) {
      const r = U.mulberry32(U.hashStr('tripranked-grid-' + i));
      const rw = U.mulberry32(U.hashStr('week-' + week + '-' + i));
      const name = r() < 0.55
        ? FIRST[Math.floor(r() * FIRST.length)] + ' ' + 'ABCDEFGHKLMNPRSTVW'[Math.floor(r() * 18)] + '.'
        : HANDLE_A[Math.floor(r() * HANDLE_A.length)] + HANDLE_B[Math.floor(r() * HANDLE_B.length)];

      const distanceKm = 40 + Math.pow(r(), 2.2) * 7000;         // long-tail veterans
      const trips = Math.max(3, Math.round(distanceKm / (7 + r() * 26)));
      const topKmh = 96 + Math.pow(r(), 1.4) * 78;               // 96–174 km/h

      const activity = 0.15 + rw() * 0.85;                        // weekly form
      const weekKm = Math.min(distanceKm * 0.05, (20 + rw() * 320) * activity);
      const weekTrips = Math.max(activity > 0.3 ? 1 : 0, Math.round(weekKm / (9 + rw() * 20)));
      const weekTopKmh = topKmh * (0.72 + rw() * 0.26);

      list.push({
        id: 'grid-' + i,
        name,
        flag: FLAGS[Math.floor(r() * FLAGS.length)],
        emoji: AVATARS[Math.floor(r() * AVATARS.length)],
        all: { speed: topKmh / 3.6, distance: distanceKm * 1000, trips },
        week: { speed: weekTrips ? weekTopKmh / 3.6 : 0, distance: weekKm * 1000, trips: weekTrips }
      });
    }
    botCache = { week, list };
    return list;
  }

  function playerEntry(period) {
    const t = period === 'week' ? Store.totals(U.weekStart()) : Store.totals();
    const p = Store.profile;
    return {
      id: 'you',
      name: p.name,
      flag: '🏁',
      emoji: p.emoji,
      isYou: true,
      all: null,
      stats: { speed: t.maxSpeedMs, distance: t.distanceM, trips: t.trips }
    };
  }

  /* ---- Supabase adapter (optional) ---- */

  const sb = () => {
    const c = window.TR_CONFIG || {};
    return (c.supabaseUrl && c.supabaseAnonKey)
      ? { url: c.supabaseUrl.replace(/\/$/, ''), key: c.supabaseAnonKey }
      : null;
  };

  async function sbFetch(pathAndQuery, opts = {}) {
    const cfg = sb();
    const res = await fetch(`${cfg.url}/rest/v1/${pathAndQuery}`, {
      ...opts,
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    if (!res.ok) throw new Error('Supabase ' + res.status);
    return res.status === 204 ? null : res.json();
  }

  // Publish your current totals (called after each saved trip / profile edit).
  async function submit() {
    if (!sb()) return false;
    const all = Store.totals();
    const wk = Store.totals(U.weekStart());
    const p = Store.profile;
    const row = {
      tag: p.tag,
      name: p.name,
      emoji: p.emoji,
      top_speed_ms: all.maxSpeedMs,
      distance_m: Math.round(all.distanceM),
      trips: all.trips,
      week_key: U.isoWeek(),
      week_top_speed_ms: wk.maxSpeedMs,
      week_distance_m: Math.round(wk.distanceM),
      week_trips: wk.trips,
      updated_at: new Date().toISOString()
    };
    try {
      await sbFetch('leaderboard?on_conflict=tag', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(row)
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async function sbBoard(metric, period) {
    const colMap = period === 'week'
      ? { speed: 'week_top_speed_ms', distance: 'week_distance_m', trips: 'week_trips' }
      : { speed: 'top_speed_ms', distance: 'distance_m', trips: 'trips' };
    const col = colMap[metric];
    let q = `leaderboard?select=tag,name,emoji,${col}&order=${col}.desc&limit=100`;
    if (period === 'week') q += `&week_key=eq.${U.isoWeek()}`;
    const rows = await sbFetch(q);
    const myTag = Store.profile.tag;
    return rows
      .map(r => ({
        id: r.tag, name: r.name, emoji: r.emoji || '🚗', flag: '',
        isYou: r.tag === myTag, value: +r[col] || 0
      }))
      .filter(r => r.value > 0);
  }

  /* ---- public ---- */

  // metric: 'speed' | 'distance' | 'trips'; period: 'week' | 'all'
  // → { live: bool, rows: [{rank, name, emoji, flag, value, isYou}] }
  async function board(metric, period) {
    if (sb()) {
      try {
        let rows = await sbBoard(metric, period);
        const you = playerEntry(period);
        if (!rows.some(r => r.isYou) && you.stats[metric] > 0) {
          rows.push({ id: 'you', name: you.name, emoji: you.emoji, flag: you.flag, isYou: true, value: you.stats[metric] });
        }
        rows.sort((a, b) => b.value - a.value);
        rows.forEach((r, i) => (r.rank = i + 1));
        return { live: true, rows };
      } catch (_) { /* fall through to the simulated grid */ }
    }

    const you = playerEntry(period);
    const rows = bots().map(b => {
      const st = period === 'week' ? b.week : b.all;
      return { id: b.id, name: b.name, emoji: b.emoji, flag: b.flag, isYou: false, value: st[metric] };
    }).filter(r => r.value > 0);
    rows.push({ id: 'you', name: you.name, emoji: you.emoji, flag: you.flag, isYou: true, value: you.stats[metric] });
    rows.sort((a, b) => b.value - a.value);
    rows.forEach((r, i) => (r.rank = i + 1));
    return { live: false, rows };
  }

  const isLive = () => !!sb();

  return { board, submit, isLive };
})();
