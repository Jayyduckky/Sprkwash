/* ============================================================
   store.js — progress persistence + spaced repetition (SM-2 lite)
   ============================================================ */

const STORAGE_KEY = "deutschlern_v1";

const Store = (() => {
  const defaultState = () => ({
    // per-word SRS state, keyed by "deckId::germanWord"
    cards: {},
    stats: {
      reviews: 0,
      correct: 0,
      quizzesTaken: 0,
      streakDays: 0,
      lastStudyDate: null, // ISO date string (YYYY-MM-DD)
      dailyGoal: 20,
      todayCount: 0,
      todayDate: null,
    },
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // merge to be resilient to added fields
      return {
        cards: parsed.cards || {},
        stats: { ...defaultState().stats, ...(parsed.stats || {}) },
      };
    } catch (e) {
      console.warn("Failed to load state, resetting.", e);
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save state.", e);
    }
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function cardKey(deckId, de) {
    return `${deckId}::${de}`;
  }

  function getCard(deckId, de) {
    const key = cardKey(deckId, de);
    if (!state.cards[key]) {
      state.cards[key] = {
        ease: 2.5,
        interval: 0, // days
        reps: 0,
        due: 0, // epoch ms; 0 = new/never studied
        lapses: 0,
      };
    }
    return state.cards[key];
  }

  // SM-2 lite. quality: 0=again,1=hard,2=good,3=easy
  function review(deckId, word, quality) {
    const card = getCard(deckId, word.de);
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    if (quality === 0) {
      card.reps = 0;
      card.interval = 0;
      card.lapses += 1;
      card.ease = Math.max(1.3, card.ease - 0.2);
      card.due = now + 60 * 1000; // 1 minute — re-show soon in session
    } else {
      card.reps += 1;
      if (card.reps === 1) card.interval = quality === 3 ? 4 : 1;
      else if (card.reps === 2) card.interval = quality === 3 ? 7 : 3;
      else card.interval = Math.round(card.interval * card.ease);

      if (quality === 1) card.ease = Math.max(1.3, card.ease - 0.15);
      else if (quality === 3) card.ease = card.ease + 0.15;
      card.due = now + card.interval * DAY;
    }

    // stats
    state.stats.reviews += 1;
    if (quality >= 2) state.stats.correct += 1;
    bumpDaily();
    updateStreak();
    save();
    return card;
  }

  function bumpDaily() {
    const t = todayStr();
    if (state.stats.todayDate !== t) {
      state.stats.todayDate = t;
      state.stats.todayCount = 0;
    }
    state.stats.todayCount += 1;
  }

  function updateStreak() {
    const t = todayStr();
    const last = state.stats.lastStudyDate;
    if (last === t) return; // already counted today
    if (!last) {
      state.stats.streakDays = 1;
    } else {
      const diff = Math.round(
        (new Date(t) - new Date(last)) / (24 * 60 * 60 * 1000)
      );
      if (diff === 1) state.stats.streakDays += 1;
      else state.stats.streakDays = 1;
    }
    state.stats.lastStudyDate = t;
  }

  function recordQuiz(correct, total) {
    state.stats.quizzesTaken += 1;
    state.stats.reviews += total;
    state.stats.correct += correct;
    // count quiz answers toward daily goal too
    const t = todayStr();
    if (state.stats.todayDate !== t) {
      state.stats.todayDate = t;
      state.stats.todayCount = 0;
    }
    state.stats.todayCount += total;
    updateStreak();
    save();
  }

  // Cards due now (or new) within a deck, ordered: due first, then new.
  function dueCards(deckId) {
    const now = Date.now();
    const deck = DECKS.find((d) => d.id === deckId);
    if (!deck) return [];
    const due = [];
    const fresh = [];
    deck.words.forEach((w) => {
      const c = getCard(deckId, w.de);
      if (c.due === 0) fresh.push(w);
      else if (c.due <= now) due.push(w);
    });
    return { due, fresh, all: deck.words };
  }

  function deckProgress(deckId) {
    const deck = DECKS.find((d) => d.id === deckId);
    if (!deck) return { learned: 0, total: 0, pct: 0 };
    let learned = 0;
    deck.words.forEach((w) => {
      const key = cardKey(deckId, w.de);
      const c = state.cards[key];
      if (c && c.reps >= 2) learned += 1; // "learned" = graduated
    });
    const total = deck.words.length;
    return { learned, total, pct: total ? Math.round((learned / total) * 100) : 0 };
  }

  function totalLearned() {
    let learned = 0;
    let total = 0;
    DECKS.forEach((d) => {
      const p = deckProgress(d.id);
      learned += p.learned;
      total += p.total;
    });
    return { learned, total };
  }

  function stats() {
    // ensure today's counter is fresh
    const t = todayStr();
    if (state.stats.todayDate !== t) {
      state.stats.todayCount = 0;
    }
    return { ...state.stats };
  }

  function setDailyGoal(n) {
    state.stats.dailyGoal = Math.max(5, Math.min(200, n | 0));
    save();
  }

  function reset() {
    state = defaultState();
    save();
  }

  return {
    review,
    recordQuiz,
    dueCards,
    deckProgress,
    totalLearned,
    stats,
    setDailyGoal,
    getCard,
    reset,
  };
})();
