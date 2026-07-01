/* ============================================================
   app.js — UI controller, routing, and all interactive modes
   ============================================================ */

// ---------- small helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = (arr, n) => shuffle(arr).slice(0, n);
const norm = (s) =>
  s.trim().toLowerCase().replace(/ß/g, "ss").replace(/\s+/g, " ");

// ---------- speech (pronunciation) ----------
const Speech = (() => {
  let voice = null;
  let enabled = true;
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    voice =
      voices.find((v) => v.lang === "de-DE") ||
      voices.find((v) => v.lang && v.lang.startsWith("de")) ||
      null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function speak(text) {
    if (!enabled || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    if (voice) u.voice = voice;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  function toggle() {
    enabled = !enabled;
    return enabled;
  }
  function available() {
    return "speechSynthesis" in window;
  }
  return { speak, toggle, available, isEnabled: () => enabled };
})();

// ---------- app root ----------
const app = $("#app");
const routes = {};
function route(name, fn) {
  routes[name] = fn;
}
function navigate(name, params) {
  location.hash = name + (params ? "/" + params : "");
}
function render() {
  const [name, param] = (location.hash.replace(/^#/, "") || "home").split("/");
  const fn = routes[name] || routes.home;
  setActiveNav(name);
  app.innerHTML = "";
  fn(param);
}
window.addEventListener("hashchange", render);

function setActiveNav(name) {
  $$(".nav-link").forEach((l) =>
    l.classList.toggle("active", l.dataset.route === name)
  );
}

// pronunciation button factory
function audioBtn(text) {
  const b = el("button", "audio-btn", "🔊");
  b.title = "Hear pronunciation";
  b.setAttribute("aria-label", "Hear pronunciation of " + text);
  b.onclick = (e) => {
    e.stopPropagation();
    Speech.speak(text);
  };
  return b;
}

/* ============================================================
   HOME / DASHBOARD
   ============================================================ */
route("home", () => {
  const s = Store.stats();
  const tot = Store.totalLearned();
  const accuracy = s.reviews ? Math.round((s.correct / s.reviews) * 100) : 0;
  const goalPct = Math.min(100, Math.round((s.todayCount / s.dailyGoal) * 100));

  const wrap = el("div", "view");
  wrap.append(
    el(
      "div",
      "hero",
      `<h1>Willkommen! 🇩🇪</h1>
       <p>Your daily path to learning German — flashcards, quizzes, grammar and more.</p>`
    )
  );

  // stat cards
  const stats = el("div", "stat-grid");
  const statData = [
    { label: "Day streak", value: s.streakDays, icon: "🔥" },
    { label: "Words learned", value: `${tot.learned}/${tot.total}`, icon: "📚" },
    { label: "Accuracy", value: accuracy + "%", icon: "🎯" },
    { label: "Total reviews", value: s.reviews, icon: "🔁" },
  ];
  statData.forEach((d) => {
    stats.append(
      el(
        "div",
        "stat-card",
        `<div class="stat-icon">${d.icon}</div>
         <div class="stat-value">${d.value}</div>
         <div class="stat-label">${d.label}</div>`
      )
    );
  });
  wrap.append(stats);

  // daily goal
  const goal = el("div", "card goal-card");
  goal.append(
    el(
      "div",
      "goal-head",
      `<span>Daily goal</span><span>${s.todayCount} / ${s.dailyGoal}</span>`
    )
  );
  const bar = el("div", "progress");
  bar.append(el("div", "progress-fill", ""));
  goal.append(bar);
  wrap.append(goal);
  requestAnimationFrame(() => {
    $(".goal-card .progress-fill").style.width = goalPct + "%";
  });

  // quick actions
  const actions = el("div", "action-grid");
  const acts = [
    { t: "Flashcards", d: "Study with spaced repetition", i: "🃏", r: "decks" },
    { t: "Quiz", d: "Test yourself", i: "❓", r: "quiz" },
    { t: "Grammar", d: "Verbs & articles", i: "📖", r: "grammar" },
    { t: "Phrases", d: "Everyday expressions", i: "💬", r: "phrases" },
    { t: "Numbers", d: "Learn to count", i: "🔢", r: "numbers" },
    { t: "Progress", d: "Track your learning", i: "📊", r: "progress" },
  ];
  acts.forEach((a) => {
    const c = el(
      "button",
      "action-card",
      `<div class="action-icon">${a.i}</div>
       <div class="action-title">${a.t}</div>
       <div class="action-desc">${a.d}</div>`
    );
    c.onclick = () => navigate(a.r);
    actions.append(c);
  });
  wrap.append(el("h2", "section-title", "What would you like to do?"), actions);

  app.append(wrap);
});

/* ============================================================
   DECK LIST
   ============================================================ */
route("decks", () => {
  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "🃏 Flashcard Decks"));
  wrap.append(
    el("p", "page-sub", "Pick a topic. Cards you've seen come back on schedule.")
  );

  const grid = el("div", "deck-grid");
  DECKS.forEach((d) => {
    const p = Store.deckProgress(d.id);
    const dueInfo = Store.dueCards(d.id);
    const dueCount = dueInfo.due.length + dueInfo.fresh.length;
    const card = el("div", "deck-card");
    card.innerHTML = `
      <div class="deck-icon">${d.icon}</div>
      <div class="deck-name">${d.name}</div>
      <div class="deck-meta">${d.words.length} words · ${p.learned} learned</div>
      <div class="progress small"><div class="progress-fill" style="width:${p.pct}%"></div></div>
      ${dueCount ? `<span class="badge">${dueCount} to review</span>` : `<span class="badge badge-muted">All caught up</span>`}
    `;
    card.onclick = () => navigate("study", d.id);
    grid.append(card);
  });
  wrap.append(grid);
  app.append(wrap);
});

/* ============================================================
   STUDY (flashcards + SRS)
   ============================================================ */
route("study", (deckId) => {
  const deck = DECKS.find((d) => d.id === deckId);
  if (!deck) return navigate("decks");

  const { due, fresh } = Store.dueCards(deckId);
  // Build a session queue: due cards + up to 8 new cards.
  let queue = shuffle(due).concat(sample(fresh, 8));
  if (queue.length === 0) queue = shuffle(deck.words); // free review if nothing due

  let index = 0;
  let flipped = false;
  let done = 0;

  const wrap = el("div", "view study-view");
  const header = el("div", "study-header");
  const back = el("button", "btn-ghost", "← Decks");
  back.onclick = () => navigate("decks");
  header.append(back, el("div", "study-title", `${deck.icon} ${deck.name}`));
  const counter = el("div", "study-counter", "");
  header.append(counter);
  wrap.append(header);

  const cardHost = el("div", "flashcard-host");
  wrap.append(cardHost);

  const controls = el("div", "study-controls");
  wrap.append(controls);

  app.append(wrap);

  function renderCard() {
    if (index >= queue.length) return finish();
    flipped = false;
    const word = queue[index];
    counter.textContent = `${done + 1} / ${queue.length}`;

    cardHost.innerHTML = "";
    const fc = el("div", "flashcard");
    const front = el("div", "flashcard-face front");
    const article = word.article ? `<span class="article">${word.article}</span> ` : "";
    front.innerHTML = `<div class="fc-word">${article}${word.de}</div>
      <div class="fc-hint">Tap to reveal</div>`;
    front.append(audioBtn(word.de));

    const back = el("div", "flashcard-face back");
    back.innerHTML = `<div class="fc-word en">${word.en}</div>
      <div class="fc-example">„${word.example.de}"<br><span>${word.example.en}</span></div>`;
    back.append(audioBtn(word.example.de));

    fc.append(front, back);
    fc.onclick = () => {
      flipped = !flipped;
      fc.classList.toggle("flipped", flipped);
      renderControls();
      if (flipped) Speech.speak(word.de);
    };
    cardHost.append(fc);
    renderControls();
  }

  function renderControls() {
    controls.innerHTML = "";
    if (!flipped) {
      const b = el("button", "btn-primary big", "Show answer");
      b.onclick = () => cardHost.querySelector(".flashcard").click();
      controls.append(b);
      return;
    }
    const grades = [
      { q: 0, label: "Again", cls: "grade-again" },
      { q: 1, label: "Hard", cls: "grade-hard" },
      { q: 2, label: "Good", cls: "grade-good" },
      { q: 3, label: "Easy", cls: "grade-easy" },
    ];
    grades.forEach((g) => {
      const b = el("button", "grade-btn " + g.cls, g.label);
      b.onclick = () => grade(g.q);
      controls.append(b);
    });
  }

  function grade(q) {
    const word = queue[index];
    Store.review(deckId, word, q);
    // "Again" re-inserts the card later in the queue
    if (q === 0) queue.push(word);
    index += 1;
    done += 1;
    renderCard();
  }

  function finish() {
    const p = Store.deckProgress(deckId);
    cardHost.innerHTML = "";
    controls.innerHTML = "";
    counter.textContent = "";
    const done = el(
      "div",
      "finish-card card",
      `<div class="finish-emoji">🎉</div>
       <h2>Session complete!</h2>
       <p>You reviewed ${queue.length} cards.</p>
       <p class="muted">${p.learned} of ${p.total} words learned in this deck.</p>`
    );
    const row = el("div", "finish-actions");
    const again = el("button", "btn-primary", "Study again");
    again.onclick = () => navigate("study", deckId);
    const b2 = el("button", "btn-ghost", "Back to decks");
    b2.onclick = () => navigate("decks");
    row.append(again, b2);
    done.append(row);
    cardHost.append(done);
  }

  renderCard();
});

/* ============================================================
   QUIZ
   ============================================================ */
route("quiz", (mode) => {
  if (!mode) return quizMenu();
  runQuiz(mode);
});

function quizMenu() {
  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "❓ Quiz"));
  wrap.append(el("p", "page-sub", "Choose a challenge. 10 questions each."));
  const grid = el("div", "action-grid");
  const modes = [
    { t: "German → English", d: "Read German, pick the meaning", i: "🇩🇪", m: "de-en" },
    { t: "English → German", d: "Read English, pick the German", i: "🇬🇧", m: "en-de" },
    { t: "Listening", d: "Hear a word, pick it", i: "👂", m: "listen" },
    { t: "Type it", d: "Type the German word", i: "⌨️", m: "type" },
    { t: "der / die / das", d: "Pick the right article", i: "🏷️", m: "gender" },
  ];
  modes.forEach((mo) => {
    const c = el(
      "button",
      "action-card",
      `<div class="action-icon">${mo.i}</div>
       <div class="action-title">${mo.t}</div>
       <div class="action-desc">${mo.d}</div>`
    );
    if (mo.m === "listen" && !Speech.available()) {
      c.classList.add("disabled");
      c.disabled = true;
      c.querySelector(".action-desc").textContent = "Not supported in this browser";
    } else {
      c.onclick = () => navigate("quiz", mo.m);
    }
    grid.append(c);
  });
  wrap.append(grid);
  app.append(wrap);
}

