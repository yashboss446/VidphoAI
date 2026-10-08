import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { RENDER_QUEUE_NAME, type RenderJobPayload } from './queue';
import { processRenderJob } from './renderJob';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6380', {
  maxRetriesPerRequest: null,
});

const worker = new Worker<RenderJobPayload>(
  RENDER_QUEUE_NAME,
  async (job) => {
    console.log(`Rendering job ${job.id} (renderJob ${job.data.renderJobId})`);
    await processRenderJob(job.data);
  },
  { connection, concurrency: 1 },
);

worker.on('completed', (job) => console.log(`Render job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Render job ${job?.id} failed:`, err));

console.log('Render worker listening on queue:', RENDER_QUEUE_NAME);
