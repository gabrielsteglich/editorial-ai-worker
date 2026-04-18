import fs from 'node:fs/promises';
import path from 'node:path';
import {jobsDir, mediaDir} from './paths.js';
import type {WorkerJob} from './types.js';

export const ensureStorage = async () => {
  await fs.mkdir(jobsDir, {recursive: true});
  await fs.mkdir(mediaDir, {recursive: true});
};

export const jobPath = (id: string) => path.join(jobsDir, `${id}.json`);

export const readJob = async (id: string): Promise<WorkerJob | null> => {
  try {
    const raw = await fs.readFile(jobPath(id), 'utf8');
    return JSON.parse(raw) as WorkerJob;
  } catch {
    return null;
  }
};

export const writeJob = async (job: WorkerJob) => {
  await ensureStorage();
  await fs.writeFile(jobPath(job.id), JSON.stringify(job, null, 2), 'utf8');
};

export const updateJob = async (id: string, patch: Partial<WorkerJob>) => {
  const job = await readJob(id);
  if (!job) {
    return null;
  }

  const updated = {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
  } as WorkerJob;
  await writeJob(updated);
  return updated;
};
