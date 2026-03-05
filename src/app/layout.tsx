import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-black min-h-screen">
        <Navbar />
        <ErrorBoundary>
          <main>{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
