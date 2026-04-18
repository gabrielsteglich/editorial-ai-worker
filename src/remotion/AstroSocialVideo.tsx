import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {RenderInput, VideoScene} from '../types.js';

const safeScenes = (input: RenderInput): VideoScene[] => {
  const scenes = Array.isArray(input.scenes) ? input.scenes : [];
  if (scenes.length > 0) {
    return scenes.slice(0, 8);
  }

  return [
    {
      title: input.title,
      body: input.caption || 'Um convite para observar o céu com mais presença.',
    },
  ];
};

const SceneCard: React.FC<{
  scene: VideoScene;
  index: number;
  active: boolean;
}> = ({scene, index, active}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - index * fps * 4,
    fps,
    config: {
      damping: 18,
      stiffness: 80,
    },
  });

  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        transform: `translateY(${interpolate(entrance, [0, 1], [80, 0])}px)`,
        transition: 'opacity 180ms linear',
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 30,
        padding: '0 82px',
      }}
    >
      <div
        style={{
          color: '#f8f6ee',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1.02,
          letterSpacing: 0,
          textShadow: '0 6px 24px rgba(0,0,0,0.42)',
        }}
      >
        {scene.title}
      </div>
      <div
        style={{
          color: '#f3eee2',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 43,
          lineHeight: 1.18,
          letterSpacing: 0,
          textShadow: '0 5px 18px rgba(0,0,0,0.36)',
        }}
      >
        {scene.body}
      </div>
    </div>
  );
};

export const AstroSocialVideo: React.FC<RenderInput> = (input) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const scenes = safeScenes(input);
  const sceneLength = Math.max(1, Math.floor(durationInFrames / scenes.length));
  const activeScene = Math.min(scenes.length - 1, Math.floor(frame / sceneLength));
  const backgroundShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 1],
    {easing: Easing.inOut(Easing.ease), extrapolateRight: 'clamp'}
  );

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 20% 15%, #f5d56f 0, transparent 20%), linear-gradient(150deg, #151515 0%, #19352c 45%, #5c3159 100%)',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${1 + backgroundShift * 0.08}) rotate(${backgroundShift * 2}deg)`,
          background:
            'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.22) 0, transparent 16%), radial-gradient(circle at 25% 72%, rgba(151,216,184,0.24) 0, transparent 24%)',
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 72,
          right: 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f8f6ee',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 0,
          textTransform: 'uppercase',
        }}
      >
        <span>{input.brand || 'Toque de Despertar'}</span>
        <span>{String(Math.floor(frame / fps) + 1).padStart(2, '0')}s</span>
      </div>

      {scenes.map((scene, index) => (
        <SceneCard
          key={`${scene.title}-${index}`}
          scene={scene}
          index={index}
          active={index === activeScene}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 86,
          color: '#f8f6ee',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 34,
          lineHeight: 1.18,
          letterSpacing: 0,
          textShadow: '0 4px 18px rgba(0,0,0,0.38)',
        }}
      >
        {input.cta || 'Calcule seu mapa astral gratuito'}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 44,
          height: 8,
          background: 'rgba(255,255,255,0.24)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#f5d56f',
          }}
        />
      </div>

      {input.audioUrl ? <Audio src={input.audioUrl} volume={0.86} /> : null}
    </AbsoluteFill>
  );
};
