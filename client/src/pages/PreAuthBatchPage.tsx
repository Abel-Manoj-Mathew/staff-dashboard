import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, CircleAlert, CircleCheck, Inbox, IndianRupee, Layers, ListChecks, RefreshCw, Search, X } from 'lucide-react'
import { AppHeader } from '../components/AppHeader.tsx'
import { StatCard } from '../components/StatCard.tsx'
import { formatAadhaar, formatRupees, type PreAuthRecord } from '../lib/preAuth.ts'

type Notice = { kind: 'success' | 'error'; text: string }

const COLUMN_COUNT = 6
const checkboxClass = 'size-4 cursor-pointer rounded border-slate-300 accent-desk-teal'

export function PreAuthBatchPage() {
  const [records, setRecords] = useState<PreAuthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [approving, setApproving] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    fetch('/api/pre-auth-batch', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        const data = (await res.json()) as PreAuthRecord[]
        setRecords(data)
        // Drop selections for records that are no longer in the batch.
        const ids = new Set(data.map((r) => r.id))
        setSelected((prev) => new Set([...prev].filter((id) => ids.has(id))))
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(err instanceof Error ? err.message : 'Could not load the batch')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const totalEstimate = records.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0)

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) =>
      [r.patientName, r.diagnosis, r.packageName, r.aadhaarLast4].some((v) => v?.toLowerCase().includes(q)),
    )
  }, [records, query])

  const selectedCount = selected.size
  const selectedEstimate = records.reduce((sum, r) => (selected.has(r.id) ? sum + (r.estimatedCost ?? 0) : sum), 0)
  const visibleSelectedCount = visibleRows.filter((r) => selected.has(r.id)).length
  const allVisibleSelected = visibleRows.length > 0 && visibleSelectedCount === visibleRows.length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = visibleSelectedCount > 0 && !allVisibleSelected
    }
  }, [visibleSelectedCount, allVisibleSelected])

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const r of visibleRows) {
        if (allVisibleSelected) next.delete(r.id)
        else next.add(r.id)
      }
      return next
    })
  }

  async function approveSelected() {
    if (selectedCount === 0 || approving) return
    setApproving(true)
    setNotice(null)
    try {
      const res = await fetch('/api/approve-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      })
      const body = (await res.json().catch(() => ({}))) as { approved?: string[]; error?: string }
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
      const count = body.approved?.length ?? selectedCount
      setNotice({ kind: 'success', text: `${count} claim${count === 1 ? '' : 's'} approved and sent for pre-authorisation.` })
      setSelected(new Set())
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Approval failed' })
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Claims / Pre-authorisation</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pre-authorisation approvals</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review the AI-matched packages from the ERP and approve claims for submission.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Claims in batch" value={String(records.length)} icon={Layers} tone="slate" loading={loading} />
          <StatCard label="Selected for approval" value={String(selectedCount)} icon={ListChecks} tone="green" loading={loading} />
          <StatCard label="Total estimate" value={formatRupees(totalEstimate)} icon={IndianRupee} tone="teal" loading={loading} />
        </div>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-desk-navy px-4 py-3">
            <h2 className="text-[15px] font-bold text-white">Pre-authorisation batch — review and approve</h2>
            <button
              type="button"
              onClick={approveSelected}
              disabled={selectedCount === 0 || approving}
              className="inline-flex items-center gap-0.5 rounded-md bg-desk-teal px-3.5 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-desk-teal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-desk-teal"
            >
              {approving ? 'Approving…' : `Approve selected (${selectedCount})`}
              <ChevronRight className="size-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <div className="flex justify-end border-b border-slate-200 px-4 py-3">
            <label className="relative block w-full sm:w-64">
              <span className="sr-only">Search claims</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search claims"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-desk-teal focus:ring-2 focus:ring-desk-teal/20 focus:outline-none"
              />
            </label>
          </div>

          {notice && (
            <div
              role="status"
              className={`flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[13px] ${
                notice.kind === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <span className="flex items-center gap-2">
                {notice.kind === 'success' ? (
                  <CircleCheck className="size-4" aria-hidden />
                ) : (
                  <CircleAlert className="size-4" aria-hidden />
                )}
                {notice.text}
              </span>
              <button type="button" onClick={() => setNotice(null)} className="rounded p-0.5 hover:bg-black/5" aria-label="Dismiss">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th scope="col" className="w-11 py-2.5 pr-2 pl-4">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      aria-label="Select all visible claims"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      disabled={visibleRows.length === 0}
                      className={checkboxClass}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2.5">Patient</th>
                  <th scope="col" className="px-3 py-2.5">Aadhaar</th>
                  <th scope="col" className="px-3 py-2.5">Diagnosis (ERP)</th>
                  <th scope="col" className="px-3 py-2.5">AI Package</th>
                  <th scope="col" className="py-2.5 pr-4 pl-3">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading &&
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      {Array.from({ length: COLUMN_COUNT }, (_, j) => (
                        <td key={j} className={j === 0 ? 'py-3 pr-2 pl-4' : 'px-3 py-3'}>
                          <span className={`block h-3.5 animate-pulse rounded bg-slate-200 ${j === 0 ? 'w-4' : 'w-3/4'}`} />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!loading && loadError && (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-12 text-center">
                      <CircleAlert className="mx-auto size-6 text-red-500" aria-hidden />
                      <p className="mt-2 font-medium text-slate-900">Couldn't load the batch</p>
                      <p className="mt-0.5 text-slate-500">{loadError}</p>
                      <button
                        type="button"
                        onClick={() => setReloadKey((k) => k + 1)}
                        className="mt-3 text-[13px] font-semibold text-desk-package hover:underline"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                )}

                {!loading && !loadError && visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-4 py-12 text-center">
                      <Inbox className="mx-auto size-6 text-slate-400" aria-hidden />
                      <p className="mt-2 font-medium text-slate-900">
                        {records.length === 0 ? 'No claims waiting for approval' : 'No claims match your search'}
                      </p>
                      <p className="mt-0.5 text-slate-500">
                        {records.length === 0
                          ? 'New claims appear here once patients complete registration.'
                          : 'Try a different search.'}
                      </p>
                    </td>
                  </tr>
                )}

                {!loading &&
                  !loadError &&
                  visibleRows.map((row) => {
                    const isSelected = selected.has(row.id)
                    return (
                      <tr
                        key={row.id}
                        onClick={() => toggleRow(row.id)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-2.5 pr-2 pl-4">
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.patientName ?? 'claim'}`}
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={checkboxClass}
                          />
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-900">{row.patientName ?? '—'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 tabular-nums">
                          {formatAadhaar(row.aadhaarLast4)}
                        </td>
                        <td className="px-3 py-2.5">{row.diagnosis ?? '—'}</td>
                        <td className="px-3 py-2.5 font-bold text-desk-package">{row.packageName ?? '—'}</td>
                        <td className="py-2.5 pr-4 pl-3 whitespace-nowrap text-slate-900 tabular-nums">
                          {formatRupees(row.estimatedCost)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[12px] text-slate-500">
            <span>
              Showing {loading ? 0 : visibleRows.length} of {records.length} claim{records.length === 1 ? '' : 's'}
            </span>
            {selectedCount > 0 && (
              <span className="font-medium text-slate-700">
                {selectedCount} selected · {formatRupees(selectedEstimate)}
              </span>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
