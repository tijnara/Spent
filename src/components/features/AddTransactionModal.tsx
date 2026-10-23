'use client'

import { useState } from 'react'
import { addTransaction } from '../../app/dashboard/actions'
import { getManilaDate } from '../../lib/date'
import CategoryCombobox from './CategoryCombobox'
import ManageCategoriesModal, { CategoryItem } from './ManageCategoriesModal'

function toTitleCase(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

interface AddTransactionModalProps {
    categories: CategoryItem[]
    isOpen?: boolean
    onClose?: () => void
}

export default function AddTransactionModal({
                                                categories,
                                                isOpen: controlledIsOpen,
                                                onClose: controlledOnClose,
                                            }: AddTransactionModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

    const [type, setType] = useState<'expense' | 'income'>('expense')
    const [amount, setAmount] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [note, setNote] = useState('')
    const [date, setDate] = useState(getManilaDate())
    const [loading, setLoading] = useState(false)
    const [categoryError, setCategoryError] = useState(false)

    function handleClose() {
        if (controlledOnClose) {
            controlledOnClose()
        }
        setInternalIsOpen(false)
        resetForm()
    }

    function resetForm() {
        setAmount('')
        setSelectedCategoryId(null)
        setNewCategoryName('')
        setNote('')
        setDate(getManilaDate())
        setCategoryError(false)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!selectedCategoryId && !newCategoryName.trim()) {
            setCategoryError(true)
            return
        }

        setCategoryError(false)
        setLoading(true)

        const formData = new FormData()
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
            await addTransaction(formData)
            handleClose()
        } catch (err: any) {
            alert(err.message || 'Failed to save transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {controlledIsOpen === undefined && (
                <button
                    type="button"
                    onClick={() => setInternalIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-spent-yellow text-spent-violet-dark hover:bg-spent-yellow-dark px-5 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                    <span className="text-base font-bold">+</span>
                    <span>Add Spent</span>
                </button>
            )}

            {isModalOpen && (
                <div
                    onClick={handleClose}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-extrabold text-card-foreground">
                                Log Transaction
                            </h3>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Expense / Income Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-input-bg border border-input-border rounded-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setType('expense')
                                    setSelectedCategoryId(null)
                                    setNewCategoryName('')
                                }}
                                className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                                    type === 'expense'
                                        ? 'bg-spent-violet text-white shadow-xs'
                                        : 'text-muted hover:text-card-foreground'
                                }`}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setType('income')
                                    setSelectedCategoryId(null)
                                    setNewCategoryName('')
                                }}
                                className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                                    type === 'income'
                                        ? 'bg-spent-yellow text-spent-violet-dark shadow-xs'
                                        : 'text-muted hover:text-card-foreground'
                                }`}
                            >
                                Income
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted select-none">
                                        ₱
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        autoFocus
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-2xl font-extrabold text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet tabular-nums"
                                    />
                                </div>
                            </div>

                            {/* Category with Manage Link */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                                        Category
                                    </label>
                                    <ManageCategoriesModal
                                        categories={categories}
                                        triggerButton={
                                            <span className="text-xs font-bold text-spent-yellow hover:underline cursor-pointer flex items-center gap-1">
                                                <span>⚙</span>
                                                <span>Manage</span>
                                            </span>
                                        }
                                    />
                                </div>
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
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value.toUpperCase())}
                                    placeholder="e.g. Lunch, Grocery, Jeepney/Grab fare"
                                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet uppercase"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-base rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}