import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import { FAVICON_URL_POR_DEFECTO } from '@/data/marca';
import './globals.css';

/** Roboto auto-hospedada por Next, la misma familia y pesos que la calculadora. */
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--fuente-roboto',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});

/**
 * `robots: noindex, nofollow`: es una herramienta de trabajo del equipo, no una
 * página que deba salir en Google. public/robots.txt lo repite.
 */
export const metadata: Metadata = {
  title: 'DAFO de vivienda · Herramienta interna Casamayor',
  icons: { icon: FAVICON_URL_POR_DEFECTO, apple: FAVICON_URL_POR_DEFECTO },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00237D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: las extensiones del navegador tocan <html> y <body>
    // antes de que React hidrate.
    <html lang="es-ES" className={roboto.variable} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
