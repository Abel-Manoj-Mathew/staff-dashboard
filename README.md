# Staff dashboard

A separate app for hospital staff to review and approve the pre-authorisation batch. It reads the
`amala` table from the same PostgreSQL database that the patient-registration app
(`../hospital-patient-reg`) uses.

| Part     | Stack                                 | Dev URL               |
| -------- | ------------------------------------- | --------------------- |
| `server` | Node, Express 5, Prisma               | http://localhost:4100 |
| `client` | Vite, React, TypeScript, Tailwind CSS | http://localhost:5190 |

The client proxies `/api` to the server, so it doesn't need any CORS setup.

## Setup

```bash
cd server
cp .env.example .env   # set DATABASE_URL (and AADHAAR_ENCRYPTION_KEY if hospital-patient-reg/server uses one)
npm install            # also runs `prisma generate`
npm run dev
```

```bash
cd client
npm install
npm run dev
```

## API

- `GET /api/pre-auth-batch`: returns every `amala` row. The Aadhaar number is decrypted on the
  server, and only its last 4 digits are sent (`aadhaarLast4`).
- `POST /api/approve-batch` with body `{ "ids": ["<amala uuid>", ...] }`: checks that the records
  exist and logs their IDs. This is a placeholder for the bot automation workflow.

## Database schema

`server/prisma/schema.prisma` is a copy of the `Amala` model from
`hospital-patient-reg/server/prisma/schema.prisma`. The tables and migrations belong to that app.
**Never run `prisma migrate` or `prisma db push` here.** This schema only knows about `amala`, so
Prisma would try to drop every other table. If the `Amala` model changes there, copy the change here
and run `npm run prisma:generate`.
