import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  const project = await prisma.project.create({
    data: { name: name || 'Untitled project', userId: session.user.id },
  });
  return NextResponse.json({ project });
}
