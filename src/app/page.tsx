import Link from 'next/link';
import { Trophy, Users, Star, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-verde-900/40 via-black to-black" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-verde-900/50 border border-verde-700 text-verde-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Trophy className="w-4 h-4" />
            Mundial FIFA 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            ¡Demuestra que sabes{' '}
            <span className="text-verde-500">de fútbol!</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Crea tu polla mundialista, predice los resultados y compite con amigos en{' '}
            <strong className="text-white">Kickdraft</strong>. El torneo de pronósticos más emocionante del Mundial 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ligas/crear"
              className="flex items-center justify-center gap-2 bg-verde-600 hover:bg-verde-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Crear mi polla
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/ligas"
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors border border-gray-700"
            >
              Unirme a una liga
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                paso: '01',
                titulo: 'Regístrate',
                descripcion: 'Crea tu cuenta gratis y únete a la comunidad de Kickdraft.',
                icono: <Star className="w-8 h-8 text-verde-400" />,
              },
              {
                paso: '02',
                titulo: 'Haz tus pronósticos',
                descripcion: 'Predice el marcador de cada partido antes de que empiece.',
                icono: <Trophy className="w-8 h-8 text-verde-400" />,
              },
              {
                paso: '03',
                titulo: 'Compite con amigos',
                descripcion: 'Crea o únete a una liga e invita a tus amigos con un código.',
                icono: <Users className="w-8 h-8 text-verde-400" />,
              },
            ].map((item) => (
              <div key={item.paso} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center hover:border-verde-700 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
                  {item.icono}
                </div>
                <div className="text-verde-500 font-black text-sm mb-2">PASO {item.paso}</div>
                <h3 className="text-xl font-bold mb-3">{item.titulo}</h3>
                <p className="text-gray-400">{item.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema de puntos */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Sistema de puntuación</h2>
          <p className="text-gray-400 mb-10">Los puntos aumentan según la importancia del partido.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { fase: 'Grupos', resultado: 1, exacto: 2 },
              { fase: 'Octavos', resultado: 3, exacto: 6 },
              { fase: 'Cuartos', resultado: 4, exacto: 8 },
              { fase: 'Final', resultado: 7, exacto: 14 },
            ].map((item) => (
              <div key={item.fase} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-verde-400 font-bold text-sm mb-2">{item.fase}</div>
                <div className="text-white">
                  <span className="font-black text-2xl">{item.exacto}</span>
                  <span className="text-gray-500 text-xs"> pts exacto</span>
                </div>
                <div className="text-gray-400 text-xs">{item.resultado} pts resultado</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-verde-900/20 border-t border-verde-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para el Mundial?</h2>
          <p className="text-gray-400 mb-8">El Mundial 2026 arranca el 11 de junio. No te quedes sin hacer tus pronósticos.</p>
          <Link
            href="/auth/registro"
            className="inline-flex items-center gap-2 bg-verde-600 hover:bg-verde-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Comenzar gratis
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
