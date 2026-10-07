import express, { type NextFunction, type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { aadhaarLast4 } from './aadhaar.js'

const PORT = Number(process.env.PORT ?? 4100)

const prisma = new PrismaClient()
const app = express()
app.use(express.json({ limit: '100kb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/pre-auth-batch', async (_req, res) => {
  const rows = await prisma.amala.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(
    rows.map((row) => ({
      id: row.id,
      patientName: row.patientName,
      aadhaarLast4: aadhaarLast4(row.aadhaarNumber),
      diagnosis: row.diagnosis,
      packageName: row.packageName,
      estimatedCost: row.estimatedCost === null ? null : row.estimatedCost.toNumber(),
      dateOfAdmission: row.dateOfAdmission,
      createdAt: row.createdAt,
    })),
  )
})

const approveBatchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Select at least one record').max(500),
})

app.post('/api/approve-batch', async (req, res) => {
  const parsed = approveBatchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' })
    return
  }

  const ids = [...new Set(parsed.data.ids)]
  const found = await prisma.amala.findMany({ where: { id: { in: ids } }, select: { id: true } })
  const foundIds = new Set(found.map((r) => r.id))
  const missing = ids.filter((id) => !foundIds.has(id))
  if (missing.length > 0) {
    res.status(404).json({ error: 'Some records no longer exist', missing })
    return
  }

  // Placeholder: this is where the bot automation workflow will be triggered.
  console.log(`[approve-batch] ${new Date().toISOString()} approved ${ids.length} record(s):`, ids)

  res.json({ approved: ids })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Staff dashboard API listening on http://localhost:${PORT}`)
})
