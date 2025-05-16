"use client";
import { useState, useEffect, useCallback } from "react";
import Sugar from "sugar";
import "sugar/locales";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleSelector } from "@/components/locale-selector";
import { QuickSelect } from "@/components/quick-select";
import { ErrorDisplay } from "@/components/error-display";
import { ResultsDisplay } from "@/components/results-display";
import { CompiledFormatsAccordion } from "@/components/compiled-formats-accordion";
import { augmentLocaleWithPrefixes, parseUserDate } from "@/lib/date-locales";

export default function Home() {
  const [locale, setLocale] = useState<string>("en");
  const [dateInput, setDateInput] = useState<string>("");
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [compiledFormats, setCompiledFormats] = useState<string>("");

  useEffect(() => {
    augmentLocaleWithPrefixes(locale);
  }, [locale]);

  useEffect(() => {
    // Update compiled formats whenever locale changes
    const localeInfo = Sugar.Date.getLocale(locale);
    if (localeInfo && localeInfo.compiledFormats) {
      console.log("LOCALE INFO", localeInfo);
      const replacer = (_key: string, value: unknown) => {
        if (value instanceof RegExp) {
          return value.toString();
        }
        return value;
      };
      setCompiledFormats(
        JSON.stringify(localeInfo.compiledFormats, replacer, 2)
      );
    } else {
      setCompiledFormats("");
    }
  }, [locale]);

  const parseAndFormat = useCallback(
    (input: string) => {
      if (!input) {
        setParsedDate(null);
        setFormattedDate("");
        setError("Unable to parse expression");
        setErrorDetails(`Expression: ${input}`);
        return;
      }

      const d = parseUserDate(input, { locale });

      if (!d) {
        setParsedDate(null);
        setFormattedDate("");
        setError("Unable to parse expression");
        setErrorDetails(`Expression: ${input}`);
      } else {
        setError("");
        setErrorDetails("");
        setParsedDate(d);
        setFormattedDate(Sugar.Date.format(d, "{long}"));
      }
    },
    [locale]
  );

  useEffect(() => {
    Sugar.Date.setLocale(locale);
    if (dateInput) {
      parseAndFormat(dateInput);
    } else {
      setError("");
      setParsedDate(null);
      setFormattedDate("");
    }
  }, [dateInput, locale, parseAndFormat]);

  const quickSelectMap: Record<string, string[]> = {
    en: ["now", "today", "tomorrow", "next week", "next month", "in 3 days"],
    de: [
      "jetzt",
      "heute",
      "morgen",
      "nächste woche",
      "nächsten monat",
      "in 3 tagen",
    ],
    fr: [
      "maintenant",
      "aujourd'hui",
      "demain",
      "la semaine prochaine",
      "le mois prochain",
      "dans 3 jours",
    ],
    es: [
      "ahora",
      "hoy",
      "mañana",
      "la próxima semana",
      "el próximo mes",
      "en 3 días",
    ],
    it: [
      "adesso",
      "oggi",
      "domani",
      "la prossima settimana",
      "il prossimo mese",
      "tra 3 giorni",
    ],
    ja: ["今", "今日", "明日", "来週", "来月", "3日後"],
  };

  const exampleTags = quickSelectMap[locale] ?? quickSelectMap["en"];

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 py-10 bg-neutral-100 dark:bg-neutral-950">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <span className="text-foreground/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="text-blue-600"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm5.93 6h-3.95a15.01 15.01 0 0 0-1.49-3.95A8.03 8.03 0 0 1 17.93 8Zm-5.93-4.9c.94 1.19 1.71 2.51 2.26 3.9H9.74c.55-1.39 1.32-2.71 2.26-3.9ZM8.51 4.05A15.01 15.01 0 0 0 7.02 8H3.07a8.03 8.03 0 0 1 5.44-3.95ZM3.05 10h3.93a17.7 17.7 0 0 0 0 4H3.05a7.96 7.96 0 0 1 0-4Zm.02 6h3.95a15.01 15.01 0 0 0 1.49 3.95A8.03 8.03 0 0 1 3.07 16Zm5.92 4.9A15.01 15.01 0 0 0 10.48 17h3.04c-.55 1.39-1.32 2.71-2.26 3.9Zm5.57-1.95A15.01 15.01 0 0 0 16.98 16h3.95a8.03 8.03 0 0 1-5.44 3.95ZM17.02 14a17.7 17.7 0 0 0 0-4h3.93a7.96 7.96 0 0 1 0 4h-3.93Z" />
            </svg>
          </span>
          <span>
            <span className="text-blue-600">Chrono</span>Lingua
          </span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Parse and format dates in natural language across multiple locales
        </p>
      </div>

      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-sm border">
        <CardHeader>
          <CardTitle>Natural Date Parser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Locale Selection */}
          <LocaleSelector
            value={locale}
            onChange={(code) => {
              setLocale(code);
              setDateInput("");
              setParsedDate(null);
              setFormattedDate("");
              setError("");
              setErrorDetails("");
            }}
            options={[
              { code: "en", label: "English", flag: "🇺🇸" },
              { code: "de", label: "Deutsch", flag: "🇩🇪" },
              { code: "fr", label: "Français", flag: "🇫🇷" },
              { code: "es", label: "Español", flag: "🇪🇸" },
              { code: "it", label: "Italiano", flag: "🇮🇹" },
              { code: "ja", label: "日本語", flag: "🇯🇵" },
            ]}
          />
          {/* Date Expression Input */}
          <div className="space-y-2">
            <Label htmlFor="dateInput">Date Expression</Label>
            <Input
              id="dateInput"
              placeholder="e.g., two weeks ago"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                parseAndFormat(e.target.value);
              }}
            />
          </div>
          {/* Quick Select */}
          <QuickSelect
            tags={exampleTags}
            onSelect={(t) => {
              setDateInput(t);
              parseAndFormat(t);
            }}
          />
          <ErrorDisplay message={error} details={errorDetails} />

          <ResultsDisplay
            parsedDate={parsedDate}
            formattedDate={formattedDate}
          />

          <CompiledFormatsAccordion
            locale={locale}
            compiledFormats={compiledFormats}
          />
        </CardContent>
      </Card>
    </div>
  );
}
