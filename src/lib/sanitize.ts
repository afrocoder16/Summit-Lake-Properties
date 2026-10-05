/** Input cleaning shared by the maintenance form. Runs in the browser. */

// Invisible and direction-changing characters that can hide content.
const INVISIBLE = /[​-‏‪-‮⁠-⁩﻿]/g;
// Control characters except tab and newline.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function clean(value: unknown, max: number): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(CONTROL, '')
    .replace(INVISIBLE, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Single line variant for short fields. */
export function cleanLine(value: unknown, max: number): string {
  return clean(value, max).replace(/\s+/g, ' ');
}
