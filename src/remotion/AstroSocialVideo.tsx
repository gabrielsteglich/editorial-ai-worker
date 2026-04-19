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
    const maxScenes = Math.max(3, Math.min(8, Number(input.maxScenes || 5)));
    return scenes.slice(0, maxScenes);
  }

  return [
    {
      title: input.title,
      body: input.caption || 'Um convite para observar o céu com mais presença.',
    },
  ];
};

const videoTemplate = (input: RenderInput) => {
  if ('cover_topics' === input.template || 'narrated_script' === input.template) {
    return input.template;
  }

  return 'editorial_astro';
};

const templateBackground = (template: string) => {
  if ('cover_topics' === template) {
    return 'radial-gradient(circle at 18% 18%, rgba(245,213,111,0.36) 0, transparent 22%), linear-gradient(155deg, #070707 0%, #172017 44%, #725b28 100%)';
  }

  if ('narrated_script' === template) {
    return 'radial-gradient(circle at 82% 12%, rgba(185,221,204,0.28) 0, transparent 20%), linear-gradient(165deg, #101416 0%, #213530 48%, #121212 100%)';
  }

  return 'radial-gradient(circle at 20% 15%, #f5d56f 0, transparent 20%), linear-gradient(150deg, #151515 0%, #19352c 45%, #5c3159 100%)';
};

const textLimits = (template: string) => {
  if ('cover_topics' === template) {
    return {title: 54, body: 150};
  }

  if ('narrated_script' === template) {
    return {title: 62, body: 150};
  }

  return {title: 58, body: 150};
};

const truncateText = (value: string, maxLength: number) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }

  const sliced = text.slice(0, Math.max(1, maxLength - 1)).trim();
  const wordSafe = sliced.replace(/\s+\S*$/, '').trim();
  return `${wordSafe || sliced}…`;
};

const SceneCard: React.FC<{
  scene: VideoScene;
  index: number;
  active: boolean;
  template: string;
}> = ({scene, index, active, template}) => {
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
  const limits = textLimits(template);
  const title = truncateText(scene.title, limits.title);
  const body = truncateText(scene.body, limits.body);

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
        justifyContent: 'cover_topics' === template ? 'flex-end' : 'center',
        gap: 'narrated_script' === template ? 24 : 30,
        padding: 'cover_topics' === template ? '0 82px 330px' : 'narrated_script' === template ? '0 72px 250px' : '0 82px',
      }}
    >
      {'cover_topics' === template ? (
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(245,213,111,0.92)',
            color: '#17150d',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: 900,
            fontSize: 34,
            marginBottom: 8,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      ) : null}
      <div
        style={{
          color: '#f8f6ee',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 800,
          fontSize: 'narrated_script' === template ? 56 : 'cover_topics' === template ? 86 : 78,
          lineHeight: 'narrated_script' === template ? 1.08 : 1.02,
          letterSpacing: 0,
          textShadow: '0 6px 24px rgba(0,0,0,0.42)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: '#f3eee2',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 'narrated_script' === template ? 48 : 43,
          lineHeight: 'narrated_script' === template ? 1.22 : 1.18,
          letterSpacing: 0,
          textShadow: '0 5px 18px rgba(0,0,0,0.36)',
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const AstroSocialVideo: React.FC<RenderInput> = (input) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const scenes = safeScenes(input);
  const template = videoTemplate(input);
  const sceneLength = Math.max(1, Math.floor(durationInFrames / scenes.length));
  const activeScene = Math.min(scenes.length - 1, Math.floor(frame / sceneLength));
  const musicVolume = Math.max(0, Math.min(0.6, Number(input.musicVolume ?? 0.18)));
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
        background: templateBackground(template),
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
          template={template}
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

      {input.musicUrl ? <Audio src={input.musicUrl} volume={musicVolume} loop /> : null}
      {input.audioUrl ? <Audio src={input.audioUrl} volume={0.92} /> : null}
    </AbsoluteFill>
  );
};
