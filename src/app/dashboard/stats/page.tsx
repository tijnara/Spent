'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const burnRateData = [
    { day: '1', ideal: 1000, actual: 450 },
    { day: '3', ideal: 3000, actual: 2100 },
    { day: '6', ideal: 6000, actual: 6800 },
    { day: '9', ideal: 9000, actual: 8200 },
    { day: '12', ideal: 12000, actual: null },
    { day: '15', ideal: 15000, actual: null },
]

export default function StatsPage() {
    const [activeCycle] = useState('Oct 16 - Oct 31')

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6 animate-in fade-in duration-200 pb-24 sm:pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cycle Analytics</h1>
                    <p className="text-xs text-zinc-400 mt-1">Data locked to your active <span className="font-bold text-[#FACC15]">15/30</span> cutoff period.</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-input-bg border border-input-border text-xs font-bold text-zinc-300">
                    {activeCycle}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col min-h-[380px] contain-card">
                    <div className="mb-6">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Runway Burn Rate</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Ideal pacing vs. actual cumulative spend</p>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
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
                    </div>
                </div>

                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col justify-between contain-card">
                    <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Cycle Comparison</h3>
                        <p className="text-[11px] text-zinc-400 mt-1">Pacing relative to Day 9 of last cutoff</p>
                    </div>
                    <div className="py-8 text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#34D399]/10 text-[#34D399] mb-2">
                            <span className="text-xl font-black">↓</span>
                        </div>
                        <h4 className="text-4xl font-black text-white tabular-nums tracking-tight">12.4%</h4>
                        <p className="text-xs font-bold text-[#34D399]">Lower spend pace</p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.08] flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>Prev: ₱9,350</span>
                        <span>Now: ₱8,200</span>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl contain-card">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Top Categories</h3>
                            <p className="text-[11px] text-zinc-400 mt-1">Current cutoff allocation</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: 'Food & Dining', amount: 3450, icon: '🍱', color: 'bg-rose-500' },
                            { name: 'Groceries', amount: 2100, icon: '🛒', color: 'bg-blue-500' },
                            { name: 'Transport', amount: 1200, icon: '🛵', color: 'bg-[#FACC15]' },
                        ].map((cat) => {
                            const percent = (cat.amount / 8200) * 100
                            return (
                                <div key={cat.name} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span>{cat.icon}</span>
                                            <span className="font-bold text-zinc-200">{cat.name}</span>
                                        </div>
                                        <span className="font-black text-white tabular-nums">₱{cat.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-[#0B0813] h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[#1A1433] border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col contain-card">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Surplus History</h3>
                            <p className="text-[11px] text-zinc-400 mt-1">Funds retained at midnight on previous paydays</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[220px]">
                        {[
                            { cycle: 'Oct 01 - Oct 15', surplus: 1250, status: 'positive' },
                            { cycle: 'Sep 16 - Sep 30', surplus: -450, status: 'negative' },
                            { cycle: 'Sep 01 - Sep 15', surplus: 3100, status: 'positive' },
                            { cycle: 'Aug 16 - Aug 31', surplus: 150, status: 'positive' },
                        ].map((record) => (
                            <div key={record.cycle} className="flex items-center justify-between p-3.5 rounded-xl bg-input-bg border border-input-border">
                                <span className="text-xs font-bold text-zinc-300">{record.cycle}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${record.status === 'positive' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-red-500/10 text-red-500'}`}>
                                        {record.status === 'positive' ? 'Retained' : 'Overdrawn'}
                                    </span>
                                    <span className={`text-sm font-black tabular-nums w-20 text-right ${record.status === 'positive' ? 'text-[#34D399]' : 'text-red-500'}`}>
                                        {record.status === 'positive' ? '+' : ''}₱{Math.abs(record.surplus).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}