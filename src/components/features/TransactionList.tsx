'use client'

import { useState } from 'react'
import { deleteTransaction } from '../../app/dashboard/actions'
import { formatManilaDateTime } from '../../lib/date'
import EditTransactionModal, { TransactionRecord } from './EditTransactionModal'

interface Category {
    id: string
    name: string
    type: string
    icon: string
    color: string
}

interface TransactionListProps {
    transactions: TransactionRecord[]
    categories: Category[]
}

export default function TransactionList({ transactions, categories }: TransactionListProps) {
    const [editingTransaction, setEditingTransaction] = useState<TransactionRecord | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    async function handleQuickDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation()
        const confirmed = window.confirm('Delete this entry permanently?')
        if (!confirmed) return

        setDeletingId(id)
        const formData = new FormData()
        formData.set('id', id)

        try {
            await deleteTransaction(formData)
        } catch (err) {
            console.error(err)
            alert('Failed to delete transaction')
        } finally {
            setDeletingId(null)
        }
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-spent-violet/10 flex items-center justify-center text-2xl text-spent-violet">
                    💸
                </div>
                <p className="font-bold text-card-foreground">No transactions logged yet</p>
                <p className="text-xs text-muted mt-1">
                    Tap the yellow + button to record your first daily expense!
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="divide-y divide-card-border">
                {transactions.map((tx) => {
                    const categoryData = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories

                    return (
                        <div
                            key={tx.id}
                            onClick={() => setEditingTransaction(tx)}
                            className="py-3.5 flex items-center justify-between hover:bg-input-bg/50 px-2 rounded-2xl transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-input-bg border border-input-border flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                                    {categoryData?.icon || (tx.type === 'income' ? '💵' : '💳')}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-card-foreground group-hover:text-spent-violet dark:group-hover:text-spent-yellow transition-colors">
                                        {tx.note || categoryData?.name || 'General Entry'}
                                    </p>
                                    {/* Date and Exact Time Display */}
                                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5 flex-wrap">
                    <span className="font-medium text-[11px]">
                      {formatManilaDateTime(tx.created_at || tx.transaction_date)}
                    </span>
                                        {categoryData?.name && (
                                            <>
                                                <span>•</span>
                                                <span>{categoryData.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Amount and Action Buttons */}
                            <div className="flex items-center gap-3">
                <span
                    className={`font-black text-sm sm:text-base ${
                        tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-card-foreground'
                    }`}
                >
                  {tx.type === 'income' ? '+₱' : '-₱'}
                    {Number(tx.amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        title="Edit transaction"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingTransaction(tx)
                                        }}
                                        className="p-1.5 text-muted hover:text-spent-violet dark:hover:text-spent-yellow rounded-lg hover:bg-input-bg transition-colors"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete transaction"
                                        disabled={deletingId === tx.id}
                                        onClick={(e) => handleQuickDelete(e, tx.id)}
                                        className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40"
                                    >
                                        {deletingId === tx.id ? '⏳' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <EditTransactionModal
                transaction={editingTransaction}
                categories={categories}
                onClose={() => setEditingTransaction(null)}
            />
        </>
    )
}