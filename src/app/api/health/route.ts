import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    checks.env = { status: 'error', message: 'Missing Supabase environment variables' };
    return NextResponse.json({ status: 'error', checks, timestamp: new Date().toISOString() }, { status: 500 });
  }
  checks.env = { status: 'ok' };

  // Check Supabase connection
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('ligas').select('id').limit(1);
    if (error) {
      checks.supabase = { status: 'error', message: error.message };
    } else {
      checks.supabase = { status: 'ok' };
    }
  } catch (err) {
    checks.supabase = { status: 'error', message: String(err) };
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    },
    { status: allOk ? 200 : 503 }
  );
}
