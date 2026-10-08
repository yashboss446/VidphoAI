import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { prisma } from '@editor/db';
import { putObjectBytes, presignDownload } from '@editor/storage';
import { EditPlanSchema } from '@editor/edit-schema';
import type { RenderJobPayload } from './queue';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The composition entry lives in a shared package so both the browser preview
// (@remotion/player) and this server-side renderer render the exact same EditPlan.
const ENTRY_POINT = resolve(__dirname, '../../../packages/remotion-composition/src/Root.tsx');

let cachedServeUrl: string | null = null;
async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  cachedServeUrl = await bundle({ entryPoint: ENTRY_POINT });
  return cachedServeUrl;
}

export async function processRenderJob(payload: RenderJobPayload) {
  const { renderJobId, projectId, editPlanId } = payload;

  await prisma.renderJob.update({
    where: { id: renderJobId },
    data: { status: 'processing', progress: 0 },
  });

  try {
    const editPlanRecord = await prisma.editPlanRecord.findUnique({ where: { id: editPlanId } });
    if (!editPlanRecord) throw new Error(`EditPlan record ${editPlanId} not found`);
    const editPlan = EditPlanSchema.parse(editPlanRecord.dataJson);

    const mediaAssets = await prisma.mediaAsset.findMany({ where: { projectId } });
    const assetUrls: Record<string, string> = {};
    for (const asset of mediaAssets) {
      assetUrls[asset.id] = await presignDownload(asset.s3Key);
    }

    const serveUrl = await getServeUrl();
    const composition = await selectComposition({
      serveUrl,
      id: 'EditPlan',
      inputProps: { editPlan, assetUrls },
    });

    const tmpDir = await mkdtemp(join(tmpdir(), 'editor-render-'));
    const outputLocation = join(tmpDir, `${renderJobId}.mp4`);

    try {
      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation,
        inputProps: { editPlan, assetUrls },
        onProgress: async ({ progress }) => {
          await prisma.renderJob.update({
            where: { id: renderJobId },
            data: { progress: Math.round(progress * 100) },
          });
        },
      });

      const outputBytes = await readFile(outputLocation);
      const outputKey = `renders/${renderJobId}.mp4`;
      await putObjectBytes(outputKey, outputBytes, 'video/mp4');

      await prisma.renderJob.update({
        where: { id: renderJobId },
        data: { status: 'completed', progress: 100, outputKey },
      });
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  } catch (err) {
    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: { status: 'failed', error: err instanceof Error ? err.message : 'Unknown render error' },
    });
    throw err;
  }
}
