/* TripRanked configuration.
 *
 * The app is fully functional with no setup — trips are stored on-device and the
 * leaderboard runs against a simulated global field.
 *
 * OPTIONAL — real global leaderboard:
 * Create a free Supabase project, run supabase/schema.sql in its SQL editor,
 * then paste your project URL and anon (publishable) key below. Every player
 * with the same config will share one live leaderboard.
 */
'use strict';

window.TR_CONFIG = {
  supabaseUrl: '',      // e.g. 'https://abcdefgh.supabase.co'
  supabaseAnonKey: '',  // the "anon / publishable" key — safe to ship in a web page

  // Driving-event thresholds (SI units). Tuned for ~1 Hz phone GPS.
  thresholds: {
    hardAccel: 2.8,     // m/s² sustained acceleration
    hardBrake: -3.2,    // m/s² sustained deceleration
    hardCornerG: 0.38,  // lateral g while turning
    stopSpeed: 0.6,     // m/s — below this you are "stopped"
    moveSpeed: 0.75,    // m/s — above this you are "moving"
    maxAccuracyM: 40,   // reject GPS fixes worse than this
    eventCooldownMs: 4000
  }
};
