import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { presignDownload } from '@/lib/s3';

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const renderJob = await prisma.renderJob.findUnique({ where: { id: params.jobId } });
  if (!renderJob) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const project = await prisma.project.findUnique({ where: { id: renderJob.projectId } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let downloadUrl: string | undefined;
  if (renderJob.status === 'completed' && renderJob.outputKey) {
    downloadUrl = await presignDownload(renderJob.outputKey);
  }

  return NextResponse.json({ renderJob, downloadUrl });
}
