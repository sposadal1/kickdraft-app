'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Modo = 'password' | 'magic-link';

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkEnviado, setMagicLinkEnviado] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Error en login:', error.message);
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
          setError('Tu email no ha sido confirmado. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación que te enviamos al registrarte.');
        } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('wrong password')) {
          setError('Email o contraseña incorrectos. Si te registraste con un enlace mágico, usa esa opción para ingresar.');
        } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
          setError('Demasiados intentos fallidos. Espera unos minutos y vuelve a intentarlo.');
        } else {
          setError(error.message);
        }
        setCargando(false);
      } else {
        router.push('/');
        router.refresh();
        // Keep cargando=true so the button stays in loading state during navigation
      }
    } catch (err) {
      console.error('Error inesperado en login:', err);
      setError('Error inesperado. Intenta de nuevo.');
      setCargando(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError('No se pudo enviar el enlace. Intenta de nuevo.');
      } else {
        setMagicLinkEnviado(true);
      }
    } catch (err) {
      console.error('Error inesperado en magic link:', err);
      setError('Error inesperado. Intenta de nuevo.');
    }
    setCargando(false);
  }

  if (magicLinkEnviado) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-verde-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Revisa tu email</h2>
          <p className="text-gray-400 mb-6">
            Enviamos un enlace de acceso a <strong className="text-white">{email}</strong>.
            Haz clic en él para ingresar a Kickdraft.
          </p>
          <button
            onClick={() => { setMagicLinkEnviado(false); setError(''); }}
            className="text-verde-400 hover:text-verde-300 text-sm font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-verde-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-gray-400 mt-1">Bienvenido de vuelta a Kickdraft</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* Selector de modo */}
          <div className="flex rounded-xl bg-gray-800 p-1 mb-6">
            <button
              onClick={() => { setModo('password'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${modo === 'password' ? 'bg-verde-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Contraseña
            </button>
            <button
              onClick={() => { setModo('magic-link'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${modo === 'magic-link' ? 'bg-verde-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Enlace mágico
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          {modo === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
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

              <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setModo('magic-link'); setError(''); }}
                    className="text-sm text-verde-400 hover:text-verde-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-sm text-gray-400 mb-2">
                Te enviaremos un enlace seguro a tu correo. Sin contraseñas, sin redirecciones extrañas.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {cargando ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/registro" className="text-verde-400 hover:text-verde-300 font-medium">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
