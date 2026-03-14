import words from "./words.txt?raw"

export const DICTIONARY = words
  .split("\n")
  .map(w => w.trim().toUpperCase())
  .filter(w => w.length >= 3)