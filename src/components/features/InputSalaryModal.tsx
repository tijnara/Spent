'use client'

import { useState } from 'react'
import { inputSalary } from '../../app/dashboard/actions'

export default function InputSalaryModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            await inputSalary(formData)
            setIsOpen(false)
        } catch (err) {
            console.error(err)
            alert('Failed to save salary. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 bg-spent-yellow text-spent-violet-dark hover:bg-spent-yellow-dark px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
            >
                <span>💼</span>
                <span>Set Salary</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
                    <div className="w-full sm:max-w-md bg-card border border-card-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💼</span>
                                <h3 className="text-xl font-extrabold text-card-foreground">Set Allocated Salary</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-muted hover:text-card-foreground font-bold text-xl px-2 py-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Allocated Salary Amount
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

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Label / Note
                                </label>
                                <input
                                    name="note"
                                    type="text"
                                    defaultValue="Active Salary"
                                    placeholder="e.g. Monthly Salary, Cut-off Pay"
                                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-input-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                                    Effective Date
                                </label>
                                <input
                                    name="transaction_date"
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    required
                                    className="w-full px-4 py-2 bg-input-bg border border-input-border rounded-xl text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-spent-violet"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 bg-spent-yellow hover:bg-spent-yellow-dark text-spent-violet-dark font-extrabold text-base rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Saving...' : 'Save Allocated Salary'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}