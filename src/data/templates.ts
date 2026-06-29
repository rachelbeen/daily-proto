import type { Constraint } from "../types.js";

export const constraints: Constraint[] = [
  { id: "timebox", text: "Ship a clickable prototype in 2 hours." },
  { id: "mobile", text: "Mobile-first." },
  { id: "no-backend", text: "No backend: fetch straight from the browser." },
  { id: "one-file", text: "One file. One link. Done." },
  { id: "accessibility", text: "One thoughtful accessibility win. Call it out." },
  { id: "loading", text: "Loading and errors deserve the same love as the happy path." },
  { id: "real-data", text: "Every number on screen comes from the API." },
  { id: "one-chart", text: "One chart max. Let type and layout do the work." },
];

export const twists: string[] = [
  "Add a plain-language \"what am I looking at?\" moment.",
  "Highlight a field nobody else would pick.",
  "End with: what if we shipped this Monday?",
  "Two colors plus neutrals. That's it.",
  "Something useful on screen in under 3 seconds.",
  "Design for someone who's never heard of this API.",
  "Let people save one thing from the results.",
  "Link to the exact endpoint you called.",
  "Make the empty state as good as the results.",
  "One small power-user shortcut.",
];
