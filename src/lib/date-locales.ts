import Sugar from "sugar";

/**
 * Quick Damerau-Levenshtein good enough for distance ≤ 1.
 * We bail out early if the strings are clearly too different.
 */
function dlDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > 1) return 2;
  // full DP for short strings
  const v0 = new Array(b.length + 1).fill(0);
  const v1 = new Array(b.length + 1).fill(0);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(
        v1[j] + 1, // insertion
        v0[j + 1] + 1, // deletion
        v0[j] + cost // substitution
      );
    }
    v0.splice(0, v0.length, ...v1);
  }
  return v1[b.length];
}

const getValueFromLocale = <T>(loc: sugarjs.Locale, key: string): T | null => {
  if (key in loc) {
    // @ts-expect-error ignoring because we know those keys exist
    return loc[key];
  }

  return null;
};

/**
 * Returns an array of all *words* that exist in the locale:
 *   • arrays   → 'months', 'weekdays', 'units', 'numerals' …
 *   • maps     → 'monthMap', 'weekdayMap', 'unitMap', 'dayMap' …
 */
function collectAllLocaleWords(loc: sugarjs.Locale) {
  const words = new Set<string>();

  // 1) simple arrays
  ["months", "weekdays", "units", "numerals", "articles", "timeMarkers"]
    .filter((k) => Array.isArray(getValueFromLocale(loc, k)))
    .forEach((k) =>
      getValueFromLocale<string[]>(loc, k)?.forEach(
        (w) => w && words.add(w.toLowerCase())
      )
    );

  // 2) all the *Map objects
  Object.keys(loc).forEach((key) => {
    if (key.endsWith("Map")) {
      Object.keys(
        getValueFromLocale<Record<string, string>>(loc, key) ?? {}
      ).forEach((w) => words.add(w.toLowerCase()));
    }
  });

  // 3) parsingTokens.* values (they are regex strings, split by "|")
  if (loc.parsingTokens) {
    Object.values(loc.parsingTokens).forEach((reStr) =>
      reStr
        .split("|")
        .forEach((w) => words.add(w.toLowerCase().replace(/\\d\+?\??/g, "")))
    );
  }

  // clean-up empty tokens
  return [...words].filter(Boolean);
}

const prefixIndexes = new Map<string, Map<string, string>>();

export function augmentLocaleWithPrefixes(localeName = "en", minPrefixLen = 2) {
  if (prefixIndexes.has(localeName)) {
    return prefixIndexes.get(localeName);
  }

  const loc = Sugar.Date.getLocale(localeName);

  if (!loc) throw new Error(`Sugar locale "${localeName}" not found!`);

  const index = new Map(); // prefix -> canonical full word

  // Canonical form rule: longest word wins (helps "to" → "tomorrow")
  function register(word: string, canonical: string) {
    const entry = index.get(word);

    if (!entry || canonical.length > entry.length) {
      index.set(word, canonical);
    }
  }

  /* Collect every word Sugar knows */
  const vocabulary = collectAllLocaleWords(loc);

  /* Build prefix table */
  vocabulary.forEach((full) => {
    // store the perfect word itself
    register(full, full);

    // generate prefixes
    for (let i = minPrefixLen; i < full.length; i++) {
      const prefix = full.slice(0, i);
      register(prefix, full);
    }
  });

  /* Manual synonyms / ambiguous overrides here */
  const manual = {
    t: "today",
    to: "tomorrow",
    tod: "today",
    ton: "tonight",
    nxt: "next",
    prev: "last",
    bday: "birthday",
    wk: "week",
    wks: "weeks",
    yr: "year",
    yrs: "years",
  };

  Object.entries(manual).forEach(([k, v]) => index.set(k, v));

  prefixIndexes.set(localeName, index);

  return index;
}

export function normalizeDatePhrase(raw: string, localeName = "en") {
  if (!raw) return raw;
  const input = raw.toLowerCase().trim();
  const index = augmentLocaleWithPrefixes(localeName);
  const loc = Sugar.Date.getLocale(localeName);

  if (!index || !loc) {
    throw new Error(`Locale "${localeName}" not found!`);
  }

  // Try to parse as is first
  const testParse = Sugar.Date.create(input);
  if (testParse && !isNaN(testParse.getTime())) {
    return input; // Already valid, no need to normalize
  }

  // Split input into tokens
  const tokens = input.split(/\s+/);

  // Try to handle numeric patterns using locale info
  // Check if first token is numeric and second might be a month
  if (tokens.length >= 2 && /^\d+$/.test(tokens[0])) {
    const num = tokens[0];
    const possibleMonth = tokens[1];

    // Check if second token might be a month using the locale's monthMap
    const monthMap = getValueFromLocale<Record<string, string>>(
      loc,
      "monthMap"
    );

    if (
      monthMap &&
      (possibleMonth in monthMap ||
        Object.keys(monthMap).some((m) => m.startsWith(possibleMonth)))
    ) {
      // Format input to include "of" connector if the locale has articles
      const articles = getValueFromLocale<string[]>(loc, "articles") || [];
      if (articles.length > 0) {
        // Use the first article as a connector (equivalent to English "of")
        return `${num} ${articles[0]} ${possibleMonth}`;
      }
    }
  }

  /* ① direct lookup + prefixes */
  if (index.has(input)) {
    return index.get(input);
  }

  /* ② sentence-level replacement (split by spaces) */
  const words = input.split(/\s+/).map((w) => index.get(w) || w);
  let rebuilt = words.join(" ");

  /* ③ tiny typo-fix (distance == 1) per word */
  rebuilt = rebuilt
    .split(/\s+/)
    .map((word) => {
      if (index.has(word)) return word; // already canonical
      const near = [...index.keys()].find((w) => dlDistance(word, w) === 1);
      return near ? index.get(near) : word;
    })
    .join(" ");

  return rebuilt;
}

export function parseUserDate(
  raw: string,
  opts: { locale?: string; fromUTC?: boolean } = {}
): Date | null {
  const { locale = "en", fromUTC = false } = opts;
  const canonical = normalizeDatePhrase(raw, locale);

  // Call Sugar
  const date = Sugar.Date.create(canonical, { fromUTC });
  return date && !isNaN(date.getTime()) ? date : null;
}
