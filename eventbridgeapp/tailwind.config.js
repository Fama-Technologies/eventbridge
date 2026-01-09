/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '01': 'var(--primary-01)',
          '02': 'var(--primary-02)',
        },
        neutrals: {
          '01': 'var(--neutrals-01)',
          '02': 'var(--neutrals-02)',
          '03': 'var(--neutrals-03)',
          '04': 'var(--neutrals-04)',
          '05': 'var(--neutrals-05)',
          '06': 'var(--neutrals-06)',
          '07': 'var(--neutrals-07)',
          '08': 'var(--neutrals-08)',
        },
        shades: {
          black: 'var(--shades-black)',
          white: 'var(--shades-white)',
        },
        errors: {
          main: 'var(--errors-main)',
          bg: 'var(--errors-bg)',
        },
        accents: {
          discount: 'var(--accents-discount)',
          peach: 'var(--accents-peach)',
          orange: 'var(--accents-orange)',
        }
      }
    },
  },
  plugins: [],
}