function runQuiz(mode) {
  const TOTAL = 10;
  let pool;
  if (mode === "gender") pool = allWords().filter((w) => w.article);
  else pool = allWords();
  const questions = sample(pool, Math.min(TOTAL, pool.length));

  let qi = 0;
  let correct = 0;
  let locked = false;

  const wrap = el("div", "view quiz-view");
  const header = el("div", "study-header");
  const back = el("button", "btn-ghost", "← Quizzes");
  back.onclick = () => navigate("quiz");
  header.append(back, el("div", "study-title", "Quiz"));
  const counter = el("div", "study-counter", "");
  header.append(counter);
  wrap.append(header);

  const bar = el("div", "progress");
  bar.append(el("div", "progress-fill quiz-progress", ""));
  wrap.append(bar);

  const host = el("div", "quiz-host");
  wrap.append(host);
  app.append(wrap);

  function showQuestion() {
    if (qi >= questions.length) return finishQuiz();
    locked = false;
    const w = questions[qi];
    counter.textContent = `${qi + 1} / ${questions.length}`;
    $(".quiz-progress").style.width = ((qi) / questions.length) * 100 + "%";
    host.innerHTML = "";

    if (mode === "type") return typeQuestion(w);
    if (mode === "gender") return genderQuestion(w);
    return mcQuestion(w);
  }

  function mcQuestion(w) {
    const askDe = mode === "de-en";
    const listen = mode === "listen";
    const promptText = listen ? "🔊 Listen and choose" : askDe ? w.de : w.en;
    const answerField = askDe || listen ? "en" : "de";

    const q = el("div", "quiz-question card");
    const promptEl = el("div", "quiz-prompt", promptText);
    if (askDe && w.article) promptEl.innerHTML = `<span class="article">${w.article}</span> ${w.de}`;
    q.append(promptEl);
    if (listen || askDe) q.append(audioBtn(w.de));
    if (listen) Speech.speak(w.de);

    // build options
    const correctAns = w[answerField];
    const distractPool = allWords()
      .filter((x) => x[answerField] !== correctAns)
      .map((x) => x[answerField]);
    const options = shuffle([correctAns, ...sample([...new Set(distractPool)], 3)]);

    const opts = el("div", "quiz-options");
    options.forEach((opt) => {
      const b = el("button", "quiz-option", opt);
      b.onclick = () => answerMC(b, opt, correctAns, opts);
      opts.append(b);
    });
    q.append(opts);
    host.append(q);
  }

  function answerMC(btn, chosen, correctAns, optsEl) {
    if (locked) return;
    locked = true;
    const ok = chosen === correctAns;
    if (ok) correct++;
    $$(".quiz-option", optsEl).forEach((b) => {
      b.disabled = true;
      if (b.textContent === correctAns) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
    });
    nextButton(ok);
  }

  function genderQuestion(w) {
    const q = el("div", "quiz-question card");
    q.append(el("div", "quiz-prompt", w.de));
    q.append(el("div", "quiz-sub", w.en));
    const opts = el("div", "quiz-options row3");
    ["der", "die", "das"].forEach((art) => {
      const b = el("button", "quiz-option art", art);
      b.onclick = () => {
        if (locked) return;
        locked = true;
        const ok = art === w.article;
        if (ok) correct++;
        $$(".quiz-option", opts).forEach((x) => {
          x.disabled = true;
          if (x.textContent === w.article) x.classList.add("correct");
          else if (x === b) x.classList.add("wrong");
        });
        Speech.speak(w.article + " " + w.de);
        nextButton(ok);
      };
      opts.append(b);
    });
    q.append(opts);
    host.append(q);
  }

  function typeQuestion(w) {
    const q = el("div", "quiz-question card");
    q.append(el("div", "quiz-prompt", w.en));
    if (w.article) q.append(el("div", "quiz-sub", `(noun — include article: ${w.article})`));
    const form = el("form", "type-form");
    const input = el("input", "type-input");
    input.type = "text";
    input.autocomplete = "off";
    input.autocapitalize = "off";
    input.spellcheck = false;
    input.placeholder = "Type in German…";
    const submit = el("button", "btn-primary", "Check");
    submit.type = "submit";
    form.append(input, submit);
    const feedback = el("div", "type-feedback", "");
    q.append(form, feedback);
    host.append(q);
    input.focus();

    form.onsubmit = (e) => {
      e.preventDefault();
      if (locked) return;
      locked = true;
      const expected = w.article ? `${w.article} ${w.de}` : w.de;
      const bare = w.de;
      const val = norm(input.value);
      const ok = val === norm(expected) || val === norm(bare);
      if (ok) correct++;
      input.disabled = true;
      submit.disabled = true;
      feedback.className = "type-feedback " + (ok ? "ok" : "bad");
      feedback.innerHTML = ok
        ? `✅ Correct — <strong>${expected}</strong>`
        : `❌ Answer: <strong>${expected}</strong>`;
      Speech.speak(bare);
      nextButton(ok);
    };
  }

  function nextButton(ok) {
    const n = el("button", "btn-primary big next-btn", qi + 1 >= questions.length ? "See results" : "Next →");
    n.onclick = () => {
      qi++;
      showQuestion();
    };
    host.append(n);
    n.focus();
  }

  function finishQuiz() {
    Store.recordQuiz(correct, questions.length);
    $(".quiz-progress").style.width = "100%";
    counter.textContent = "";
    host.innerHTML = "";
    const pct = Math.round((correct / questions.length) * 100);
    const msg = pct >= 80 ? "Ausgezeichnet! 🌟" : pct >= 50 ? "Gut gemacht! 👍" : "Weiter üben! 💪";
    const card = el(
      "div",
      "finish-card card",
      `<div class="finish-emoji">${pct >= 80 ? "🏆" : "📊"}</div>
       <h2>${msg}</h2>
       <div class="score">${correct} / ${questions.length}</div>
       <p class="muted">${pct}% correct</p>`
    );
    const row = el("div", "finish-actions");
    const again = el("button", "btn-primary", "Try again");
    again.onclick = () => navigate("quiz", mode);
    const menu = el("button", "btn-ghost", "Other quizzes");
    menu.onclick = () => navigate("quiz");
    row.append(again, menu);
    card.append(row);
    host.append(card);
  }

  showQuestion();
}

