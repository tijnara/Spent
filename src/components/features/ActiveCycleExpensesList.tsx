'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '../../app/dashboard/actions'
import { formatManilaDateTime } from '../../lib/date'
import EditTransactionModal, { TransactionRecord, Category } from './EditTransactionModal'

interface ActiveCycleExpensesListProps {
    expenses: TransactionRecord[]
    categories: Category[]
}

export default function ActiveCycleExpensesList({
    expenses,
    categories,
}: ActiveCycleExpensesListProps) {
    const router = useRouter()
    const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    async function handleQuickDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        const confirmed = window.confirm('Delete this expense permanently?')
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

    if (expenses.length === 0) {
        return (
            <div className="p-4 rounded-2xl bg-input-bg border border-input-border text-center">
                <p className="text-xs text-muted font-medium">
                    No expenses logged against this salary yet. Tap <strong className="text-spent-yellow">+ Add Spent</strong> to record your first deduction.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {expenses.map((exp) => {
                    const catData = Array.isArray(exp.categories) ? exp.categories[0] : exp.categories
                    const icon = exp.categoryIcon || catData?.icon || '🏷️'
                    const name = exp.categoryName || catData?.name || ''

                    return (
                        <div
                            key={exp.id}
                            onClick={() => setEditingTransaction(exp)}
                            className="flex items-center justify-between p-3 rounded-2xl bg-input-bg border border-input-border hover:border-spent-violet/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-card border border-card-border flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                    {icon}
                                </span>
                                <div>
                                    <p className="font-extrabold text-sm text-card-foreground group-hover:text-spent-violet dark:group-hover:text-spent-yellow transition-colors">
                                        {exp.note || name || 'EXPENSE'}
                                    </p>
                                    <p className="text-[10px] text-muted font-medium">
                                        {name ? `${name} • ` : ''}
                                        {formatManilaDateTime(exp.created_at || exp.transaction_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="font-black text-sm text-red-500 tabular-nums">
                                    -₱{Number(exp.amount).toLocaleString('en-PH', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        title="Edit expense"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTransaction(exp)
                                        }}
                                        className="p-1.5 text-muted hover:text-spent-violet dark:hover:text-spent-yellow rounded-lg hover:bg-card transition-colors cursor-pointer"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete expense"
                                        disabled={deletingId === exp.id}
                                        onClick={(e) => handleQuickDelete(e, exp.id)}
                                        className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        {deletingId === exp.id ? '⏳' : '🗑️'}
                                    </button>
                                </div>
                            </div>
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
        </>
    )
}
