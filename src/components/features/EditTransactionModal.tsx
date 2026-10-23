'use client'

import { useState } from 'react'
import { updateTransaction, deleteTransaction } from '../../app/dashboard/actions'
import { formatManilaDateTime, getManilaDate } from '../../lib/date'
import CategoryCombobox from './CategoryCombobox'

function toTitleCase(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

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
    created_at?: string
    category_id: string | null
    categories: Category | Category[] | null
}

interface EditTransactionModalProps {
    transaction: TransactionRecord | null
    categories: Category[]
    onClose: () => void
}

export default function EditTransactionModal({
                                                 transaction,
                                                 categories,
                                                 onClose,
                                             }: EditTransactionModalProps) {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const initialCatId = transaction
        ? (Array.isArray(transaction.categories)
        ? transaction.categories[0]?.id
        : transaction.categories?.id) || transaction.category_id || null
        : null

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCatId)
    const [newCategoryName, setNewCategoryName] = useState<string>('')
    const [note, setNote] = useState<string>(transaction?.note?.toUpperCase() || '')
    const [categoryError, setCategoryError] = useState(false)

    if (!transaction) return null

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!selectedCategoryId && !newCategoryName.trim()) {
            setCategoryError(true)
            return
        }

        setCategoryError(false)
        setLoading(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        formData.set('id', transaction!.id)
        formData.set('note', note.trim().toUpperCase())

        if (selectedCategoryId) {
            formData.set('category_id', selectedCategoryId)
        } else if (newCategoryName.trim()) {
            formData.set('new_category_name', toTitleCase(newCategoryName.trim()))
        }

        try {
            await updateTransaction(formData)
            onClose()
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Failed to update transaction')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm('Are you sure you want to delete this transaction permanently?')
        if (!confirmed) return

        setDeleting(true)
        const formData = new FormData()
        formData.set('id', transaction!.id)

        try {
            await deleteTransaction(formData)
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to delete transaction')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-extrabold text-card-foreground">Edit Transaction</h3>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {transaction.created_at && (
                    <div className="mb-4 px-3 py-2 rounded-xl bg-input-bg border border-input-border text-[11px] text-muted flex items-center justify-between">
                        <span>🕒 Recorded at:</span>
                        <span className="font-bold text-card-foreground">
                            {formatManilaDateTime(transaction.created_at)}
                        </span>
                    </div>
                )}

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
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-2xl font-extrabold text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet tabular-nums"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Type
                        </label>
                        <select
                            name="type"
                            defaultValue={transaction.type}
                            className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                            Category
                        </label>
                        <CategoryCombobox
                            categories={categories}
                            type={transaction.type}
                            selectedCategoryId={selectedCategoryId}
                            newCategoryName={newCategoryName}
                            onSelectExisting={(id) => {
                                setSelectedCategoryId(id)
                                setNewCategoryName('')
                                setCategoryError(false)
                            }}
                            onSetNewCategory={(name) => {
                                setSelectedCategoryId(null)
                                setNewCategoryName(toTitleCase(name))
                                setCategoryError(false)
                            }}
                            hasError={categoryError}
                        />
                    </div>

                    {/* Note / Description: Forced UPPERCASE */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Note / Description
                        </label>
                        <input
                            name="note"
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value.toUpperCase())}
                            placeholder="e.g. Lunch, Grocery"
                            className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Date
                        </label>
                        <input
                            name="transaction_date"
                            type="date"
                            defaultValue={transaction.transaction_date || getManilaDate()}
                            required
                            className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            disabled={deleting || loading}
                            onClick={handleDelete}
                            className="w-1/3 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors cursor-pointer disabled:opacity-40"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>

                        <button
                            type="submit"
                            disabled={loading || deleting}
                            className="w-2/3 py-3 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Saving...' : 'Update & Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}