/* TripRanked — shared utilities. Everything internal is SI: meters, m/s, milliseconds. */
'use strict';

const U = {
  MS_TO_KMH: 3.6,
  MS_TO_MPH: 2.236936,

  $(sel, root) { return (root || document).querySelector(sel); },
  $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },

  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  },

  clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); },
  lerp(a, b, t) { return a + (b - a) * t; },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  /* ---- geo math ---- */

  // Distance in meters between two lat/lon points.
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  },

  // Initial bearing in degrees (0..360) from point 1 to point 2.
  bearing(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180;
    const y = Math.sin((lon2 - lon1) * rad) * Math.cos(lat2 * rad);
    const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
      Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon2 - lon1) * rad);
    return (Math.atan2(y, x) / rad + 360) % 360;
  },

  // Signed shortest angular difference a→b in degrees (-180..180).
  angDiff(a, b) {
    let d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  },

  compass(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
  },

  /* ---- units & formatting ---- */

  // speed m/s -> {v, unit} in user units
  speed(ms, units, digits = 0) {
    const v = ms * (units === 'kmh' ? U.MS_TO_KMH : U.MS_TO_MPH);
    return { v: v.toFixed(digits), unit: units === 'kmh' ? 'km/h' : 'mph' };
  },

  // distance meters -> {v, unit}
  dist(m, units, digits = 1) {
    if (units === 'kmh') {
      const km = m / 1000;
      return { v: km >= 100 ? Math.round(km).toString() : km.toFixed(digits), unit: 'km' };
    }
    const mi = m / 1609.344;
    return { v: mi >= 100 ? Math.round(mi).toString() : mi.toFixed(digits), unit: 'mi' };
  },

  fmtDuration(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    const p = n => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${p(m)}:${p(r)}` : `${m}:${p(r)}`;
  },

  fmtDurationLong(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m} min`;
    return `${s}s`;
  },

  fmtClock(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  },

  fmtDate(ts) {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  },

  relDate(ts) {
    const d = new Date(ts), now = new Date();
    const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(now) - day(d)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  },

  fmtInt(n) { return Math.round(n).toLocaleString(); },

  /* ---- deterministic PRNG (leaderboard field) ---- */

  hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // ISO week key like "2026-W28" — drives the weekly leaderboard shuffle.
  isoWeek(ts) {
    const d = new Date(ts ? ts : Date.now());
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = (t.getUTCDay() + 6) % 7;
    t.setUTCDate(t.getUTCDate() - dayNum + 3);
    const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  },

  // Start of the current ISO week (Monday 00:00 local).
  weekStart(ts) {
    const d = new Date(ts ? ts : Date.now());
    const day = (d.getDay() + 6) % 7;
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
    return m.getTime();
  },

  haptic(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) { /* unsupported */ }
  },

  /* Draw a recorded trip path ([lat,lon,t,v][]) into a canvas rect.
   * Segments are colored by speed; start/end markers included. */
  drawRoute(ctx, path, x, y, w, h, opts = {}) {
    if (!path || path.length < 2) {
      ctx.save();
      ctx.fillStyle = opts.emptyColor || 'rgba(255,255,255,.25)';
      ctx.font = `${Math.round(h / 10)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('No route recorded', x + w / 2, y + h / 2);
      ctx.restore();
      return;
    }
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity, maxV = 1;
    for (const p of path) {
      minLat = Math.min(minLat, p[0]); maxLat = Math.max(maxLat, p[0]);
      minLon = Math.min(minLon, p[1]); maxLon = Math.max(maxLon, p[1]);
      maxV = Math.max(maxV, p[3] || 0);
    }
    const midLat = (minLat + maxLat) / 2;
    const kx = Math.cos(midLat * Math.PI / 180);
    const spanX = Math.max((maxLon - minLon) * kx, 1e-6);
    const spanY = Math.max(maxLat - minLat, 1e-6);
    const pad = opts.pad != null ? opts.pad : Math.min(w, h) * 0.12;
    const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);
    const ox = x + w / 2 - ((minLon + maxLon) / 2) * kx * scale;
    const oy = y + h / 2 + midLat * scale;
    const px = p => [ox + p[1] * kx * scale, oy - p[0] * scale];

    const speedColor = v => {
      const t = U.clamp(v / Math.max(8, maxV), 0, 1);
      // blue (slow) → green → amber (fast)
      const h1 = U.lerp(210, 145, Math.min(1, t * 2));
      const h2 = U.lerp(145, 40, Math.max(0, t * 2 - 1));
      return `hsl(${t < 0.5 ? h1 : h2} 90% 60%)`;
    };

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const lw = opts.lineWidth || Math.max(2, Math.min(w, h) / 70);
    if (opts.glow !== false) {
      ctx.shadowColor = 'rgba(61,214,140,.5)';
      ctx.shadowBlur = lw * 2.2;
    }
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = px(path[i - 1]);
      const [bx, by] = px(path[i]);
      ctx.strokeStyle = speedColor(path[i][3] || 0);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    const dot = (p, color) => {
      const [cx, cy] = px(p);
      ctx.beginPath();
      ctx.arc(cx, cy, lw * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, lw * 0.5);
      ctx.strokeStyle = 'rgba(10,14,19,.9)';
      ctx.stroke();
    };
    dot(path[0], '#3dd68c');
    dot(path[path.length - 1], '#ff5d5d');
    ctx.restore();
  }
};
