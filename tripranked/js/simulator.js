/* TripRanked — demo drive simulator.
 *
 * Generates a realistic ~2.5 minute city-to-highway drive in real time and
 * feeds synthetic GeolocationPosition fixes through the exact same tracker
 * pipeline that real GPS uses. Lets you experience the whole app at a desk
 * (or anywhere without GPS permission).
 */
'use strict';

const Simulator = (() => {
  // Each segment ramps speed linearly to `to` m/s over `dur` seconds while
  // turning at `turn` deg/s. The profile is choreographed to trigger a small,
  // predictable set of driving events.
  const SCRIPT = [
    { to: 0,    dur: 3,  turn: 0 },     // parked, engine on
    { to: 13.4, dur: 7,  turn: 0 },     // pull away to 30 mph
    { to: 13.4, dur: 10, turn: 0 },     // city cruise
    { to: 9,    dur: 3,  turn: 0 },     // ease off for the turn
    { to: 9,    dur: 5,  turn: 17 },    // gentle right-hander
    { to: 13.4, dur: 5,  turn: 0 },     // back up to speed
    { to: 0,    dur: 2.6, turn: 0 },    // HARD BRAKE — light went yellow
    { to: 0,    dur: 6,  turn: 0 },     // red light (full stop)
    { to: 15.6, dur: 5,  turn: 0 },     // HARD ACCEL off the line
    { to: 15.6, dur: 8,  turn: 5 },     // sweeping avenue
    { to: 15.6, dur: 7,  turn: -5 },
    { to: 12,   dur: 3,  turn: 0 },
    { to: 12,   dur: 4,  turn: 25 },    // HARD CORNER onto the on-ramp
    { to: 31,   dur: 14, turn: 3 },     // ramp up to 70 mph
    { to: 31,   dur: 12, turn: 0 },     // highway
    { to: 31,   dur: 2,  turn: -5 },    // lane change
    { to: 31,   dur: 2,  turn: 5 },
    { to: 31,   dur: 12, turn: 0 },     // highway
    { to: 17,   dur: 3,  turn: 0 },     // HARD BRAKE — sudden traffic
    { to: 29,   dur: 6,  turn: 0 },     // traffic clears
    { to: 29,   dur: 8,  turn: 0 },
    { to: 10,   dur: 8,  turn: 4 },     // take the exit
    { to: 10,   dur: 4,  turn: 18 },    // exit loop
    { to: 11,   dur: 8,  turn: 0 },     // surface street
    { to: 0,    dur: 5,  turn: 0 },     // arrive
    { to: 0,    dur: 6,  turn: 0 }      // parked
  ];

  const TICK_MS = 400;
  const EARTH = 6371000;

  let timer = null;
  let onDone = null;
  let st = null;

  function start(opts) {
    stopTimer();
    onDone = opts && opts.onDone;
    const rng = U.mulberry32((Date.now() & 0xffffffff) >>> 0);
    st = {
      seg: 0,
      segT: 0,
      v: 0,
      vSeg0: 0,
      heading: 20 + rng() * 320,
      lat: 34.0522 + (rng() - 0.5) * 0.2,   // somewhere around LA
      lon: -118.2437 + (rng() - 0.5) * 0.2,
      rng
    };
    timer = setInterval(tick, TICK_MS);
  }

  function tick() {
    if (!st) return;
    const dt = TICK_MS / 1000;
    const seg = SCRIPT[st.seg];
    if (!seg) { finish(); return; }

    st.segT += dt;
    const f = U.clamp(st.segT / seg.dur, 0, 1);
    st.v = Math.max(0, U.lerp(st.vSeg0, seg.to, f));

    // integrate heading & position
    st.heading = (st.heading + seg.turn * dt + 360) % 360;
    const dist = st.v * dt;
    const rad = Math.PI / 180;
    const dLat = (dist * Math.cos(st.heading * rad)) / EARTH / rad;
    const dLon = (dist * Math.sin(st.heading * rad)) / (EARTH * Math.cos(st.lat * rad)) / rad;
    st.lat += dLat;
    st.lon += dLon;

    // a few meters of GPS jitter, like the real thing
    const jitter = () => (st.rng() - 0.5) * 0.000018;
    const accuracy = 5 + st.rng() * 7;

    Tracker.injectPosition({
      timestamp: Date.now(),
      coords: {
        latitude: st.lat + jitter(),
        longitude: st.lon + jitter(),
        speed: Math.max(0, st.v + (st.rng() - 0.5) * 0.4),
        heading: st.v > 1 ? st.heading : NaN,
        accuracy,
        altitude: null, altitudeAccuracy: null
      }
    });

    if (st.segT >= seg.dur) {
      st.seg++;
      st.segT = 0;
      st.vSeg0 = st.v;
    }
  }

  function finish() {
    stopTimer();
    const cb = onDone; onDone = null; st = null;
    if (cb) cb();
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function stop() { stopTimer(); onDone = null; st = null; }

  const isRunning = () => !!timer;

  return { start, stop, isRunning };
})();
