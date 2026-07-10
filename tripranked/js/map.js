/* TripRanked — real map views (Leaflet + OpenStreetMap).
 *
 * Three jobs:
 *   1. Live map on the Drive screen: follows you, heading arrow, accuracy
 *      ring, growing trail of the current trip.
 *   2. Trip maps in the summary/detail modals: the recorded route drawn on
 *      real streets, colored by speed.
 *   3. Graceful degradation: with no tile network the dark base and the
 *      route overlays still render.
 */
'use strict';

const MapView = (() => {
  const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  const GERMANY = [51.163, 10.447];   // pleasant default view before the first fix

  const hasLeaflet = () => typeof L !== 'undefined';

  function base(el, opts = {}) {
    const m = L.map(el, {
      zoomControl: opts.zoomControl !== false,
      attributionControl: true,
      center: opts.center || GERMANY,
      zoom: opts.zoom || 5,
      worldCopyJump: true
    });
    m.attributionControl.setPrefix(false);
    L.tileLayer(TILE_URL, { maxZoom: 19, className: 'map-tiles', attribution: ATTRIB }).addTo(m);
    return m;
  }

  const toLatLngs = path => path.map(p => [p[0], p[1]]);

  function speedColor(v, maxV) {
    const t = U.clamp(v / Math.max(8, maxV), 0, 1);
    const h = t < 0.5 ? U.lerp(210, 145, t * 2) : U.lerp(145, 40, t * 2 - 1);
    return `hsl(${Math.round(h)} 90% 60%)`;
  }

  /* ---------- live map (Drive screen) ---------- */

  const live = {
    map: null, marker: null, ring: null, trail: null,
    lastPan: 0, follow: true, everFixed: false
  };

  function carIcon() {
    return L.divIcon({
      className: 'car-icon-wrap',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      html: '<div class="car-icon" id="carIconRot"><svg viewBox="0 0 24 24"><path d="M12 2 L19 20 L12 16 L5 20 Z"/></svg></div>'
    });
  }

  function initLive(el) {
    if (live.map || !hasLeaflet()) return;
    live.map = base(el, { zoomControl: false });
    // manual interaction pauses auto-follow until re-centered
    live.map.on('dragstart', () => { live.follow = false; updateRecenterBtn(); });
  }

  function updateRecenterBtn() {
    const b = U.$('#btnRecenter');
    if (b) b.classList.toggle('hidden', live.follow || !live.everFixed);
  }

  function liveUpdate(lat, lon, heading, accuracy, path) {
    if (!live.map) return;
    const ll = [lat, lon];

    if (!live.marker) {
      live.marker = L.marker(ll, { icon: carIcon(), interactive: false, keyboard: false }).addTo(live.map);
      live.ring = L.circle(ll, {
        radius: accuracy || 15, color: '#3dd68c', weight: 1,
        opacity: 0.35, fillColor: '#3dd68c', fillOpacity: 0.08, interactive: false
      }).addTo(live.map);
      live.trail = L.polyline([], { color: '#3dd68c', weight: 4, opacity: 0.9, lineJoin: 'round' }).addTo(live.map);
      live.map.setView(ll, 16);
      live.everFixed = true;
    } else {
      live.marker.setLatLng(ll);
      live.ring.setLatLng(ll);
      if (accuracy) live.ring.setRadius(accuracy);
    }

    const rot = U.$('#carIconRot');
    if (rot && isFinite(heading)) rot.style.transform = `rotate(${Math.round(heading)}deg)`;

    if (path && live.trail && path.length !== live.trail.getLatLngs().length) {
      live.trail.setLatLngs(toLatLngs(path));
    }

    const now = Date.now();
    if (live.follow && now - live.lastPan > 900) {
      live.lastPan = now;
      live.map.panTo(ll, { animate: true, duration: 0.5 });
    }
  }

  function liveRecenter() {
    live.follow = true;
    if (live.marker) live.map.panTo(live.marker.getLatLng(), { animate: true });
    updateRecenterBtn();
  }

  function liveReset() {
    if (live.trail) live.trail.setLatLngs([]);
    live.follow = true;
    updateRecenterBtn();
  }

  // One-shot "where am I" for the idle drive screen.
  function locateOnce() {
    if (!live.map || !('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        liveUpdate(pos.coords.latitude, pos.coords.longitude, NaN, pos.coords.accuracy, null);
        live.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      },
      () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function liveInvalidate() {
    if (live.map) setTimeout(() => live.map.invalidateSize(), 220);
  }

  /* ---------- trip maps (modals) ---------- */

  const modalMaps = [];

  // Draw a recorded path on a real map, colored by speed bucket.
  function tripMap(el, path) {
    if (!hasLeaflet() || !path || path.length < 2) {
      el.classList.add('map-empty');
      el.textContent = 'No route recorded';
      return null;
    }
    const m = base(el, { zoomControl: false, zoom: 13, center: [path[0][0], path[0][1]] });

    // decimate for rendering, then group consecutive same-color points
    const step = Math.max(1, Math.floor(path.length / 400));
    const pts = path.filter((_, i) => i % step === 0);
    if (pts[pts.length - 1] !== path[path.length - 1]) pts.push(path[path.length - 1]);
    const maxV = Math.max(...pts.map(p => p[3] || 0), 1);

    let seg = [pts[0]], segColor = speedColor(pts[0][3] || 0, maxV);
    const flush = () => {
      if (seg.length > 1) {
        L.polyline(toLatLngs(seg), { color: segColor, weight: 5, opacity: 0.95, lineJoin: 'round' }).addTo(m);
      }
    };
    for (let i = 1; i < pts.length; i++) {
      const c = speedColor(pts[i][3] || 0, maxV);
      seg.push(pts[i]);
      if (c !== segColor) { flush(); seg = [pts[i]]; segColor = c; }
    }
    flush();

    const dot = (p, cls) => L.circleMarker([p[0], p[1]], {
      radius: 7, weight: 2, color: '#0a0e13',
      fillColor: cls === 'start' ? '#3dd68c' : '#ff5d5d', fillOpacity: 1
    }).addTo(m);
    dot(path[0], 'start');
    dot(path[path.length - 1], 'end');

    const bounds = L.latLngBounds(toLatLngs(path));
    m.fitBounds(bounds, { padding: [26, 26] });
    setTimeout(() => { m.invalidateSize(); m.fitBounds(bounds, { padding: [26, 26] }); }, 260);

    modalMaps.push(m);
    return m;
  }

  function destroyModalMaps() {
    while (modalMaps.length) {
      try { modalMaps.pop().remove(); } catch (_) { /* already gone */ }
    }
  }

  return { initLive, liveUpdate, liveRecenter, liveReset, liveInvalidate, locateOnce, tripMap, destroyModalMaps, live };
})();
