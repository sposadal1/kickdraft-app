import { UserCircle2 } from 'lucide-react';
import { getIniciales } from '@/lib/profile';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  sizeClassName?: string;
  textClassName?: string;
}

export default function Avatar({
  name,
  avatarUrl,
  sizeClassName = 'w-8 h-8',
  textClassName = 'text-xs font-bold',
}: AvatarProps) {
  const initiales = getIniciales(name);

  return (
    <div className={`${sizeClassName} rounded-full bg-verde-700 flex items-center justify-center text-white overflow-hidden flex-shrink-0`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : name ? (
        <span className={textClassName}>{initiales}</span>
      ) : (
        <UserCircle2 className="w-2/3 h-2/3 text-white/90" />
      )}
    </div>
  );
}