/* ============================================================
   GRAMMAR (verb conjugation + articles reference)
   ============================================================ */
route("grammar", (sub) => {
  if (sub === "conjugate") return conjugationTrainer();
  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "📖 Grammar"));

  // Articles explainer
  wrap.append(el("h2", "section-title", "The three articles"));
  const artCard = el("div", "card grammar-card");
  artCard.innerHTML = `
    <p>German nouns have a gender. The word for "the" changes with it:</p>
    <div class="article-row">
      <div class="art-box der"><span>der</span><small>masculine</small><em>der Mann</em></div>
      <div class="art-box die"><span>die</span><small>feminine</small><em>die Frau</em></div>
      <div class="art-box das"><span>das</span><small>neuter</small><em>das Kind</em></div>
    </div>
    <p class="muted">Tip: always learn a noun together with its article. Practice in the "der/die/das" quiz!</p>
  `;
  wrap.append(artCard);

  // Verb conjugation tables
  wrap.append(el("h2", "section-title", "Present-tense verbs"));
  const trainBtn = el("button", "btn-primary", "▶ Practice conjugation");
  trainBtn.onclick = () => navigate("grammar", "conjugate");
  wrap.append(trainBtn);

  CONJUGATIONS.forEach((v) => {
    const c = el("div", "card conj-card");
    const head = el(
      "div",
      "conj-head",
      `<span class="conj-inf">${v.infinitive}</span>
       <span class="conj-en">${v.en}</span>
       ${v.irregular ? '<span class="tag-irregular">irregular</span>' : ""}`
    );
    head.append(audioBtn(v.infinitive));
    c.append(head);
    const table = el("div", "conj-table");
    PRONOUNS.forEach((p) => {
      const row = el("div", "conj-row");
      row.innerHTML = `<span class="pron">${p}</span><span class="form">${v.forms[p]}</span>`;
      const b = audioBtn(p.split("/")[0] + " " + v.forms[p]);
      row.append(b);
      table.append(row);
    });
    c.append(table);
    wrap.append(c);
  });

  app.append(wrap);
});

