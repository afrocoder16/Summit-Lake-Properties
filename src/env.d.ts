/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_EMAILJS_SERVICE_ID?: string;
  readonly PUBLIC_EMAILJS_TEMPLATE_ID?: string;
  readonly PUBLIC_EMAILJS_PUBLIC_KEY?: string;
  readonly PUBLIC_VACANCIES_CSV_URL?: string;
  readonly PUBLIC_APPLY_FORM_URL?: string;
}
