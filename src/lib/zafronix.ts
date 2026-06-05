const API_KEY = process.env.ZAFRONIX_API_KEY;

export async function zafronixFetch(endpoint: string) {
  const response = await fetch(
    `https://api.zafronix.com/fifa/worldcup/v1${endpoint}`,
    {
      headers: {
        'X-API-Key': API_KEY || '',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Zafronix Error: ${response.status}`);
  }

  return response.json();
}