'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ActualizarPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  async function handleActualizar(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        setCargando(false);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Error inesperado al actualizar contraseña:', err);
      setError('Error inesperado. Intenta de nuevo.');
      setCargando(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-verde-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-gray-400 mt-1">Elige una contraseña segura para tu cuenta</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleActualizar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 focus:border-verde-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={mostrarConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 focus:border-verde-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {mostrarConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
