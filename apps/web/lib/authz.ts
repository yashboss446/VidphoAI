import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export class UnauthorizedError extends Error {}
export class NotFoundError extends Error {}

/** Verifies the current session owns the given project, or throws. */
export async function requireProjectAccess(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new UnauthorizedError();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError();
  if (project.userId !== session.user.id) throw new UnauthorizedError();

  return { session, project };
}
