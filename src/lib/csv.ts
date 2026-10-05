/** Small CSV parser that handles quoted fields, escaped quotes and CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export interface Vacancy {
  unit: string;
  bedrooms: string;
  bathrooms: string;
  rent: string;
  available: string;
  details: string;
}

/**
 * Only these columns are ever read. Any other column in the sheet is ignored,
 * so extra data can never reach the page.
 * A row is shown when the optional "status" column is empty or says available.
 */
export const VACANCY_COLUMNS = ['unit', 'bedrooms', 'bathrooms', 'rent', 'available', 'details', 'status'] as const;
const MAX_ROWS = 50;

export function toVacancies(rows: string[][]): Vacancy[] {
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = Object.fromEntries(VACANCY_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<
    (typeof VACANCY_COLUMNS)[number],
    number
  >;
  const get = (r: string[], c: (typeof VACANCY_COLUMNS)[number], max: number) =>
    idx[c] >= 0 ? (r[idx[c]] ?? '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '';

  return rows
    .slice(1)
    .map((r) => ({
      unit: get(r, 'unit', 40),
      bedrooms: get(r, 'bedrooms', 20),
      bathrooms: get(r, 'bathrooms', 20),
      rent: get(r, 'rent', 30),
      available: get(r, 'available', 40),
      details: get(r, 'details', 400),
      status: get(r, 'status', 20).toLowerCase(),
    }))
    .filter((v) => v.status === '' || v.status === 'available' || v.status === 'vacant')
    .filter((v) => v.unit || v.bedrooms || v.rent || v.details)
    .slice(0, MAX_ROWS)
    .map(({ status: _s, ...rest }) => rest);
}
