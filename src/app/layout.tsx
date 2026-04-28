import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import AdSenseFooter from '@/components/layout/AdSenseFooter';

export const metadata: Metadata = {
  title: 'Kickdraft - Pollas Mundialistas Mundial 2026',
  description: 'Crea tu polla del Mundial 2026, haz tus pronósticos y compite con amigos en Kickdraft.',
  keywords: 'mundial 2026, polla mundialista, pronósticos fútbol, FIFA World Cup 2026',
  metadataBase: new URL('https://kickdraft-app.vercel.app'),
  openGraph: {
    title: 'Kickdraft - Pollas Mundialistas Mundial 2026',
    description: 'Demuestra que sabes de fútbol con Kickdraft. Crea tu polla mundialista gratis.',
    locale: 'es_CO',
    type: 'website',
    siteName: 'Kickdraft',
    url: 'https://kickdraft-app.vercel.app',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Kickdraft - Pollas Mundialistas Mundial 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kickdraft - Pollas Mundialistas Mundial 2026',
    description: 'Demuestra que sabes de fútbol con Kickdraft.',
    images: ['/og-image.svg'],
  },
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Google AdSense — only loaded in production when env var is set */}
        {ADSENSE_CLIENT && process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-sans bg-black min-h-screen flex flex-col">
        <Navbar />
        <ErrorBoundary>
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
        </ErrorBoundary>
        {/* Footer con anuncio pequeño no invasivo */}
        <footer className="border-t border-gray-900 py-4 px-4">
          <AdSenseFooter />
          <p className="text-center text-xs text-gray-700 mt-3">
            © {new Date().getFullYear()} Kickdraft · Mundial 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
