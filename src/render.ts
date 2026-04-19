import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mediaDir, remotionEntry} from './paths.js';
import {ensureStorage, readJob, updateJob} from './storage.js';
import type {RenderInput, SocialArtFormat, SocialArtInput, SocialArtResult, SocialArtSlide, VideoSceneSource, VideoTemplate} from './types.js';

const compositionId = 'AstroSocialVideo';
const socialArtCompositionIds: Record<SocialArtFormat, string> = {
  square: 'SocialArtSquare',
  vertical: 'SocialArtVertical',
  portrait: 'SocialArtPortrait',
};

const webpackOverride = (config: any) => ({
  ...config,
  resolve: {
    ...(config.resolve || {}),
    extensionAlias: {
      ...(config.resolve?.extensionAlias || {}),
      '.js': ['.js', '.ts', '.tsx'],
    },
  },
});

const normalizeInput = (input: RenderInput): RenderInput => {
  const maxScenes = Math.max(3, Math.min(8, Number(input.maxScenes || 5)));
  const scenes = Array.isArray(input.scenes)
    ? input.scenes
        .filter((scene) => scene && typeof scene.title === 'string' && typeof scene.body === 'string')
        .slice(0, maxScenes)
    : [];
  const template = ['editorial_astro', 'cover_topics', 'narrated_script'].includes(String(input.template))
    ? input.template as VideoTemplate
    : 'editorial_astro';
  const sceneSource = ['auto', 'carousel', 'reel_script', 'article_summary'].includes(String(input.sceneSource))
    ? input.sceneSource as VideoSceneSource
    : 'auto';

  return {
    title: input.title || 'Céu do momento',
    caption: input.caption || '',
    cta: input.cta || 'Calcule seu mapa astral gratuito',
    brand: input.brand || 'Toque de Despertar',
    durationSeconds: Math.max(15, Math.min(45, Number(input.durationSeconds || 30))),
    hashtags: Array.isArray(input.hashtags) ? input.hashtags.slice(0, 8) : [],
    postId: input.postId,
    audioUrl: input.audioUrl || '',
    musicUrl: input.musicUrl || '',
    musicVolume: Math.max(0, Math.min(0.6, Number(input.musicVolume ?? 0.18))),
    template,
    sceneSource,
    maxScenes,
    scenes: scenes.length > 0 ? scenes : [{title: input.title || 'Céu do momento', body: input.caption || ''}],
  };
};

export const renderVideo = async (jobId: string, input: RenderInput, publicBaseUrl: string) => {
  await ensureStorage();
  const normalizedInput = normalizeInput(input);
  await updateJob(jobId, {status: 'rendering', progress: 0.05});

  const serveUrl = await bundle({
    entryPoint: remotionEntry,
    webpackOverride,
  });

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps: normalizedInput,
  });

  const outputLocation = path.join(mediaDir, `${jobId}.mp4`);
  const coverLocation = path.join(mediaDir, `${jobId}.jpg`);

  await renderStill({
    composition,
    serveUrl,
    inputProps: normalizedInput,
    output: coverLocation,
    frame: 45,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps: normalizedInput,
    crf: 18,
    imageFormat: 'jpeg',
    jpegQuality: 88,
    concurrency: '50%',
    onProgress: ({progress}) => {
      void updateJob(jobId, {progress: Math.max(0.05, Math.min(0.98, progress))});
    },
  });

  const base = publicBaseUrl.replace(/\/$/, '');
  const currentJob = await readJob(jobId);
  if (currentJob?.status === 'failed') {
    return;
  }

  await updateJob(jobId, {
    status: 'completed',
    progress: 1,
    outputUrl: `${base}/media/${jobId}.mp4`,
    coverUrl: `${base}/media/${jobId}.jpg`,
  });
};

