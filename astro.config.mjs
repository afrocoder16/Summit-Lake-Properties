import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

export default defineConfig({
  site: env.SITE_URL || process.env.SITE_URL || 'http://localhost:4321',
  base: env.BASE_PATH || process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [tailwind({ applyBaseStyles: false })],
});
