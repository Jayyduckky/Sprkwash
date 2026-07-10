/* TripRanked — shareable end-of-trip stat card (1080×1350 canvas → PNG). */
'use strict';

const ShareCard = (() => {
  const W = 1080, H = 1350;
  const FONT = "-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render(trip, profile, units) {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0d131b');
    bg.addColorStop(0.55, '#0a0e13');
    bg.addColorStop(1, '#0c1219');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // faint speed arcs top-right
    ctx.save();
    ctx.strokeStyle = 'rgba(61,214,140,.07)';
    for (let i = 0; i < 5; i++) {
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(W + 60, -60, 220 + i * 110, Math.PI * 0.5, Math.PI * 1.02);
      ctx.stroke();
    }
    ctx.restore();

    // wordmark
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#3dd68c';
    ctx.font = `900 54px ${FONT}`;
    ctx.fillText('⚡ TRIPRANKED', 64, 118);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.font = `500 34px ${FONT}`;
    const nm = Store.tripName(trip.startedAt);
    ctx.fillText(`${nm.name}  ·  ${U.fmtDate(trip.startedAt)} ${U.fmtClock(trip.startedAt)}`, 64, 172);

    // driver chip
    ctx.font = `700 36px ${FONT}`;
    const driver = `${profile.emoji} ${profile.name}  ·  ${profile.tag}`;
    const dw = ctx.measureText(driver).width + 56;
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    roundRect(ctx, 64, 206, dw, 72, 36);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(driver, 92, 254);

    // hero: max speed
    const spd = U.speed(trip.maxSpeedMs, units);
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 300px ${FONT}`;
    ctx.fillText(spd.v, 56, 620);
    const vw = ctx.measureText(spd.v).width;
    ctx.fillStyle = '#3dd68c';
    ctx.font = `800 66px ${FONT}`;
    ctx.fillText(spd.unit, 72 + vw, 616);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = `600 38px ${FONT}`;
    ctx.fillText('TOP SPEED', 72 + vw, 550);

    // route panel
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    roundRect(ctx, 64, 680, W - 128, 330, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, 64, 680, W - 128, 330, 28);
    ctx.stroke();
    U.drawRoute(ctx, trip.path, 96, 700, W - 192, 290, { lineWidth: 7 });

    // stat grid (2×2)
    const stats = [
      ['DISTANCE', `${U.dist(trip.distanceM, units).v} ${U.dist(trip.distanceM, units).unit}`],
      ['DURATION', U.fmtDuration(trip.durationMs)],
      ['AVG SPEED', `${U.speed(trip.avgSpeedMs, units).v} ${U.speed(trip.avgSpeedMs, units).unit}`],
      ['SCORE', `${trip.score}  ·  ${trip.grade}`]
    ];
    const gx = 64, gy = 1046, gw = (W - 128 - 24) / 2, gh = 108;
    stats.forEach((sItem, i) => {
      const x = gx + (i % 2) * (gw + 24);
      const y = gy + Math.floor(i / 2) * (gh + 20);
      ctx.fillStyle = 'rgba(255,255,255,.045)';
      roundRect(ctx, x, y, gw, gh, 22);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.font = `700 26px ${FONT}`;
      ctx.fillText(sItem[0], x + 30, y + 44);
      ctx.fillStyle = i === 3 ? '#3dd68c' : '#ffffff';
      ctx.font = `800 44px ${FONT}`;
      ctx.fillText(sItem[1], x + 30, y + 90);
    });

    // footer
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(trip.demo ? 'demo drive · tripranked' : 'tracked with tripranked', 64, H - 40);
    const evTxt = `⚡${trip.events.hardAccels}  🛑${trip.events.hardBrakes}  ↩️${trip.events.hardCorners}  🚦${trip.events.stops}`;
    ctx.textAlign = 'right';
    ctx.fillText(evTxt, W - 64, H - 40);
    ctx.textAlign = 'left';

    return cv;
  }

  async function toBlob(canvas) {
    return new Promise(res => canvas.toBlob(res, 'image/png'));
  }

  // Share via the native sheet when possible, otherwise download the PNG.
  async function share(canvas, trip) {
    const blob = await toBlob(canvas);
    if (!blob) return 'error';
    const file = new File([blob], `tripranked-${new Date(trip.startedAt).toISOString().slice(0, 10)}.png`,
      { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'TripRanked drive' });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  }

  return { render, share };
})();
