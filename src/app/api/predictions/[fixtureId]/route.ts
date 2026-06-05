import { NextResponse } from 'next/server';
import { fetchFromAPIFootball } from '@/lib/api-football';

interface Props {
  params: Promise<{
    fixtureId: string;
  }>;
}

export async function GET(_: Request, { params }: Props) {
  try {
    const { fixtureId } = await params;

    const data = await fetchFromAPIFootball(
      `/predictions?fixture=${fixtureId}`
    );

    const prediction = data.response?.[0];

    if (!prediction) {
      return NextResponse.json(
        { error: 'No prediction found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      winner: prediction.predictions.winner,
      percent: prediction.predictions.percent,
      advice: prediction.predictions.advice,
      comparison: prediction.comparison,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}