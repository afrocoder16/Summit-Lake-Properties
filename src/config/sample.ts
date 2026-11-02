/**
 * Sample content for the pitch. Everything here is invented to show how the finished
 * site will look. Nothing here is a real unit, price, photo of the building or payment option.
 * To remove: delete the sample sections in pages/tenants.astro and pages/vacancies.astro,
 * and the /pay page. Photo credits are listed in TECHNICAL.md.
 */
import type { Vacancy } from '../lib/csv';

export interface SamplePayMethod {
  icon: 'mail' | 'bank' | 'card' | 'repeat';
  title: string;
  text: string;
  note: string;
  live: boolean;
  recommended?: boolean;
}

export const payMethods: SamplePayMethod[] = [
  {
    icon: 'mail',
    title: 'Mail a check',
    text: 'Send a check or money order to the PO Box below. Works today.',
    note: 'No fee',
    live: true,
  },
  {
    icon: 'bank',
    title: 'Bank transfer',
    text: 'Pay straight from your checking account. Fast, secure and the lowest cost option.',
    note: 'Little or no fee',
    live: false,
    recommended: true,
  },
  {
    icon: 'card',
    title: 'Debit or credit card',
    text: 'Pay by card when you need to. A small card fee may apply.',
    note: 'Card fee may apply',
    live: false,
  },
  {
    icon: 'repeat',
    title: 'Autopay',
    text: 'Set it once and rent is paid on time every month, with an emailed receipt.',
    note: 'Set up once',
    live: false,
  },
];

/* ---------- Pay rent flow (/pay) ---------- */

export interface SamplePayUnit {
  id: string;
  label: string;
  /** Monthly rent in dollars. */
  rent: number;
}

export const payUnits: SamplePayUnit[] = [
  { id: '1c', label: 'Sample 1C', rent: 925 },
  { id: '2a', label: 'Sample 2A', rent: 700 },
  { id: '3b', label: 'Sample 3B', rent: 850 },
  { id: '4d', label: 'Sample 4D', rent: 775 },
];

export const payDueText = 'December 1';

/** Estimated card fee shown to the tenant: 2.9% plus 30 cents. Bank transfer has no tenant fee. */
export const cardFee = { percent: 0.029, flat: 0.3 };

export const payHistory = [
  { date: 'November 1', amount: 700, method: 'Bank transfer', status: 'Paid' },
  { date: 'October 1', amount: 700, method: 'Bank transfer', status: 'Paid' },
  { date: 'September 1', amount: 700, method: 'Bank transfer', status: 'Paid' },
];

/* ---------- Vacancies ---------- */

export interface SamplePhoto {
  /** Path under public/, without the deploy base. Wrap with href() when rendering. */
  src: string;
  alt: string;
}

export interface SampleVacancy extends Vacancy {
  id: string;
  beds: number;
  photos: SamplePhoto[];
}

export const sampleVacancies: SampleVacancy[] = [
  {
    id: '2a',
    unit: 'Sample 2A',
    beds: 1,
    bedrooms: '1',
    bathrooms: '1',
    rent: '700',
    available: 'December 1',
    details: 'Bright upstairs apartment with a full kitchen and new flooring. Heat included.',
    photos: [
      { src: '/sample/2a-1.jpg', alt: 'Open living room with a gray sectional sofa and a kitchen beyond' },
      { src: '/sample/2a-2.jpg', alt: 'White brick kitchen with wood counters and a gas range' },
      { src: '/sample/2a-3.jpg', alt: 'Bedroom with a made bed, window and hardwood floors' },
      { src: '/sample/2a-4.jpg', alt: 'Bathroom with a soaking tub and a glass shower' },
    ],
  },
  {
    id: '3b',
    unit: 'Sample 3B',
    beds: 2,
    bedrooms: '2',
    bathrooms: '1',
    rent: '850',
    available: 'Now',
    details: 'Two bedroom with plenty of closet space and a view of the lake. On site laundry.',
    photos: [
      { src: '/sample/3b-1.jpg', alt: 'Kitchen and dining area with large windows and wood floors' },
      { src: '/sample/3b-2.jpg', alt: 'Living room with a blue sofa and a wide window view' },
      { src: '/sample/3b-3.jpg', alt: 'Bedroom with a large window and a bed with white linens' },
      { src: '/sample/3b-4.jpg', alt: 'Second bedroom with a bed, bench and bedside tables' },
    ],
  },
  {
    id: '1c',
    unit: 'Sample 1C',
    beds: 2,
    bedrooms: '2',
    bathrooms: '1.5',
    rent: '925',
    available: 'January 1',
    details: 'Ground floor, easy entry, extra storage. Off street parking.',
    photos: [
      { src: '/sample/1c-1.jpg', alt: 'Living and dining area with sliding glass doors to the outside' },
      { src: '/sample/1c-2.jpg', alt: 'Kitchen with white cabinets and a center island' },
      { src: '/sample/1c-3.jpg', alt: 'Living room with a green sofa and a brick accent wall' },
      { src: '/sample/1c-4.jpg', alt: 'Dining area with a round table and pendant lights' },
    ],
  },
];
