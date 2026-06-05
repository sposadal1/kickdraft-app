import { NextResponse } from 'next/server';
import { zafronixFetch } from '@/lib/zafronix';

export async function GET() {
  try {
    const data = await zafronixFetch('/teams');

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}