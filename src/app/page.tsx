"use client";
import { useState, useEffect } from "react";
import Sugar from "sugar";
import "sugar/locales";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [locale, setLocale] = useState<string>("en");
  const [dateInput, setDateInput] = useState<string>("");
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [error, setError] = useState<string>("");

  const localeCodes = Sugar.Date.getAllLocaleCodes();

  useEffect(() => {
    Sugar.Date.setLocale(locale);
    if (dateInput) {
      parseAndFormat(dateInput);
    } else {
      setError("");
      setParsedDate(null);
      setFormattedDate("");
    }
  }, [dateInput, locale]);

  const parseAndFormat = (input: string) => {
    if (!input) {
      setParsedDate(null);
      setFormattedDate("");
      setError("");
      return;
    }
    const d = Sugar.Date.create(input);
    if (isNaN(d.getTime())) {
      setParsedDate(null);
      setFormattedDate("");
      setError("Invalid date or unable to parse");
    } else {
      setError("");
      setParsedDate(d);
      setFormattedDate(Sugar.Date.format(d, "{long}"));
    }
  };

  const exampleTags = [
    "now",
    "today",
    "tomorrow",
    "two weeks ago",
    "next week",
    "last year",
    "in 30 minutes",
    "the first day of 2013",
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen p-4 bg-slate-50"
      )}
    >
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Natural Date Parser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="locale">Select Locale</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose locale" />
              </SelectTrigger>
              <SelectContent>
                {localeCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div className="flex flex-wrap gap-2">
            {exampleTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                onClick={() => {
                  setDateInput(tag);
                  parseAndFormat(tag);
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {parsedDate && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Parsed Date Object</Label>
                <pre className="p-2 bg-gray-100 rounded">
                  {JSON.stringify(parsedDate, null, 2)}
                </pre>
              </div>
              <div className="space-y-1">
                <Label>Formatted Date</Label>
                <pre className="p-2 bg-gray-100 rounded">{formattedDate}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
