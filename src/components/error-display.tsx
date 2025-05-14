"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

/**
 * ErrorDisplay – shows an error message with optional collapsible details.
 */
interface Props {
  message: string;
  details?: string;
}

export function ErrorDisplay({ message, details }: Props) {
  if (!message) return null;
  return (
    <div className="space-y-2">
      <p className="text-red-600 font-medium">{message}</p>
      {details && (
        <Accordion type="single" collapsible>
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm text-blue-600 underline">
              Show Details
            </AccordionTrigger>
            <AccordionContent>
              <pre className="p-2 bg-gray-100 rounded text-xs whitespace-pre-wrap">
                {details}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
