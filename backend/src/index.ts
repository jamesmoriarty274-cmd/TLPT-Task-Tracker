import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

dotenv.config();

import { authRoutes } from './routes/auth';
import { usersRoutes } from './routes/users';

const server = Fastify({ logger: true });

// Plugins
server.register(cors, { origin: true });
server.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

// Simple authenticate decorator (typed as any for now)
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}
server.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(usersRoutes, { prefix: '/api/users' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
