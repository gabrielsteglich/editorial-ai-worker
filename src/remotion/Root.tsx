import React from 'react';
import {Composition} from 'remotion';
import {AstroSocialVideo} from './AstroSocialVideo.js';
import {SocialArtCover} from './SocialArtCover.js';
import type {RenderInput, SocialArtInput} from '../types.js';

const defaultProps: RenderInput = {
  title: 'Céu do momento',
  caption: 'Um convite para observar os ciclos com mais consciência.',
  cta: 'Calcule seu mapa astral gratuito',
  brand: 'Toque de Despertar',
  durationSeconds: 30,
  audioUrl: '',
  scenes: [
    {
      title: 'Céu do momento',
      body: 'Observe o que pede presença, escuta e escolha consciente.',
    },
  ],
};

const defaultSocialArtProps: SocialArtInput & {format: 'square' | 'vertical'} = {
  postId: 0,
  baseImageUrl: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg',
  title: 'Céu do momento',
  subtitle: 'um convite para presença e escolha consciente',
  badge: 'Astrologia',
  brand: 'Toque de Despertar',
  formats: ['square', 'vertical'],
  template: 'editorial-cover-v1',
  format: 'vertical',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AstroSocialVideo"
        component={AstroSocialVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={({props}) => ({
          durationInFrames: Math.round(Math.max(15, Math.min(45, Number(props.durationSeconds || 30))) * 30),
          props,
        })}
      />
      <Composition
        id="SocialArtSquare"
        component={SocialArtCover}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{...defaultSocialArtProps, format: 'square'}}
      />
      <Composition
        id="SocialArtVertical"
        component={SocialArtCover}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{...defaultSocialArtProps, format: 'vertical'}}
      />
    </>
  );
};
