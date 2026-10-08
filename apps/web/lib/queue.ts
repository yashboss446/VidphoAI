import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const RENDER_QUEUE_NAME = 'render-jobs';

export const renderQueue = new Queue(RENDER_QUEUE_NAME, { connection });

export interface RenderJobPayload {
  renderJobId: string;
  projectId: string;
  editPlanId: string;
}
