import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Kickdraft - Pollas Mundialistas Mundial 2026',
  description: 'Crea tu polla del Mundial 2026, haz tus pronósticos y compite con amigos en Kickdraft.',
  keywords: 'mundial 2026, polla mundialista, pronósticos fútbol, FIFA World Cup 2026',
  openGraph: {
    title: 'Kickdraft - Pollas Mundialistas Mundial 2026',
    description: 'Demuestra que sabes de fútbol con Kickdraft',
    locale: 'es_CO',
    type: 'website',
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
        <main>{children}</main>
      </body>
    </html>
  );
}
