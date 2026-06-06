'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  email: string;
}

const COOLDOWN_SECONDS = 20;

function mapSupabaseError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
    return 'Has superado el límite de solicitudes. Espera un momento antes de intentar de nuevo.';
  }
  if (msg.includes('not found') || msg.includes('user not found') || msg.includes('email not')) {
    return 'No encontramos una cuenta con ese correo.';
  }
  return `No se pudo reenviar el correo: ${message}`;
}

export default function ResendEmailButton({ email }: Props) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (loading || cooldown > 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (resendError) {
        setError(mapSupabaseError(resendError.message));
      } else {
        setSuccess('Hemos enviado un nuevo correo de verificación.');
        setCooldown(COOLDOWN_SECONDS);
      }
    } catch {
      setError('No hay conexión de red. Verifica tu internet e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || cooldown > 0}
        className="w-full bg-verde-600 hover:bg-verde-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Reenviando...' : 'Reenviar correo de verificación'}
      </button>

      {cooldown > 0 && <p className="text-xs text-gray-500">Reenviar disponible en {cooldown}s</p>}
      {success && <p className="text-sm text-verde-400">{success}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
