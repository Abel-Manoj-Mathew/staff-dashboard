import { Stethoscope } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="bg-desk-navy">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <span className="grid size-8 place-items-center rounded-lg bg-desk-teal text-white">
          <Stethoscope className="size-4.5" aria-hidden />
        </span>
        <span className="text-[15px] font-semibold text-white">Medisep Claim Desk</span>
        <span className="h-5 w-px bg-white/20" aria-hidden />
        <nav className="flex items-center gap-1">
          <span className="rounded-md bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white">Approvals</span>
        </nav>
      </div>
    </header>
  )
}
