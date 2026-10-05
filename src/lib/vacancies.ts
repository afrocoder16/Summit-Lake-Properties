import { parseCsv, toVacancies, type Vacancy } from './csv';

const TIMEOUT_MS = 8000;

export async function loadVacancies(url: string): Promise<Vacancy[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!res.ok) throw new Error(`Vacancy sheet returned ${res.status}`);
    return toVacancies(parseCsv(await res.text()));
  } finally {
    clearTimeout(timer);
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string) {
  const node = document.createElement(tag);
  node.className = cls;
  if (text) node.textContent = text;
  return node;
}

const plural = (v: string, word: string) => (/^\d+(\.\d+)?$/.test(v) ? `${v} ${word}` : v);
const money = (v: string) => (/^\d+(\.\d+)?$/.test(v.replace(/[$,]/g, '')) ? `$${Number(v.replace(/[$,]/g, '')).toLocaleString('en-US')} per month` : v);

/** Builds a card with textContent only, so sheet text can never become markup. */
export function vacancyCard(v: Vacancy): HTMLElement {
  const card = el('li', 'card flex flex-col p-7');
  card.append(el('h3', 'text-2xl', v.unit ? `Unit ${v.unit}` : 'Available home'));

  const facts = el('ul', 'mt-3 flex flex-wrap gap-2');
  for (const t of [plural(v.bedrooms, 'bed'), plural(v.bathrooms, 'bath')]) {
    if (t) facts.append(el('li', 'rounded-full bg-mist px-3 py-1 text-sm font-semibold text-lake', t));
  }
  if (facts.childElementCount) card.append(facts);

  if (v.rent) card.append(el('p', 'mt-4 font-display text-3xl font-bold text-lake', money(v.rent)));
  if (v.available) card.append(el('p', 'mt-1 text-sm font-semibold text-muted', `Available ${v.available}`));
  if (v.details) card.append(el('p', 'mt-4', v.details));
  return card;
}
