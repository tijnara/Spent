'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateTransaction, deleteTransaction } from '../../app/dashboard/actions'
import { formatManilaDateTime, getManilaDate } from '../../lib/date'
import CategoryCombobox from './CategoryCombobox'

function toTitleCase(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

export interface Category {
    id: string
    name: string
    type: string
    icon: string
    color?: string
}

export interface TransactionRecord {
    id: string
    amount: number
    type: 'expense' | 'income'
    note: string | null
    transaction_date: string
    created_at?: string
    category_id: string | null
    categories?: Category | Category[] | {
        id?: string
        name?: string
        type?: string
        icon?: string
        color?: string
    } | {
        id?: string
        name?: string
        type?: string
        icon?: string
        color?: string
    }[] | null
    categoryName?: string
    categoryIcon?: string
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
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const initialCatId = transaction
        ? (Array.isArray(transaction.categories)
            ? transaction.categories[0]?.id
            : transaction.categories?.id) || transaction.category_id || null
        : null

    const [type, setType] = useState<'expense' | 'income'>('expense')
    const [amount, setAmount] = useState<string>('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [newCategoryName, setNewCategoryName] = useState<string>('')
    const [note, setNote] = useState<string>('')
    const [date, setDate] = useState<string>(getManilaDate())
    const [categoryError, setCategoryError] = useState(false)

    // Re-initialize state whenever the active transaction changes
    useEffect(() => {
        if (transaction) {
            setType(transaction.type || 'expense')
            setAmount(String(transaction.amount || ''))
            setSelectedCategoryId(initialCatId)
            setNewCategoryName('')
            setNote(transaction.note?.toUpperCase() || '')
            setDate(transaction.transaction_date || getManilaDate())
            setCategoryError(false)
        }
    }, [transaction?.id, initialCatId])

    if (!transaction) return null

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!selectedCategoryId && !newCategoryName.trim()) {
            setCategoryError(true)
            return
        }

        setCategoryError(false)
        setLoading(true)

        const formData = new FormData()
        formData.set('id', transaction!.id)
        formData.set('type', type)
        formData.set('amount', amount)
        formData.set('note', note.trim().toUpperCase())
        formData.set('transaction_date', date)

        if (selectedCategoryId) {
            formData.set('category_id', selectedCategoryId)
        } else if (newCategoryName.trim()) {
            formData.set('new_category_name', toTitleCase(newCategoryName.trim()))
        }

        try {
            await updateTransaction(formData)
            router.refresh()
            onClose()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Failed to update transaction'
            alert(message)
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
            router.refresh()
            onClose()
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Failed to delete transaction'
            alert(message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-extrabold text-card-foreground">Edit Transaction</h3>
                        <p className="text-xs text-muted font-medium mt-0.5">
                            Modify or remove this transaction entry
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer transition-colors"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {transaction.created_at && (
                    <div className="px-3 py-2 rounded-xl bg-input-bg border border-input-border text-[11px] text-muted flex items-center justify-between">
                        <span>🕒 Recorded at:</span>
                        <span className="font-bold text-card-foreground">
                            {formatManilaDateTime(transaction.created_at)}
                        </span>
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                    {/* Expense / Income Type Switcher */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-input-bg border border-input-border rounded-2xl">
                        <button
                            type="button"
                            onClick={() => {
                                setType('expense')
                                setSelectedCategoryId(null)
                                setNewCategoryName('')
                                setCategoryError(false)
                            }}
                            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                                type === 'expense'
                                    ? 'bg-spent-violet text-white shadow-xs'
                                    : 'text-muted hover:text-card-foreground'
                            }`}
                        >
                            💸 Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setType('income')
                                setSelectedCategoryId(null)
                                setNewCategoryName('')
                                setCategoryError(false)
                            }}
                            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                                type === 'income'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-muted hover:text-card-foreground'
                            }`}
                        >
                            💵 Income
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Amount (PHP)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted select-none">
                                ₱
                            </span>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-2xl font-extrabold text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet tabular-nums"
                            />
                        </div>
                    </div>

                    {/* Category Combobox */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                            Category
                        </label>
                        <CategoryCombobox
                            categories={categories}
                            type={type}
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
                            placeholder="e.g. Lunch, Grocery, Grab ride"
                            className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet uppercase"
                        />
                    </div>

                    {/* Transaction Date */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                            Date
                        </label>
                        <input
                            name="transaction_date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                        />
                    </div>

                    {/* Actions: Delete & Save */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            disabled={deleting || loading}
                            onClick={handleDelete}
                            className="w-1/3 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                        >
                            <span>🗑️</span>
                            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                        </button>

                        <button
                            type="submit"
                            disabled={loading || deleting}
                            className="w-2/3 py-3 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>✓</span>
                            <span>{loading ? 'Saving...' : 'Update & Save'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}