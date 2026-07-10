/* TripRanked — GPS trip engine.
 *
 * Consumes GeolocationPosition fixes (real watchPosition or injected by the
 * demo simulator — identical pipeline either way), smooths speed, accumulates
 * distance/time, estimates longitudinal & lateral g from kinematics, and
 * detects driving events: hard acceleration, hard braking, hard cornering
 * and full stops.
 */
'use strict';

const Tracker = (() => {
  const T = () => window.TR_CONFIG.thresholds;

  let s = null;          // live trip state (null when idle)
  let watchId = null;
  let demoMode = false;

  const gps = { status: 'off', accuracy: null, error: '' }; // off|acquiring|ok|weak|denied|error

  function blank(now) {
    return {
      startedAt: now,
      lastFixAt: 0,
      // last accepted sample
      lat: null, lon: null, t: 0,
      // motion state
      speedMs: 0,          // smoothed
      rawSpeedMs: 0,
      accel: 0,            // smoothed longitudinal m/s²
      heading: NaN,
      headingOk: false,
      gLat: 0, gLon: 0,
      // accumulators
      distanceM: 0,
      movingMs: 0,
      maxSpeedMs: 0,
      maxG: 0,
      samples: 0,
      // events
      events: { hardAccels: 0, hardBrakes: 0, hardCorners: 0, stops: 0 },
      cooldown: { accel: 0, brake: 0, corner: 0 },
      hold: { accel: 0, brake: 0, corner: 0 },   // sustained-condition timers (s)
      stopped: true,
      stopHold: 0, moveHold: 0, hasMoved: false,
      // recordings
      path: [],            // [lat, lon, tRelSec, speedMs]
      speeds: [],          // [tRelSec, speedMs]
      pathT0: null,
      lastPathT: -1e9, lastPathLat: null, lastPathLon: null,
      lastSpeedT: -1e9
    };
  }

  /* ---- the sample pipeline ---- */

  function process(lat, lon, tMs, rawSpd, rawHeading, accuracy) {
    if (!s) return;
    const th = T();

    if (accuracy != null && accuracy > th.maxAccuracyM) {
      gps.status = 'weak'; gps.accuracy = accuracy;
      return; // fix too sloppy to trust
    }
    gps.status = 'ok'; gps.accuracy = accuracy;
    s.lastFixAt = Date.now();

    // First accepted fix — anchor only.
    if (s.lat === null) {
      s.lat = lat; s.lon = lon; s.t = tMs; s.pathT0 = tMs;
      recordPath(lat, lon, 0, 0);
      s.samples++;
      return;
    }

    let dt = (tMs - s.t) / 1000;
    if (dt <= 0.05) return;                    // duplicate / out-of-order fix
    if (dt > 10) {                             // signal gap — re-anchor, no phantom distance
      s.lat = lat; s.lon = lon; s.t = tMs;
      return;
    }

    const d = U.haversine(s.lat, s.lon, lat, lon);

    // Derived or reported speed (m/s)
    let v = (rawSpd != null && isFinite(rawSpd) && rawSpd >= 0) ? rawSpd : d / dt;
    // Physically implausible jump → clamp to a 12 m/s² envelope
    const maxDelta = 12 * dt;
    v = U.clamp(v, Math.max(0, s.rawSpeedMs - maxDelta), s.rawSpeedMs + maxDelta);
    s.rawSpeedMs = v;

    // Smooth speed (time-aware EMA, tau ≈ 1.2 s)
    const aV = 1 - Math.exp(-dt / 1.2);
    const prevSmooth = s.speedMs;
    s.speedMs = U.lerp(s.speedMs, v, aV);
    if (s.speedMs < 0.15) s.speedMs = 0;

    // Longitudinal acceleration (smoothed, tau ≈ 0.8 s)
    const rawA = (s.speedMs - prevSmooth) / dt;
    const aA = 1 - Math.exp(-dt / 0.8);
    s.accel = U.lerp(s.accel, rawA, aA);
    s.gLon = s.accel / 9.81;

    // Heading + lateral g (only meaningful while actually moving).
    // Smoothed (tau ≈ 0.5 s) and clamped so single-sample heading jumps —
    // GPS noise, tunnels, the works — can't fake impossible g readings.
    let hdg = (rawHeading != null && isFinite(rawHeading) && s.speedMs > 1.5) ? rawHeading
      : (d > 3 ? U.bearing(s.lat, s.lon, lat, lon) : NaN);
    let gLatRaw = 0;
    if (isFinite(hdg)) {
      if (s.headingOk && s.speedMs > 4) {
        const rate = U.clamp(U.angDiff(s.heading, hdg) / dt, -60, 60);  // deg/s
        gLatRaw = U.clamp((s.speedMs * rate * Math.PI / 180) / 9.81, -1.3, 1.3);
      }
      s.heading = hdg; s.headingOk = true;
    }
    const aG = 1 - Math.exp(-dt / 0.5);
    s.gLat = U.lerp(s.gLat, gLatRaw, aG);
    s.maxG = Math.max(s.maxG, Math.abs(s.gLat), Math.abs(s.gLon));

    // Distance & moving time (ignore GPS drift while parked)
    if (s.speedMs > th.moveSpeed && d < 120) {
      s.distanceM += d;
      s.movingMs += dt * 1000;
    }

    // Top speed (trust good fixes only)
    if (accuracy == null || accuracy <= 25) {
      s.maxSpeedMs = Math.max(s.maxSpeedMs, s.speedMs);
    }

    // ---- events (sustained ≥0.5 s + per-type cooldown) ----
    const now = tMs / 1000;
    const sustain = (key, cond) => {
      s.hold[key] = cond ? s.hold[key] + dt : 0;
      if (s.hold[key] >= 0.5 && now - s.cooldown[key] > th.eventCooldownMs / 1000) {
        s.cooldown[key] = now;
        s.hold[key] = 0;
        return true;
      }
      return false;
    };
    if (sustain('accel', s.accel > th.hardAccel && s.speedMs > 2)) s.events.hardAccels++;
    if (sustain('brake', s.accel < th.hardBrake && s.speedMs > 2)) s.events.hardBrakes++;
    if (sustain('corner', Math.abs(s.gLat) > th.hardCornerG && s.speedMs > 5)) s.events.hardCorners++;

    // Stops: moving → standstill (2.5 s under stopSpeed)
    if (s.speedMs < th.stopSpeed) {
      s.moveHold = 0;
      s.stopHold += dt;
      if (!s.stopped && s.stopHold >= 2.5) {
        s.stopped = true;
        if (s.hasMoved) s.events.stops++;
      }
    } else {
      s.stopHold = 0;
      s.moveHold += dt;
      if (s.moveHold >= 1) {
        s.stopped = false;
        if (s.speedMs > th.moveSpeed) s.hasMoved = true;
      }
    }

    // ---- recordings ----
    if (s.pathT0 == null) s.pathT0 = tMs;
    const tRel = (tMs - s.pathT0) / 1000;
    const dRec = (s.lastPathLat != null)
      ? U.haversine(s.lastPathLat, s.lastPathLon, lat, lon) : Infinity;
    if (dRec >= 15 || tRel - s.lastPathT >= 5) recordPath(lat, lon, tRel, s.speedMs);
    if (tRel - s.lastSpeedT >= 1) {
      s.speeds.push([Math.round(tRel), +s.speedMs.toFixed(2)]);
      s.lastSpeedT = tRel;
      if (s.speeds.length > 1800) s.speeds = s.speeds.filter((_, i) => i % 2 === 0);
    }

    s.lat = lat; s.lon = lon; s.t = tMs;
    s.samples++;
  }

  function recordPath(lat, lon, tRel, spd) {
    s.path.push([+lat.toFixed(6), +lon.toFixed(6), Math.round(tRel), +spd.toFixed(1)]);
    s.lastPathT = tRel; s.lastPathLat = lat; s.lastPathLon = lon;
    if (s.path.length > 2400) {
      const keepLast = s.path.pop();
      s.path = s.path.filter((_, i) => i % 2 === 0);
      s.path.push(keepLast);
    }
  }

  function onPosition(pos) {
    const c = pos.coords;
    process(c.latitude, c.longitude, pos.timestamp, c.speed, c.heading, c.accuracy);
  }

  function onError(err) {
    if (!s) return;
    gps.status = (err && err.code === 1) ? 'denied' : 'error';
    gps.error = err && err.message ? err.message : 'GPS unavailable';
  }

  /* ---- public API ---- */

  function start(opts) {
    if (s) return false;
    demoMode = !!(opts && opts.demo);
    s = blank(Date.now());
    gps.status = demoMode ? 'ok' : 'acquiring';
    gps.accuracy = null; gps.error = '';

    if (!demoMode) {
      if (!('geolocation' in navigator)) {
        gps.status = 'error'; gps.error = 'Geolocation is not supported on this device';
      } else {
        watchId = navigator.geolocation.watchPosition(onPosition, onError, {
          enableHighAccuracy: true, maximumAge: 0, timeout: 15000
        });
      }
    }
    return true;
  }

  // Simulator entry point — same pipeline as real GPS.
  function injectPosition(pos) {
    if (!s || !demoMode) return;
    onPosition(pos);
  }

  function snapshot() {
    if (!s) return null;
    const elapsed = Date.now() - s.startedAt;
    return {
      demo: demoMode,
      lat: s.lat, lon: s.lon,
      elapsedMs: elapsed,
      movingMs: s.movingMs,
      speedMs: s.speedMs,
      distanceM: s.distanceM,
      maxSpeedMs: s.maxSpeedMs,
      avgSpeedMs: s.movingMs > 3000 ? s.distanceM / (s.movingMs / 1000) : 0,
      accel: s.accel,
      gLat: s.gLat, gLon: s.gLon, maxG: s.maxG,
      heading: s.heading, headingOk: s.headingOk,
      stopped: s.stopped,
      events: { ...s.events },
      samples: s.samples,
      path: s.path,
      gps: { ...gps, stale: !demoMode && s.lastFixAt > 0 && (Date.now() - s.lastFixAt > 8000) }
    };
  }

  function stop() {
    if (!s) return null;
    if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    const endAt = Date.now();
    const raw = {
      startedAt: s.startedAt,
      endedAt: endAt,
      durationMs: endAt - s.startedAt,
      movingMs: Math.round(s.movingMs),
      distanceM: Math.round(s.distanceM),
      maxSpeedMs: +s.maxSpeedMs.toFixed(2),
      avgSpeedMs: s.movingMs > 3000 ? +(s.distanceM / (s.movingMs / 1000)).toFixed(2) : 0,
      maxG: +s.maxG.toFixed(2),
      events: { ...s.events },
      path: s.path,
      speeds: s.speeds,
      demo: demoMode,
      samples: s.samples
    };
    s = null;
    gps.status = 'off'; gps.accuracy = null;
    demoMode = false;
    return raw;
  }

  const isActive = () => !!s;
  const isDemo = () => demoMode;

  return { start, stop, snapshot, injectPosition, isActive, isDemo, gps };
})();
