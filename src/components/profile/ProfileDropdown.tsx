'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Settings, LogOut, UserCircle2, Edit3 } from 'lucide-react';
import Avatar from '@/components/profile/Avatar';

interface Props {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  onLogout: () => Promise<void> | void;
  compact?: boolean;
}

export default function ProfileDropdown({ name, email, avatarUrl, onLogout, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-800 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={name} avatarUrl={avatarUrl} sizeClassName={compact ? 'w-7 h-7' : 'w-8 h-8'} />
        <span className={`${compact ? 'text-xs max-w-[100px]' : 'text-sm max-w-[150px]'} text-gray-200 truncate`}>
          {name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 p-2" role="menu">
          <div className="px-3 py-2 border-b border-gray-700 mb-1">
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            {email && <p className="text-gray-400 text-xs truncate">{email}</p>}
          </div>

          <Link
            href="/perfil"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <UserCircle2 className="w-4 h-4" />
            Mi perfil
          </Link>

          <Link
            href="/perfil/editar"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <Edit3 className="w-4 h-4" />
            Editar perfil
          </Link>

          <button
            type="button"
            disabled
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 rounded-lg cursor-not-allowed"
            title="Próximamente"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>

          <button
            type="button"
            onClick={async () => {
              await onLogout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
