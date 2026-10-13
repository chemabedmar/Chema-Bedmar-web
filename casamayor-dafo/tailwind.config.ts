import type { Config } from 'tailwindcss';
import { COLORES } from './data/marca';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        texto: COLORES.texto,
        'texto-suave': COLORES.textoSuave,
        dorado: COLORES.dorado,
        'dorado-oscuro': COLORES.doradoOscuro,
        marino: COLORES.marino,
        'marino-oscuro': COLORES.marinoOscuro,
        turquesa: COLORES.turquesa,
        borde: COLORES.borde,
        'gris-claro': COLORES.grisClaro,
      },
      fontFamily: {
        sans: ['var(--fuente-roboto)', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        // Como la web: 2–4 px como máximo.
        DEFAULT: '2px',
        ficha: '4px',
      },
      boxShadow: {
        ficha: '0 1px 3px rgba(0,0,0,0.06)',
        'ficha-hover': '0 2px 6px rgba(0,0,0,0.10)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
