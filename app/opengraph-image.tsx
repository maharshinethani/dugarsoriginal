import { ImageResponse } from 'next/server';
import { getSeoSettings } from '@/lib/seo-settings';
import { siteConfig } from '@/lib/site-config';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const alt = 'Fine Jewellery';

export default async function Image() {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;
  const parts = brandName.split(' ');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 300, letterSpacing: 4, color: '#c4a86a' }}>
          {parts[0] || 'DUGARS'}
        </div>
        {parts.length > 1 && (
          <div style={{ fontSize: 24, fontWeight: 400, letterSpacing: 8, color: '#e8e8e8', marginTop: 12 }}>
            {parts.slice(1).join(' ')}
          </div>
        )}
        <div
          style={{
            width: 60,
            height: 1,
            background: '#c4a86a',
            marginTop: 24,
          }}
        />
        <div style={{ fontSize: 18, color: '#999', marginTop: 20, letterSpacing: 2 }}>
          {seo.taglineEn || 'Fine Jewellery & Bespoke Designs'}
        </div>
      </div>
    ),
    { ...size }
  );
}