function conjugationTrainer() {
  const questions = shuffle(CONJUGATIONS).slice(0, 6).map((v) => {
    const pron = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
    return { verb: v, pron, answer: v.forms[pron] };
  });
  let qi = 0;
  let correct = 0;

  const wrap = el("div", "view");
  const header = el("div", "study-header");
  const back = el("button", "btn-ghost", "← Grammar");
  back.onclick = () => navigate("grammar");
  header.append(back, el("div", "study-title", "Conjugation practice"));
  const counter = el("div", "study-counter", "");
  header.append(counter);
  wrap.append(header);
  const host = el("div", "quiz-host");
  wrap.append(host);
  app.append(wrap);

  function show() {
    if (qi >= questions.length) return finish();
    const { verb, pron, answer } = questions[qi];
    counter.textContent = `${qi + 1} / ${questions.length}`;
    host.innerHTML = "";
    const q = el("div", "quiz-question card");
    q.innerHTML = `<div class="conj-prompt"><strong>${verb.infinitive}</strong> <span class="muted">(${verb.en})</span></div>
      <div class="conj-fill">${pron} <input class="type-input inline" type="text" autocomplete="off" spellcheck="false" placeholder="…"></div>`;
    const feedback = el("div", "type-feedback", "");
    const submit = el("button", "btn-primary", "Check");
    q.append(submit, feedback);
    host.append(q);
    const input = $("input", q);
    input.focus();

    let locked = false;
    const check = () => {
      if (locked) return;
      locked = true;
      const ok = norm(input.value) === norm(answer);
      if (ok) correct++;
      input.disabled = true;
      submit.disabled = true;
      feedback.className = "type-feedback " + (ok ? "ok" : "bad");
      feedback.innerHTML = ok ? `✅ Richtig!` : `❌ ${pron} <strong>${answer}</strong>`;
      Speech.speak(pron.split("/")[0] + " " + answer);
      const n = el("button", "btn-primary big", qi + 1 >= questions.length ? "Results" : "Next →");
      n.onclick = () => { qi++; show(); };
      q.append(n);
      n.focus();
    };
    submit.onclick = check;
    input.onkeydown = (e) => { if (e.key === "Enter") check(); };
  }

  function finish() {
    Store.recordQuiz(correct, questions.length);
    host.innerHTML = "";
    counter.textContent = "";
    const card = el("div", "finish-card card",
      `<div class="finish-emoji">✍️</div><h2>Done!</h2>
       <div class="score">${correct} / ${questions.length}</div>`);
    const row = el("div", "finish-actions");
    const again = el("button", "btn-primary", "Again");
    again.onclick = () => navigate("grammar", "conjugate");
    const b = el("button", "btn-ghost", "Back");
    b.onclick = () => navigate("grammar");
    row.append(again, b);
    card.append(row);
    host.append(card);
  }
  show();
}

