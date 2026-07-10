/* TripRanked — application shell: screens, drive lifecycle, rendering. */
'use strict';

(() => {
  const $ = U.$;

  /* ────────────────────────── ui state ────────────────────────── */

  const ui = {
    screen: 'drive',
    lbMetric: 'speed',
    lbPeriod: 'week',
    loop: null,
    prevEvents: null,
    gaugeMax: 0,        // in display units
    wakeLock: null,
    installEvt: null,
    lbSeq: 0
  };

  const units = () => Store.settings.units;

  /* ────────────────────────── toast & modal ────────────────────────── */

  let toastTimer = null;
  function toast(msg, ms = 2400) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
  }

  let modalDismissable = true;
  function openModal(html, opts = {}) {
    modalDismissable = opts.dismissable !== false;
    const back = $('#modalBack'), box = $('#modalBox');
    box.innerHTML = html;
    back.classList.remove('hidden');
    return box;
  }
  function closeModal() {
    $('#modalBack').classList.add('hidden');
    $('#modalBox').innerHTML = '';
  }

  /* ────────────────────────── gauge ────────────────────────── */

  const GAUGE = { cx: 130, cy: 115, r: 98, a0: 150, sweep: 240 };

  function gaugePoint(angleDeg, radius) {
    const a = angleDeg * Math.PI / 180;
    return [GAUGE.cx + radius * Math.cos(a), GAUGE.cy + radius * Math.sin(a)];
  }

  function buildGauge() {
    const u = units();
    const base = u === 'kmh' ? 200 : 120;
    const seen = Store.totals().maxSpeedMs * (u === 'kmh' ? U.MS_TO_KMH : U.MS_TO_MPH);
    ui.gaugeMax = seen > base ? (u === 'kmh' ? 280 : 180) : base;

    const [x0, y0] = gaugePoint(GAUGE.a0, GAUGE.r);
    const [x1, y1] = gaugePoint(GAUGE.a0 + GAUGE.sweep, GAUGE.r);
    const d = `M ${x0} ${y0} A ${GAUGE.r} ${GAUGE.r} 0 1 1 ${x1} ${y1}`;
    $('#gaugeTrack').setAttribute('d', d);
    $('#gaugeFill').setAttribute('d', d);
    $('#gauge').setAttribute('viewBox', '0 0 260 190');

    const step = u === 'kmh' ? 40 : 20;
    const ticks = $('#gaugeTicks');
    ticks.innerHTML = '';
    for (let v = 0; v <= ui.gaugeMax; v += step) {
      const ang = GAUGE.a0 + GAUGE.sweep * (v / ui.gaugeMax);
      const [tx, ty] = gaugePoint(ang, GAUGE.r - 24);
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.setAttribute('x', tx.toFixed(1));
      el.setAttribute('y', (ty + 3.5).toFixed(1));
      el.setAttribute('text-anchor', 'middle');
      el.textContent = v;
      ticks.appendChild(el);
    }
    $('#speedUnit').textContent = u === 'kmh' ? 'km/h' : 'mph';
    setGauge(0);
  }

  function setGauge(displaySpeed) {
    const pct = U.clamp(displaySpeed / ui.gaugeMax, 0, 1);
    const fill = $('#gaugeFill');
    fill.style.strokeDashoffset = (100 - pct * 100).toFixed(2);
    // a zero-length dash still paints its round cap — hide the stray dot
    fill.style.visibility = pct <= 0.004 ? 'hidden' : 'visible';
    fill.classList.toggle('hot', pct > 0.72);
  }

  /* ────────────────────────── gps chip ────────────────────────── */

  function setChip(cls, text) {
    const chip = $('#gpsChip');
    chip.className = 'chip ' + cls;
    chip.textContent = text;
  }

  function updateChip(snap) {
    if (!snap) { $('#gpsChip').className = 'chip chip-hidden'; return; }
    if (snap.demo) return setChip('ok', '🧪 DEMO');
    const g = snap.gps;
    if (g.status === 'acquiring') return setChip('warn pulse', 'ACQUIRING GPS…');
    if (g.status === 'denied') return setChip('bad', 'GPS DENIED');
    if (g.status === 'error') return setChip('bad', 'GPS ERROR');
    if (g.stale) return setChip('warn pulse', 'GPS LOST…');
    if (g.status === 'weak') return setChip('warn', 'GPS WEAK');
    return setChip('ok', `GPS ±${Math.round(g.accuracy || 0)}m`);
  }

  /* ────────────────────────── drive screen ────────────────────────── */

  function fmtSpeedTile(ms) {
    const s = U.speed(ms, units());
    return `${s.v}<small> ${s.unit}</small>`;
  }

  function uiTick() {
    const snap = Tracker.snapshot();
    if (!snap) return;

    const u = units();
    const dispSpeed = snap.speedMs * (u === 'kmh' ? U.MS_TO_KMH : U.MS_TO_MPH);
    $('#speedNow').textContent = Math.round(dispSpeed);
    setGauge(dispSpeed);

    $('#lvTime').textContent = U.fmtDuration(snap.elapsedMs);
    const dd = U.dist(snap.distanceM, u);
    $('#lvDist').innerHTML = `${dd.v}<small> ${dd.unit}</small>`;
    $('#lvAvg').innerHTML = fmtSpeedTile(snap.avgSpeedMs);
    $('#lvMax').innerHTML = fmtSpeedTile(snap.maxSpeedMs);

    // heading + state line
    const hdg = snap.headingOk && isFinite(snap.heading)
      ? `${U.compass(snap.heading)} ${Math.round(snap.heading)}°` : '—';
    $('#headingLbl').textContent = hdg;
    $('#stateLbl').textContent = snap.demo
      ? 'Demo drive in progress'
      : snap.gps.status === 'acquiring' ? 'Waiting for GPS fix…'
      : snap.gps.status === 'denied' ? 'Location permission needed'
      : snap.stopped ? 'Stopped' : 'Moving';

    // g-force bubble
    const gx = U.clamp(snap.gLat, -1, 1) * 30;
    const gy = U.clamp(snap.gLon, -1, 1) * 30;
    const dot = $('#gDot');
    dot.style.transform = `translate(calc(-50% + ${gx.toFixed(1)}px), calc(-50% + ${gy.toFixed(1)}px))`;
    const gNow = Math.max(Math.abs(snap.gLat), Math.abs(snap.gLon));
    dot.classList.toggle('hard', gNow > 0.35);
    $('#gVal').textContent = gNow.toFixed(2);

    // event counters (flash on increment)
    const map = { hardAccels: 'evA', hardBrakes: 'evB', hardCorners: 'evC', stops: 'evS' };
    for (const k in map) {
      const el = $('#' + map[k]);
      el.textContent = snap.events[k];
      if (ui.prevEvents && snap.events[k] > ui.prevEvents[k]) {
        const chip = el.closest('.ev-chip');
        chip.classList.remove('flash');
        void chip.offsetWidth;
        chip.classList.add('flash');
        U.haptic(30);
      }
    }
    ui.prevEvents = snap.events;

    // permission trouble → help panel
    if (!snap.demo && snap.gps.status === 'denied') {
      const help = $('#gpsHelp');
      if (help.classList.contains('hidden')) {
        help.innerHTML = 'Location access is blocked, so speed can\'t be tracked. Enable location for this site in your browser settings — or end this trip and hit <b>Try a demo drive</b> to see TripRanked in action.';
        help.classList.remove('hidden');
      }
    }

    updateChip(snap);
  }

  async function grabWakeLock() {
    if (!Store.settings.keepAwake || !('wakeLock' in navigator)) return;
    try {
      ui.wakeLock = await navigator.wakeLock.request('screen');
    } catch (_) { /* not critical */ }
  }
  function releaseWakeLock() {
    if (ui.wakeLock) { ui.wakeLock.release().catch(() => {}); ui.wakeLock = null; }
  }

  function startDrive(demo) {
    if (Tracker.isActive()) return;
    ui.prevEvents = null;
    if (!Tracker.start({ demo })) return;
    if (demo) Simulator.start({ onDone: () => endDrive(true) });

    $('#btnStart').classList.add('hidden');
    $('#btnDemo').classList.add('hidden');
    $('#btnEnd').classList.remove('hidden');
    $('#gpsHelp').classList.add('hidden');
    $('#tabbar .tab[data-screen="drive"]').insertAdjacentHTML('beforeend', '<i class="rec-dot"></i>');

    grabWakeLock();
    U.haptic([40, 60, 40]);
    ui.loop = setInterval(uiTick, 200);
    uiTick();
    showScreen('drive');
    if (demo) toast('🧪 Demo drive started — sit back and watch');
  }

  function resetDriveUi() {
    clearInterval(ui.loop); ui.loop = null;
    releaseWakeLock();
    $('#btnStart').classList.remove('hidden');
    $('#btnDemo').classList.remove('hidden');
    $('#btnEnd').classList.add('hidden');
    const rec = $('#tabbar .rec-dot');
    if (rec) rec.remove();
    $('#speedNow').textContent = '0';
    setGauge(0);
    $('#stateLbl').textContent = 'Ready';
    $('#headingLbl').textContent = '—';
    updateChip(null);
  }

  function endDrive(autoFinished) {
    if (!Tracker.isActive()) return;
    Simulator.stop();
    const raw = Tracker.stop();
    resetDriveUi();
    U.haptic(60);
    if (!raw) return;

    if (raw.samples < 3) {
      toast('No GPS data was recorded — nothing to save');
      return;
    }
    if (raw.distanceM < 40 && raw.durationMs < 20000) {
      toast('Trip too short to score — not saved');
      return;
    }

    const nm = Store.tripName(raw.startedAt);
    const trip = {
      id: U.uid(),
      name: nm.name,
      icon: nm.icon,
      ...raw,
      score: 0,
      grade: ''
    };
    trip.score = Store.scoreTrip(trip);
    trip.grade = Store.grade(trip.score);
    showSummary(trip, autoFinished);
  }

  /* ────────────────────────── summary & detail modals ────────────────────────── */

  function scoreClass(score) {
    return score >= 85 ? 'good' : score >= 65 ? 'mid' : 'bad';
  }

  function statTile(label, valueHtml) {
    return `<div class="tile"><div class="tile-label">${label}</div><div class="tile-value">${valueHtml}</div></div>`;
  }

  function tripStatsHtml(trip) {
    const u = units();
    const d = U.dist(trip.distanceM, u);
    return `
      <div class="sum-grid">
        ${statTile('Distance', `${d.v}<small> ${d.unit}</small>`)}
        ${statTile('Duration', U.fmtDuration(trip.durationMs))}
        ${statTile('Avg speed', fmtSpeedTile(trip.avgSpeedMs))}
        ${statTile('Top speed', fmtSpeedTile(trip.maxSpeedMs))}
      </div>
      <div class="ev-strip">
        ${statTile('⚡ Accel', trip.events.hardAccels)}
        ${statTile('🛑 Brakes', trip.events.hardBrakes)}
        ${statTile('↩️ Corners', trip.events.hardCorners)}
        ${statTile('🚦 Stops', trip.events.stops)}
      </div>`;
  }

  function paintRoute(canvas, trip) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    U.drawRoute(ctx, trip.path, 0, 0, w, h, {});
  }

  function paintSpeedGraph(canvas, trip) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const pts = trip.speeds || [];
    if (pts.length < 2) return;
    const maxT = pts[pts.length - 1][0] || 1;
    const maxV = Math.max(...pts.map(p => p[1]), 1);
    const px = p => [8 + (p[0] / maxT) * (w - 16), h - 10 - (p[1] / maxV) * (h - 26)];

    // area fill
    ctx.beginPath();
    ctx.moveTo(px(pts[0])[0], h - 10);
    pts.forEach(p => ctx.lineTo(...px(p)));
    ctx.lineTo(px(pts[pts.length - 1])[0], h - 10);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(61,214,140,.35)');
    grad.addColorStop(1, 'rgba(61,214,140,.02)');
    ctx.fillStyle = grad;
    ctx.fill();
    // line
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(...px(p)) : ctx.moveTo(...px(p)));
    ctx.strokeStyle = '#3dd68c';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    // max speed label
    const s = U.speed(maxV, units());
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(`peak ${s.v} ${s.unit}`, 10, 14);
  }

  function showSummary(trip, autoFinished) {
    const box = openModal(`
      <div class="modal-head">
        <h3>${autoFinished ? '🏁 Demo complete' : '🏁 Trip complete'}</h3>
      </div>
      <div class="sum-hero">
        <div class="sum-score">${trip.score}</div>
        <div class="sum-grade ${scoreClass(trip.score)}">GRADE ${trip.grade}</div>
        <div class="sum-sub">${trip.icon} ${trip.name} · ${U.fmtClock(trip.startedAt)}${trip.demo ? ' · 🧪 demo' : ''} · max ${trip.maxG.toFixed(2)}g</div>
      </div>
      <canvas class="route-canvas" id="sumRoute"></canvas>
      ${tripStatsHtml(trip)}
      <div class="modal-actions">
        <button class="btn btn-primary btn-big" id="sumSave">💾 &nbsp;Save trip</button>
        <div class="row2">
          <button class="btn btn-soft" id="sumShare">📤 Share card</button>
          <button class="btn btn-ghost" id="sumDiscard">🗑 Discard</button>
        </div>
      </div>
    `, { dismissable: false });

    paintRoute($('#sumRoute', box), trip);

    $('#sumSave', box).onclick = () => {
      Store.addTrip(trip);
      LB.submit();
      closeModal();
      toast(`Saved · ${trip.icon} ${trip.name}`);
      renderHistory();
      renderProfile();
      buildGauge();
      showScreen('history');
    };
    $('#sumShare', box).onclick = async () => {
      const res = await ShareCard.share(ShareCard.render(trip, Store.profile, units()), trip);
      if (res === 'downloaded') toast('Card saved as PNG 🖼️');
      else if (res === 'shared') toast('Shared 🚀');
    };
    $('#sumDiscard', box).onclick = () => { closeModal(); toast('Trip discarded'); };
  }

  function showTripDetail(id) {
    const trip = Store.getTrip(id);
    if (!trip) return;
    const box = openModal(`
      <div class="modal-head">
        <h3>${trip.icon} ${trip.name}${trip.demo ? ' <span class="badge badge-demo">DEMO</span>' : ''}</h3>
        <button class="modal-x" id="dX">✕</button>
      </div>
      <div class="sum-sub" style="margin-bottom:10px">${U.fmtDate(trip.startedAt)} · ${U.fmtClock(trip.startedAt)} → ${U.fmtClock(trip.endedAt)}</div>
      <canvas class="route-canvas" id="detRoute"></canvas>
      <canvas class="graph-canvas" id="detGraph"></canvas>
      <div class="sum-hero" style="margin-bottom:10px">
        <div class="sum-score" style="font-size:40px">${trip.score}</div>
        <div class="sum-grade ${scoreClass(trip.score)}">GRADE ${trip.grade} · MAX ${trip.maxG.toFixed(2)}G</div>
      </div>
      ${tripStatsHtml(trip)}
      <div class="modal-actions">
        <button class="btn btn-soft" id="detShare">📤 Share card</button>
        <button class="btn btn-ghost danger-link" id="detDel">Delete this trip</button>
      </div>
    `);
    paintRoute($('#detRoute', box), trip);
    paintSpeedGraph($('#detGraph', box), trip);
    $('#dX', box).onclick = closeModal;
    $('#detShare', box).onclick = async () => {
      const res = await ShareCard.share(ShareCard.render(trip, Store.profile, units()), trip);
      if (res === 'downloaded') toast('Card saved as PNG 🖼️');
    };
    $('#detDel', box).onclick = () => {
      Store.deleteTrip(id);
      LB.submit();
      closeModal();
      toast('Trip deleted');
      renderHistory();
      renderProfile();
    };
  }

  /* ────────────────────────── leaderboard screen ────────────────────────── */

  function lbValue(v) {
    const u = units();
    if (ui.lbMetric === 'speed') { const s = U.speed(v, u); return `${s.v}<small> ${s.unit}</small>`; }
    if (ui.lbMetric === 'distance') { const d = U.dist(v, u, v < 16000 ? 1 : 0); return `${d.v}<small> ${d.unit}</small>`; }
    return `${U.fmtInt(v)}<small> trips</small>`;
  }

  function lbRowHtml(r) {
    const medal = ['🥇', '🥈', '🥉'][r.rank - 1];
    return `
      <div class="lb-row ${r.isYou ? 'you' : ''}">
        <div class="lb-rank ${medal ? 'medal' : ''}">${medal || r.rank}</div>
        <div class="lb-ava">${r.emoji}</div>
        <div class="lb-name">${U.esc(r.name)}${r.flag ? `<span class="flag">${r.flag}</span>` : ''}${r.isYou ? '<span class="you-tag">YOU</span>' : ''}</div>
        <div class="lb-val">${lbValue(r.value)}</div>
      </div>`;
  }

  async function renderRanks() {
    const seq = ++ui.lbSeq;
    const body = $('#lbBody');
    body.innerHTML = '<div class="lb-loading">Loading…</div>';
    const { live, rows } = await LB.board(ui.lbMetric, ui.lbPeriod);
    if (seq !== ui.lbSeq) return; // a newer request superseded this one

    $('#lbMode').textContent = live ? '● LIVE' : 'GLOBAL GRID';

    const top3 = rows.slice(0, 3);
    const podium = top3.length === 3 ? `
      <div class="podium">
        ${[top3[1], top3[0], top3[2]].map((r, i) => `
          <div class="pod ${['p2', 'p1', 'p3'][i]} ${r.isYou ? 'you-glow' : ''}">
            <div class="pod-medal">${['🥈', '🥇', '🥉'][i]}</div>
            <div class="pod-ava">${r.emoji}</div>
            <div class="pod-name">${U.esc(r.name)}${r.isYou ? ' ⭐' : ''}</div>
            <div class="pod-val">${lbValue(r.value)}</div>
          </div>`).join('')}
      </div>` : '';

    const you = rows.find(r => r.isYou);
    let list = rows.slice(3, 25);
    let tail = '';
    if (you && you.rank > 25) {
      list = rows.slice(3, 22);
      tail = `<div class="lb-gap">···</div>${lbRowHtml(you)}`;
    }
    const note = live
      ? '<p class="lb-note">Live board — every driver on this deployment, ranked in real time.</p>'
      : '<p class="lb-note">You\'re ranked against TripRanked\'s global grid of drivers. Their form shifts every week — drive more to climb. (Connect Supabase in js/config.js to race real people.)</p>';

    body.innerHTML = podium + list.map(lbRowHtml).join('') + tail + note;
  }

  /* ────────────────────────── history screen ────────────────────────── */

  function renderHistory() {
    const trips = Store.trips;
    const u = units();
    $('#histCount').textContent = trips.length ? `${trips.length} TRIP${trips.length === 1 ? '' : 'S'}` : 'NO TRIPS YET';

    const t = Store.totals();
    const d = U.dist(t.distanceM, u, t.distanceM < 16000 ? 1 : 0);
    $('#histTotals').innerHTML = trips.length ? `
      ${statTile('Trips', t.trips)}
      ${statTile('Distance', `${d.v}<small> ${d.unit}</small>`)}
      ${statTile('Time', U.fmtDurationLong(t.timeMs))}
      ${statTile('Top', fmtSpeedTile(t.maxSpeedMs))}` : '';

    const list = $('#histList');
    if (!trips.length) {
      list.innerHTML = `
        <div class="empty">
          <span class="big">🛣️</span>
          No trips yet. Hit <b>START DRIVE</b> and take it for a spin —<br>
          or run the demo drive to see how it works.
        </div>`;
      return;
    }
    list.innerHTML = trips.map(tr => {
      const dd = U.dist(tr.distanceM, u);
      const mx = U.speed(tr.maxSpeedMs, u);
      return `
        <div class="trip-card" data-id="${tr.id}">
          <div class="trip-ico">${tr.icon}</div>
          <div class="trip-main">
            <div class="trip-title">${tr.name}
              ${tr.demo ? '<span class="badge badge-demo">DEMO</span>' : ''}
              <span class="badge badge-score ${scoreClass(tr.score)}">${tr.score} · ${tr.grade}</span>
            </div>
            <div class="trip-when">${U.relDate(tr.startedAt)} · ${U.fmtClock(tr.startedAt)}</div>
            <div class="trip-sub">${U.fmtDuration(tr.durationMs)} · max ${mx.v} ${mx.unit}</div>
          </div>
          <div class="trip-right"><div class="trip-dist">${dd.v}<small> ${dd.unit}</small></div></div>
        </div>`;
    }).join('');
    U.$$('.trip-card', list).forEach(el => {
      el.onclick = () => showTripDetail(el.dataset.id);
    });
  }

  /* ────────────────────────── profile screen ────────────────────────── */

  function renderProfile() {
    const p = Store.profile;
    const t = Store.totals();
    const tier = Store.tier(t.distanceM);
    const u = units();
    const d = U.dist(t.distanceM, u, t.distanceM < 16000 ? 1 : 0);
    const ach = Store.achievements();
    const earned = ach.filter(a => a.earned).length;

    const nextTxt = tier.next
      ? `${U.dist(tier.next.atKm * 1000 - t.distanceM, u, 0).v} ${U.dist(0, u).unit} to ${tier.next.icon} ${tier.next.name}`
      : 'Top tier reached — respect. 👑';

    $('#profileBody').innerHTML = `
      <div class="pro-head">
        <div class="pro-ava">${p.emoji}</div>
        <div>
          <div class="pro-name">${U.esc(p.name)}</div>
          <div class="pro-tag">${p.tag} · driving since ${U.fmtDate(p.createdAt)}</div>
          <button class="pro-edit" id="editProfile">✏️ Edit driver</button>
        </div>
      </div>

      <div class="card">
        <h3>Rank tier</h3>
        <div class="tier-row">
          <div class="tier-ico">${tier.icon}</div>
          <div>
            <div class="tier-name">${tier.name}</div>
            <div class="tier-next">${nextTxt}</div>
          </div>
        </div>
        <div class="tier-bar"><i style="width:${Math.round(tier.progress * 100)}%"></i></div>
      </div>

      <div class="card">
        <h3>Lifetime stats</h3>
        <div class="stat-grid">
          ${statTile('Distance', `${d.v}<small> ${d.unit}</small>`)}
          ${statTile('Drive time', U.fmtDurationLong(t.timeMs))}
          ${statTile('Trips', t.trips)}
          ${statTile('Top speed', fmtSpeedTile(t.maxSpeedMs))}
          ${statTile('Driver score', t.avgScore || '—')}
          ${statTile('Best trip score', t.bestScore || '—')}
          ${statTile('Max G', (t.maxG || 0).toFixed(2))}
          ${statTile('Day streak', `${Store.streakDays()} 🔥`)}
        </div>
      </div>

      <div class="card">
        <h3>Achievements · ${earned}/${ach.length}</h3>
        <div class="ach-grid">
          ${ach.map(a => `
            <div class="ach ${a.earned ? '' : 'locked'}" title="${U.esc(a.desc)}">
              <div class="ach-ico">${a.icon}</div>
              <div class="ach-name">${a.name}</div>
              <div class="ach-desc">${a.desc}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <h3>Settings</h3>
        <div class="set-row">
          <div><div class="set-lbl">Units</div></div>
          <div class="seg" id="segUnits">
            <button data-u="mph" class="${u === 'mph' ? 'on' : ''}">mph</button>
            <button data-u="kmh" class="${u === 'kmh' ? 'on' : ''}">km/h</button>
          </div>
        </div>
        <div class="set-row">
          <div>
            <div class="set-lbl">Keep screen awake</div>
            <div class="set-sub">While a trip is recording</div>
          </div>
          <label class="switch"><input type="checkbox" id="setAwake" ${Store.settings.keepAwake ? 'checked' : ''}><i></i></label>
        </div>
        <div class="set-row ${ui.installEvt ? '' : 'hidden'}" id="rowInstall">
          <div>
            <div class="set-lbl">Install TripRanked</div>
            <div class="set-sub">Add to your home screen</div>
          </div>
          <button class="btn btn-soft" id="btnInstall" style="padding:9px 16px">Install</button>
        </div>
      </div>

      <div class="card">
        <h3>Data</h3>
        <div class="set-row">
          <div>
            <div class="set-lbl">Export my data</div>
            <div class="set-sub">All trips & stats as JSON</div>
          </div>
          <button class="btn btn-soft" id="btnExport" style="padding:9px 16px">Export</button>
        </div>
        <div class="set-row">
          <div>
            <div class="set-lbl">Reset everything</div>
            <div class="set-sub">Deletes all trips and your profile</div>
          </div>
          <button class="danger-link" id="btnReset">Reset…</button>
        </div>
      </div>

      <p class="about">
        TripRanked v1.0 · trips are stored on this device${LB.isLive() ? ' · leaderboard is live' : ''}<br>
        🛡️ Drive responsibly. Obey speed limits — the leaderboard isn't worth it.
      </p>`;

    $('#editProfile').onclick = showEditProfile;
    U.$$('#segUnits button').forEach(b => b.onclick = () => {
      Store.settings.units = b.dataset.u;
      Store.save();
      buildGauge();
      renderAll();
      toast(`Units: ${b.dataset.u === 'kmh' ? 'km/h' : 'mph'}`);
    });
    $('#setAwake').onchange = e => {
      Store.settings.keepAwake = e.target.checked;
      Store.save();
    };
    const inst = $('#btnInstall');
    if (inst) inst.onclick = async () => {
      if (!ui.installEvt) return;
      ui.installEvt.prompt();
      await ui.installEvt.userChoice;
      ui.installEvt = null;
      renderProfile();
    };
    $('#btnExport').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tripranked-data.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('Data exported 📦');
    };
    $('#btnReset').onclick = () => {
      const box = openModal(`
        <div class="modal-head"><h3>Reset everything?</h3><button class="modal-x" id="rX">✕</button></div>
        <p style="color:var(--dim);font-size:14px;line-height:1.5;margin-bottom:16px">
          This permanently deletes all ${Store.trips.length} trip(s), your stats, achievements and profile from this device. There's no undo.
        </p>
        <div class="modal-actions">
          <button class="btn btn-danger btn-big" id="rGo">Delete it all</button>
          <button class="btn btn-ghost" id="rNo">Keep my data</button>
        </div>`);
      $('#rX', box).onclick = closeModal;
      $('#rNo', box).onclick = closeModal;
      $('#rGo', box).onclick = () => {
        Store.resetAll();
        closeModal();
        buildGauge();
        renderAll();
        toast('Fresh start 🌱');
      };
    };
  }

  function showEditProfile() {
    const p = Store.profile;
    const emojis = ['🏎️', '🚗', '🚙', '🛻', '🚘', '🏁', '⚡', '🛞', '🚕', '🏍️'];
    const box = openModal(`
      <div class="modal-head"><h3>Edit driver</h3><button class="modal-x" id="eX">✕</button></div>
      <div class="field">
        <label>Driver name</label>
        <input type="text" id="eName" maxlength="20" value="${U.esc(p.name)}" autocomplete="off">
      </div>
      <div class="field">
        <label>Avatar</label>
        <div class="emoji-row">
          ${emojis.map(e => `<button class="emoji-opt ${e === p.emoji ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-big" id="eSave">Save</button>
      </div>`);
    let chosen = p.emoji;
    U.$$('.emoji-opt', box).forEach(b => b.onclick = () => {
      chosen = b.dataset.e;
      U.$$('.emoji-opt', box).forEach(x => x.classList.toggle('on', x === b));
    });
    $('#eX', box).onclick = closeModal;
    $('#eSave', box).onclick = () => {
      const name = $('#eName', box).value.trim();
      if (name) p.name = name.slice(0, 20);
      p.emoji = chosen;
      Store.save();
      LB.submit();
      closeModal();
      renderProfile();
      toast('Driver updated');
    };
  }

  /* ────────────────────────── navigation & boot ────────────────────────── */

  function showScreen(name) {
    ui.screen = name;
    U.$$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    U.$$('#tabbar .tab').forEach(t => t.classList.toggle('on', t.dataset.screen === name));
    if (name === 'ranks') renderRanks();
    if (name === 'history') renderHistory();
    if (name === 'profile') renderProfile();
  }

  function renderAll() {
    renderRanks();
    renderHistory();
    renderProfile();
  }

  function boot() {
    buildGauge();

    U.$$('#tabbar .tab').forEach(t => t.onclick = () => showScreen(t.dataset.screen));

    $('#btnStart').onclick = () => startDrive(false);
    $('#btnDemo').onclick = () => startDrive(true);
    $('#btnEnd').onclick = () => endDrive(false);

    U.$$('#segMetric button').forEach(b => b.onclick = () => {
      ui.lbMetric = b.dataset.metric;
      U.$$('#segMetric button').forEach(x => x.classList.toggle('on', x === b));
      renderRanks();
    });
    U.$$('#segPeriod button').forEach(b => b.onclick = () => {
      ui.lbPeriod = b.dataset.period;
      U.$$('#segPeriod button').forEach(x => x.classList.toggle('on', x === b));
      renderRanks();
    });

    $('#modalBack').addEventListener('click', e => {
      if (e.target.id === 'modalBack' && modalDismissable) closeModal();
    });

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      ui.installEvt = e;
      const row = $('#rowInstall');
      if (row) row.classList.remove('hidden');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Tracker.isActive()) grabWakeLock();
    });

    window.addEventListener('beforeunload', e => {
      if (Tracker.isActive() && !Tracker.isDemo()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ });
    }

    renderHistory();
    renderProfile();
    renderRanks();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
