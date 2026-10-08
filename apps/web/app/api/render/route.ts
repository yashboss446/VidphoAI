import { NextResponse } from 'next/server';
import { requireProjectAccess, UnauthorizedError, NotFoundError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { renderQueue } from '@/lib/queue';

export async function POST(req: Request) {
  const { projectId, editPlanRecordId } = await req.json();
  if (!projectId || !editPlanRecordId) {
    return NextResponse.json({ error: 'projectId and editPlanRecordId are required' }, { status: 400 });
  }

  try {
    await requireProjectAccess(projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const editPlanRecord = await prisma.editPlanRecord.findUnique({ where: { id: editPlanRecordId } });
  if (!editPlanRecord || editPlanRecord.projectId !== projectId) {
    return NextResponse.json({ error: 'EditPlan not found' }, { status: 404 });
  }

  const renderJob = await prisma.renderJob.create({
    data: { projectId, editPlanId: editPlanRecordId, status: 'queued' },
  });

  await renderQueue.add('render', {
    renderJobId: renderJob.id,
    projectId,
    editPlanId: editPlanRecordId,
  });

  return NextResponse.json({ renderJob });
}
