export type PreAuthRecord = {
  id: string
  patientName: string | null
  aadhaarLast4: string | null
  diagnosis: string | null
  packageName: string | null
  estimatedCost: number | null
}

export type AiCheck = { ok: true } | { ok: false; message: string }

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatAadhaar(last4: string | null): string {
  return last4 ? `XXXX XXXX ${last4}` : '—'
}

export function formatRupees(amount: number | null): string {
  return amount === null ? '—' : `₹ ${inrFormatter.format(amount)}`
}

// Simulated until the real AI check exists: cardiac cases need an angiogram report on file.
const CARDIAC_PATTERN = /cardi|coronary|angio|heart|myocard|\bcad\b|\bptca\b|\bcabg\b|stent/i

export function simulateAiCheck(record: PreAuthRecord): AiCheck {
  const text = `${record.diagnosis ?? ''} ${record.packageName ?? ''}`
  return CARDIAC_PATTERN.test(text) ? { ok: false, message: 'Angiogram report missing' } : { ok: true }
}
