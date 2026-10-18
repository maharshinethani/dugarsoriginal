import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET() {
  const checks: Record<string, string> = {};
  let allHealthy = true;

  try {
    const start = Date.now();
    const { error } = await supabase.from('website_settings').select('id').limit(1).maybeSingle();
    const latency = Date.now() - start;

    if (error) {
      checks.database = 'degraded';
      allHealthy = false;
    } else if (latency > 3000) {
      checks.database = 'slow';
      allHealthy = false;
    } else {
      checks.database = 'ok';
    }
  } catch {
    checks.database = 'error';
    allHealthy = false;
  }

  checks.status = allHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      status: checks.status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
