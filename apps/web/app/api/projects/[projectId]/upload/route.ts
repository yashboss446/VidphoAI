import { NextResponse } from 'next/server';
import { requireProjectAccess, UnauthorizedError, NotFoundError } from '@/lib/authz';
import { objectKeyFor, presignUpload } from '@/lib/s3';

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    await requireProjectAccess(params.projectId);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw e;
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 });
  }

  const key = objectKeyFor(params.projectId, filename);
  const uploadUrl = await presignUpload(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
