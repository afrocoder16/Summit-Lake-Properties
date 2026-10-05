import { clean, cleanLine } from './sanitize';

export const CONTACT_TIMES = ['Any time', 'Morning', 'Afternoon', 'Evening'] as const;

export interface MaintenanceInput {
  name: string;
  unit: string;
  phone: string;
  issue: string;
  contactTime: string;
  photoNote: string;
}

export type FieldErrors = Partial<Record<keyof MaintenanceInput, string>>;

export const LIMITS = { name: 80, unit: 20, phone: 20, issue: 1500, photoNote: 300 };

/** Clean raw form values, then validate. Returns the cleaned values and any errors. */
export function validateMaintenance(raw: Record<string, unknown>): {
  values: MaintenanceInput;
  errors: FieldErrors;
} {
  const values: MaintenanceInput = {
    name: cleanLine(raw.name, LIMITS.name),
    unit: cleanLine(raw.unit, LIMITS.unit),
    phone: cleanLine(raw.phone, LIMITS.phone),
    issue: clean(raw.issue, LIMITS.issue),
    contactTime: cleanLine(raw.contactTime, 20),
    photoNote: clean(raw.photoNote, LIMITS.photoNote),
  };
  const errors: FieldErrors = {};

  if (values.name.length < 2) errors.name = 'Enter your name.';
  if (!values.unit) errors.unit = 'Enter your unit number.';
  else if (!/^[A-Za-z0-9 #.\-/]{1,20}$/.test(values.unit))
    errors.unit = 'Use letters, numbers, spaces, # or dashes only.';

  const digits = values.phone.replace(/\D/g, '');
  if (!/^[0-9+() .\-]+$/.test(values.phone) || !(digits.length === 10 || (digits.length === 11 && digits[0] === '1')))
    errors.phone = 'Enter a 10 digit phone number.';

  if (values.issue.length < 10) errors.issue = 'Tell us a little more about what is wrong (at least 10 characters).';

  if (!(CONTACT_TIMES as readonly string[]).includes(values.contactTime))
    errors.contactTime = 'Choose a time that works.';

  return { values, errors };
}
