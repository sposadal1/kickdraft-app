import Link from 'next/link';
import { Mail } from 'lucide-react';
import ResendEmailButton from '@/components/auth/ResendEmailButton';

interface Props {
  email: string;
}

export default function VerificationScreen({ email }: Props) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-verde-900/40 rounded-2xl mb-4">
          <Mail className="w-8 h-8 text-verde-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Verifica tu correo electrónico</h2>

        <p className="text-gray-400 mb-4">
          Hemos enviado un correo de verificación a <strong className="text-white">{email}</strong>.
        </p>

        <div className="text-left text-sm text-gray-400 bg-gray-950 border border-gray-800 rounded-xl p-4 mb-5">
          <p className="mb-2">Por favor revisa:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bandeja de entrada</li>
            <li>Carpeta de Spam</li>
            <li>Carpeta de Promociones</li>
            <li>Correo no deseado</li>
          </ul>
        </div>

        <p className="text-sm text-yellow-300 mb-5">
          No podrás iniciar sesión hasta confirmar tu cuenta.
        </p>

        <ResendEmailButton email={email} />

        <Link href="/auth/login" className="inline-block mt-4 text-verde-400 hover:text-verde-300 text-sm font-medium">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
