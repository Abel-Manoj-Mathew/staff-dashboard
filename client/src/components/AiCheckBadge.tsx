import { AlertTriangle, Check } from 'lucide-react'
import type { AiCheck } from '../lib/preAuth.ts'

export function AiCheckBadge({ check }: { check: AiCheck }) {
  if (check.ok) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-green-700">
        <Check className="size-3" strokeWidth={3} aria-hidden />
        Complete
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-orange-700">
      <AlertTriangle className="size-3" strokeWidth={2.5} aria-hidden />
      {check.message}
    </span>
  )
}