/* ============================================================
   PHRASES
   ============================================================ */
route("phrases", () => {
  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "💬 Everyday Phrases"));
  wrap.append(el("p", "page-sub", "Tap any phrase to hear it spoken."));
  const list = el("div", "phrase-list");
  PHRASES.forEach((p) => {
    const row = el("div", "phrase-row");
    row.innerHTML = `<div class="phrase-de">${p.de}</div><div class="phrase-en">${p.en}</div>`;
    row.append(audioBtn(p.de));
    row.onclick = () => Speech.speak(p.de);
    list.append(row);
  });
  wrap.append(list);
  app.append(wrap);
});

/* ============================================================
   NUMBERS
   ============================================================ */
route("numbers", (sub) => {
  if (sub === "practice") return numberTrainer();
  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "🔢 Numbers"));
  wrap.append(el("p", "page-sub", "Learn to count in German. Tap to listen."));
  const btn = el("button", "btn-primary", "▶ Practice numbers");
  btn.onclick = () => navigate("numbers", "practice");
  wrap.append(btn);

  const grid = el("div", "number-grid");
  NUMBERS.forEach((num) => {
    const c = el("div", "number-card");
    c.innerHTML = `<div class="num-digit">${num.n}</div><div class="num-word">${num.de}</div>`;
    c.append(audioBtn(num.de));
    c.onclick = () => Speech.speak(num.de);
    grid.append(c);
  });
  wrap.append(grid);

  const tip = el("div", "card grammar-card");
  tip.innerHTML = `<h3>Building bigger numbers</h3>
    <p>German says the ones <em>before</em> the tens, joined by <strong>und</strong>:</p>
    <ul>
      <li><strong>21</strong> = einundzwanzig <span class="muted">(one-and-twenty)</span></li>
      <li><strong>34</strong> = vierunddreißig <span class="muted">(four-and-thirty)</span></li>
      <li><strong>99</strong> = neunundneunzig</li>
    </ul>`;
  wrap.append(tip);
  app.append(wrap);
});

