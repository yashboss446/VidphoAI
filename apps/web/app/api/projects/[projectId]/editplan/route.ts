import { NextResponse } from 'next/server';
import { requireProjectAccess, UnauthorizedError, NotFoundError } from '@/lib/authz';
import { prisma } from '@/lib/prisma';
import { EditPlanSchema, createEmptyEditPlan } from '@editor/edit-schema';

export async function GET(_req: Request, { params }: { params: { projectId: string } }) {
  try {
    await requireProjectAccess(params.projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const latest = await prisma.editPlanRecord.findFirst({
    where: { projectId: params.projectId },
    orderBy: { version: 'desc' },
  });

  const editPlan = latest ? EditPlanSchema.parse(latest.dataJson) : createEmptyEditPlan();
  return NextResponse.json({ editPlan, recordId: latest?.id ?? null });
}

export async function PUT(req: Request, { params }: { params: { projectId: string } }) {
  try {
    await requireProjectAccess(params.projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const body = await req.json();
  const parsed = EditPlanSchema.safeParse(body.editPlan);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid EditPlan', issues: parsed.error.issues }, { status: 400 });
  }

  // The server owns version numbering so concurrent/duplicate saves never collide
  // on the (projectId, version) unique constraint.
  const latest = await prisma.editPlanRecord.findFirst({
    where: { projectId: params.projectId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (latest?.version ?? -1) + 1;
  const editPlan = { ...parsed.data, version: nextVersion };

  const record = await prisma.editPlanRecord.create({
    data: {
      projectId: params.projectId,
      version: nextVersion,
      dataJson: editPlan,
    },
  });

  return NextResponse.json({ recordId: record.id, editPlan });
}
