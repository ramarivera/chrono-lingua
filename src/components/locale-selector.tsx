"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * LocaleSelector – Renders a group of pill buttons allowing the user to pick a locale.
 *
 * Props:
 *  value: currently selected locale code (e.g. "en")
 *  onChange: callback invoked with the new locale code when a button is clicked.
 */
export interface LocaleOption {
  code: string;
  label: string;
  flag: string;
}

interface Props {
  value: string;
  onChange: (code: string) => void;
  options: LocaleOption[];
}

export function LocaleSelector({ value, onChange, options }: Props) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-semibold">
        <svg
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="text-blue-600"
        >
          <path d="M12 2c2.21 0 4-.89 4-2s-1.79-2-4-2-4 .89-4 2 1.79 2 4 2zm0 2c-2.21 0-4 .89-4 2v2h8V6c0-1.11-1.79-2-4-2zm-4 4V8H4v12h16V8h-4v2H8zm2 4h4v2h-4v-2z" />
        </svg>
        Select Locale
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((loc) => (
          <Button
            key={loc.code}
            size="sm"
            variant={value === loc.code ? "default" : "outline"}
            onClick={() => onChange(loc.code)}
            className="rounded-full px-3"
          >
            <span className="mr-1">{loc.flag}</span>
            {loc.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
