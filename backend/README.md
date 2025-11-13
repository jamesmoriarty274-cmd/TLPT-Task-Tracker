# TLPT Backend - quick start

## Setup (with Docker)
1. Copy .env.example to .env if needed.
2. docker compose up --build
3. After containers are up:
   - Exec into backend and run migrations:
     docker exec -it <backend_container_name> npx prisma migrate dev --name init
     docker exec -it <backend_container_name> npx ts-node prisma/seed.ts
4. API endpoints:
   - POST /api/auth/register
   - POST /api/auth/login
   - GET  /api/auth/me
   - GET  /api/users/  (admin only)
