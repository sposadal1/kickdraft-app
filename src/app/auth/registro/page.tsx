'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirmPassword: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setCargando(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      setCargando(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          apellido: form.apellido ?? '',
        },
      },
    });

    if (error) {
      console.error('Error en registro:', error.message);
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
        setError('Este email ya está registrado. Intenta iniciar sesión.');
      } else if (error.message.toLowerCase().includes('password')) {
        setError('La contraseña no cumple los requisitos. Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      } else {
        setError(error.message);
      }
      setCargando(false);
      return;
    }

    if (data.user) {
      if (data.session) {
        // Email confirmation not required — user is immediately logged in
        router.push('/');
        router.refresh();
      } else {
        // Email confirmation required — show confirmation message
        setEsperandoConfirmacion(true);
      }
    }

    setCargando(false);
  }

  if (esperandoConfirmacion) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
            <Mail className="w-8 h-8 text-verde-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Revisa tu email!</h2>
          <p className="text-gray-400 mb-6">
            Enviamos un enlace de confirmación a <strong className="text-white">{form.email}</strong>.
            Haz clic en él para activar tu cuenta e ingresar a Kickdraft.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ¿No lo ves? Revisa la carpeta de spam o correo no deseado.
          </p>
          <Link href="/auth/login" className="text-verde-400 hover:text-verde-300 text-sm font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-verde-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-gray-400 mt-1">Únete a Kickdraft y empieza a pronosticar</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleRegistro} className="space-y-4">
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña *</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Repite tu contraseña"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:border-verde-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-verde-400 hover:text-verde-300 font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
