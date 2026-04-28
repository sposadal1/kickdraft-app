'use client';

import { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Componente no invasivo para Google AdSense.
 * Solo se renderiza en producción y no bloquea la interacción del usuario.
 */
export default function AdSenseBanner({ adSlot, adFormat = 'auto', className = '' }: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!publisherId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense no disponible en este entorno
    }
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div className={`overflow-hidden ${className}`} aria-label="Publicidad">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
