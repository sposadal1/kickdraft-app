'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generarCodigoInvitacion } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Trophy, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function CrearLigaPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [ligaCreada, setLigaCreada] = useState<{ nombre: string; codigo: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login');
        return;
      }
      setUsuario(data.user);
    });
  }, [router]);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !usuario) return;
    setCargando(true);
    setError('');

    const codigo = generarCodigoInvitacion();

    const { data: liga, error: ligaError } = await supabase
      .from('ligas')
      .insert({
        nombre: nombre.trim(),
        codigo_invitacion: codigo,
        creador_id: usuario.id,
      })
      .select()
      .single();

    if (ligaError || !liga) {
      setError('Error al crear la liga');
      setCargando(false);
      return;
    }

    const { error: miembroError } = await supabase
      .from('miembros_liga')
      .insert({ liga_id: liga.id, usuario_id: usuario.id, total_puntos: 0 });

    if (miembroError) {
      setError('Liga creada pero hubo un error al unirte como miembro');
      setCargando(false);
      return;
    }

    setLigaCreada({ nombre: liga.nombre, codigo: liga.codigo_invitacion });
    setCargando(false);
  }

  async function copiarCodigo() {
    if (!ligaCreada) return;
    await navigator.clipboard.writeText(ligaCreada.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (ligaCreada) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-6">
          <Trophy className="w-8 h-8 text-verde-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">¡Liga creada!</h1>
        <p className="text-gray-400 mb-8">
          Comparte este código con tus amigos para que se unan a <strong className="text-white">{ligaCreada.nombre}</strong>.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">Código de invitación</p>
          <div className="text-4xl font-black text-verde-400 tracking-widest mb-4">{ligaCreada.codigo}</div>
          <button
            onClick={copiarCodigo}
            className="flex items-center gap-2 mx-auto bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-700 transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-verde-400" /> : <Copy className="w-4 h-4" />}
            {copiado ? '¡Copiado!' : 'Copiar código'}
          </button>
        </div>

        <Link
          href="/ligas"
          className="text-verde-400 hover:text-verde-300 text-sm font-medium transition-colors"
        >
          Ver mis ligas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Crear mi Liga</h1>
      <p className="text-gray-400 mb-8">Crea tu polla mundialista e invita a tus amigos.</p>

      <form onSubmit={handleCrear} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de la liga *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Los cracks del trabajo"
            maxLength={50}
            required
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foto de perfil (opcional)
          </label>
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-500 hover:border-gray-600 transition-colors cursor-pointer">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Haz clic para subir una imagen</p>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!nombre.trim() || cargando}
          className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {cargando ? 'Creando...' : 'Crear liga'}
        </button>
      </form>
    </div>
  );
}