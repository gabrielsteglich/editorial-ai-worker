import crypto from 'node:crypto';
import express from 'express';
import {mediaDir} from './paths.js';
import {renderSocialArt, renderVideo} from './render.js';
import {ensureStorage, readJob, updateJob, writeJob} from './storage.js';
import type {RenderInput, RenderJob, SocialArtFormat, SocialArtInput, SocialArtJob} from './types.js';

const app = express();
const port = Number(process.env.PORT || 4788);
const apiKey = process.env.TDDR_VIDEO_API_KEY || '';
const publicBaseUrl = process.env.TDDR_VIDEO_PUBLIC_BASE_URL || `http://127.0.0.1:${port}`;
const serviceVersion = '1.0.0';
const configuredRenderTimeoutMs = Number(process.env.TDDR_VIDEO_RENDER_TIMEOUT_MS || 10 * 60 * 1000);
const renderTimeoutMs = Number.isFinite(configuredRenderTimeoutMs) && configuredRenderTimeoutMs > 0 ? configuredRenderTimeoutMs : 10 * 60 * 1000;

app.use(express.json({limit: '1mb'}));

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};

const requireApiKey: express.RequestHandler = (request, response, next) => {
  if (!apiKey) {
    next();
    return;
  }

  if (request.header('x-tddr-video-key') !== apiKey) {
    response.status(401).json({error: 'unauthorized'});
    return;
  }

  next();
};

const sanitizeInput = (raw: unknown): RenderInput | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const input = raw as Partial<RenderInput>;
  const scenes = Array.isArray(input.scenes)
    ? input.scenes
        .filter((scene) => scene && typeof scene.title === 'string' && typeof scene.body === 'string')
        .map((scene) => ({
          title: String(scene.title).slice(0, 120),
          body: String(scene.body).slice(0, 320),
        }))
        .slice(0, 8)
    : [];

  if (!input.title || scenes.length === 0) {
    return null;
  }

  return {
    postId: Number.isFinite(Number(input.postId)) ? Number(input.postId) : undefined,
    title: String(input.title).slice(0, 140),
    caption: input.caption ? String(input.caption).slice(0, 900) : '',
    cta: input.cta ? String(input.cta).slice(0, 180) : '',
    brand: input.brand ? String(input.brand).slice(0, 80) : 'Toque de Despertar',
    durationSeconds: Number.isFinite(Number(input.durationSeconds)) ? Number(input.durationSeconds) : 30,
    audioUrl: input.audioUrl ? String(input.audioUrl).slice(0, 600) : '',
    hashtags: Array.isArray(input.hashtags)
      ? input.hashtags.map((tag) => String(tag).slice(0, 48)).slice(0, 10)
      : [],
    scenes,
  };
};

const sanitizeSocialArtInput = (raw: unknown): SocialArtInput | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const input = raw as Partial<SocialArtInput>;
  const defaultFormats: SocialArtFormat[] = ['square', 'vertical'];
  const formats: SocialArtFormat[] = Array.isArray(input.formats)
    ? input.formats
        .map((format) => String(format))
        .filter((format): format is SocialArtFormat => 'square' === format || 'vertical' === format)
        .slice(0, 2)
    : defaultFormats;

  if (!input.baseImageUrl || !input.title) {
    return null;
  }

  return {
    postId: Number.isFinite(Number(input.postId)) ? Number(input.postId) : undefined,
    baseImageUrl: String(input.baseImageUrl).slice(0, 900),
    title: String(input.title).slice(0, 120),
    subtitle: input.subtitle ? String(input.subtitle).slice(0, 180) : '',
    badge: input.badge ? String(input.badge).slice(0, 60) : 'Astrologia',
    brand: input.brand ? String(input.brand).slice(0, 80) : 'Toque de Despertar',
    formats: formats.length > 0 ? Array.from(new Set(formats)) : defaultFormats,
    template: input.template ? String(input.template).slice(0, 80) : 'editorial-cover-v1',
  };
};

app.get('/health', requireApiKey, async (_request, response) => {
  try {
    await ensureStorage();
    response.json({
      ok: true,
      service: 'tddr-video-renderer',
      version: serviceVersion,
      publicBaseUrl,
      authRequired: Boolean(apiKey),
      renderTimeoutMs,
      capabilities: {
        video: true,
        socialArt: true,
        asyncJobs: true,
        staticMedia: true,
      },
      storage: {
        ok: true,
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    response.status(500).json({
      ok: false,
      service: 'tddr-video-renderer',
      version: serviceVersion,
      publicBaseUrl,
      authRequired: Boolean(apiKey),
      renderTimeoutMs,
      storage: {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      checkedAt: new Date().toISOString(),
    });
  }
});

app.use('/media', express.static(mediaDir, {
  immutable: true,
  maxAge: '30d',
}));

app.post('/render', requireApiKey, async (request, response) => {
  const input = sanitizeInput(request.body);
  if (!input) {
    response.status(400).json({error: 'invalid_render_input'});
    return;
  }

  await ensureStorage();
  const now = new Date().toISOString();
  const job: RenderJob = {
    id: crypto.randomUUID(),
    status: 'queued',
    progress: 0,
    input,
    createdAt: now,
    updatedAt: now,
  };

  await writeJob(job);
  response.status(202).json(job);

  withTimeout(renderVideo(job.id, input, publicBaseUrl), renderTimeoutMs, 'video_render_timeout').catch(async (error: unknown) => {
    await updateJob(job.id, {
      status: 'failed',
      progress: 1,
      error: error instanceof Error ? error.message : String(error),
    });
  });
});

app.post('/social-art', requireApiKey, async (request, response) => {
  const input = sanitizeSocialArtInput(request.body);
  if (!input) {
    response.status(400).json({error: 'invalid_social_art_input'});
    return;
  }

  await ensureStorage();
  const now = new Date().toISOString();
  const job: SocialArtJob = {
    id: crypto.randomUUID(),
    status: 'queued',
    progress: 0,
    input,
    template: input.template || 'editorial-cover-v1',
    createdAt: now,
    updatedAt: now,
  };

  await writeJob(job);
  response.status(202).json(job);

  await updateJob(job.id, {status: 'rendering', progress: 0.05});
  withTimeout(renderSocialArt(job.id, input, publicBaseUrl), renderTimeoutMs, 'social_art_render_timeout')
    .then(async (result) => {
      await updateJob(job.id, {
        status: 'completed',
        progress: 1,
        squareUrl: result.squareUrl,
        verticalUrl: result.verticalUrl,
        template: result.template,
      });
    })
    .catch(async (error: unknown) => {
      await updateJob(job.id, {
        status: 'failed',
        progress: 1,
        error: error instanceof Error ? error.message : String(error),
      });
    });
});

app.get('/jobs/:id', requireApiKey, async (request, response) => {
  const job = await readJob(request.params.id);
  if (!job) {
    response.status(404).json({error: 'job_not_found'});
    return;
  }

  response.json(job);
});

await ensureStorage();
app.listen(port, '0.0.0.0', () => {
  console.log(`TDDR video renderer listening on http://0.0.0.0:${port}`);
});
