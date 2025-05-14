"use client";
import Sugar from "sugar";
import { Label } from "@/components/ui/label";

interface Props {
  parsedDate: Date | null;
  formattedDate: string;
}

export function ResultsDisplay({ parsedDate, formattedDate }: Props) {
  if (!parsedDate) return null;
  return (
    <div className="space-y-4">
      {/* Parsed Date */}
      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
        <Label className="flex items-center gap-1 font-semibold text-blue-600">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
          </svg>
          Parsed Date
        </Label>
        <pre className="mt-2 text-sm font-mono whitespace-pre-wrap">
          {parsedDate.toString()}
        </pre>
      </div>

      {/* Relative & Long */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 bg-emerald-50 dark:bg-emerald-950/30">
          <Label className="flex items-center gap-1 font-semibold text-emerald-600">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8Zm-.5-13h1v6l5.25 3.15-.5.85L11.5 13V7Z" />
            </svg>
            Relative Format
          </Label>
          <p className="mt-2 text-sm font-mono">
            {Sugar.Date.relative(parsedDate)}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-indigo-50 dark:bg-indigo-950/30">
          <Label className="flex items-center gap-1 font-semibold text-indigo-600">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
            </svg>
            Long Format
          </Label>
          <p className="mt-2 text-sm font-mono">{formattedDate}</p>
        </div>
      </div>

      {/* Custom */}
      <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30 space-y-2">
        <Label className="flex items-center gap-1 font-semibold text-amber-600">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c5.421 0 10-4.579 10-10S17.421 2 12 2 2 6.579 2 12s4.579 10 10 10zm-1-17h2v7h-2V5zm0 9h2v2h-2v-2z" />
          </svg>
          Custom Formats
        </Label>
        <div className="grid md:grid-cols-2 text-sm font-mono gap-2">
          <div>
            <span className="font-semibold">Short Date:</span>
            <div>{Sugar.Date.format(parsedDate, "{MM}/{dd}/{yyyy}")}</div>
          </div>
          <div>
            <span className="font-semibold">Full Date:</span>
            <div>
              {Sugar.Date.format(
                parsedDate,
                "{Weekday}, {Month} {d}, {yyyy} {time}"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
