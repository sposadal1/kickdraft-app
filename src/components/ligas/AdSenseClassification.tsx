'use client';

import AdSenseBanner from '@/components/layout/AdSenseBanner';

/**
 * Anuncio de tipo rectángulo (300×250) para mostrar debajo de la tabla
 * de clasificación en las ligas. Centrado y con margen vertical para no
 * quedar pegado al contenido.
 * Solo se renderiza si NEXT_PUBLIC_ADSENSE_PUBLISHER_ID está configurado.
 */
export default function AdSenseClassification() {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_CLASSIFICATION_SLOT ?? '';

  return (
    <div className="flex justify-center my-4">
      {/* adFormat='rectangle' maps to data-ad-format="rectangle" (300×250) supported by AdSenseBanner */}
      <AdSenseBanner
        adSlot={slot}
        adFormat="rectangle"
        className="w-[300px]"
      />
    </div>
  );
}
