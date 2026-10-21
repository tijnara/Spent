'use client'

import { useState } from 'react'

interface SandboxTransaction {
    id: string
    title: string
    amount: number
    type: 'expense' | 'income'
    icon: string
    time: string
    isNew?: boolean
}

const INITIAL_EXPENSES: SandboxTransaction[] = [
    {
        id: '1',
        title: 'Grocery Run',
        amount: 1450,
        type: 'expense',
        icon: '🛒',
        time: 'Today • 9:15 AM',
    },
    {
        id: '2',
        title: 'Work Lunch',
        amount: 180,
        type: 'expense',
        icon: '🍱',
        time: 'Today • 12:30 PM',
    },
]

export default function HeroSandbox() {
    const salary = 15000 // Semi-monthly cutoff salary (15/30)
    const [transactions, setTransactions] = useState<SandboxTransaction[]>(INITIAL_EXPENSES)

    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const remainingSalary = salary - totalExpense + totalIncome
    const remainingPercent = Math.max(0, Math.min(100, (remainingSalary / salary) * 100))

    function addSampleTransaction(title: string, amount: number, type: 'expense' | 'income', icon: string) {
        const now = new Date()
        const timeStr = `Today • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`

        const newTx: SandboxTransaction = {
            id: Math.random().toString(36).substring(2, 9),
            title,
            amount,
            type,
            icon,
            time: timeStr,
            isNew: true,
        }

        setTransactions((prev) => [newTx, ...prev])
    }

    function resetDemo() {
        setTransactions(INITIAL_EXPENSES)
    }

    return (
        <div id="demo" className="w-full max-w-xl mx-auto scroll-mt-20 sm:scroll-mt-24">
            {/* Elevated Slate-Violet Surface Container */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent shadow-2xl">
                <div className="bg-[#1A1433] border border-white/[0.08] rounded-[23px] p-6 sm:p-8 space-y-7 backdrop-blur-xl">
                    {/* Header bar: Cutoff & Manila indicator */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-[#34D399] animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                                Active 15/30 Cutoff Period
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg tabular-nums">
                            Asia/Manila (UTC+8)
                        </span>
                    </div>

                    {/* Active Salary & Remaining Budget */}
                    <div className="grid grid-cols-2 gap-4 items-end pt-1">
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                                Allocated Salary
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight mt-1">
                                ₱{salary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                                Remaining Budget
                            </span>
                            <p
                                className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight mt-1 ${
                                    remainingSalary >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                                }`}
                            >
                                ₱{remainingSalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="space-y-2 py-1">
                        <div className="w-full bg-[#0B0813] h-3 rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                    remainingPercent > 25 ? 'bg-[#FACC15]' : 'bg-[#F87171]'
                                }`}
                                style={{ width: `${remainingPercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-400 px-0.5 pt-0.5">
                            <span className="tabular-nums">{remainingPercent.toFixed(1)}% runway left</span>
                            <span className="text-[#F87171] font-semibold tabular-nums">-₱{totalExpense.toLocaleString('en-PH')} spent</span>
                        </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="space-y-3 pt-2">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
                            Tap to test instant logging:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button
                                type="button"
                                onClick={() => addSampleTransaction('Jeepney Fare', 45, 'expense', '🚐')}
                                className="py-3 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white flex flex-col items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                                <span className="text-lg">🚐</span>
                                <span className="text-xs font-extrabold tabular-nums">-₱45 Jeep</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => addSampleTransaction('Iced Coffee', 140, 'expense', '☕')}
                                className="py-3 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white flex flex-col items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                                <span className="text-lg">☕</span>
                                <span className="text-xs font-extrabold tabular-nums">-₱140 Coffee</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => addSampleTransaction('Carinderia Lunch', 120, 'expense', '🍲')}
                                className="py-3 px-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white flex flex-col items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                                <span className="text-lg">🍲</span>
                                <span className="text-xs font-extrabold tabular-nums">-₱120 Lunch</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => addSampleTransaction('Side Gig / GCash', 500, 'income', '💸')}
                                className="py-3 px-3 rounded-2xl bg-[#34D399]/10 hover:bg-[#34D399]/20 border border-[#34D399]/30 text-xs font-bold text-[#34D399] flex flex-col items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                                <span className="text-lg">💸</span>
                                <span className="text-xs font-extrabold tabular-nums">+₱500 Side gig</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Feed Ledger */}
                    <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                        <div className="flex justify-between items-center text-xs pb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white">Feed Simulation</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.08] tabular-nums">
                                    {transactions.length} entries
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={resetDemo}
                                className="text-zinc-400 hover:text-[#FACC15] text-xs font-bold transition-colors cursor-pointer"
                            >
                                Reset Demo
                            </button>
                        </div>

                        {/* Uncapped scroll container */}
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-white/[0.06] scrollbar-thin">
                            {transactions.map((item) => (
                                <div
                                    key={item.id}
                                    className={`pt-2.5 pb-1 flex items-center justify-between text-xs transition-colors rounded-xl px-2 ${
                                        item.isNew
                                            ? 'bg-white/[0.04] animate-in fade-in slide-in-from-top-1 duration-200'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-base shrink-0">{item.icon}</span>
                                        <div className="min-w-0">
                                            <p className="font-bold text-zinc-100 leading-tight truncate">
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-zinc-500 block leading-none mt-1 tabular-nums">
                                                {item.time}
                                            </span>
                                        </div>
                                    </div>

                                    <span
                                        className={`font-black tabular-nums whitespace-nowrap shrink-0 pl-3 ${
                                            item.type === 'income' ? 'text-[#34D399]' : 'text-zinc-200'
                                        }`}
                                    >
                                        {item.type === 'income' ? '+₱' : '-₱'}
                                        {item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}