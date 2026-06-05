'use client';

import { useEffect, useState } from 'react';

interface PredictionData {
  winner?: {
    id: number;
    name: string;
    comment: string;
  };

  percent: {
    home: string;
    draw: string;
    away: string;
  };

  advice?: string;

  comparison?: any;

  fallback?: boolean;
}

export function usePredictions(fixtureId?: number) {
  const [data, setData] = useState<PredictionData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fixtureId) {
      setData({
        percent: {
          home: '45%',
          draw: '30%',
          away: '25%',
        },
        advice: 'Predicción generada localmente',
        fallback: true,
      });

      setLoading(false);
      return;
    }

    async function loadPredictions() {
      try {
        const response = await fetch(
          `/api/predictions/${fixtureId}`
        );

        if (!response.ok) {
          throw new Error('Prediction not found');
        }

        const json = await response.json();

        if (!json?.percent) {
          throw new Error('Invalid prediction');
        }

        setData({
          ...json,
          fallback: false,
        });
      } catch (error) {
        console.log('Using fallback predictions');

        setData({
          percent: {
            home: '45%',
            draw: '30%',
            away: '25%',
          },

          advice: 'Predicción generada localmente',

          fallback: true,
        });
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, [fixtureId]);

  return {
    data,
    loading,
  };
}