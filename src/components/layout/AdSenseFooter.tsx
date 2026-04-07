'use client';

import AdSenseBanner from './AdSenseBanner';

/**
 * Anuncio no invasivo en el footer global.
 * Formato horizontal/responsive, centrado y con margen superior.
 * Solo se renderiza si NEXT_PUBLIC_ADSENSE_PUBLISHER_ID está configurado.
 */
export default function AdSenseFooter() {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT ?? '';

  return (
    /* adFormat='horizontal' maps to data-ad-format="horizontal" supported by AdSenseBanner */
    <AdSenseBanner
      adSlot={slot}
      adFormat="horizontal"
      className="max-w-5xl mx-auto mt-2"
    />
  );
}
