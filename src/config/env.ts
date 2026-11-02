/** Values read from .env. Names only are documented; see .env.example. */

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/** Accept only https URLs (plain http only for localhost testing) so a typo cannot inject another scheme. */
const httpsUrl = (v: string | undefined) => {
  const value = clean(v);
  if (!value) return null;
  try {
    const u = new URL(value);
    const localTest = u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
    return u.protocol === 'https:' || localTest ? value : null;
  } catch {
    return null;
  }
};

export const env = {
  vacanciesCsvUrl: httpsUrl(import.meta.env.PUBLIC_VACANCIES_CSV_URL),
  applyFormUrl: httpsUrl(import.meta.env.PUBLIC_APPLY_FORM_URL),
  emailjs: {
    serviceId: clean(import.meta.env.PUBLIC_EMAILJS_SERVICE_ID),
    templateId: clean(import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID),
    inquiryTemplateId: clean(import.meta.env.PUBLIC_EMAILJS_INQUIRY_TEMPLATE_ID),
    publicKey: clean(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY),
  },
};

export const emailjsConfigured = Boolean(
  env.emailjs.serviceId && env.emailjs.templateId && env.emailjs.publicKey,
);

/** The home inquiry and tour form uses its own EmailJS template. */
export const inquiryConfigured = Boolean(
  env.emailjs.serviceId && env.emailjs.inquiryTemplateId && env.emailjs.publicKey,
);
