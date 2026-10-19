'use client'

import { useState } from 'react'
import { addTransaction } from '../../app/dashboard/actions'
import { getManilaDate } from '../../lib/date'
import CategoryCombobox from './CategoryCombobox'
import ManageCategoriesModal from './ManageCategoriesModal'

interface Category {
    id: string
    name: string
    type: string
    icon: string
    color: string
}

export default function AddTransactionModal({ categories }: { categories: Category[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
    const [type, setType] = useState<'expense' | 'income'>('expense')

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [newCategoryName, setNewCategoryName] = useState<string>('')
    const [categoryError, setCategoryError] = useState(false)

    const [loading, setLoading] = useState(false)

    function handleTypeSwitch(nextType: 'expense' | 'income') {
        setType(nextType)
        setSelectedCategoryId(null)
        setNewCategoryName('')
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

        const form = e.currentTarget
        const formData = new FormData(form)
        formData.set('type', type)

        if (selectedCategoryId) {
            formData.set('category_id', selectedCategoryId)
        } else if (newCategoryName.trim()) {
            formData.set('new_category_name', newCategoryName.trim())
        }

        if (!navigator.onLine) {
            const offlineItem: Record<string, string> = {
                amount: formData.get('amount') as string,
                type: formData.get('type') as string,
                category_id: selectedCategoryId || '',
                new_category_name: newCategoryName.trim(),
                note: (formData.get('note') as string) || '',
                transaction_date: (formData.get('transaction_date') as string) || getManilaDate(),
            }

            const existingQueue = JSON.parse(localStorage.getItem('spent_offline_queue') || '[]')
            existingQueue.push(offlineItem)
            localStorage.setItem('spent_offline_queue', JSON.stringify(existingQueue))

            alert('⚡ Saved offline! Your transaction and category will sync with your account when you reconnect.')
            setLoading(false)
            setIsOpen(false)
            return
        }

        try {
            await addTransaction(formData)
            setSelectedCategoryId(null)
            setNewCategoryName('')
            setIsOpen(false)
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Failed to save transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => {
                    setSelectedCategoryId(null)
                    setNewCategoryName('')
                    setCategoryError(false)
                    setIsOpen(true)
                }}
                style={{ zIndex: 40 }}
                className="fixed bottom-20 right-6 sm:bottom-8 sm:right-8 bg-spent-yellow text-spent-violet-dark p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold cursor-pointer border-2 border-white/20"
                aria-label="Add Transaction"
            >
                <span className="text-2xl leading-none font-black">+</span>
                <span className="hidden sm:inline text-sm font-extrabold pr-1">Add Spent</span>
            </button>

            {/* Log Transaction Modal - Fixed at z-index 50 */}
            {isOpen && (
                <div
                    style={{ zIndex: 50 }}
                    className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
                >
                    <div className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-card-foreground">Log Transaction</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Income / Expense Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-input-bg border border-input-border rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => handleTypeSwitch('expense')}
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
                                onClick={() => handleTypeSwitch('income')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                                    type === 'income'
                                        ? 'bg-spent-yellow text-spent-violet-dark shadow-sm'
                                        : 'text-muted hover:text-card-foreground'
                                }`}
                            >
                                Income
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        placeholder="0.00"
                                        required
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl text-2xl font-extrabold text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                    />
                                </div>
                            </div>

                            {/* Dropdown Textbox with Autocomplete & Auto-Add */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                                        Category
                                    </label>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsManageCategoriesOpen(true)
                                        }}
                                        className="text-xs font-bold text-spent-violet hover:text-spent-violet-dark dark:text-spent-yellow transition-colors cursor-pointer"
                                    >
                                        ⚙️ Manage
                                    </button>
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
                                        setNewCategoryName(name)
                                        setCategoryError(false)
                                    }}
                                    hasError={categoryError}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Note / Description
                                </label>
                                <input
                                    name="note"
                                    type="text"
                                    placeholder="e.g. Lunch, Grocery, Jeepney/Grab fare"
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
                                    defaultValue={getManilaDate()}
                                    required
                                    className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3.5 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-base rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Portal-rendered Manage Categories Modal (Renders into document.body at z-index 99999) */}
            <ManageCategoriesModal
                categories={categories}
                isOpen={isManageCategoriesOpen}
                onClose={() => setIsManageCategoriesOpen(false)}
            />
        </>
    )
}