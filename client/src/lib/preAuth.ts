export type PreAuthRecord = {
  id: string
  patientName: string | null
  aadhaarLast4: string | null
  diagnosis: string | null
  packageName: string | null
  estimatedCost: number | null
}

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatAadhaar(last4: string | null): string {
  return last4 ? `XXXX XXXX ${last4}` : '—'
}

export function formatRupees(amount: number | null): string {
  return amount === null ? '—' : `₹ ${inrFormatter.format(amount)}`
}
