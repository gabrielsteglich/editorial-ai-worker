import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import type {SocialArtInput} from '../types.js';

const clampText = (value: string | undefined, fallback: string, maxLength: number) => {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return (normalized || fallback).slice(0, maxLength);
};

export const SocialArtCover: React.FC<SocialArtInput & {format?: 'square' | 'vertical'}> = (input) => {
  const format = input.format || 'vertical';
  const isSquare = 'square' === format;
  const title = clampText(input.title, 'Céu do momento', 92);
  const subtitle = clampText(input.subtitle, '', 120);
  const badge = clampText(input.badge, 'Astrologia', 38);
  const brand = clampText(input.brand, 'Toque de Despertar', 60);

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
          top: isSquare ? 58 : 92,
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
            fontSize: isSquare ? 25 : 29,
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
            fontSize: isSquare ? 24 : 28,
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
          bottom: isSquare ? 88 : 146,
        }}
      >
        <div
          style={{
            width: isSquare ? 118 : 132,
            height: isSquare ? 12 : 14,
            background: '#f5d56f',
            marginBottom: isSquare ? 34 : 42,
          }}
        />
        <div
          style={{
            color: '#fffaf0',
            fontSize: isSquare ? 72 : 92,
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
              marginTop: isSquare ? 26 : 34,
              color: '#f3eee2',
              fontSize: isSquare ? 42 : 52,
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
