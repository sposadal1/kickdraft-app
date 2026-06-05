import { NextResponse } from 'next/server';

const API_KEY = process.env.API_FOOTBALL_KEY;

export async function GET(
  request: Request,
  context: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const params = await context.params;

    const fixtureId = params.fixtureId;

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
      {
        headers: {
          'x-apisports-key': API_KEY || '',
        },

        next: {
          revalidate: 30,
        },
      }
    );

    const data = await response.json();

    const fixture = data.response?.[0];

    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: fixture.fixture.status.short,
      elapsed: fixture.fixture.status.elapsed,

      home: {
        name: fixture.teams.home.name,
        goals: fixture.goals.home,
      },

      away: {
        name: fixture.teams.away.name,
        goals: fixture.goals.away,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch live match' },
      { status: 500 }
    );
  }
}