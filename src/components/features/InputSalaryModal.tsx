'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { inputSalary } from '../../app/dashboard/actions'
import { getManilaDate } from '../../lib/date'

interface DeductedExpense {
    id: string
    amount: number
    note: string | null
    transaction_date: string
    created_at: string
    categoryName: string
    categoryIcon: string
}

interface DeductionSummary {
    salaryAmount: number
    note: string
    transactionDate: string
    totalDeducted: number
    remainingSalary: number
    percentLeft: number
    expenses: DeductedExpense[]
}

interface InputSalaryModalProps {
    lastSalaryAmount?: number
    lastSalaryNote?: string
    lastSalaryDate?: string
    unspentSurplus?: number
}

export default function InputSalaryModal({
                                             lastSalaryAmount = 0,
                                             lastSalaryNote = 'ACTIVE SALARY',
                                             lastSalaryDate,
                                             unspentSurplus = 0,
                                         }: InputSalaryModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [amount, setAmount] = useState(lastSalaryAmount > 0 ? String(lastSalaryAmount) : '')
    const [note, setNote] = useState(lastSalaryNote)
    const [date, setDate] = useState(getManilaDate())
    const [rolloverSurplus, setRolloverSurplus] = useState(false)
    const [summary, setSummary] = useState<DeductionSummary | null>(null)

    const effectiveAmount = useMemo(() => {
        const parsed = parseFloat(amount) || 0
        return rolloverSurplus && unspentSurplus > 0 ? parsed + unspentSurplus : parsed
    }, [amount, rolloverSurplus, unspentSurplus])

    // Group and sum all same categories from the last cycle
    const categorySummary = useMemo(() => {
        if (!summary?.expenses || summary.expenses.length === 0) return []
        const map = new Map<string, { categoryName: string; categoryIcon: string; totalAmount: number; count: number }>()

        summary.expenses.forEach((exp) => {
            const key = exp.categoryName || 'Uncategorized'
            const existing = map.get(key)
            if (existing) {
                existing.totalAmount += exp.amount
                existing.count += 1
            } else {
                map.set(key, {
                    categoryName: key,
                    categoryIcon: exp.categoryIcon || '🏷️',
                    totalAmount: exp.amount,
                    count: 1,
                })
            }
        })

        return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount)
    }, [summary?.expenses])

    const lastCycleTotalSpent = useMemo(() => {
        return categorySummary.reduce((acc, c) => acc + c.totalAmount, 0)
    }, [categorySummary])

    function handleOpen() {
        if (lastSalaryAmount > 0 && !amount) {
            setAmount(String(lastSalaryAmount))
        }
        if (lastSalaryNote) {
            setNote(lastSalaryNote)
        }
        setSummary(null)
        setIsOpen(true)
    }

    function handleClose() {
        setIsOpen(false)
        setSummary(null)
        router.refresh()
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.set('amount', String(effectiveAmount))
        formData.set('note', note.trim().toUpperCase())
        formData.set('transaction_date', date)

        try {
            const result = await inputSalary(formData)
            router.refresh()
            if (result && result.success) {
                setSummary(result as unknown as DeductionSummary)
            } else {
                handleClose()
            }
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Failed to save salary. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="flex items-center gap-1.5 bg-[#FACC15] text-[#0B0813] hover:bg-yellow-400 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
            >
                <span>💼</span>
                <span>Set Salary</span>
            </button>

            {isOpen && (
                <div
                    onClick={handleClose}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#1A1433] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col"
                    >
                        {summary ? (
                            /* --- SUMMARY MODAL: SALARY SET & DEDUCTIONS --- */
                            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🎉</span>
                                        <div>
                                            <h3 className="text-base font-black text-white tracking-tight">
                                                New Cycle Activated
                                            </h3>
                                            <p className="text-[11px] text-zinc-400">
                                                Effective starting {summary.transactionDate}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="text-zinc-400 hover:text-white font-bold text-lg px-2 py-1 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Active Salary Reset to 0 Expenses */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-3 rounded-2xl bg-[#0B0813] border border-white/[0.08]">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                            New Salary Runway
                                        </span>
                                        <p className="text-lg font-black text-white tabular-nums mt-0.5">
                                            ₱{summary.salaryAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-[#0B0813] border border-white/[0.08]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                Current Spent
                                            </span>
                                            <span className="text-[10px] font-extrabold text-[#34D399]">
                                                100% Left
                                            </span>
                                        </div>
                                        <p className="text-lg font-black text-[#34D399] tabular-nums mt-0.5">
                                            ₱0.00
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="w-full bg-[#0B0813] border border-white/[0.08] h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#34D399] rounded-full w-full" />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-zinc-400">
                                        <span>New cycle clean start</span>
                                        <span className="text-[#34D399] font-bold">0% spent</span>
                                    </div>
                                </div>

                                {/* Sum of All Same Categories from Previous Cycle */}
                                <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-white/[0.08]">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <h4 className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                            <span>🧾</span>
                                            <span>Expenses from Last Salary / Cycle ({categorySummary.length})</span>
                                        </h4>
                                        {lastCycleTotalSpent > 0 && (
                                            <span className="font-black text-rose-400 tabular-nums">
                                                -₱{lastCycleTotalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-48 custom-scrollbar">
                                        {categorySummary.length > 0 ? (
                                            categorySummary.map((cat) => (
                                                <div
                                                    key={cat.categoryName}
                                                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0813] border border-white/[0.08]"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-8 h-8 rounded-lg bg-[#1A1433] border border-white/[0.08] flex items-center justify-center text-sm shrink-0">
                                                            {cat.categoryIcon}
                                                        </span>
                                                        <div>
                                                            <p className="font-extrabold text-xs text-white">
                                                                {cat.categoryName}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 font-medium">
                                                                {cat.count} {cat.count === 1 ? 'transaction' : 'transactions'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-xs sm:text-sm text-rose-400 tabular-nums">
                                                        -₱{cat.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 rounded-xl bg-[#0B0813] border border-white/[0.08] text-center">
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    No expenses recorded in the previous cycle.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full py-3 bg-[#FACC15] hover:bg-yellow-400 text-[#0B0813] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                                >
                                    Done & View Dashboard →
                                </button>
                            </div>
                        ) : (
                            /* --- INPUT FORM --- */
                            <>
                                <div className="flex justify-between items-center pb-1 border-b border-white/[0.08]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💼</span>
                                        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                                            Set Allocated Salary
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="text-zinc-400 hover:text-white font-bold text-lg px-2 py-0.5 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {lastSalaryAmount > 0 && (
                                    <div className="p-2.5 rounded-xl bg-[#0B0813] border border-white/[0.08] flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                                                Current Baseline
                                            </span>
                                            <span className="font-black text-[#34D399] tabular-nums text-sm">
                                                ₱{lastSalaryAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <span className="text-[10px] bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate max-w-[140px]">
                                            {lastSalaryNote}
                                        </span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Allocated Salary Amount
                                        </label>
                                        <div className="flex items-center bg-[#0B0813] border border-white/[0.08] focus-within:border-[#FACC15] rounded-xl px-3.5 py-2.5 transition-colors">
                                            <span className="text-xl font-black text-zinc-400 select-none mr-2">
                                                ₱
                                            </span>
                                            <input
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                required
                                                autoFocus
                                                className="w-full bg-transparent text-xl font-black text-white placeholder:text-zinc-600 focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>

                                        {/* Quick Amount Chips */}
                                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                                            {lastSalaryAmount > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAmount(String(lastSalaryAmount))}
                                                    className="px-2 py-0.5 bg-[#0B0813] hover:bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] font-bold text-zinc-300 transition-colors shrink-0"
                                                >
                                                    Same (₱{lastSalaryAmount >= 1000 ? `${(lastSalaryAmount / 1000).toFixed(0)}k` : lastSalaryAmount})
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setAmount(String((parseFloat(amount) || 0) + 1000))}
                                                className="px-2 py-0.5 bg-[#0B0813] hover:bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] font-bold text-zinc-300 transition-colors shrink-0"
                                            >
                                                +₱1,000
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAmount(String((parseFloat(amount) || 0) + 5000))}
                                                className="px-2 py-0.5 bg-[#0B0813] hover:bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] font-bold text-zinc-300 transition-colors shrink-0"
                                            >
                                                +₱5,000
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAmount('')}
                                                className="px-2 py-0.5 bg-[#0B0813] hover:bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] font-bold text-zinc-400 transition-colors shrink-0 ml-auto"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {unspentSurplus > 0 && (
                                        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B0813] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={rolloverSurplus}
                                                onChange={(e) => setRolloverSurplus(e.target.checked)}
                                                className="w-4 h-4 rounded accent-[#FACC15] cursor-pointer"
                                            />
                                            <div className="text-[11px]">
                                                <span className="font-bold text-white block">
                                                    Roll over unspent surplus (+₱{unspentSurplus.toLocaleString('en-PH', { minimumFractionDigits: 2 })})
                                                </span>
                                                <span className="text-[10px] text-zinc-400">
                                                    Starting budget: ₱{effectiveAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </label>
                                    )}

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Cycle Label / Note
                                        </label>
                                        <input
                                            name="note"
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value.toUpperCase())}
                                            placeholder="E.G. 15TH CUTOFF SALARY, MONTHLY"
                                            className="w-full px-3 py-2 bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15] rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors uppercase font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Effective Date
                                        </label>
                                        <input
                                            name="transaction_date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-[#0B0813] border border-white/[0.08] focus:border-[#FACC15] rounded-xl text-xs text-white focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !amount || parseFloat(amount) <= 0}
                                        className="w-full mt-2 py-3 bg-[#FACC15] hover:bg-yellow-400 text-[#0B0813] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? 'Saving...' : 'Save Allocated Salary'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}