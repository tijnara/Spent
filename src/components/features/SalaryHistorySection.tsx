'use client'

import { useState } from 'react'
import { formatManilaDateTime } from '../../lib/date'

export interface SalaryCycleExpense {
    id: string
    amount: number
    note: string | null
    transaction_date: string
    created_at?: string
    categoryName?: string
    categoryIcon?: string
}

export interface SalaryCycle {
    id: string
    salaryAmount: number
    note: string
    startDate: string
    endDate: string | null
    createdAt: string
    endCreatedAt?: string | null
    isActive: boolean
    expenses: SalaryCycleExpense[]
    totalDeducted: number
    remainingSalary: number
    percentLeft: number
}

interface SalaryHistorySectionProps {
    cycles: SalaryCycle[]
}

export default function SalaryHistorySection({ cycles }: SalaryHistorySectionProps) {
    // Exclude the currently active cycle so only closed/historical cycles are shown
    const historicalCycles = cycles.filter((c) => !c.isActive)

    const [expandedCycleId, setExpandedCycleId] = useState<string | null>(
        historicalCycles[0]?.id || null
    )

    // Hide section entirely if there are no closed cycles yet
    if (historicalCycles.length === 0) {
        return null
    }

    function toggleExpand(id: string) {
        setExpandedCycleId((prev) => (prev === id ? null : id))
    }

    return (
        <section className="bg-card border border-card-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div>
                    <h2 className="text-lg font-extrabold text-card-foreground flex items-center gap-2">
                        <span>📜</span>
                        <span>Salary & Expense Cycle History</span>
                    </h2>
                    <p className="text-xs text-muted font-medium mt-0.5">
                        Breakdown with exact timestamps for each closed payroll cycle
                    </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-input-bg border border-input-border rounded-xl text-muted tabular-nums">
                    {historicalCycles.length} Closed {historicalCycles.length === 1 ? 'Cycle' : 'Cycles'}
                </span>
            </div>

            <div className="space-y-4">
                {historicalCycles.map((cycle, index) => {
                    const isExpanded = expandedCycleId === cycle.id

                    return (
                        <div
                            key={cycle.id}
                            className="border rounded-2xl transition-all overflow-hidden border-card-border bg-input-bg/30"
                        >
                            {/* Cycle Summary Card Header */}
                            <div
                                onClick={() => toggleExpand(cycle.id)}
                                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-input-bg/60 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-base text-card-foreground tabular-nums">
                                            ₱{cycle.salaryAmount.toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-card border border-card-border text-muted">
                                            Cycle #{historicalCycles.length - index}
                                        </span>
                                    </div>

                                    {/* Exact Date & Time Range */}
                                    <div className="text-xs text-muted font-medium flex items-center gap-1.5 flex-wrap">
                                        <span>📅 {formatManilaDateTime(cycle.createdAt)}</span>
                                        <span>→</span>
                                        <span>
                                            {cycle.endCreatedAt
                                                ? formatManilaDateTime(cycle.endCreatedAt)
                                                : 'Closed'}
                                        </span>
                                        <span>•</span>
                                        <span>{cycle.note}</span>
                                    </div>
                                </div>

                                {/* Deduction Metrics & Toggle */}
                                <div className="flex items-center justify-between sm:justify-end gap-5">
                                    <div className="text-left sm:text-right">
                                        <span className="text-xs text-muted block font-semibold">
                                            Remaining / Spent
                                        </span>
                                        <div className="flex items-center gap-1.5 font-black text-sm tabular-nums">
                                            <span
                                                className={
                                                    cycle.remainingSalary >= 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-red-500'
                                                }
                                            >
                                                ₱{cycle.remainingSalary.toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                            </span>
                                            <span className="text-xs text-muted font-medium">
                                                (-₱{cycle.totalDeducted.toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })})
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="h-8 w-8 rounded-xl bg-card border border-card-border flex items-center justify-center text-xs font-bold text-muted hover:text-card-foreground transition-transform cursor-pointer"
                                        aria-label="Toggle cycle details"
                                    >
                                        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Expense History Drawer */}
                            {isExpanded && (
                                <div className="p-4 sm:p-5 pt-0 border-t border-card-border space-y-3 animate-in fade-in duration-150">
                                    <div className="pt-3 space-y-1">
                                        <div className="w-full bg-input-bg border border-input-border h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    cycle.remainingSalary >= 0
                                                        ? 'bg-spent-yellow'
                                                        : 'bg-red-500'
                                                }`}
                                                style={{ width: `${cycle.percentLeft}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] text-muted font-semibold">
                                            <span>{cycle.percentLeft.toFixed(1)}% remaining</span>
                                            <span>
                                                {cycle.expenses.length} {cycle.expenses.length === 1 ? 'expense' : 'expenses'} logged
                                            </span>
                                        </div>
                                    </div>

                                    {cycle.expenses.length === 0 ? (
                                        <div className="text-center py-5 bg-card/60 rounded-xl border border-card-border">
                                            <p className="text-xs font-bold text-muted">
                                                No expenses were logged during this salary period.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-card-border bg-card rounded-2xl border border-card-border overflow-hidden">
                                            {cycle.expenses.map((exp) => (
                                                <div
                                                    key={exp.id}
                                                    className="p-3 px-4 flex items-center justify-between text-xs hover:bg-input-bg/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-base">
                                                            {exp.categoryIcon || '💳'}
                                                        </span>
                                                        <div>
                                                            <p className="font-bold text-card-foreground">
                                                                {exp.note || exp.categoryName || 'General Expense'}
                                                            </p>
                                                            <span className="text-[11px] text-muted font-medium">
                                                                {formatManilaDateTime(exp.created_at || exp.transaction_date)}
                                                                {exp.categoryName ? ` • ${exp.categoryName}` : ''}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span className="font-black text-red-500 sm:text-sm tabular-nums">
                                                        -₱{Number(exp.amount).toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}