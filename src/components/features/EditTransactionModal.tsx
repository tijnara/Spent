'use client'

import { useState } from 'react'
import { updateTransaction, deleteTransaction } from '../../app/dashboard/actions'

interface Category {
    id: string
    name: string
    type: string
    icon: string
    color: string
}

export interface TransactionRecord {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string | null
    transaction_date: string
    category_id?: string | null
    categories?: {
        id: string
        name: string
        icon: string
        color: string
    } | {
        id: string
        name: string
        icon: string
        color: string
    }[] | null
}

interface EditModalProps {
    transaction: TransactionRecord | null
    categories: Category[]
    onClose: () => void
}

export default function EditTransactionModal({ transaction, categories, onClose }: EditModalProps) {
    if (!transaction) return null

    const rawCatId = Array.isArray(transaction.categories)
        ? transaction.categories[0]?.id
        : transaction.categories?.id

    const [type, setType] = useState<'expense' | 'income'>(transaction.type)
    const [selectedCategory, setSelectedCategory] = useState<string>(rawCatId || transaction.category_id || '')
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filteredCategories = categories.filter((c) => c.type === type)

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set('id', transaction!.id)
        formData.set('type', type)
        if (selectedCategory) {
            formData.set('category_id', selectedCategory)
        }

        try {
            await updateTransaction(formData)
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to update transaction.')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm('Are you sure you want to delete this transaction? This cannot be undone.')
        if (!confirmed) return

        setDeleting(true)
        const formData = new FormData()
        formData.set('id', transaction!.id)

        try {
            await deleteTransaction(formData)
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to delete transaction.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-200">

                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-extrabold text-card-foreground">Edit Transaction</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Expense / Income Toggle */}
                <div className="grid grid-cols-2 p-1 bg-input-bg border border-input-border rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setType('expense')
                            const firstExpense = categories.find((c) => c.type === 'expense')
                            if (firstExpense) setSelectedCategory(firstExpense.id)
                        }}
                        className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                            type === 'expense'
                                ? 'bg-spent-violet text-white shadow-sm'
                                : 'text-muted hover:text-card-foreground'
                        }`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setType('income')
                            const firstIncome = categories.find((c) => c.type === 'income')
                            if (firstIncome) setSelectedCategory(firstIncome.id)
                        }}
                        className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                            type === 'income'
                                ? 'bg-spent-yellow text-spent-violet-dark shadow-sm'
                                : 'text-muted hover:text-card-foreground'
                        }`}
                    >
                        Income
                    </button>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Amount
                        </label>
                        <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted select-none">
                ₱
              </span>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                defaultValue={transaction.amount}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-2xl font-extrabold text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                            Category
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {filteredCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'border-spent-violet bg-spent-violet/10 text-spent-violet dark:text-spent-violet-light ring-2 ring-spent-violet/30'
                                            : 'border-input-border bg-input-bg text-muted hover:text-card-foreground'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Note / Description
                        </label>
                        <input
                            name="note"
                            type="text"
                            defaultValue={transaction.note || ''}
                            placeholder="e.g. Lunch, Groceries, Jeepney/Grab fare"
                            className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Date
                        </label>
                        <input
                            name="transaction_date"
                            type="date"
                            defaultValue={transaction.transaction_date}
                            required
                            className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                        />
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={loading || deleting}
                            className="w-full py-3.5 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-base rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Saving...' : 'Update Transaction'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || deleting}
                            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                        >
                            {deleting ? 'Deleting...' : 'Delete Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}