import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,ts}'],
  theme: {
    extend: {
      colors: {
        lake: 'var(--lake)',
        deep: 'var(--deep)',
        shore: 'var(--shore)',
        mist: 'var(--mist)',
        sky: 'var(--sky)',
        ink: 'var(--ink)',
        glow: 'var(--glow)',
        muted: 'color-mix(in srgb, var(--ink) 78%, white)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', ...defaultTheme.fontFamily.sans],
        sans: ['"Instrument Sans"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
