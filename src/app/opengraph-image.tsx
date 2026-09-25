import { ImageResponse } from 'next/og';

export const alt = 'Evenements — Galatasaray Üniversitesi kulüp etkinlikleri';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 90, background: '#eff6ff', color: '#172554' }}>
      <div style={{ display: 'flex', fontSize: 34, color: '#2563eb', marginBottom: 32 }}>GALATASARAY ÜNİVERSİTESİ</div>
      <div style={{ display: 'flex', fontSize: 112, fontWeight: 700, letterSpacing: -5 }}>evenements</div>
      <div style={{ display: 'flex', fontSize: 38, marginTop: 30 }}>Kulüpler · Etkinlikler · Duyurular</div>
    </div>, size,
  );
}
