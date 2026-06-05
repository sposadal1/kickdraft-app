const API_BASE_URL = 'https://v3.football.api-sports.io';

const headers = {
  'x-apisports-key': process.env.API_FOOTBALL_KEY!,
};

export async function fetchFromAPIFootball(endpoint: string) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`);
  }

  return response.json();
}