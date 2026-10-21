'use client'

import { useState, useEffect } from 'react'

const PRESET_CATEGORIES = [
    { name: 'Grab / Angkas', icon: '🛵' },
    { name: 'Fast Food & Dining', icon: '🍔' },
    { name: 'Groceries & Wet Market', icon: '🛒' },
    { name: 'Electricity & Internet', icon: '⚡' },
    { name: 'Pharmacy & Meds', icon: '💊' },
]

export default function BentoGrid() {
    // Manila Midnight Countdown
    const [timeToMidnight, setTimeToMidnight] = useState('08h 14m 20s')

    useEffect(() => {
        function updateManilaCountdown() {
            const now = new Date()
            const manilaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
            const midnight = new Date(manilaTime)
            midnight.setHours(24, 0, 0, 0)

            const diffMs = midnight.getTime() - manilaTime.getTime()
            const hours = Math.floor(diffMs / (1000 * 60 * 60)).toString().padStart(2, '0')
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60).toString().padStart(2, '0')
            const seconds = Math.floor((diffMs / 1000) % 60).toString().padStart(2, '0')

            setTimeToMidnight(`${hours}h ${minutes}m ${seconds}s`)
        }

        updateManilaCountdown()
        const timer = setInterval(updateManilaCountdown, 1000)
        return () => clearInterval(timer)
    }, [])

    // Offline Queue Simulation
    const [offlineQueue, setOfflineQueue] = useState<string[]>([])
    const [isOfflineMode, setIsOfflineMode] = useState(false)
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('synced')

    function logOfflineExpense(name: string) {
        if (isOfflineMode) {
            setOfflineQueue((prev) => [...prev, name])
            setSyncStatus('idle')
        } else {
            setSyncStatus('syncing')
            setTimeout(() => setSyncStatus('synced'), 600)
        }
    }

    function toggleOfflineSwitch() {
        if (isOfflineMode && offlineQueue.length > 0) {
            setSyncStatus('syncing')
            setTimeout(() => {
                setOfflineQueue([])
                setSyncStatus('synced')
            }, 900)
        }
        setIsOfflineMode(!isOfflineMode)
    }

    // Category Combobox Simulation
    const [categoryQuery, setCategoryQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState({ name: 'Grab / Angkas', icon: '🛵' })
    const [isFocused, setIsFocused] = useState(false)

    const filteredCategories = PRESET_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(categoryQuery.toLowerCase())
    )

    return (
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
            {/* Section Header */}
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-14 sm:mb-16">
                <span className="text-xs font-black uppercase tracking-widest text-[#FACC15] bg-[#1A1433] border border-white/[0.08] px-3.5 py-1.5 rounded-full inline-block">
                    Architected for the Philippines
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Engineered for how you actually get paid.
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    Generic budget trackers enforce 1st-to-31st calendars and stall when offline. Spent gives you tools calibrated specifically to local financial rhythms.
                </p>
            </div>

            {/* Asymmetric Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* CARD 1: Salary Cycle Grouping (Span 2) */}
                <div className="lg:col-span-2 rounded-3xl bg-[#1A1433] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-white/[0.16] transition-colors contain-card min-h-[380px]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-3 py-1 rounded-full">
                                Semi-Monthly Payday Engine
                            </span>
                            <span className="text-xs font-bold text-zinc-400">15/30 Runway</span>
                        </div>

                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Automatic Salary Cycle Grouping
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-xl">
                                Expenses don't reset when the calendar month flips. Spent groups deductions into individual paycheck periods, showing the exact runway left until your next salary.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3.5">
                        <div className="bg-[#0B0813]/60 border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
                                    <span className="font-extrabold text-white">Active Cutoff: Oct 16 – Oct 31</span>
                                </div>
                                <span className="font-black text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded-full text-[11px] tabular-currency">
                                    63.6% Left
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between text-xs pt-1">
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Remaining</span>
                                    <span className="text-xl sm:text-2xl font-black text-white tabular-currency">₱11,450.00</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Cutoff Base</span>
                                    <span className="text-sm font-bold text-zinc-400 tabular-currency">₱18,000.00</span>
                                </div>
                            </div>

                            <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FACC15] rounded-full transition-[width] duration-300 ease-out" style={{ width: '63.6%' }} />
                            </div>
                        </div>

                        <div className="bg-[#0B0813]/40 border border-white/[0.06] rounded-xl p-3 px-4 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm">📁</span>
                                <span className="font-semibold text-zinc-300 whitespace-nowrap">Archived: Oct 01 – Oct 15</span>
                            </div>
                            <span className="font-bold tabular-currency whitespace-nowrap text-zinc-300">₱18,000.00 (Closed • 18.2% saved)</span>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Midnight Manila Reset (Span 1) */}
                <div className="lg:col-span-1 rounded-3xl bg-[#1A1433] border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:border-white/[0.16] transition-colors contain-card min-h-[380px]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-3 py-1 rounded-full">
                                UTC+8 Clock
                            </span>
                            <span className="flex h-2 w-2 rounded-full bg-[#34D399] animate-ping" />
                        </div>

                        <h3 className="text-xl font-black text-white tracking-tight">
                            Midnight Manila Reset
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Zero timezone drift. Daily spending limits recalculate precisely at 00:00 PST.
                        </p>
                    </div>

                    <div className="mt-6 p-5 rounded-2xl bg-[#0B0813]/60 border border-white/[0.08] space-y-4 text-center">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Spent Today
                            </span>
                            <p className="text-3xl font-black text-white tabular-currency mt-0.5">
                                ₱485.00
                            </p>
                        </div>

                        <div className="border-t border-white/[0.08] pt-3 flex items-center justify-between text-xs font-semibold text-zinc-400">
                            <span>Resets In:</span>
                            <span className="text-[#FACC15] font-black tabular-currency">{timeToMidnight}</span>
                        </div>
                    </div>
                </div>

                {/* CARD 3: Offline-First Logging (Span 1) */}
                <div className="lg:col-span-1 rounded-3xl bg-[#1A1433] border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:border-white/[0.16] transition-colors contain-card min-h-[420px]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                PWA Engine
                            </span>

                            <button
                                type="button"
                                onClick={toggleOfflineSwitch}
                                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs gpu-layer ${
                                    isOfflineMode
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                        : 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isOfflineMode ? 'bg-amber-400 animate-pulse' : 'bg-[#34D399]'}`} />
                                <span>{isOfflineMode ? 'In Tunnel (Offline)' : 'Online (Synced)'}</span>
                            </button>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">
                                Subway & Jeepney Proof
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                                Zero signal in the MRT basement? Expenses queue safely on your device and sync to the cloud the second you step back outside.
                            </p>
                        </div>
                    </div>

                    <div className="my-5 rounded-2xl bg-[#0B0813]/60 border border-white/[0.08] p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                                <span>📱</span> Device Storage Queue
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider ${
                                offlineQueue.length > 0
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-white/5 text-zinc-400'
                            }`}>
                                {offlineQueue.length} {offlineQueue.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>

                        {/* Preserved height tray: No layout shifts when queues fill */}
                        <div className="min-h-[64px] flex flex-col justify-center space-y-1.5 contain-feed">
                            {offlineQueue.length === 0 ? (
                                <div className="text-center py-2">
                                    <p className="text-[11px] font-medium text-zinc-500">
                                        {isOfflineMode ? 'Tap button below to queue an expense' : 'All logs synced with Supabase ☁️'}
                                    </p>
                                </div>
                            ) : (
                                offlineQueue.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between bg-[#1A1433] border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs gpu-layer animate-in fade-in slide-in-from-bottom-1 duration-150"
                                    >
                                        <span className="font-semibold text-zinc-200 text-[11px] truncate">{item}</span>
                                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                            Queued
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => logOfflineExpense('MRT 3 Ayala → Cubao (₱28)')}
                            className="w-full py-2.5 px-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-xs gpu-layer"
                        >
                            <span>🚇</span>
                            <span className="tabular-currency">+ Log ₱28 MRT Fare</span>
                        </button>

                        {isOfflineMode && offlineQueue.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleOfflineSwitch}
                                className="w-full py-2 px-3 bg-[#34D399]/20 hover:bg-[#34D399]/30 border border-[#34D399]/40 text-[#34D399] rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 gpu-layer"
                            >
                                <span>☁️</span>
                                <span>Exit Tunnel & Sync Queue Now</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* CARD 4: Zero-Friction Categorization (Span 2) */}
                <div className="lg:col-span-2 rounded-3xl bg-[#1A1433] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-white/[0.16] transition-colors contain-card min-h-[420px]">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                                Intelligent Combobox
                            </span>
                            <span className="text-xs font-bold text-zinc-400">Type-Ahead Matching</span>
                        </div>

                        <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Zero-Friction Categorization
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-xl">
                                Never get interrupted by a modal to add a category. Type any label to auto-match existing entries, or register custom categories on the fly.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3 relative">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-400">Test typing a category:</span>
                            <span className="text-[11px] font-semibold text-[#FACC15]">
                                Active: {selectedCategory.icon} {selectedCategory.name}
                            </span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={categoryQuery}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                onChange={(e) => setCategoryQuery(e.target.value)}
                                placeholder="Search or type a new tag (e.g. Milk Tea, Laundry)..."
                                className="w-full bg-[#0B0813]/70 border border-white/[0.08] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FACC15]/80 transition-colors"
                            />
                            {categoryQuery && (
                                <button
                                    type="button"
                                    onClick={() => setCategoryQuery('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* GPU-accelerated dropdown menu strictly bound to transform & opacity */}
                        {(isFocused || categoryQuery) && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-[#1A1433] border border-white/[0.12] rounded-2xl p-2 shadow-2xl space-y-1 max-h-44 overflow-y-auto gpu-layer transition-all duration-200 ease-out translate-y-0 opacity-100">
                                {filteredCategories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onMouseDown={() => {
                                            setSelectedCategory(cat)
                                            setCategoryQuery('')
                                        }}
                                        className="w-full p-2 rounded-xl flex items-center justify-between text-xs text-zinc-200 hover:bg-white/[0.06] transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{cat.icon}</span>
                                            <span className="font-semibold">{cat.name}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500">Select</span>
                                    </button>
                                ))}

                                {categoryQuery && !filteredCategories.some(c => c.name.toLowerCase() === categoryQuery.toLowerCase()) && (
                                    <button
                                        type="button"
                                        onMouseDown={() => {
                                            setSelectedCategory({ name: categoryQuery, icon: '🏷️' })
                                            setCategoryQuery('')
                                        }}
                                        className="w-full p-2.5 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-between text-xs text-[#FACC15] hover:bg-[#FACC15]/20 transition-all font-bold"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>➕</span>
                                            <span>Create &quot;{categoryQuery}&quot; as custom category</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-black">Auto-insert</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </section>
    )
}