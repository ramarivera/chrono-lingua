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

/** Remove accents/diacritics for simplified matching */
function stripAccents(str: string) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

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
    const stripped = stripAccents(word);
    if (stripped !== word) {
      const existing = index.get(stripped);
      if (!existing || canonical.length > existing.length) {
        index.set(stripped, canonical);
      }
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
  const manualByLocale: Record<string, Record<string, string>> = {
    en: {
      t: "today",
      to: "tomorrow",
      tod: "today",
      ton: "tonight",
      tmr: "tomorrow",
      tmrw: "tomorrow",
      tdy: "today",
      tmo: "tomorrow",
      tonite: "tonight",
      yday: "yesterday",
      wknd: "weekend",
      nxt: "next",
      prev: "last",
      bday: "birthday",
      wk: "week",
      wks: "weeks",
      yr: "year",
      yrs: "years",
    },
    es: {
      manana: "mañana",
      man: "mañana",
      prox: "próximo",
      "prox.": "próximo",
      sig: "próximo",
    },
    fr: {
      ajd: "aujourd'hui",
      auj: "aujourd'hui",
      dem: "demain",
    },
    it: {
      dom: "domani",
      ogg: "oggi",
      prox: "prossimo",
    },
    de: {
      heut: "heute",
      uebermorgen: "übermorgen",
    },
    ja: {
      kyou: "今日",
      kyo: "今日",
      ashita: "明日",
      kinou: "昨日",
      ototoi: "一昨日",
      asatte: "明後日",
      raishuu: "来週",
      raigetsu: "来月",
    },
  };

  const manual = manualByLocale[localeName] || {};

  Object.entries(manual).forEach(([k, v]) => index.set(k, v));

  prefixIndexes.set(localeName, index);

  return index;
}

export function normalizeDatePhrase(raw: string, localeName = "en") {
  if (!raw) return raw;
  let input = raw.toLowerCase().trim();
  // Normalize 24h time formats like "15h30" → "15:30" and "15h" → "15:00"
  input = input.replace(/\b(\d{1,2})h(\d{2})?\b/g, (_m, h, m) => {
    return `${h}:${m ?? "00"}`;
  });
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
  const keys = [...index.keys()];
  rebuilt = rebuilt
    .split(/\s+/)
    .map((word) => {
      if (index.has(word)) return word; // already canonical
      let best: string | null = null;
      let bestDist = Infinity;
      for (const k of keys) {
        const d = dlDistance(word, k);
        if (d < bestDist) {
          best = k;
          bestDist = d;
        }
        if (bestDist === 0) break;
      }
      if (best && (bestDist === 1 || (word.length > 4 && bestDist === 2))) {
        return index.get(best) as string;
      }
      return word;
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
