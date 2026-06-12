/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain NativeWind classes.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0B0B12',
        surface: '#15151F',
        border: '#272746',
        primary: 'hsl(239, 84%, 67%)',
        accent: 'hsl(260, 80%, 75%)',
        muted: '#9A9AB0',
        foreground: 'hsl(230, 25%, 92%)',
        'primary-foreground': 'hsl(0, 0%, 100%)',
        'accent-foreground': 'hsl(232, 40%, 6%)',
      },
      borderRadius: {
        button: '40px',
      },
      fontFamily: {
        // Display (headings) — Playfair Display
        display: ['PlayfairDisplay_700Bold'],
        'display-semibold': ['PlayfairDisplay_600SemiBold'],
        // Body — DM Sans
        body: ['DMSans_400Regular'],
        'body-medium': ['DMSans_500Medium'],
      },
      fontSize: {
        // [fontSize, lineHeight]
        h1: ['36px', '36px'],
        h2: ['24px', '32px'],
        h3: ['20px', '28px'],
        h4: ['18px', '24px'],
        h5: ['16px', '22px'],
        'body-base': ['16px', '24px'],
        'body-sm': ['14px', '20px'],
        button: ['16px', '20px'],
      },
    },
  },
  plugins: [],
};
