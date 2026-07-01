/* ============================================================
   data.js — German learning content
   All content is embedded so the app works fully offline.
   ============================================================ */

// Vocabulary decks. Each word: de (German), en (English),
// article ('der'|'die'|'das'|null for non-nouns), example {de, en}.
const DECKS = [
  {
    id: "greetings",
    name: "Greetings & Basics",
    icon: "👋",
    words: [
      { de: "Hallo", en: "hello", article: null, example: { de: "Hallo, wie geht es dir?", en: "Hello, how are you?" } },
      { de: "Tschüss", en: "bye", article: null, example: { de: "Tschüss, bis morgen!", en: "Bye, see you tomorrow!" } },
      { de: "Guten Morgen", en: "good morning", article: null, example: { de: "Guten Morgen, alle zusammen!", en: "Good morning, everyone!" } },
      { de: "Guten Tag", en: "good day", article: null, example: { de: "Guten Tag, Herr Müller.", en: "Good day, Mr. Müller." } },
      { de: "Guten Abend", en: "good evening", article: null, example: { de: "Guten Abend, schön Sie zu sehen.", en: "Good evening, nice to see you." } },
      { de: "Gute Nacht", en: "good night", article: null, example: { de: "Gute Nacht, schlaf gut.", en: "Good night, sleep well." } },
      { de: "Bitte", en: "please / you're welcome", article: null, example: { de: "Einen Kaffee, bitte.", en: "A coffee, please." } },
      { de: "Danke", en: "thank you", article: null, example: { de: "Danke für deine Hilfe.", en: "Thank you for your help." } },
      { de: "Entschuldigung", en: "excuse me / sorry", article: null, example: { de: "Entschuldigung, wo ist der Bahnhof?", en: "Excuse me, where is the station?" } },
      { de: "Ja", en: "yes", article: null, example: { de: "Ja, das stimmt.", en: "Yes, that's right." } },
      { de: "Nein", en: "no", article: null, example: { de: "Nein, danke.", en: "No, thank you." } },
      { de: "Vielleicht", en: "maybe", article: null, example: { de: "Vielleicht komme ich später.", en: "Maybe I'll come later." } },
    ],
  },
  {
    id: "people",
    name: "People & Family",
    icon: "👨‍👩‍👧",
    words: [
      { de: "Mann", en: "man", article: "der", example: { de: "Der Mann liest eine Zeitung.", en: "The man is reading a newspaper." } },
      { de: "Frau", en: "woman", article: "die", example: { de: "Die Frau spielt Klavier.", en: "The woman plays piano." } },
      { de: "Kind", en: "child", article: "das", example: { de: "Das Kind spielt im Garten.", en: "The child plays in the garden." } },
      { de: "Mutter", en: "mother", article: "die", example: { de: "Meine Mutter kocht gern.", en: "My mother likes to cook." } },
      { de: "Vater", en: "father", article: "der", example: { de: "Mein Vater arbeitet viel.", en: "My father works a lot." } },
      { de: "Bruder", en: "brother", article: "der", example: { de: "Mein Bruder ist älter als ich.", en: "My brother is older than me." } },
      { de: "Schwester", en: "sister", article: "die", example: { de: "Meine Schwester wohnt in Berlin.", en: "My sister lives in Berlin." } },
      { de: "Freund", en: "friend (m)", article: "der", example: { de: "Mein Freund kommt aus Spanien.", en: "My friend comes from Spain." } },
      { de: "Freundin", en: "friend (f)", article: "die", example: { de: "Meine Freundin lernt Deutsch.", en: "My friend is learning German." } },
      { de: "Familie", en: "family", article: "die", example: { de: "Meine Familie ist groß.", en: "My family is big." } },
      { de: "Baby", en: "baby", article: "das", example: { de: "Das Baby schläft.", en: "The baby is sleeping." } },
      { de: "Leute", en: "people", article: "die", example: { de: "Viele Leute warten hier.", en: "Many people are waiting here." } },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: "🍞",
    words: [
      { de: "Brot", en: "bread", article: "das", example: { de: "Ich kaufe frisches Brot.", en: "I buy fresh bread." } },
      { de: "Wasser", en: "water", article: "das", example: { de: "Ein Glas Wasser, bitte.", en: "A glass of water, please." } },
      { de: "Kaffee", en: "coffee", article: "der", example: { de: "Ich trinke morgens Kaffee.", en: "I drink coffee in the morning." } },
      { de: "Tee", en: "tea", article: "der", example: { de: "Möchtest du einen Tee?", en: "Would you like a tea?" } },
      { de: "Apfel", en: "apple", article: "der", example: { de: "Der Apfel ist rot.", en: "The apple is red." } },
      { de: "Milch", en: "milk", article: "die", example: { de: "Die Milch ist kalt.", en: "The milk is cold." } },
      { de: "Käse", en: "cheese", article: "der", example: { de: "Ich mag deutschen Käse.", en: "I like German cheese." } },
      { de: "Ei", en: "egg", article: "das", example: { de: "Ich esse ein Ei zum Frühstück.", en: "I eat an egg for breakfast." } },
      { de: "Fleisch", en: "meat", article: "das", example: { de: "Er isst kein Fleisch.", en: "He doesn't eat meat." } },
      { de: "Gemüse", en: "vegetables", article: "das", example: { de: "Gemüse ist gesund.", en: "Vegetables are healthy." } },
      { de: "Bier", en: "beer", article: "das", example: { de: "Ein Bier, bitte.", en: "A beer, please." } },
      { de: "Wein", en: "wine", article: "der", example: { de: "Der Wein kommt aus Frankreich.", en: "The wine comes from France." } },
    ],
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🎨",
    words: [
      { de: "rot", en: "red", article: null, example: { de: "Die Rose ist rot.", en: "The rose is red." } },
      { de: "blau", en: "blue", article: null, example: { de: "Der Himmel ist blau.", en: "The sky is blue." } },
      { de: "grün", en: "green", article: null, example: { de: "Das Gras ist grün.", en: "The grass is green." } },
      { de: "gelb", en: "yellow", article: null, example: { de: "Die Sonne ist gelb.", en: "The sun is yellow." } },
      { de: "schwarz", en: "black", article: null, example: { de: "Die Katze ist schwarz.", en: "The cat is black." } },
      { de: "weiß", en: "white", article: null, example: { de: "Der Schnee ist weiß.", en: "The snow is white." } },
      { de: "orange", en: "orange", article: null, example: { de: "Die Orange ist orange.", en: "The orange is orange." } },
      { de: "lila", en: "purple", article: null, example: { de: "Ihr Kleid ist lila.", en: "Her dress is purple." } },
      { de: "braun", en: "brown", article: null, example: { de: "Der Hund ist braun.", en: "The dog is brown." } },
      { de: "grau", en: "gray", article: null, example: { de: "Der Himmel ist heute grau.", en: "The sky is gray today." } },
      { de: "rosa", en: "pink", article: null, example: { de: "Sie trägt rosa Schuhe.", en: "She wears pink shoes." } },
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: "🧳",
    words: [
      { de: "Bahnhof", en: "train station", article: "der", example: { de: "Der Bahnhof ist in der Nähe.", en: "The train station is nearby." } },
      { de: "Flughafen", en: "airport", article: "der", example: { de: "Wir fahren zum Flughafen.", en: "We're going to the airport." } },
      { de: "Hotel", en: "hotel", article: "das", example: { de: "Das Hotel ist sehr schön.", en: "The hotel is very nice." } },
      { de: "Zug", en: "train", article: "der", example: { de: "Der Zug kommt um acht Uhr.", en: "The train comes at eight o'clock." } },
      { de: "Auto", en: "car", article: "das", example: { de: "Mein Auto ist blau.", en: "My car is blue." } },
      { de: "Straße", en: "street", article: "die", example: { de: "Die Straße ist lang.", en: "The street is long." } },
      { de: "Stadt", en: "city", article: "die", example: { de: "Berlin ist eine große Stadt.", en: "Berlin is a big city." } },
      { de: "Land", en: "country", article: "das", example: { de: "Deutschland ist ein schönes Land.", en: "Germany is a beautiful country." } },
      { de: "Karte", en: "map / ticket", article: "die", example: { de: "Ich brauche eine Karte.", en: "I need a map." } },
      { de: "Koffer", en: "suitcase", article: "der", example: { de: "Mein Koffer ist schwer.", en: "My suitcase is heavy." } },
      { de: "Reise", en: "trip / journey", article: "die", example: { de: "Die Reise war lang.", en: "The journey was long." } },
    ],
  },
  {
    id: "time",
    name: "Time & Days",
    icon: "🕐",
    words: [
      { de: "Tag", en: "day", article: "der", example: { de: "Heute ist ein schöner Tag.", en: "Today is a nice day." } },
      { de: "Woche", en: "week", article: "die", example: { de: "Die Woche geht schnell vorbei.", en: "The week goes by fast." } },
      { de: "Monat", en: "month", article: "der", example: { de: "Der Monat hat 30 Tage.", en: "The month has 30 days." } },
      { de: "Jahr", en: "year", article: "das", example: { de: "Das Jahr ist fast vorbei.", en: "The year is almost over." } },
      { de: "Stunde", en: "hour", article: "die", example: { de: "Ich warte seit einer Stunde.", en: "I've been waiting for an hour." } },
      { de: "heute", en: "today", article: null, example: { de: "Heute lerne ich Deutsch.", en: "Today I'm learning German." } },
      { de: "morgen", en: "tomorrow", article: null, example: { de: "Morgen habe ich frei.", en: "Tomorrow I'm off." } },
      { de: "gestern", en: "yesterday", article: null, example: { de: "Gestern war ich müde.", en: "Yesterday I was tired." } },
      { de: "Montag", en: "Monday", article: "der", example: { de: "Am Montag arbeite ich.", en: "On Monday I work." } },
      { de: "Freitag", en: "Friday", article: "der", example: { de: "Freitag ist mein Lieblingstag.", en: "Friday is my favorite day." } },
      { de: "Wochenende", en: "weekend", article: "das", example: { de: "Am Wochenende schlafe ich lange.", en: "On the weekend I sleep in." } },
    ],
  },
  {
    id: "verbs",
    name: "Common Verbs",
    icon: "🏃",
    words: [
      { de: "sein", en: "to be", article: null, example: { de: "Ich bin müde.", en: "I am tired." } },
      { de: "haben", en: "to have", article: null, example: { de: "Ich habe Hunger.", en: "I am hungry." } },
      { de: "gehen", en: "to go", article: null, example: { de: "Ich gehe nach Hause.", en: "I'm going home." } },
      { de: "kommen", en: "to come", article: null, example: { de: "Kommst du mit?", en: "Are you coming along?" } },
      { de: "machen", en: "to make / do", article: null, example: { de: "Was machst du?", en: "What are you doing?" } },
      { de: "sagen", en: "to say", article: null, example: { de: "Was sagst du?", en: "What are you saying?" } },
      { de: "essen", en: "to eat", article: null, example: { de: "Ich esse einen Apfel.", en: "I'm eating an apple." } },
      { de: "trinken", en: "to drink", article: null, example: { de: "Wir trinken Kaffee.", en: "We drink coffee." } },
      { de: "sprechen", en: "to speak", article: null, example: { de: "Ich spreche Deutsch.", en: "I speak German." } },
      { de: "lernen", en: "to learn", article: null, example: { de: "Wir lernen zusammen.", en: "We learn together." } },
      { de: "arbeiten", en: "to work", article: null, example: { de: "Sie arbeitet im Büro.", en: "She works in the office." } },
      { de: "wohnen", en: "to live / reside", article: null, example: { de: "Ich wohne in München.", en: "I live in Munich." } },
    ],
  },
  {
    id: "adjectives",
    name: "Useful Adjectives",
    icon: "✨",
    words: [
      { de: "groß", en: "big / tall", article: null, example: { de: "Das Haus ist groß.", en: "The house is big." } },
      { de: "klein", en: "small", article: null, example: { de: "Die Katze ist klein.", en: "The cat is small." } },
      { de: "gut", en: "good", article: null, example: { de: "Das Essen ist gut.", en: "The food is good." } },
      { de: "schlecht", en: "bad", article: null, example: { de: "Das Wetter ist schlecht.", en: "The weather is bad." } },
      { de: "schön", en: "beautiful / nice", article: null, example: { de: "Der Tag ist schön.", en: "The day is beautiful." } },
      { de: "neu", en: "new", article: null, example: { de: "Ich habe ein neues Handy.", en: "I have a new phone." } },
      { de: "alt", en: "old", article: null, example: { de: "Das Buch ist alt.", en: "The book is old." } },
      { de: "schnell", en: "fast", article: null, example: { de: "Der Zug ist schnell.", en: "The train is fast." } },
      { de: "langsam", en: "slow", article: null, example: { de: "Die Schnecke ist langsam.", en: "The snail is slow." } },
      { de: "teuer", en: "expensive", article: null, example: { de: "Das Auto ist teuer.", en: "The car is expensive." } },
      { de: "billig", en: "cheap", article: null, example: { de: "Das Brot ist billig.", en: "The bread is cheap." } },
      { de: "wichtig", en: "important", article: null, example: { de: "Das ist sehr wichtig.", en: "That is very important." } },
    ],
  },
];

// Common phrases for the Phrases section.
const PHRASES = [
  { de: "Wie heißt du?", en: "What's your name?" },
  { de: "Ich heiße ...", en: "My name is ..." },
  { de: "Wie geht es dir?", en: "How are you?" },
  { de: "Mir geht es gut, danke.", en: "I'm doing well, thank you." },
  { de: "Woher kommst du?", en: "Where are you from?" },
  { de: "Ich komme aus ...", en: "I come from ..." },
  { de: "Ich verstehe nicht.", en: "I don't understand." },
  { de: "Können Sie das wiederholen?", en: "Can you repeat that?" },
  { de: "Sprechen Sie Englisch?", en: "Do you speak English?" },
  { de: "Ich spreche ein bisschen Deutsch.", en: "I speak a little German." },
  { de: "Wo ist die Toilette?", en: "Where is the toilet?" },
  { de: "Was kostet das?", en: "How much does that cost?" },
  { de: "Ich hätte gern ...", en: "I would like ..." },
  { de: "Die Rechnung, bitte.", en: "The bill, please." },
  { de: "Entschuldigung, wo ist der Bahnhof?", en: "Excuse me, where is the train station?" },
  { de: "Ich brauche Hilfe.", en: "I need help." },
  { de: "Alles klar!", en: "All good! / Got it!" },
  { de: "Kein Problem.", en: "No problem." },
  { de: "Bis später!", en: "See you later!" },
  { de: "Schönen Tag noch!", en: "Have a nice day!" },
];

// Numbers 0–20 plus tens for the number trainer.
const NUMBERS = [
  { n: 0, de: "null" }, { n: 1, de: "eins" }, { n: 2, de: "zwei" },
  { n: 3, de: "drei" }, { n: 4, de: "vier" }, { n: 5, de: "fünf" },
  { n: 6, de: "sechs" }, { n: 7, de: "sieben" }, { n: 8, de: "acht" },
  { n: 9, de: "neun" }, { n: 10, de: "zehn" }, { n: 11, de: "elf" },
  { n: 12, de: "zwölf" }, { n: 13, de: "dreizehn" }, { n: 14, de: "vierzehn" },
  { n: 15, de: "fünfzehn" }, { n: 16, de: "sechzehn" }, { n: 17, de: "siebzehn" },
  { n: 18, de: "achtzehn" }, { n: 19, de: "neunzehn" }, { n: 20, de: "zwanzig" },
  { n: 30, de: "dreißig" }, { n: 40, de: "vierzig" }, { n: 50, de: "fünfzig" },
  { n: 60, de: "sechzig" }, { n: 70, de: "siebzig" }, { n: 80, de: "achtzig" },
  { n: 90, de: "neunzig" }, { n: 100, de: "hundert" },
];

// Verb conjugation tables (present tense) for the grammar trainer.
const CONJUGATIONS = [
  {
    infinitive: "sein", en: "to be", irregular: true,
    forms: { ich: "bin", du: "bist", "er/sie/es": "ist", wir: "sind", ihr: "seid", "sie/Sie": "sind" },
  },
  {
    infinitive: "haben", en: "to have", irregular: true,
    forms: { ich: "habe", du: "hast", "er/sie/es": "hat", wir: "haben", ihr: "habt", "sie/Sie": "haben" },
  },
  {
    infinitive: "gehen", en: "to go", irregular: false,
    forms: { ich: "gehe", du: "gehst", "er/sie/es": "geht", wir: "gehen", ihr: "geht", "sie/Sie": "gehen" },
  },
  {
    infinitive: "machen", en: "to make/do", irregular: false,
    forms: { ich: "mache", du: "machst", "er/sie/es": "macht", wir: "machen", ihr: "macht", "sie/Sie": "machen" },
  },
  {
    infinitive: "sprechen", en: "to speak", irregular: true,
    forms: { ich: "spreche", du: "sprichst", "er/sie/es": "spricht", wir: "sprechen", ihr: "sprecht", "sie/Sie": "sprechen" },
  },
  {
    infinitive: "essen", en: "to eat", irregular: true,
    forms: { ich: "esse", du: "isst", "er/sie/es": "isst", wir: "essen", ihr: "esst", "sie/Sie": "essen" },
  },
  {
    infinitive: "fahren", en: "to drive/go", irregular: true,
    forms: { ich: "fahre", du: "fährst", "er/sie/es": "fährt", wir: "fahren", ihr: "fahrt", "sie/Sie": "fahren" },
  },
  {
    infinitive: "lernen", en: "to learn", irregular: false,
    forms: { ich: "lerne", du: "lernst", "er/sie/es": "lernt", wir: "lernen", ihr: "lernt", "sie/Sie": "lernen" },
  },
];

const PRONOUNS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

// Flatten helper: every vocab word with its deck id, used for global quizzes.
function allWords() {
  const out = [];
  DECKS.forEach((d) => d.words.forEach((w) => out.push({ ...w, deck: d.id })));
  return out;
}
