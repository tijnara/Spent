'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
}

export default function StatsView({ activeCycleStr, burnRateData, topCategories, surplusHistory, comparison }: StatsViewProps) {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6 animate-in fade-in duration-200 pb-24 sm:pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cycle Analytics</h1>
                    <p className="text-xs text-zinc-400 mt-1">Data locked to your active <span className="font-bold text-[#FACC15]">15/30</span> cutoff period.</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-input-bg border border-input-border text-xs font-bold text-zinc-300">
                    {activeCycleStr}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Runway Burn Rate */}
                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col min-h-[380px] contain-card">
                    <div className="mb-6">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Runway Burn Rate</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Ideal pacing vs. actual cumulative spend</p>
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
                            <div className="flex h-full items-center justify-center text-sm font-bold text-zinc-500">
                                No spending data yet for this cycle.
                            </div>
                        )}
                    </div>
                </div>

                {/* Cycle Comparison */}
                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between contain-card">
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Cycle Comparison</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Pacing relative to same day last cutoff</p>
                    </div>
                    <div className="py-8 text-center space-y-2">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${comparison.isLower ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-red-500/10 text-red-500'}`}>
                            <span className="text-xl font-black">{comparison.isLower ? '↓' : '↑'}</span>
                        </div>
                        <h4 className="text-4xl font-black text-white tabular-nums tracking-tight">{comparison.percent}%</h4>
                        <p className={`text-xs font-bold ${comparison.isLower ? 'text-[#34D399]' : 'text-red-500'}`}>
                            {comparison.isLower ? 'Lower spend pace' : 'Higher spend pace'}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>Prev: ₱{comparison.prevAmount.toLocaleString()}</span>
                        <span>Now: ₱{comparison.nowAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Top Categories */}
                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl contain-card">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Top Categories</h3>
                            <p className="text-[11px] text-zinc-400 mt-1">Current cutoff allocation</p>
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
                            <p className="text-xs text-zinc-500 font-bold py-4 text-center">No categorized expenses yet.</p>
                        )}
                    </div>
                </div>

                {/* Surplus History */}
                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col contain-card">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Surplus History</h3>
                            <p className="text-[11px] text-zinc-400 mt-1">Funds retained at midnight on previous paydays</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[220px]">
                        {surplusHistory.length > 0 ? surplusHistory.map((record, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-input-bg border border-input-border">
                                <span className="text-xs font-bold text-zinc-300">{record.cycleStr}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${record.status === 'positive' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-red-500/10 text-red-500'}`}>
                                        {record.status === 'positive' ? 'Retained' : 'Overdrawn'}
                                    </span>
                                    <span className={`text-sm font-black tabular-nums w-20 text-right ${record.status === 'positive' ? 'text-[#34D399]' : 'text-red-500'}`}>
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
        </div>
    )
}