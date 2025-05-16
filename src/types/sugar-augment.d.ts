/*
  Augment Sugar.js type definitions to include the `compiledFormats` array that
  is exposed on locale objects returned by `Sugar.Date.getLocale()`.

  Placing this file under `src/types` automatically makes it part of the
  TypeScript project (tsconfig includes .d.ts) so editors and the compiler
  will pick it up without further configuration.
*/

declare namespace sugarjs {
  interface CompiledFormat {
    /**
     * The compiled regular expression that matches the date pattern.  Sugar.js
     * stores this under `reg` (may be an empty object when populated at
     * runtime).
     */
    reg: RegExp;

    /**
     * The token conversion list for the format, e.g. `["hour", "minute"]`.
     */
    to: string[];
  }

  interface Locale {
    /**
     * Internal array Sugar.js builds after compiling the locale's date formats.
     * This property isn't part of the published type definitions but exists at
     * runtime, so we add it here to avoid TypeScript errors when inspecting it.
     */
    compiledFormats: CompiledFormat[];

    parsingTokens: Record<string, string>;
  }
}
