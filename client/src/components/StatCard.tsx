import type { LucideIcon } from 'lucide-react'

const tones = {
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-desk-package',
}

type StatCardProps = {
  label: string
  value: string
  icon: LucideIcon
  tone: keyof typeof tones
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, tone, loading }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {loading ? (
          <span className="mt-1.5 block h-5 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="mt-0.5 truncate text-xl font-semibold text-slate-900 tabular-nums">{value}</p>
        )}
      </div>
    </div>
  )
}
