/**
 * Single source of truth for everything the site says about Summit Lake Properties.
 *
 * Rules:
 * - Only facts from the notice taped to the building are filled in.
 * - Anything unknown is null. A null value is never rendered: the field,
 *   its label and its whole section are skipped.
 * - Fill a value in here when it is confirmed and it appears on the site.
 */

export interface Announcement {
  message: string;
  /** Optional link text and href shown after the message. */
  linkLabel: string | null;
  linkHref: string | null;
}

export interface SiteConfig {
  name: string;
  city: string;
  state: string;
  tagline: string;
  goal: string;
  manager: { firstName: string; lastName: string | null };
  phone: string;
  mailing: { poBox: string; city: string; state: string; zip: string };

  // Unknown for now. Set to a value to make it appear.
  email: string | null;
  buildingAddresses: string[] | null;
  unitCount: number | null;
  officeHours: string | null;
  logo: { src: string; alt: string } | null;
  rentPayableTo: string | null;
  rentDueNote: string | null;

  /** Future extension point. Stripe is not built. */
  features: { onlineRentPayment: boolean };
  /** Used only when features.onlineRentPayment is true. */
  onlinePaymentUrl: string | null;

  /** Set to null to hide the announcements bar. */
  announcement: Announcement | null;
}

export const site: SiteConfig = {
  name: 'Summit Lake Properties',
  city: 'Marshall',
  state: 'MN',
  tagline: 'Property management in Marshall, MN',
  goal: 'Responsive, reliable management, and a safe, comfortable, well-maintained place to live.',
  manager: { firstName: 'Kane', lastName: null },
  phone: '(320) 226-8891',
  mailing: { poBox: 'PO Box 354', city: 'Marshall', state: 'MN', zip: '56258' },

  email: null,
  buildingAddresses: null,
  unitCount: null,
  officeHours: null,
  logo: null,
  rentPayableTo: null,
  rentDueNote: null,

  features: { onlineRentPayment: false },
  onlinePaymentUrl: null,

  announcement: {
    message: 'Your building is now under new management, effective immediately.',
    linkLabel: null,
    linkHref: null,
  },
};

export const managerName = site.manager.lastName
  ? `${site.manager.firstName} ${site.manager.lastName}`
  : site.manager.firstName;

/** tel: link built from the display phone number. */
export const phoneHref = `tel:+1${site.phone.replace(/\D/g, '')}`;

/** sms: link with a prefilled message. The "?&body=" form works on both iOS and Android. */
export const smsHref = (message: string) => `sms:+1${site.phone.replace(/\D/g, '')}?&body=${encodeURIComponent(message)}`;

export const mailingLines = [site.name, site.mailing.poBox, `${site.mailing.city}, ${site.mailing.state} ${site.mailing.zip}`];
export const mailingText = mailingLines.join('\n');

/** Prefix a site path with the deploy base (for example /Summit-Lake-Properties on GitHub Pages). */
export const href = (path: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}` || '/';
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Tenants', href: '/tenants' },
  { label: 'Tenant portal', href: '/portal' },
  { label: 'Vacancies', href: '/vacancies' },
  { label: 'Contact', href: '/contact' },
] as const;