function numberTrainer() {
  const items = sample(NUMBERS, 8);
  let qi = 0, correct = 0;
  const wrap = el("div", "view");
  const header = el("div", "study-header");
  const back = el("button", "btn-ghost", "← Numbers");
  back.onclick = () => navigate("numbers");
  header.append(back, el("div", "study-title", "Number practice"));
  const counter = el("div", "study-counter", "");
  header.append(counter);
  wrap.append(header);
  const host = el("div", "quiz-host");
  wrap.append(host);
  app.append(wrap);

  function show() {
    if (qi >= items.length) return finish();
    const item = items[qi];
    counter.textContent = `${qi + 1} / ${items.length}`;
    host.innerHTML = "";
    const q = el("div", "quiz-question card");
    q.append(el("div", "quiz-prompt big-num", String(item.n)));
    q.append(el("div", "quiz-sub", "Write this number in German"));
    const form = el("form", "type-form");
    const input = el("input", "type-input");
    input.type = "text"; input.autocomplete = "off"; input.spellcheck = false;
    input.placeholder = "Type in German…";
    const submit = el("button", "btn-primary", "Check"); submit.type = "submit";
    form.append(input, submit);
    const feedback = el("div", "type-feedback", "");
    q.append(form, feedback);
    host.append(q);
    input.focus();
    let locked = false;
    form.onsubmit = (e) => {
      e.preventDefault();
      if (locked) return; locked = true;
      const ok = norm(input.value) === norm(item.de);
      if (ok) correct++;
      input.disabled = true; submit.disabled = true;
      feedback.className = "type-feedback " + (ok ? "ok" : "bad");
      feedback.innerHTML = ok ? `✅ Richtig!` : `❌ <strong>${item.de}</strong>`;
      Speech.speak(item.de);
      const n = el("button", "btn-primary big", qi + 1 >= items.length ? "Results" : "Next →");
      n.onclick = () => { qi++; show(); };
      q.append(n); n.focus();
    };
  }
  function finish() {
    Store.recordQuiz(correct, items.length);
    host.innerHTML = ""; counter.textContent = "";
    const card = el("div", "finish-card card",
      `<div class="finish-emoji">🔢</div><h2>Done!</h2><div class="score">${correct} / ${items.length}</div>`);
    const row = el("div", "finish-actions");
    const again = el("button", "btn-primary", "Again");
    again.onclick = () => navigate("numbers", "practice");
    const b = el("button", "btn-ghost", "Back");
    b.onclick = () => navigate("numbers");
    row.append(again, b); card.append(row); host.append(card);
  }
  show();
}

