import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import type {SocialArtInput} from '../types.js';

const clampText = (value: string | undefined, fallback: string, maxLength: number) => {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  const text = normalized || fallback;
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, Math.max(1, maxLength - 1)).trim();
  const wordSafe = sliced.replace(/\s+\S*$/, '').trim();
  return `${wordSafe || sliced}…`;
};

const narrativePalettes = [
  {
    base: 'linear-gradient(150deg, #151515 0%, #19352c 47%, #5c3159 100%)',
    glow: 'radial-gradient(circle at 18% 18%, rgba(245,213,111,0.48) 0, transparent 23%), radial-gradient(circle at 76% 30%, rgba(151,216,184,0.24) 0, transparent 24%)',
    accent: '#f5d56f',
  },
  {
    base: 'linear-gradient(160deg, #0d1413 0%, #1f4338 48%, #6c542b 100%)',
    glow: 'radial-gradient(circle at 82% 18%, rgba(245,213,111,0.40) 0, transparent 21%), radial-gradient(circle at 20% 78%, rgba(185,221,204,0.22) 0, transparent 26%)',
    accent: '#d8c06a',
  },
  {
    base: 'linear-gradient(145deg, #111318 0%, #283746 44%, #172018 100%)',
    glow: 'radial-gradient(circle at 22% 70%, rgba(126,178,147,0.34) 0, transparent 25%), radial-gradient(circle at 78% 20%, rgba(245,213,111,0.28) 0, transparent 18%)',
    accent: '#9fd1b4',
  },
  {
    base: 'linear-gradient(155deg, #17120f 0%, #352616 43%, #18352f 100%)',
    glow: 'radial-gradient(circle at 72% 74%, rgba(245,213,111,0.38) 0, transparent 24%), radial-gradient(circle at 18% 24%, rgba(255,250,240,0.16) 0, transparent 18%)',
    accent: '#f0bd65',
  },
  {
    base: 'linear-gradient(160deg, #101416 0%, #213530 48%, #251b30 100%)',
    glow: 'radial-gradient(circle at 24% 24%, rgba(185,221,204,0.30) 0, transparent 22%), radial-gradient(circle at 86% 76%, rgba(245,213,111,0.26) 0, transparent 24%)',
    accent: '#b9ddcc',
  },
  {
    base: 'linear-gradient(150deg, #120f13 0%, #342443 45%, #19352c 100%)',
    glow: 'radial-gradient(circle at 76% 20%, rgba(245,213,111,0.32) 0, transparent 20%), radial-gradient(circle at 24% 74%, rgba(151,216,184,0.28) 0, transparent 25%)',
    accent: '#d4b7f0',
  },
];

