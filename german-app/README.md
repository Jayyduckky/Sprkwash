# DeutschLern 🇩🇪 — Learn German

A fully functional, offline-capable German learning app. Pure HTML, CSS, and
JavaScript — no build step, no backend, no dependencies. Just open `index.html`.

## Features

- **🃏 Flashcards with spaced repetition** — 8 topic decks (greetings, family,
  food, colors, travel, time, verbs, adjectives). Cards resurface on an
  SM-2-style schedule so you review at the right moment. Grade each card
  *Again / Hard / Good / Easy*.
- **❓ Five quiz modes** — German→English, English→German, listening,
  type-the-word, and der/die/das article practice. 10 questions each with
  instant feedback and scoring.
- **📖 Grammar** — der/die/das explainer plus present-tense conjugation tables
  for 8 common verbs, and an interactive conjugation trainer.
- **💬 Phrases** — 20 everyday expressions, tap to hear them.
- **🔢 Numbers** — number reference (0–100) plus a spelling trainer, with an
  explainer for how German builds larger numbers.
- **🔊 Pronunciation** — every German word/sentence can be spoken aloud using
  the browser's built-in German text-to-speech (Web Speech API).
- **📊 Progress tracking** — day streak, words learned, accuracy, per-deck
  progress, and a configurable daily goal. All saved locally in your browser
  (`localStorage`) — no account needed.

## Run it

Open `index.html` in any modern browser. That's it.

For local development with a server (recommended so speech + hashing behave):

```bash
cd german-app
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy (Netlify, free)

Drag the `german-app` folder onto [netlify.com](https://netlify.com), or connect
the repo and set the publish directory to `german-app`. The included
`netlify.toml` adds sensible security headers.

## Tech

- Vanilla JS (hash-based routing, no framework)
- `localStorage` for progress + spaced-repetition scheduling
- Web Speech API (`speechSynthesis`) for German pronunciation
- Plus Jakarta Sans (Google Fonts)

## Project layout

```
german-app/
├── index.html        app shell + bottom nav
├── css/styles.css    all styling (dark theme, mobile-first)
├── js/data.js        vocabulary, phrases, numbers, conjugations
├── js/store.js       progress persistence + SM-2 spaced repetition
├── js/app.js         UI controller, routing, all study modes
└── netlify.toml      deploy config
```

Viel Erfolg beim Deutschlernen! 🎉
