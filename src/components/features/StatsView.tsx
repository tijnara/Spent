'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TransactionList from './TransactionList'
import { CategoryItem } from './ManageCategoriesModal'

interface StatsViewProps {
    activeCycleStr: string
    burnRateData: any[]
    topCategories: any[]
    surplusHistory: any[]
    comparison: {
        percent: number
        isLower: boolean
        prevAmount: number
        nowAmount: number
    }
    transactions: any[]
    categories: CategoryItem[]
}

export default function StatsView({
                                      activeCycleStr,
                                      burnRateData,
                                      topCategories,
                                      surplusHistory,
                                      comparison,
                                      transactions,
                                      categories,
                                  }: StatsViewProps) {
    // Date Range Filter States
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Filter transactions based on date selection
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (dateFrom && t.transaction_date < dateFrom) return false
            if (dateTo && t.transaction_date > dateTo) return false
            return true
        })
    }, [transactions, dateFrom, dateTo])

    // Filtered range summary metrics
    const filteredMetrics = useMemo(() => {
        let totalIn = 0
        let totalOut = 0

        filteredTransactions.forEach((t) => {
            const val = Number(t.amount) || 0
            if (t.type === 'income') totalIn += val
            else if (t.type === 'expense') totalOut += val
        })

        return { totalIn, totalOut, net: totalIn - totalOut }
    }, [filteredTransactions])

    const isFiltered = Boolean(dateFrom || dateTo)

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200 pb-28 sm:pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cycle Analytics & Ledger</h1>
                    <p className="text-xs text-zinc-400 mt-1">
                        Pacing, surplus retention, and full transaction history locked to your <span className="font-bold text-[#FACC15]">15/30</span> cutoff.
                    </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-[#0B0813] border border-white/[0.08] text-xs font-bold text-zinc-300 self-start sm:self-auto">
                    {activeCycleStr}
                </div>
            </div>

            {/* 4 Analytics Modules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Runway Burn Rate */}
                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col min-h-[380px]">
                    <div className="mb-6">
                        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Runway Burn Rate</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Ideal pacing vs. actual cumulative spend</p>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        {burnRateData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={burnRateData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val/1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0813', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="ideal" stroke="#34D399" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal Pace" />
                                    <Line type="monotone" dataKey="actual" stroke="#FACC15" strokeWidth={3} dot={{ r: 4, fill: '#0B0813', strokeWidth: 2 }} name="Actual Spend" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-zinc-500">
                                No spending data yet for this cycle.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Cycle Comparison */}
                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Cycle Comparison</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Pacing relative to previous cutoff</p>
                    </div>
                    <div className="py-8 text-center space-y-2">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${comparison.isLower ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-500'}`}>
                            <span className="text-xl font-black">{comparison.isLower ? '↓' : '↑'}</span>
                        </div>
                        <h4 className="text-4xl font-black text-white tabular-nums tracking-tight">{comparison.percent}%</h4>
                        <p className={`text-xs font-bold ${comparison.isLower ? 'text-[#34D399]' : 'text-rose-500'}`}>
                            {comparison.isLower ? 'Lower spend pace' : 'Higher spend pace'}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>Prev: ₱{comparison.prevAmount.toLocaleString()}</span>
                        <span>Now: ₱{comparison.nowAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* 3. Top Categories */}
                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Top Categories</h3>
                            <p className="text-[11px] text-zinc-400 mt-0.5">Current cutoff allocation</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {topCategories.length > 0 ? topCategories.map((cat) => (
                            <div key={cat.name} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span>{cat.icon}</span>
                                        <span className="font-bold text-zinc-200">{cat.name}</span>
                                    </div>
                                    <span className="font-black text-white tabular-nums">₱{cat.amount.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-[#0B0813] h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#FACC15] rounded-full" style={{ width: `${cat.percent}%` }} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-xs text-zinc-500 font-bold py-6 text-center">No categorized expenses yet.</p>
                        )}
                    </div>
                </div>

                {/* 4. Surplus History */}
                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Surplus History</h3>
                            <p className="text-[11px] text-zinc-400 mt-0.5">Funds retained at midnight on previous paydays</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[220px]">
                        {surplusHistory.length > 0 ? surplusHistory.map((record, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0813] border border-white/[0.08]">
                                <span className="text-xs font-bold text-zinc-300">{record.cycleStr}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${record.status === 'positive' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {record.status === 'positive' ? 'Retained' : 'Overdrawn'}
                                    </span>
                                    <span className={`text-sm font-black tabular-nums w-20 text-right ${record.status === 'positive' ? 'text-[#34D399]' : 'text-rose-500'}`}>
                                        {record.status === 'positive' ? '+' : ''}₱{Math.abs(record.surplus).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex items-center justify-center h-full pb-4">
                                <p className="text-xs text-zinc-500 font-bold text-center">No past cycles recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction Ledger with Date Range Filter */}
            <div className="bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <span>🧾</span>
                            <span>Transaction Ledger</span>
                        </h2>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">
                            Filter and browse historical logs by date range
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold px-3 py-1 bg-[#0B0813] border border-white/[0.08] rounded-xl text-zinc-300 tabular-nums">
                            {filteredTransactions.length} of {transactions.length} Logs
                        </span>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#0B0813] border border-white/[0.08] rounded-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Date From:
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="px-3 py-1.5 bg-[#1A1433] border border-white/[0.08] focus:border-[#FACC15] rounded-xl text-xs text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Date To:
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="px-3 py-1.5 bg-[#1A1433] border border-white/[0.08] focus:border-[#FACC15] rounded-xl text-xs text-white focus:outline-none transition-colors"
                            />
                        </div>

                        {isFiltered && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDateFrom('')
                                    setDateTo('')
                                }}
                                className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Reset Filter ✕
                            </button>
                        )}
                    </div>

                    {/* Filtered Range Totals */}
                    {isFiltered && (
                        <div className="flex items-center gap-4 text-xs font-bold tabular-nums border-t md:border-t-0 md:border-l border-white/[0.08] pt-2 md:pt-0 md:pl-4">
                            <div>
                                <span className="text-[10px] uppercase text-zinc-500 block">Total In</span>
                                <span className="text-[#34D399]">+₱{filteredMetrics.totalIn.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase text-zinc-500 block">Total Out</span>
                                <span className="text-rose-400">-₱{filteredMetrics.totalOut.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ledger Item List */}
                <TransactionList
                    transactions={filteredTransactions}
                    categories={categories}
                />
            </div>
        </div>
    )
}