export const SocialArtCover: React.FC<SocialArtInput & {format?: 'square' | 'vertical' | 'portrait'}> = (input) => {
  const format = input.format || 'vertical';
  const isSquare = 'square' === format;
  const isPortrait = 'portrait' === format;
  const isNarrative = isPortrait && 'narrative' === input.layout;
  const slideIndex = Math.max(0, Number(input.slideIndex || 0));
  const slideCount = Math.max(1, Number(input.slideCount || 1));
  const palette = narrativePalettes[slideIndex % narrativePalettes.length];
  const title = clampText(input.title, 'Céu do momento', isNarrative ? 76 : 92);
  const subtitle = clampText(input.subtitle, '', isNarrative ? 220 : 120);
  const badge = clampText(input.badge, 'Astrologia', 38);
  const brand = clampText(input.brand, 'Toque de Despertar', 60);

  if (isNarrative) {
    return (
      <AbsoluteFill
        style={{
          background: palette.base,
          color: '#fffaf0',
          overflow: 'hidden',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <AbsoluteFill
          style={{
            background: palette.glow,
            opacity: 0.95,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.16) 42%, rgba(0,0,0,0.44) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: 999,
            left: -110 + (slideIndex % 3) * 72,
            top: 104 + (slideIndex % 2) * 94,
            background: palette.accent,
            opacity: 0.12,
            filter: 'blur(18px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: 999,
            right: -90 + (slideIndex % 2) * 60,
            bottom: 150 + (slideIndex % 3) * 48,
            border: '2px solid rgba(255,250,240,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 72,
            right: 72,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fffaf0',
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            fontSize: 26,
          }}
        >
          <span>{brand}</span>
          <span>{String(slideIndex + 1).padStart(2, '0')}/{String(slideCount).padStart(2, '0')}</span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 78,
            right: 78,
            top: 232,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '12px 20px 11px',
              background: 'rgba(15,18,14,0.36)',
              border: '1px solid rgba(255,250,240,0.22)',
              color: '#fffaf0',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </div>
          <div
            style={{
              width: 124,
              height: 13,
              background: palette.accent,
              marginTop: 72,
              marginBottom: 38,
            }}
          />
          <div
            style={{
              color: '#fffaf0',
              fontSize: 82,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: -2.4,
              textShadow: '0 10px 34px rgba(0,0,0,0.48)',
              textWrap: 'balance',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                marginTop: 42,
                color: '#f3eee2',
                fontSize: 46,
                lineHeight: 1.18,
                fontWeight: 650,
                letterSpacing: -0.4,
                textShadow: '0 8px 28px rgba(0,0,0,0.48)',
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: '#11130f',
        color: '#fffaf0',
        overflow: 'hidden',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <AbsoluteFill>
        <Img
          src={input.baseImageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'saturate(0.92) contrast(1.04)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: isSquare
            ? 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.88) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.91) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 18% 16%, rgba(245,213,111,0.34) 0, transparent 26%), radial-gradient(circle at 88% 86%, rgba(126,178,147,0.22) 0, transparent 30%)',
          mixBlendMode: 'screen',
          opacity: 0.72,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: isSquare ? 58 : isPortrait ? 72 : 92,
          left: isSquare ? 64 : 72,
          right: isSquare ? 64 : 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            border: '2px solid rgba(255,250,240,0.76)',
            borderRadius: 999,
            padding: '13px 22px 12px',
            color: '#fffaf0',
            fontSize: isSquare ? 25 : isPortrait ? 27 : 29,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            background: 'rgba(15,18,14,0.34)',
          }}
        >
          {badge}
        </div>
        <div
          style={{
            color: '#fffaf0',
            fontSize: isSquare ? 24 : isPortrait ? 26 : 28,
            fontWeight: 800,
            letterSpacing: -0.3,
            textShadow: '0 4px 18px rgba(0,0,0,0.45)',
            textAlign: 'right',
          }}
        >
          {brand}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: isSquare ? 68 : 76,
          right: isSquare ? 64 : 76,
          bottom: isSquare ? 88 : isPortrait ? 110 : 146,
        }}
      >
        <div
          style={{
            width: isSquare ? 118 : isPortrait ? 124 : 132,
            height: isSquare ? 12 : isPortrait ? 13 : 14,
            background: '#f5d56f',
            marginBottom: isSquare ? 34 : isPortrait ? 38 : 42,
          }}
        />
        <div
          style={{
            color: '#fffaf0',
            fontSize: isSquare ? 72 : isPortrait ? 82 : 92,
            lineHeight: 0.98,
            fontWeight: 900,
            letterSpacing: -2.6,
            textShadow: '0 10px 34px rgba(0,0,0,0.58)',
            maxWidth: isSquare ? 900 : 880,
            textWrap: 'balance',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
            marginTop: isSquare ? 26 : isPortrait ? 30 : 34,
              color: '#f3eee2',
              fontSize: isSquare ? 42 : isPortrait ? 46 : 52,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: -0.8,
              textShadow: '0 8px 28px rgba(0,0,0,0.58)',
              maxWidth: isSquare ? 820 : 840,
              textWrap: 'balance',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
