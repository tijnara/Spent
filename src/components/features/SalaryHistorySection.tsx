'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '../../app/dashboard/actions'
import { formatManilaDateTime } from '../../lib/date'
import EditTransactionModal, { TransactionRecord, Category } from './EditTransactionModal'

export interface SalaryCycleExpense extends TransactionRecord {}

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
    categories?: Category[]
}

export default function SalaryHistorySection({
    cycles,
    categories = [],
}: SalaryHistorySectionProps) {
    const router = useRouter()
    // Exclude the currently active cycle so only closed/historical cycles are shown
    const historicalCycles = cycles.filter((c) => !c.isActive)

    const [expandedCycleId, setExpandedCycleId] = useState<string | null>(
        historicalCycles[0]?.id || null
    )
    const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Hide section entirely if there are no closed cycles yet
    if (historicalCycles.length === 0) {
        return null
    }

    function toggleExpand(id: string) {
        setExpandedCycleId((prev) => (prev === id ? null : id))
    }

    async function handleQuickDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        const confirmed = window.confirm('Delete this entry permanently?')
        if (!confirmed) return

        setDeletingId(id)
        const formData = new FormData()
        formData.set('id', id)

        try {
            await deleteTransaction(formData)
            router.refresh()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Failed to delete transaction'
            alert(message)
        } finally {
            setDeletingId(null)
        }
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

                    const salaryRecord: TransactionRecord = {
                        id: cycle.id,
                        amount: cycle.salaryAmount,
                        type: 'income',
                        note: cycle.note,
                        transaction_date: cycle.startDate,
                        created_at: cycle.createdAt,
                        category_id: null,
                    }

                    return (
                        <div
                            key={cycle.id}
                            className="border rounded-2xl transition-all overflow-hidden border-card-border bg-input-bg/30"
                        >
                            {/* Cycle Summary Card Header */}
                            <div
                                onClick={() => toggleExpand(cycle.id)}
                                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-input-bg/60 transition-colors group"
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
                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
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

                                    {/* Salary Edit / Delete quick triggers */}
                                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            title="Edit salary log"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingTransaction(salaryRecord)
                                            }}
                                            className="p-1.5 text-muted hover:text-spent-violet dark:hover:text-spent-yellow rounded-lg hover:bg-card transition-colors cursor-pointer text-xs"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            type="button"
                                            title="Delete salary cycle"
                                            disabled={deletingId === cycle.id}
                                            onClick={(e) => handleQuickDelete(e, cycle.id)}
                                            className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer text-xs"
                                        >
                                            {deletingId === cycle.id ? '⏳' : '🗑️'}
                                        </button>
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
                                            {cycle.expenses.map((exp) => {
                                                const expRecord: TransactionRecord = {
                                                    id: exp.id,
                                                    amount: exp.amount,
                                                    type: exp.type || 'expense',
                                                    note: exp.note,
                                                    transaction_date: exp.transaction_date,
                                                    created_at: exp.created_at,
                                                    category_id: exp.category_id || null,
                                                    categories: exp.categories || null,
                                                    categoryName: exp.categoryName,
                                                    categoryIcon: exp.categoryIcon,
                                                }

                                                return (
                                                    <div
                                                        key={exp.id}
                                                        onClick={() => setEditingTransaction(expRecord)}
                                                        className="p-3 px-4 flex items-center justify-between text-xs hover:bg-input-bg/40 transition-colors cursor-pointer group/item"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-base">
                                                                {exp.categoryIcon || '💳'}
                                                            </span>
                                                            <div>
                                                                <p className="font-bold text-card-foreground group-hover/item:text-spent-violet dark:group-hover/item:text-spent-yellow transition-colors">
                                                                    {exp.note || exp.categoryName || 'General Expense'}
                                                                </p>
                                                                <span className="text-[11px] text-muted font-medium">
                                                                    {formatManilaDateTime(exp.created_at || exp.transaction_date)}
                                                                    {exp.categoryName ? ` • ${exp.categoryName}` : ''}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-red-500 sm:text-sm tabular-nums">
                                                                -₱{Number(exp.amount).toLocaleString('en-PH', {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </span>

                                                            <div className="flex items-center gap-1 opacity-70 group-hover/item:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    title="Edit expense"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setEditingTransaction(expRecord)
                                                                    }}
                                                                    className="p-1 text-muted hover:text-spent-violet dark:hover:text-spent-yellow rounded hover:bg-input-bg transition-colors cursor-pointer"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    title="Delete expense"
                                                                    disabled={deletingId === exp.id}
                                                                    onClick={(e) => handleQuickDelete(e, exp.id)}
                                                                    className="p-1 text-muted hover:text-red-500 rounded hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                                                                >
                                                                    {deletingId === exp.id ? '⏳' : '🗑️'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <EditTransactionModal
                key={editingTransaction?.id || 'modal'}
                transaction={editingTransaction}
                categories={categories}
                onClose={() => setEditingTransaction(null)}
            />
        </section>
    )
}