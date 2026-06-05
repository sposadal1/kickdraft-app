import { NextResponse } from 'next/server';

const API_KEY = process.env.API_FOOTBALL_KEY;

export async function GET() {
  try {
    const response = await fetch(
      'https://v3.football.api-sports.io/leagues?id=1&season=2026',
      {
        headers: {
          'x-apisports-key': API_KEY || '',
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    );
  }
}