/* ============================================================
   PROGRESS
   ============================================================ */
route("progress", () => {
  const s = Store.stats();
  const tot = Store.totalLearned();
  const accuracy = s.reviews ? Math.round((s.correct / s.reviews) * 100) : 0;

  const wrap = el("div", "view");
  wrap.append(el("h1", "page-title", "📊 Your Progress"));

  const stats = el("div", "stat-grid");
  [
    { label: "Day streak", value: s.streakDays, icon: "🔥" },
    { label: "Words learned", value: `${tot.learned}/${tot.total}`, icon: "📚" },
    { label: "Accuracy", value: accuracy + "%", icon: "🎯" },
    { label: "Reviews", value: s.reviews, icon: "🔁" },
    { label: "Quizzes taken", value: s.quizzesTaken, icon: "❓" },
    { label: "Studied today", value: `${s.todayCount}`, icon: "📅" },
  ].forEach((d) => {
    stats.append(el("div", "stat-card",
      `<div class="stat-icon">${d.icon}</div>
       <div class="stat-value">${d.value}</div>
       <div class="stat-label">${d.label}</div>`));
  });
  wrap.append(stats);

  wrap.append(el("h2", "section-title", "By deck"));
  const list = el("div", "deck-progress-list");
  DECKS.forEach((d) => {
    const p = Store.deckProgress(d.id);
    const row = el("div", "deck-progress-row");
    row.innerHTML = `
      <div class="dp-icon">${d.icon}</div>
      <div class="dp-main">
        <div class="dp-name">${d.name}</div>
        <div class="progress small"><div class="progress-fill" style="width:${p.pct}%"></div></div>
      </div>
      <div class="dp-count">${p.learned}/${p.total}</div>`;
    row.onclick = () => navigate("study", d.id);
    list.append(row);
  });
  wrap.append(list);

  // daily goal setting
  const goalCard = el("div", "card");
  goalCard.append(el("h3", null, "Daily goal"));
  const gr = el("div", "goal-setter");
  const input = el("input", "goal-input");
  input.type = "number"; input.min = "5"; input.max = "200"; input.value = s.dailyGoal;
  const saveG = el("button", "btn-primary", "Save");
  saveG.onclick = () => { Store.setDailyGoal(parseInt(input.value, 10)); render(); };
  gr.append(el("span", null, "Words per day:"), input, saveG);
  goalCard.append(gr);
  wrap.append(goalCard);

  // reset
  const danger = el("div", "card danger-card");
  danger.append(el("h3", null, "Reset progress"));
  danger.append(el("p", "muted", "This clears all your saved progress on this device."));
  const rb = el("button", "btn-danger", "Reset everything");
  rb.onclick = () => {
    if (confirm("Really reset all progress? This can't be undone.")) {
      Store.reset();
      navigate("home");
    }
  };
  danger.append(rb);
  wrap.append(danger);

  app.append(wrap);
});

