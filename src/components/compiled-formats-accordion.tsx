"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface Props {
  locale: string;
  compiledFormats: string;
}

export function CompiledFormatsAccordion({ locale, compiledFormats }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledFormats).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!compiledFormats) return null;

  return (
    <Accordion
      type="single"
      collapsible
      className="border rounded-lg bg-neutral-50 dark:bg-neutral-900"
    >
      <AccordionItem value="compiled-formats">
        <AccordionTrigger className="px-4">
          Compiled Formats ({locale})
        </AccordionTrigger>
        <AccordionContent className="relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <pre className="max-h-64 overflow-auto text-xs leading-relaxed font-mono bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md whitespace-pre-wrap">
            {compiledFormats}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
