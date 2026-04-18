import path from 'node:path';
import {fileURLToPath} from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const srcDir = path.dirname(currentFile);
const runningFromDist = path.basename(srcDir) === 'dist';

export const projectRoot = path.resolve(srcDir, '..');
export const dataDir = path.join(projectRoot, 'data');
export const jobsDir = path.join(dataDir, 'jobs');
export const publicDir = path.join(projectRoot, 'public');
export const mediaDir = path.join(publicDir, 'media');
export const remotionEntry = path.join(srcDir, 'remotion', runningFromDist ? 'index.js' : 'index.ts');
