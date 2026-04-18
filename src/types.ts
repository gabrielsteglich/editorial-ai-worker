export type VideoScene = {
  title: string;
  body: string;
};

export type VideoTemplate = 'editorial_astro' | 'cover_topics' | 'narrated_script';
export type VideoSceneSource = 'auto' | 'carousel' | 'reel_script' | 'article_summary';

export type RenderInput = {
  postId?: number;
  title: string;
  caption?: string;
  cta?: string;
  brand?: string;
  scenes: VideoScene[];
  hashtags?: string[];
  durationSeconds?: number;
  audioUrl?: string;
  template?: VideoTemplate;
  sceneSource?: VideoSceneSource;
  maxScenes?: number;
};

export type RenderJobStatus = 'queued' | 'rendering' | 'completed' | 'failed';

export type RenderJob = {
  id: string;
  status: RenderJobStatus;
  progress: number;
  input: RenderInput;
  outputUrl?: string;
  coverUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type SocialArtFormat = 'square' | 'vertical';

export type SocialArtInput = {
  postId?: number;
  baseImageUrl: string;
  title: string;
  subtitle?: string;
  badge?: string;
  brand?: string;
  formats?: SocialArtFormat[];
  template?: string;
};

export type SocialArtResult = {
  squareUrl?: string;
  verticalUrl?: string;
  template: string;
};

export type SocialArtJob = {
  id: string;
  status: RenderJobStatus;
  progress: number;
  input: SocialArtInput;
  squareUrl?: string;
  verticalUrl?: string;
  template?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkerJob = RenderJob | SocialArtJob;
