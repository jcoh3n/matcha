// Theme configuration for Matcha - Respect existing color palette
export const theme = {
  colors: {
    primary: {
      main: 'hsl(101 37% 56%)', // Flax Smoke (vert olive) - --primary
      foreground: 'hsl(48 14% 91%)', // Cararra - --primary-foreground
      muted: 'hsl(75 15% 75%)', // --primary-muted
    },
    secondary: {
      main: 'hsl(66 62% 13%)', // Waiouru (vert très foncé) - --secondary
      foreground: 'hsl(48 14% 91%)', // Cararra - --secondary-foreground
      muted: 'hsl(80 18% 71%)', // Clay Ash - --secondary-muted
    },
    accent: {
      main: 'hsl(32 32% 73%)', // Vanilla (beige/vanille) - --accent
      foreground: 'hsl(66 62% 13%)', // --accent-foreground
    },
    background: {
      main: 'hsl(48 14% 91%)', // Cararra - --background
      card: 'hsl(48 14% 94%)', // --card
    },
    neutral: {
      white: 'hsl(0 0% 100%)',
      lightGray: 'hsl(80 18% 80%)', // --input
      gray: 'hsl(80 18% 75%)', // --border
      darkGray: 'hsl(80 18% 71%)', // Clay Ash - --muted
      black: 'hsl(66 62% 13%)', // Waiouru - --foreground
    },
    status: {
      success: 'hsl(0 72% 58%)', // --destructive (used for success as well in this theme)
      warning: 'hsl(32 32% 73%)', // Vanilla - repurposed for warning
      error: 'hsl(0 72% 58%)', // --destructive
      info: 'hsl(75 23% 45%)', // --ring
    }
  },
  typography: {
    fontFamily: {
      heading: "'Montserrat', 'Poppins', 'Inter', system-ui, sans-serif",
      body: "'Inter', 'Montserrat', 'Poppins', system-ui, sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '1rem', // --radius-sm
    md: '1.25rem',
    lg: '1.5rem', // --radius
    xl: '2rem', // --radius-lg
    '2xl': '2.5rem', // --radius-xl
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 hsl(101 37% 56% / 0.15)', // --shadow-soft
    md: '0 4px 6px -1px hsl(66 62% 13% / 0.1), 0 2px 4px -1px hsl(66 62% 13% / 0.06)',
    lg: '0 10px 15px -3px hsl(66 62% 13% / 0.1), 0 4px 6px -2px hsl(66 62% 13% / 0.05)',
    xl: '0 20px 25px -5px hsl(66 62% 13% / 0.1), 0 10px 10px -5px hsl(66 62% 13% / 0.04)',
    brutal: '8px 8px 0px hsl(66 62% 13% / 0.8)', // --shadow-brutal
    card: '0 8px 32px -8px hsl(66 62% 13% / 0.1)', // --shadow-card
    inner: 'inset 0 2px 4px 0 hsl(66 62% 13% / 0.06)',
    none: 'none',
  },
  transition: {
    default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // --transition-smooth
    slow: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // --transition-bounce
    fast: 'all 0.1s ease-in-out',
  }
};

export default theme;