/* ============================================================
   BOOT
   ============================================================ */
function buildNav() {
  const items = [
    { r: "home", label: "Home", icon: "🏠" },
    { r: "decks", label: "Cards", icon: "🃏" },
    { r: "quiz", label: "Quiz", icon: "❓" },
    { r: "grammar", label: "Grammar", icon: "📖" },
    { r: "phrases", label: "Phrases", icon: "💬" },
    { r: "numbers", label: "Numbers", icon: "🔢" },
    { r: "progress", label: "Progress", icon: "📊" },
  ];
  const nav = $("#bottom-nav");
  items.forEach((it) => {
    const a = el("a", "nav-link", `<span class="nav-icon">${it.icon}</span><span class="nav-label">${it.label}</span>`);
    a.href = "#" + it.r;
    a.dataset.route = it.r;
    nav.append(a);
  });
}

function initSpeechToggle() {
  const btn = $("#speech-toggle");
  if (!Speech.available()) {
    btn.style.display = "none";
    return;
  }
  const sync = () => {
    const on = Speech.isEnabled();
    btn.textContent = on ? "🔊" : "🔇";
    btn.title = on ? "Sound on" : "Sound off";
  };
  btn.onclick = () => { Speech.toggle(); sync(); };
  sync();
}

buildNav();
initSpeechToggle();
render();