const normalizeSocialArtInput = (input: SocialArtInput): SocialArtInput => {
  const defaultFormats: SocialArtFormat[] = ['square', 'vertical'];
  const formats: SocialArtFormat[] = Array.isArray(input.formats) && input.formats.length > 0
    ? input.formats.filter((format): format is SocialArtFormat => 'square' === format || 'vertical' === format || 'portrait' === format)
    : defaultFormats;
  const slides: SocialArtSlide[] = Array.isArray(input.slides)
    ? input.slides
        .filter((slide) => slide && typeof slide.title === 'string' && typeof slide.body === 'string')
        .slice(0, 10)
    : [];

  return {
    postId: input.postId,
    baseImageUrl: input.baseImageUrl,
    title: input.title || 'Céu do momento',
    subtitle: input.subtitle || '',
    badge: input.badge || 'Astrologia',
    brand: input.brand || 'Toque de Despertar',
    formats: formats.length > 0 ? Array.from(new Set(formats)) : defaultFormats,
    template: input.template || 'editorial-cover-v1',
    slides,
    layout: input.layout || 'cover',
    slideIndex: Number(input.slideIndex || 0),
    slideCount: Number(input.slideCount || slides.length || 1),
  };
};

export const renderSocialArt = async (jobId: string, input: SocialArtInput, publicBaseUrl: string): Promise<SocialArtResult> => {
  await ensureStorage();
  const normalizedInput = normalizeSocialArtInput(input);
  const serveUrl = await bundle({
    entryPoint: remotionEntry,
    webpackOverride,
  });

  const result: SocialArtResult = {
    template: normalizedInput.template || 'editorial-cover-v1',
  };

  for (const format of normalizedInput.formats || []) {
    const composition = await selectComposition({
      serveUrl,
      id: socialArtCompositionIds[format],
      inputProps: {...normalizedInput, format},
    });
    const extension = 'jpg';
    const outputLocation = path.join(mediaDir, `${jobId}-${format}.${extension}`);
    const imageFormat = 'jpeg';

    await renderStill({
      composition,
      serveUrl,
      inputProps: {...normalizedInput, format},
      output: outputLocation,
      frame: 0,
      imageFormat,
      jpegQuality: 90,
    });

    const base = publicBaseUrl.replace(/\/$/, '');
    if ('square' === format) {
      result.squareUrl = `${base}/media/${jobId}-${format}.${extension}`;
    }
    if ('vertical' === format) {
      result.verticalUrl = `${base}/media/${jobId}-${format}.${extension}`;
    }
  }

  if (normalizedInput.slides && normalizedInput.slides.length > 0) {
    result.carouselUrls = [];
    const base = publicBaseUrl.replace(/\/$/, '');
    const composition = await selectComposition({
      serveUrl,
      id: socialArtCompositionIds.portrait,
      inputProps: {...normalizedInput, format: 'portrait'},
    });

    for (const [index, slide] of normalizedInput.slides.entries()) {
      const outputLocation = path.join(mediaDir, `${jobId}-carousel-${index + 1}.jpg`);
      await renderStill({
        composition,
        serveUrl,
        inputProps: {
          ...normalizedInput,
          format: 'portrait',
          layout: 'narrative',
          slideIndex: index,
          slideCount: normalizedInput.slides.length,
          title: slide.title,
          subtitle: slide.body,
        },
        output: outputLocation,
        frame: 0,
        imageFormat: 'jpeg',
        jpegQuality: 90,
      });
      result.carouselUrls.push(`${base}/media/${jobId}-carousel-${index + 1}.jpg`);
    }
  }

  return result;
};

if (process.argv[1]?.endsWith('render.ts') || process.argv[1]?.endsWith('render.js')) {
  const raw = process.env.TDDR_VIDEO_INPUT_JSON;
  const jobId = process.env.TDDR_VIDEO_JOB_ID || `manual-${Date.now()}`;
  const publicBaseUrl = process.env.TDDR_VIDEO_PUBLIC_BASE_URL || 'http://127.0.0.1:4788';
  if (!raw) {
    throw new Error('TDDR_VIDEO_INPUT_JSON is required');
  }
  await renderVideo(jobId, JSON.parse(raw) as RenderInput, publicBaseUrl);
}
