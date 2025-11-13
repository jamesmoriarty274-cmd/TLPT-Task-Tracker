import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';

export async function authRoutes(server: FastifyInstance) {
  // register
  server.post('/register', async (request: FastifyRequest<{ Body: { name: string; email: string; password: string; role?: string } }>, reply: FastifyReply) => {
    const { name, email, password, role } = request.body as any;
    if (!name || !email || !password) return reply.status(400).send({ message: 'Missing fields' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return reply.status(400).send({ message: 'Email exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || 'USER' } });
    return reply.send({ user });
  });

  // login
  server.post('/login', async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
    const { email, password } = request.body as any;
    if (!email || !password) return reply.status(400).send({ message: 'Missing email/password' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.status(401).send({ message: 'Invalid credentials' });

    const token = server.jwt.sign({ userId: user.id, role: user.role, name: user.name });
    return reply.send({ accessToken: token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // whoami
  server.get('/me', { preValidation: [server.authenticate] }, async (request: any, reply: FastifyReply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.userId } });
    return reply.send({ user });
  });
}
