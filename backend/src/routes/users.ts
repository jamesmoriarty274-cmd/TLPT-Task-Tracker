import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';

export async function usersRoutes(server: FastifyInstance) {
  // list users (admin only)
  server.get('/', { preValidation: [server.authenticate] }, async (request: any, reply: FastifyReply) => {
    if (request.user.role !== 'ADMIN') return reply.status(403).send({ message: 'Forbidden' });
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
    return reply.send(users);
  });
}
