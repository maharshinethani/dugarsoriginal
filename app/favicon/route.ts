import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0a0a0a"/>
  <text x="50" y="62" font-family="Georgia, serif" font-size="42" font-weight="300" letter-spacing="2" text-anchor="middle" fill="#c4a86a">D</text>
</svg>`;

export async function GET() {
  try {
    const { data } = await supabase
      .from('website_settings')
      .select('favicon_url, logo_url')
      .eq('id', 1)
      .maybeSingle();

    const faviconUrl = (data?.favicon_url as string | null) || (data?.logo_url as string | null);

    if (faviconUrl) {
      const upstream = await fetch(faviconUrl, { cache: 'no-store' });
      if (upstream.ok) {
        const contentType = upstream.headers.get('content-type') || 'image/png';
        const body = await upstream.arrayBuffer();
        return new NextResponse(body, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=300, must-revalidate',
          },
        });
      }
    }
  } catch {
    // fall through to default
  }

  return new NextResponse(FALLBACK_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  });
}
