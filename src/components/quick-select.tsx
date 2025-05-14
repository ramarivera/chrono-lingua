"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * QuickSelect – Displays preset expressions as buttons.
 *
 * Props:
 *  tags: array of strings to display.
 *  onSelect(tag): callback when a tag is clicked.
 */
interface Props {
  tags: string[];
  onSelect: (tag: string) => void;
}

export function QuickSelect({ tags, onSelect }: Props) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-1 text-sm font-semibold">
        <svg
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="text-blue-600"
        >
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zM3 9h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z" />
        </svg>
        Quick Select
      </Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Button
            key={t}
            variant="outline"
            size="sm"
            onClick={() => onSelect(t)}
            className="rounded-full px-3"
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}
