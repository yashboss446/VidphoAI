import { NextResponse } from 'next/server';
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { requireProjectAccess, UnauthorizedError, NotFoundError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { objectKeyFor, presignDownload, getObjectBytes, putObjectBytes } from '@/lib/s3';
import { probeFile, generateThumbnail } from '@/lib/mediaProbe';
import type { MediaKind } from '@editor/db';

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    await requireProjectAccess(params.projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const mediaAssets = await prisma.mediaAsset.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: 'asc' },
  });

  const withUrls = await Promise.all(
    mediaAssets.map(async (asset) => ({
      ...asset,
      url: await presignDownload(asset.s3Key),
      thumbnailUrl: asset.thumbnailKey ? await presignDownload(asset.thumbnailKey) : null,
    })),
  );

  return NextResponse.json({ mediaAssets: withUrls });
}

function kindFromContentType(contentType: string): MediaKind {
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  return 'image';
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    await requireProjectAccess(params.projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const { key, filename, contentType } = await req.json();
  if (!key || !filename || !contentType) {
    return NextResponse.json({ error: 'key, filename and contentType are required' }, { status: 400 });
  }

  const kind = kindFromContentType(contentType);
  const tmpDir = await mkdtemp(join(tmpdir(), 'editor-media-'));
  const localPath = join(tmpDir, filename);

  try {
    const bytes = await getObjectBytes(key);
    await writeFile(localPath, bytes);

    let durationSec: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    let fps: number | undefined;
    let thumbnailKey: string | undefined;

    if (kind === 'video' || kind === 'audio') {
      const probe = await probeFile(localPath);
      durationSec = probe.durationSec;
      width = probe.width;
      height = probe.height;
      fps = probe.fps;
    }

    if (kind === 'video') {
      const thumbPath = join(tmpDir, 'thumb.jpg');
      await generateThumbnail(localPath, thumbPath);
      const thumbBytes = await readFile(thumbPath);
      thumbnailKey = objectKeyFor(params.projectId, 'thumb.jpg');
      await putObjectBytes(thumbnailKey, thumbBytes, 'image/jpeg');
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        projectId: params.projectId,
        kind,
        s3Key: key,
        originalName: filename,
        durationSec,
        width,
        height,
        fps,
        thumbnailKey,
      },
    });

    return NextResponse.json({ mediaAsset });
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
